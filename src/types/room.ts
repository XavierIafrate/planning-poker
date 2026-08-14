import type { Timestamp } from 'firebase/firestore'

export type DeckId = 'fibonacci' | 'fibonacciModified'

export type AccentColorId = 'green' | 'blue' | 'purple' | 'pink' | 'orange' | 'teal'

export interface RoundHistoryEntry {
  ticket: string | null
  round: number
  votes: { name: string; vote: string | null }[]
  average: number | null
  consensus: boolean
  revealedAt: Timestamp
}

export interface Room {
  createdAt: Timestamp
  hostUid: string
  deck: DeckId
  revealed: boolean
  round: number
  tickets: string[]
  currentTicket: string | null
  accentColor: AccentColorId
  history: RoundHistoryEntry[]
  lastActivityAt: Timestamp
  expiresAt: Timestamp
  roundStartedAt: Timestamp
}

export type ParticipantRole = 'voter' | 'observer'

export type JobRole = 'dev' | 'qa' | 'product'

export interface Participant {
  name: string
  role: ParticipantRole
  jobRole: JobRole
  vote: string | null
  joinedAt: Timestamp
  lastSeenAt: Timestamp
  expiresAt: Timestamp
}
