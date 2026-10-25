import type { Timestamp } from 'firebase/firestore'

export type DeckId = 'fibonacci' | 'fibonacciModified'

export type AccentColorId = 'green' | 'blue' | 'purple' | 'pink' | 'orange' | 'teal'

/**
 * lobby: no ticket picked yet — the room's just-started state.
 * discussion: a ticket is up but voting hasn't opened.
 * voting: cards are live.
 * revealed: votes are shown for the current ticket/round.
 */
export type RoomPhase = 'lobby' | 'discussion' | 'voting' | 'revealed'

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
  phase: RoomPhase
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
  /** The room round `vote` was cast in — a vote from any other round is stale. */
  votedRound: number | null
  joinedAt: Timestamp
  /** Null in local snapshots while a serverTimestamp() write is still pending. */
  lastSeenAt: Timestamp | null
  expiresAt: Timestamp
}
