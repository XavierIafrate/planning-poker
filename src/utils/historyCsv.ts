import type { RoundHistoryEntry } from '@/types/room'

function csvCell(value: string | number | boolean | null | undefined): string {
  const text = value === null || value === undefined ? '' : String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function historyToCsv(history: RoundHistoryEntry[]): string {
  const header = ['Ticket', 'Round', 'Estimate', 'Average', 'Consensus', 'Votes']
  const rows = history.map((entry) => [
    entry.ticket ?? `Round ${entry.round}`,
    entry.round,
    entry.estimate,
    entry.average,
    entry.consensus ? 'yes' : 'no',
    entry.votes.map((v) => `${v.name}: ${v.vote ?? '-'}`).join('; '),
  ])
  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')
}

export function downloadCsv(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
