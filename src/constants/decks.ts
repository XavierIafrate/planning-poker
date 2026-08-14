import type { DeckId } from '@/types/room'

export const DECKS: Record<DeckId, readonly string[]> = {
  fibonacci: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', 'raccoon'],
  fibonacciModified: ['0', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', 'raccoon'],
}

export const DECK_LABELS: Record<DeckId, string> = {
  fibonacci: 'Fibonacci',
  fibonacciModified: 'Fibonacci (modified)',
}

// Maps a card face to the number it contributes to the round average.
export const NUMERIC_VALUES: Record<string, number> = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '5': 5,
  '8': 8,
  '13': 13,
  '20': 20,
  '21': 21,
  '34': 34,
  '40': 40,
  '55': 55,
  '89': 89,
  '100': 100,
}
