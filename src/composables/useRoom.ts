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
import type { Room } from '@/types/room'
import { useAuth } from './useAuth'

const ROOM_TTL_DAYS = 7
const MAX_CREATE_ATTEMPTS = 3

function expiryTimestamp(days: number): Timestamp {
  return Timestamp.fromMillis(Date.now() + days * 24 * 60 * 60 * 1000)
}

export async function createRoom(): Promise<string> {
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
      deck: 'fibonacci',
      revealed: false,
      round: 1,
      tickets: [],
      currentTicket: null,
      lastActivityAt: serverTimestamp(),
      expiresAt: expiryTimestamp(ROOM_TTL_DAYS),
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

  async function revealVotes() {
    await updateDoc(doc(db, 'rooms', roomCode.value), {
      revealed: true,
      lastActivityAt: serverTimestamp(),
    })
  }

  async function resetRound() {
    await updateDoc(doc(db, 'rooms', roomCode.value), {
      revealed: false,
      round: increment(1),
      lastActivityAt: serverTimestamp(),
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

  async function nextTicket() {
    const tickets = room.value?.tickets ?? []
    if (tickets.length === 0) return
    const [next, ...rest] = tickets
    await updateDoc(doc(db, 'rooms', roomCode.value), {
      currentTicket: next,
      tickets: rest,
      revealed: false,
      round: increment(1),
      lastActivityAt: serverTimestamp(),
    })
  }

  return { room, loading, revealVotes, resetRound, addTickets, removeTicket, nextTicket }
}
