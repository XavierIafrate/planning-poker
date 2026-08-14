import type { Timestamp } from 'firebase/firestore'

export type DeckId = 'fibonacci'

export interface Room {
  createdAt: Timestamp
  hostUid: string
  deck: DeckId
  revealed: boolean
  round: number
  tickets: string[]
  currentTicket: string | null
  lastActivityAt: Timestamp
  expiresAt: Timestamp
}

export interface Participant {
  name: string
  vote: string | null
  joinedAt: Timestamp
  lastSeenAt: Timestamp
  expiresAt: Timestamp
}
