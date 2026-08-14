type AudioContextCtor = typeof AudioContext

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext ?? null
}

function playBrassNote(ctx: AudioContext, freq: number, time: number, duration: number, droop: boolean) {
  const osc = ctx.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(freq, time)
  if (droop) {
    // Mournful downward slide on the final, held note.
    osc.frequency.setValueAtTime(freq, time + duration * 0.4)
    osc.frequency.exponentialRampToValueAtTime(freq * 0.82, time + duration)
  }

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 1200

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, time)
  gain.gain.linearRampToValueAtTime(0.35, time + 0.03)
  gain.gain.setValueAtTime(0.35, time + Math.max(0, duration - 0.08))
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration)

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  osc.start(time)
  osc.stop(time + duration + 0.02)
}

// Classic four-note "wah wah wah waaaah" — descending, with the last note
// held and drooping further for the punchline.
export function playSadTrombone() {
  const Ctor = getAudioContextCtor()
  if (!Ctor) return

  const ctx = new Ctor()
  void ctx.resume().catch(() => {})

  const notes = [349.23, 329.63, 311.13, 293.66] // F4, E4, Eb4, D4
  const noteDuration = 0.28
  const gap = 0.02
  let time = ctx.currentTime + 0.02

  notes.forEach((freq, index) => {
    const isLast = index === notes.length - 1
    const duration = isLast ? noteDuration * 2.2 : noteDuration
    playBrassNote(ctx, freq, time, duration, isLast)
    time += duration + gap
  })

  const totalDurationMs = (time - ctx.currentTime) * 1000
  setTimeout(() => void ctx.close().catch(() => {}), totalDurationMs + 300)
}
