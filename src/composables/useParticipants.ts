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
import type { Participant } from '@/types/room'
import { useAuth } from './useAuth'

const PARTICIPANT_TTL_DAYS = 7

export interface ParticipantWithId extends Participant {
  uid: string
}

function expiryTimestamp(days: number): Timestamp {
  return Timestamp.fromMillis(Date.now() + days * 24 * 60 * 60 * 1000)
}

/**
 * `round` drives the reset flow: rules only allow a participant to write their
 * own doc, so "New Round" only bumps the room's `round` field, and every
 * connected client self-clears its own vote when it observes that change.
 */
export function useParticipants(roomCode: Ref<string>, round: Ref<number | undefined>) {
  const { user, waitForUser } = useAuth()
  const participants = ref<ParticipantWithId[]>([])
  const loading = ref(true)

  let unsubscribe: (() => void) | null = null
  let lastSeenRound: number | undefined
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
        participants.value = snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Participant) }))
        loading.value = false
      })
    },
    { immediate: true },
  )

  onUnmounted(() => unsubscribe?.())

  const self = computed(
    () => participants.value.find((p) => p.uid === user.value?.uid) ?? null,
  )

  watch(round, (newRound) => {
    if (newRound === undefined) return
    const isFirstObservation = lastSeenRound === undefined
    const changed = lastSeenRound !== newRound
    lastSeenRound = newRound
    if (isFirstObservation || !changed) return
    if (self.value && self.value.vote !== null) {
      updateDoc(doc(db, 'rooms', roomCode.value, 'participants', self.value.uid), {
        vote: null,
      }).catch((error: unknown) => console.error('Failed to self-clear vote', error))
    }
  })

  async function joinRoom(name: string) {
    const currentUser = await waitForUser()
    await setDoc(doc(db, 'rooms', roomCode.value, 'participants', currentUser.uid), {
      name,
      vote: null,
      joinedAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
      expiresAt: expiryTimestamp(PARTICIPANT_TTL_DAYS),
    })
  }

  async function castVote(vote: string) {
    if (!user.value) throw new Error('Not signed in yet — try again in a moment')
    await updateDoc(doc(db, 'rooms', roomCode.value, 'participants', user.value.uid), {
      vote,
      lastSeenAt: serverTimestamp(),
    })
  }

  async function leaveRoom() {
    if (!user.value) return
    await deleteDoc(doc(db, 'rooms', roomCode.value, 'participants', user.value.uid))
  }

  return { participants, loading, self, joinRoom, castVote, leaveRoom }
}
