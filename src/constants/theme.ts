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
  green: { label: 'Green', light: '#15803d', dark: '#4ade80' },
  blue: { label: 'Blue', light: '#1d4ed8', dark: '#60a5fa' },
  purple: { label: 'Purple', light: '#6d28d9', dark: '#a78bfa' },
  pink: { label: 'Pink', light: '#be185d', dark: '#f472b6' },
  orange: { label: 'Orange', light: '#c2410c', dark: '#fb923c' },
  teal: { label: 'Teal', light: '#0f766e', dark: '#2dd4bf' },
}

export const DEFAULT_ACCENT_COLOR: AccentColorId = 'green'
