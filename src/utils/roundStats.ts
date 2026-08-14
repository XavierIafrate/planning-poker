import { NUMERIC_VALUES } from '@/constants/decks'

export function computeAverage(votes: (string | null)[]): number | null {
  const numeric = votes
    .filter((v): v is string => v !== null && v in NUMERIC_VALUES)
    .map((v) => NUMERIC_VALUES[v]!)
  if (numeric.length === 0) return null
  return Math.round((numeric.reduce((total, value) => total + value, 0) / numeric.length) * 10) / 10
}

export function hasConsensus(votes: (string | null)[]): boolean {
  const cast = votes.filter((v): v is string => v !== null)
  return cast.length > 0 && new Set(cast).size === 1
}
