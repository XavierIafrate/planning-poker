import type { Timestamp } from 'firebase/firestore'

export type DeckId = 'fibonacci'

export type AccentColorId = 'green' | 'blue' | 'purple' | 'pink' | 'orange' | 'teal'

export interface Room {
  createdAt: Timestamp
  hostUid: string
  deck: DeckId
  revealed: boolean
  round: number
  tickets: string[]
  currentTicket: string | null
  accentColor: AccentColorId
  lastActivityAt: Timestamp
  expiresAt: Timestamp
}

export type ParticipantRole = 'voter' | 'observer'

export interface Participant {
  name: string
  role: ParticipantRole
  vote: string | null
  joinedAt: Timestamp
  lastSeenAt: Timestamp
  expiresAt: Timestamp
}
