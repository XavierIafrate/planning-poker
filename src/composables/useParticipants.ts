import { computed, onUnmounted, ref, watch, type Ref } from 'vue'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/firebase/client'
import type { JobRole, Participant, ParticipantRole } from '@/types/room'
import { DEFAULT_JOB_ROLE } from '@/constants/jobRoles'
import { useAuth } from './useAuth'

const PARTICIPANT_TTL_DAYS = 7
// Both overridable via env so e2e tests don't wait minutes for someone to go away.
const HEARTBEAT_INTERVAL_MS = Number(import.meta.env.VITE_PRESENCE_HEARTBEAT_MS) || 30_000
// Comfortably above the heartbeat interval, and above the once-a-minute
// timer throttling browsers apply to long-hidden tabs, so someone sitting
// in a meeting app with the room in a background tab isn't marked away.
const AWAY_AFTER_MS = Number(import.meta.env.VITE_PRESENCE_AWAY_AFTER_MS) || 2 * 60_000

export interface ParticipantWithId extends Participant {
  uid: string
  /** No heartbeat for a while — tab closed, laptop asleep, or offline. */
  away: boolean
}

function expiryTimestamp(days: number): Timestamp {
  return Timestamp.fromMillis(Date.now() + days * 24 * 60 * 60 * 1000)
}

/**
 * `round` drives the reset flow: a vote only counts for the round it was cast
 * in (`votedRound`), so "New Round" just bumps the room's `round` and every
 * vote — including those of participants who are offline — goes stale at once.
 */
export function useParticipants(roomCode: Ref<string>, round: Ref<number | undefined>) {
  const { user, waitForUser } = useAuth()
  const docs = ref<(Participant & { uid: string })[]>([])
  const loading = ref(true)

  let unsubscribe: (() => void) | null = null
  let subscription = 0

  watch(
    roomCode,
    async (code) => {
      unsubscribe?.()
      loading.value = true
      const current = ++subscription
      await waitForUser()
      if (current !== subscription) return // roomCode changed again while waiting for auth
      unsubscribe = onSnapshot(collection(db, 'rooms', code, 'participants'), (snap) => {
        docs.value = snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Participant) }))
        loading.value = false
      })
    },
    { immediate: true },
  )

  onUnmounted(() => unsubscribe?.())

  const participants = computed<ParticipantWithId[]>(() => {
    // Away-ness is measured against the freshest heartbeat in the room rather
    // than the local clock, so a client with a skewed clock can't mark
    // everyone away. Our own heartbeat keeps this within one interval of now.
    const freshest = Math.max(0, ...docs.value.map((p) => p.lastSeenAt?.toMillis() ?? 0))
    return docs.value.map((p) => ({
      ...p,
      vote: p.votedRound === round.value ? p.vote : null,
      away:
        p.uid !== user.value?.uid
        && p.lastSeenAt !== null
        && freshest - p.lastSeenAt.toMillis() > AWAY_AFTER_MS,
    }))
  })

  const self = computed(
    () => participants.value.find((p) => p.uid === user.value?.uid) ?? null,
  )

  function sendHeartbeat() {
    if (!self.value) return
    updateDoc(doc(db, 'rooms', roomCode.value, 'participants', self.value.uid), {
      lastSeenAt: serverTimestamp(),
    }).catch((error: unknown) => console.error('Failed to send heartbeat', error))
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') sendHeartbeat()
  }

  // Beat as soon as we're in the room (e.g. rejoining on a fresh page load),
  // then on an interval and whenever the tab comes back into view.
  watch(() => self.value?.uid, (uid) => {
    if (uid) sendHeartbeat()
  })
  const heartbeatId = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  onUnmounted(() => {
    clearInterval(heartbeatId)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  async function joinRoom(name: string, role: ParticipantRole = 'voter', jobRole: JobRole = DEFAULT_JOB_ROLE) {
    const currentUser = await waitForUser()
    await setDoc(doc(db, 'rooms', roomCode.value, 'participants', currentUser.uid), {
      name,
      role,
      jobRole,
      vote: null,
      votedRound: null,
      joinedAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
      expiresAt: expiryTimestamp(PARTICIPANT_TTL_DAYS),
    })
  }

  async function castVote(vote: string) {
    if (!user.value) throw new Error('Not signed in yet — try again in a moment')
    if (round.value === undefined) throw new Error('Room is still loading — try again in a moment')
    await updateDoc(doc(db, 'rooms', roomCode.value, 'participants', user.value.uid), {
      vote,
      votedRound: round.value,
      lastSeenAt: serverTimestamp(),
    })
  }

  async function setRole(role: ParticipantRole) {
    if (!user.value) return
    await updateDoc(doc(db, 'rooms', roomCode.value, 'participants', user.value.uid), {
      role,
      ...(role === 'observer' ? { vote: null } : {}),
      lastSeenAt: serverTimestamp(),
    })
  }

  async function setJobRole(jobRole: JobRole) {
    if (!user.value) return
    await updateDoc(doc(db, 'rooms', roomCode.value, 'participants', user.value.uid), {
      jobRole,
      lastSeenAt: serverTimestamp(),
    })
  }

  async function leaveRoom() {
    if (!user.value) return
    await deleteDoc(doc(db, 'rooms', roomCode.value, 'participants', user.value.uid))
  }

  // Host-only (enforced by rules). The removed participant sees the join
  // modal again and can rejoin if they're actually still around.
  async function removeParticipant(uid: string) {
    await deleteDoc(doc(db, 'rooms', roomCode.value, 'participants', uid))
  }

  return {
    participants,
    loading,
    self,
    joinRoom,
    castVote,
    setRole,
    setJobRole,
    leaveRoom,
    removeParticipant,
  }
}
