import type { AccentColorId } from '@/types/room'

interface AccentColorDefinition {
  label: string
  light: string
  dark: string
}

// Each pair is picked to keep the button/card text (which sits directly on
// this color) readable in both themes: a mid-dark shade against the white
// text used in light mode, a light shade against the near-black text used
// in dark mode. Letting hosts pick an arbitrary hex here previously let a
// pale color wash out button/card text entirely.
export const ACCENT_COLORS: Record<AccentColorId, AccentColorDefinition> = {
  green: { label: 'Green', light: '#16a34a', dark: '#4ade80' },
  blue: { label: 'Blue', light: '#2563eb', dark: '#60a5fa' },
  purple: { label: 'Purple', light: '#7c3aed', dark: '#a78bfa' },
  pink: { label: 'Pink', light: '#db2777', dark: '#f472b6' },
  orange: { label: 'Orange', light: '#ea580c', dark: '#fb923c' },
  teal: { label: 'Teal', light: '#0d9488', dark: '#2dd4bf' },
}

export const DEFAULT_ACCENT_COLOR: AccentColorId = 'green'
