// Ambiguous characters (0/O, 1/I/L) excluded so codes are easy to read aloud and type.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 6

export function generateRoomCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join('')
}

export function normalizeRoomCode(input: string): string {
  return input.trim().toUpperCase()
}

export function isValidRoomCode(code: string): boolean {
  return new RegExp(`^[${ALPHABET}]{${CODE_LENGTH}}$`).test(code)
}
