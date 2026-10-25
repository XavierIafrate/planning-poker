import { onUnmounted, ref, watch, type Ref } from 'vue'
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/firebase/client'
import { generateRoomCode } from '@/utils/roomCode'
import { DEFAULT_ACCENT_COLOR } from '@/constants/theme'
import { DECKS } from '@/constants/decks'
import { computeAverage, hasConsensus, suggestEstimate } from '@/utils/roundStats'
import type { AccentColorId, DeckId, Room, RoomPhase, RoundHistoryEntry } from '@/types/room'
import type { ParticipantWithId } from './useParticipants'
import { useAuth } from './useAuth'

const ROOM_TTL_DAYS = 7
const MAX_CREATE_ATTEMPTS = 3

function expiryTimestamp(days: number): Timestamp {
  return Timestamp.fromMillis(Date.now() + days * 24 * 60 * 60 * 1000)
}

/** `saved`: the round's suggested card is kept as the ticket's estimate, rather than voted again. */
function buildHistoryEntry(room: Room, participants: ParticipantWithId[], saved: boolean): RoundHistoryEntry {
  // Away voters who never voted weren't really part of this round.
  const voters = participants.filter((p) => p.role === 'voter' && !(p.away && p.vote === null))
  const votes = voters.map((p) => p.vote)
  return {
    ticket: room.currentTicket,
    round: room.round,
    votes: voters.map((p) => ({ name: p.name, vote: p.vote })),
    average: computeAverage(votes),
    consensus: hasConsensus(votes),
    estimate: saved ? suggestEstimate(votes, DECKS[room.deck]) : null,
    revealedAt: Timestamp.now(),
  }
}

export async function createRoom(deck: DeckId = 'fibonacci'): Promise<string> {
  const { waitForUser } = useAuth()
  const user = await waitForUser()

  for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
    const code = generateRoomCode()
    const roomRef = doc(db, 'rooms', code)
    const existing = await getDoc(roomRef)
    if (existing.exists()) continue

    await setDoc(roomRef, {
      createdAt: serverTimestamp(),
      hostUid: user.uid,
      deck,
      phase: 'lobby' satisfies RoomPhase,
      round: 1,
      tickets: [],
      currentTicket: null,
      history: [],
      accentColor: DEFAULT_ACCENT_COLOR,
      lastActivityAt: serverTimestamp(),
      expiresAt: expiryTimestamp(ROOM_TTL_DAYS),
      roundStartedAt: serverTimestamp(),
    })
    return code
  }

  throw new Error('Could not generate a unique room code — please try again')
}

export function useRoom(roomCode: Ref<string>) {
  const { waitForUser } = useAuth()
  const room = ref<Room | null>(null)
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
      unsubscribe = onSnapshot(doc(db, 'rooms', code), (snap) => {
        room.value = snap.exists() ? (snap.data() as Room) : null
        loading.value = false
      })
    },
    { immediate: true },
  )

  onUnmounted(() => unsubscribe?.())

  async function startVoting() {
    await updateDoc(doc(db, 'rooms', roomCode.value), {
      phase: 'voting' satisfies RoomPhase,
      lastActivityAt: serverTimestamp(),
    })
  }

  async function revealVotes() {
    await updateDoc(doc(db, 'rooms', roomCode.value), {
      phase: 'revealed' satisfies RoomPhase,
      lastActivityAt: serverTimestamp(),
    })
  }

  async function resetRound(participants: ParticipantWithId[]) {
    await updateDoc(doc(db, 'rooms', roomCode.value), {
      phase: 'discussion' satisfies RoomPhase,
      round: increment(1),
      lastActivityAt: serverTimestamp(),
      roundStartedAt: serverTimestamp(),
      ...(room.value?.phase === 'revealed'
        ? { history: arrayUnion(buildHistoryEntry(room.value, participants, false)) }
        : {}),
    })
  }

  async function addTickets(titles: string[]) {
    const cleaned = titles.map((title) => title.trim()).filter(Boolean)
    if (cleaned.length === 0) return
    await updateDoc(doc(db, 'rooms', roomCode.value), {
      tickets: arrayUnion(...cleaned),
      lastActivityAt: serverTimestamp(),
    })
  }

  async function removeTicket(title: string) {
    await updateDoc(doc(db, 'rooms', roomCode.value), {
      tickets: arrayRemove(title),
      lastActivityAt: serverTimestamp(),
    })
  }

  async function moveTicket(index: number, direction: 'up' | 'down') {
    const tickets = room.value?.tickets ?? []
    const swapWith = direction === 'up' ? index - 1 : index + 1
    if (swapWith < 0 || swapWith >= tickets.length) return
    const reordered = [...tickets]
    ;[reordered[index], reordered[swapWith]] = [reordered[swapWith]!, reordered[index]!]
    await updateDoc(doc(db, 'rooms', roomCode.value), {
      tickets: reordered,
      lastActivityAt: serverTimestamp(),
    })
  }

  async function nextTicket(participants: ParticipantWithId[]) {
    const tickets = room.value?.tickets ?? []
    if (tickets.length === 0) return
    const [next, ...rest] = tickets
    await updateDoc(doc(db, 'rooms', roomCode.value), {
      currentTicket: next,
      tickets: rest,
      phase: 'discussion' satisfies RoomPhase,
      round: increment(1),
      lastActivityAt: serverTimestamp(),
      roundStartedAt: serverTimestamp(),
      ...(room.value?.phase === 'revealed'
        ? { history: arrayUnion(buildHistoryEntry(room.value, participants, true)) }
        : {}),
    })
  }

  // Sends the current ticket to the back of the queue and brings up the next.
  async function skipTicket() {
    const current = room.value
    if (!current?.currentTicket || current.tickets.length === 0) return
    const [next, ...rest] = current.tickets
    await updateDoc(doc(db, 'rooms', roomCode.value), {
      currentTicket: next,
      tickets: [...rest, current.currentTicket],
      phase: 'discussion' satisfies RoomPhase,
      round: increment(1),
      lastActivityAt: serverTimestamp(),
      roundStartedAt: serverTimestamp(),
    })
  }

  // Saves the last ticket's estimate and returns to the lobby for more tickets.
  async function finishTicket(participants: ParticipantWithId[]) {
    if (room.value?.phase !== 'revealed') return
    await updateDoc(doc(db, 'rooms', roomCode.value), {
      currentTicket: null,
      phase: 'lobby' satisfies RoomPhase,
      round: increment(1),
      lastActivityAt: serverTimestamp(),
      roundStartedAt: serverTimestamp(),
      history: arrayUnion(buildHistoryEntry(room.value, participants, true)),
    })
  }

  async function setAccentColor(color: AccentColorId) {
    await updateDoc(doc(db, 'rooms', roomCode.value), {
      accentColor: color,
      lastActivityAt: serverTimestamp(),
    })
  }

  return {
    room,
    loading,
    startVoting,
    revealVotes,
    resetRound,
    addTickets,
    removeTicket,
    moveTicket,
    nextTicket,
    skipTicket,
    finishTicket,
    setAccentColor,
  }
}
