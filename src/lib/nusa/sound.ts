// NUSA LEARN — Web Audio sound manager
// Generates pleasant sounds programmatically (no asset files needed).
// Sounds: click, correct, wrong, levelup, unlock, hint, celebration

let ctx: AudioContext | null = null
function getCtx() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    } catch {
      return null
    }
  }
  return ctx
}

type SoundName = 'click' | 'correct' | 'wrong' | 'levelup' | 'unlock' | 'hint' | 'celebration' | 'whoosh' | 'star' | 'coin'

function playTone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', vol = 0.15) {
  const c = getCtx()
  if (!c) return
  const t0 = c.currentTime + start
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration)
  osc.connect(gain).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + duration)
}

const RECIPES: Record<SoundName, () => void> = {
  click: () => playTone(420, 0, 0.08, 'triangle', 0.1),
  whoosh: () => {
    playTone(300, 0, 0.18, 'sine', 0.08)
    playTone(520, 0.06, 0.18, 'sine', 0.06)
  },
  correct: () => {
    playTone(660, 0, 0.12, 'sine', 0.15)
    playTone(880, 0.1, 0.16, 'sine', 0.15)
    playTone(1100, 0.22, 0.2, 'sine', 0.12)
  },
  wrong: () => {
    playTone(300, 0, 0.14, 'triangle', 0.12)
    playTone(220, 0.12, 0.18, 'triangle', 0.1)
  },
  hint: () => {
    playTone(520, 0, 0.1, 'sine', 0.1)
    playTone(700, 0.08, 0.14, 'sine', 0.1)
  },
  levelup: () => {
    playTone(523, 0, 0.14, 'sine', 0.15) // C
    playTone(659, 0.12, 0.14, 'sine', 0.15) // E
    playTone(784, 0.24, 0.18, 'sine', 0.15) // G
    playTone(1046, 0.4, 0.3, 'sine', 0.18) // C high
  },
  unlock: () => {
    playTone(880, 0, 0.1, 'sine', 0.12)
    playTone(1100, 0.1, 0.12, 'sine', 0.12)
    playTone(1400, 0.22, 0.22, 'sine', 0.14)
    playTone(1760, 0.44, 0.3, 'sine', 0.16)
  },
  star: () => {
    playTone(900, 0, 0.08, 'sine', 0.12)
    playTone(1200, 0.08, 0.12, 'sine', 0.12)
    playTone(1600, 0.18, 0.18, 'sine', 0.14)
  },
  coin: () => {
    playTone(880, 0, 0.06, 'square', 0.08)
    playTone(1100, 0.06, 0.1, 'square', 0.08)
  },
  celebration: () => {
    // C E G C arpeggio with sparkle
    playTone(523, 0, 0.12, 'sine', 0.16)
    playTone(659, 0.1, 0.12, 'sine', 0.16)
    playTone(784, 0.2, 0.12, 'sine', 0.16)
    playTone(1046, 0.3, 0.18, 'sine', 0.18)
    playTone(1318, 0.4, 0.3, 'sine', 0.16)
    playTone(1568, 0.55, 0.4, 'sine', 0.12)
  },
}

let enabled = true
export function setSoundEnabled(v: boolean) {
  enabled = v
}
export function isSoundEnabled() {
  return enabled
}

export function playSound(name: SoundName) {
  if (!enabled) return
  try {
    const c = getCtx()
    if (!c) return
    if (c.state === 'suspended') c.resume()
    RECIPES[name]?.()
  } catch {
    /* ignore */
  }
}

// React hook to read sound setting from store
export { }
