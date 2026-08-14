import type { DeckId } from '@/types/room'

export const DECKS: Record<DeckId, readonly string[]> = {
  fibonacci: ['0', '1', '2', '3', '5', '8', '13', '21', '?', 'raccoon'],
}

export const NUMERIC_VALUES = new Set(['0', '1', '2', '3', '5', '8', '13', '21'])
