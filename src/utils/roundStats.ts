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

/** Lowest and highest numeric votes, or null when nobody picked a number. */
export function voteSpread(votes: (string | null)[]): { low: string; high: string } | null {
  const numeric = votes
    .filter((v): v is string => v !== null && v in NUMERIC_VALUES)
    .sort((a, b) => NUMERIC_VALUES[a]! - NUMERIC_VALUES[b]!)
  if (numeric.length === 0) return null
  return { low: numeric[0]!, high: numeric[numeric.length - 1]! }
}

/**
 * The card to save for a ticket: the agreed card on a numeric consensus,
 * otherwise the deck card nearest the average. Ties round up, since teams
 * under-estimate far more often than they over-estimate.
 */
export function suggestEstimate(votes: (string | null)[], deck: readonly string[]): string | null {
  const agreed = votes.find((v) => v !== null)
  if (hasConsensus(votes) && agreed !== undefined && agreed in NUMERIC_VALUES) return agreed

  const average = computeAverage(votes)
  if (average === null) return null
  let best: string | null = null
  for (const card of deck) {
    if (!(card in NUMERIC_VALUES)) continue
    if (best === null) {
      best = card
      continue
    }
    const distance = Math.abs(NUMERIC_VALUES[card]! - average)
    const bestDistance = Math.abs(NUMERIC_VALUES[best]! - average)
    if (distance < bestDistance || (distance === bestDistance && NUMERIC_VALUES[card]! > NUMERIC_VALUES[best]!)) {
      best = card
    }
  }
  return best
}
