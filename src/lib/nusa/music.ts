// NUSA LEARN — Music manager (procedural, no asset files)
// Generates looping background music tracks using Web Audio synthesis.
// Each track = a melody pattern + optional bass line + ambient pad.

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

// Note frequencies (Hz) for common notes
const N = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
  C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1568.0,
  // sharps/flats
  Cs4: 277.18, Ds4: 311.13, Fs4: 369.99, Gs4: 415.3, As4: 466.16,
  Cs5: 554.37, Ds5: 622.25, Fs5: 739.99, Gs5: 830.61, As5: 932.33,
  // low octave
  C2: 65.41, G2: 98.0, A2: 110.0, F2: 87.31, D2: 73.42,
}

export interface MusicTrack {
  id: string
  name: string
  emoji: string
  description: string
  bpm: number
  // Melody: array of steps; each step is array of {note, dur} or null (rest)
  melody: ({ note: number; dur: number } | null)[]
  // Optional bass line (same step count)
  bass?: ({ note: number; dur: number } | null)[]
  // Optional pad chord (sustained)
  pad?: number[]
  leadType: OscillatorType
  bassType?: OscillatorType
  mood: 'adventure' | 'calm' | 'cheerful' | 'mystery' | 'victory'
}

// ============ Track definitions ============
export const TRACKS: MusicTrack[] = [
  {
    id: 'petualangan',
    name: 'Petualangan',
    emoji: '🚀',
    description: 'Semangat petualangan',
    bpm: 120,
    mood: 'adventure',
    leadType: 'triangle',
    bassType: 'sine',
    melody: [
      { note: N.C5, dur: 0.4 }, { note: N.E5, dur: 0.2 }, { note: N.G5, dur: 0.4 }, { note: N.E5, dur: 0.2 },
      { note: N.C5, dur: 0.4 }, { note: N.G4, dur: 0.2 }, { note: N.E5, dur: 0.6 }, null,
      { note: N.D5, dur: 0.4 }, { note: N.F5, dur: 0.2 }, { note: N.A5, dur: 0.4 }, { note: N.F5, dur: 0.2 },
      { note: N.D5, dur: 0.4 }, { note: N.A4, dur: 0.2 }, { note: N.F5, dur: 0.6 }, null,
      { note: N.G5, dur: 0.2 }, { note: N.E5, dur: 0.2 }, { note: N.G5, dur: 0.2 }, { note: N.C6, dur: 0.4 },
      { note: N.G5, dur: 0.2 }, { note: N.E5, dur: 0.2 }, { note: N.C5, dur: 0.4 }, null,
      { note: N.G4, dur: 0.4 }, { note: N.C5, dur: 0.4 }, { note: N.E5, dur: 0.4 }, { note: N.G5, dur: 0.8 },
    ],
    bass: [
      { note: N.C3, dur: 0.4 }, null, { note: N.G2, dur: 0.4 }, null,
      { note: N.C3, dur: 0.4 }, null, { note: N.G2, dur: 0.4 }, null,
      { note: N.D3, dur: 0.4 }, null, { note: N.A2, dur: 0.4 }, null,
      { note: N.D3, dur: 0.4 }, null, { note: N.A2, dur: 0.4 }, null,
      { note: N.G2, dur: 0.4 }, null, { note: N.G2, dur: 0.4 }, null,
      { note: N.G2, dur: 0.4 }, null, { note: N.G2, dur: 0.4 }, null,
      { note: N.C3, dur: 0.4 }, null, { note: N.G2, dur: 0.4 }, null,
      { note: N.C3, dur: 0.4 }, null, { note: N.G3, dur: 0.4 }, { note: N.C4, dur: 0.4 },
    ],
  },
  {
    id: 'ceria',
    name: 'Siang Ceria',
    emoji: '☀️',
    description: 'Lembut & ceria',
    bpm: 100,
    mood: 'cheerful',
    leadType: 'sine',
    bassType: 'triangle',
    melody: [
      { note: N.E5, dur: 0.3 }, { note: N.G5, dur: 0.3 }, { note: N.C5, dur: 0.3 }, { note: N.E5, dur: 0.3 },
      { note: N.D5, dur: 0.6 }, null, { note: N.G5, dur: 0.3 }, { note: N.E5, dur: 0.3 },
      { note: N.C5, dur: 0.3 }, { note: N.E5, dur: 0.3 }, { note: N.G5, dur: 0.3 }, { note: N.A5, dur: 0.3 },
      { note: N.G5, dur: 0.6 }, null, { note: N.E5, dur: 0.3 }, null,
      { note: N.A5, dur: 0.3 }, { note: N.G5, dur: 0.3 }, { note: N.E5, dur: 0.3 }, { note: N.D5, dur: 0.3 },
      { note: N.C5, dur: 0.6 }, null, { note: N.G4, dur: 0.3 }, null,
      { note: N.C5, dur: 0.3 }, { note: N.E5, dur: 0.3 }, { note: N.G5, dur: 0.3 }, { note: N.E5, dur: 0.3 },
      { note: N.C5, dur: 0.6 }, null, null, null,
    ],
    bass: [
      { note: N.C3, dur: 0.6 }, null, null, null,
      { note: N.G2, dur: 0.6 }, null, null, null,
      { note: N.A2, dur: 0.6 }, null, null, null,
      { note: N.F2, dur: 0.6 }, null, null, null,
      { note: N.G2, dur: 0.6 }, null, null, null,
      { note: N.C3, dur: 0.6 }, null, null, null,
      { note: N.F2, dur: 0.6 }, null, null, null,
      { note: N.G2, dur: 0.6 }, null, { note: N.G3, dur: 0.3 }, null,
    ],
    pad: [N.C4, N.E4, N.G4],
  },
  {
    id: 'tenang',
    name: 'Tenang',
    emoji: '🌌',
    description: 'Damai untuk belajar',
    bpm: 70,
    mood: 'calm',
    leadType: 'sine',
    bassType: 'sine',
    melody: [
      { note: N.C5, dur: 1.2 }, null, { note: N.E5, dur: 1.2 }, null,
      { note: N.G5, dur: 1.2 }, null, { note: N.E5, dur: 1.2 }, null,
      { note: N.A5, dur: 1.2 }, null, { note: N.G5, dur: 1.2 }, null,
      { note: N.E5, dur: 1.2 }, null, { note: N.C5, dur: 1.2 }, null,
      { note: N.D5, dur: 1.2 }, null, { note: N.F5, dur: 1.2 }, null,
      { note: N.G5, dur: 1.2 }, null, { note: N.C5, dur: 1.2 }, null,
    ],
    bass: [
      { note: N.C2, dur: 2.4 }, null, null, null,
      { note: N.C2, dur: 2.4 }, null, null, null,
      { note: N.F2, dur: 2.4 }, null, null, null,
      { note: N.G2, dur: 2.4 }, null, null, null,
      { note: N.A2, dur: 2.4 }, null, null, null,
      { note: N.G2, dur: 2.4 }, null, null, null,
      { note: N.F2, dur: 2.4 }, null, null, null,
      { note: N.C2, dur: 2.4 }, null, null, null,
    ],
    pad: [N.C3, N.E3, N.G3],
  },
  {
    id: 'misteri',
    name: 'Misteri',
    emoji: '🔮',
    description: 'Untuk membaca cerita',
    bpm: 90,
    mood: 'mystery',
    leadType: 'triangle',
    bassType: 'sine',
    melody: [
      { note: N.A4, dur: 0.5 }, { note: N.C5, dur: 0.25 }, { note: N.E5, dur: 0.5 }, { note: N.A4, dur: 0.25 },
      { note: N.G4, dur: 0.5 }, null, { note: N.E5, dur: 0.5 }, null,
      { note: N.F5, dur: 0.5 }, { note: N.E5, dur: 0.25 }, { note: N.D5, dur: 0.5 }, { note: N.C5, dur: 0.25 },
      { note: N.A4, dur: 0.5 }, null, { note: N.G4, dur: 0.5 }, null,
      { note: N.E5, dur: 0.5 }, { note: N.D5, dur: 0.25 }, { note: N.C5, dur: 0.5 }, { note: N.A4, dur: 0.25 },
      { note: N.G4, dur: 0.5 }, null, { note: N.F4, dur: 0.5 }, null,
      { note: N.A4, dur: 0.5 }, null, { note: N.C5, dur: 0.5 }, { note: N.E5, dur: 0.5 },
      { note: N.A5, dur: 1.0 }, null, null, null,
    ],
    bass: [
      { note: N.A2, dur: 1.0 }, null, { note: N.A2, dur: 1.0 }, null,
      { note: N.G2, dur: 1.0 }, null, { note: N.G2, dur: 1.0 }, null,
      { note: N.F2, dur: 1.0 }, null, { note: N.F2, dur: 1.0 }, null,
      { note: N.E2, dur: 1.0 }, null, { note: N.E2, dur: 1.0 }, null,
      { note: N.A2, dur: 1.0 }, null, { note: N.E2, dur: 1.0 }, null,
      { note: N.A2, dur: 1.0 }, null, null, null,
      { note: N.A2, dur: 2.0 }, null, null, null,
    ],
    pad: [N.A3, N.C4, N.E4],
  },
  {
    id: 'kemenangan',
    name: 'Kemenangan',
    emoji: '🏆',
    description: 'Rayakan keberhasilan',
    bpm: 130,
    mood: 'victory',
    leadType: 'square',
    bassType: 'triangle',
    melody: [
      { note: N.C5, dur: 0.2 }, { note: N.C5, dur: 0.2 }, { note: N.C5, dur: 0.2 }, { note: N.C5, dur: 0.2 },
      { note: N.G5, dur: 0.4 }, { note: N.E5, dur: 0.4 }, { note: N.G5, dur: 0.4 }, { note: N.A5, dur: 0.4 },
      { note: N.G5, dur: 0.8 }, null, { note: N.E5, dur: 0.4 }, { note: N.G5, dur: 0.4 },
      { note: N.C6, dur: 0.6 }, { note: N.G5, dur: 0.2 }, { note: N.E5, dur: 0.4 }, { note: N.C5, dur: 0.4 },
      { note: N.D5, dur: 0.4 }, { note: N.F5, dur: 0.4 }, { note: N.A5, dur: 0.4 }, { note: N.F5, dur: 0.4 },
      { note: N.D5, dur: 0.8 }, null, null, null,
      { note: N.C5, dur: 0.4 }, { note: N.E5, dur: 0.4 }, { note: N.G5, dur: 0.4 }, { note: N.C6, dur: 0.4 },
      { note: N.G5, dur: 0.4 }, { note: N.E5, dur: 0.4 }, { note: N.C5, dur: 0.4 }, null,
    ],
    bass: [
      { note: N.C3, dur: 0.4 }, null, { note: N.C3, dur: 0.4 }, null,
      { note: N.C3, dur: 0.4 }, { note: N.G2, dur: 0.4 }, { note: N.C3, dur: 0.4 }, { note: N.G2, dur: 0.4 },
      { note: N.C3, dur: 0.8 }, null, { note: N.G2, dur: 0.4 }, { note: N.C3, dur: 0.4 },
      { note: N.C3, dur: 0.4 }, { note: N.G2, dur: 0.4 }, { note: N.E2, dur: 0.4 }, { note: N.G2, dur: 0.4 },
      { note: N.D3, dur: 0.4 }, null, { note: N.A2, dur: 0.4 }, null,
      { note: N.D3, dur: 0.8 }, null, null, null,
      { note: N.C3, dur: 0.4 }, { note: N.E3, dur: 0.4 }, { note: N.G3, dur: 0.4 }, { note: N.C4, dur: 0.4 },
      { note: N.G3, dur: 0.4 }, { note: N.E3, dur: 0.4 }, { note: N.C3, dur: 0.4 }, { note: N.G2, dur: 0.4 },
    ],
  },
  {
    id: 'off',
    name: 'Tanpa Musik',
    emoji: '🔇',
    description: 'Tidak ada musik',
    bpm: 0,
    mood: 'calm',
    leadType: 'sine',
    melody: [],
  },
]

// ============ Music player ============
let musicEnabled = true
let currentTrackId: string | null = null
let stepIndex = 0
let intervalId: number | null = null
let masterGain: GainNode | null = null
let padOscs: { osc: OscillatorNode; gain: GainNode }[] = []
let activeOscs: { osc: OscillatorNode; gain: GainNode }[] = []
let onStateChange: (() => void) | null = null

export function setMusicEnabled(v: boolean) {
  musicEnabled = v
  if (!v) stopMusic()
  notifyStateChange()
}

export function isMusicEnabled() {
  return musicEnabled
}

export function getCurrentTrackId() {
  return currentTrackId
}

export function isMusicPlaying() {
  return intervalId !== null
}

export function subscribeStateChange(cb: () => void) {
  onStateChange = cb
  return () => {
    if (onStateChange === cb) onStateChange = null
  }
}

function notifyStateChange() {
  if (onStateChange) onStateChange()
}

function buildMasterGain() {
  const c = getCtx()
  if (!c) return null
  if (!masterGain) {
    masterGain = c.createGain()
    masterGain.gain.value = 0.18
    masterGain.connect(c.destination)
  }
  return masterGain
}

function startPad(track: MusicTrack) {
  const c = getCtx()
  const g = buildMasterGain()
  if (!c || !g || !track.pad) return
  stopPad()
  track.pad.forEach((freq) => {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.value = 0
    gain.gain.linearRampToValueAtTime(0.04, c.currentTime + 1.5)
    osc.connect(gain).connect(g)
    osc.start()
    padOscs.push({ osc, gain })
  })
}

function stopPad() {
  const c = getCtx()
  if (!c) return
  padOscs.forEach(({ osc, gain }) => {
    try {
      gain.gain.cancelScheduledValues(c.currentTime)
      gain.gain.setValueAtTime(gain.gain.value, c.currentTime)
      gain.gain.linearRampToValueAtTime(0, c.currentTime + 0.5)
      osc.stop(c.currentTime + 0.6)
    } catch { /* ignore */ }
  })
  padOscs = []
}

function playNote(freq: number, start: number, dur: number, type: OscillatorType, vol: number) {
  const c = getCtx()
  const g = buildMasterGain()
  if (!c || !g) return
  const t0 = c.currentTime + start
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  // Slight detune envelope for warmth
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.02)
  gain.gain.linearRampToValueAtTime(vol * 0.7, t0 + dur * 0.5)
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
  osc.connect(gain).connect(g)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
  activeOscs.push({ osc, gain })
  // Cleanup
  osc.onended = () => {
    activeOscs = activeOscs.filter((o) => o.osc !== osc)
  }
}

export function playMusic(trackId: string) {
  const c = getCtx()
  if (!c) return
  if (c.state === 'suspended') c.resume()
  if (!musicEnabled) return
  if (trackId === 'off') {
    stopMusic()
    return
  }
  const track = TRACKS.find((t) => t.id === trackId)
  if (!track) return
  // If already playing this track, do nothing
  if (currentTrackId === trackId && intervalId !== null) return
  // Stop current
  stopMusic()
  currentTrackId = trackId
  stepIndex = 0
  // Start pad if any
  startPad(track)
  // Step duration in seconds
  const stepDur = 60 / track.bpm / 2 // each step = 1/8 note
  intervalId = window.setInterval(() => {
    const i = stepIndex % track.melody.length
    const m = track.melody[i]
    if (m) {
      playNote(m.note, 0, m.dur, track.leadType, 0.12)
    }
    if (track.bass) {
      const b = track.bass[i % track.bass.length]
      if (b) {
        playNote(b.note, 0, b.dur, track.bassType || 'sine', 0.1)
      }
    }
    stepIndex++
  }, stepDur * 1000)
  notifyStateChange()
}

export function stopMusic() {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
  stopPad()
  // Stop active notes gracefully
  const c = getCtx()
  if (c) {
    activeOscs.forEach(({ osc, gain }) => {
      try {
        gain.gain.cancelScheduledValues(c.currentTime)
        gain.gain.linearRampToValueAtTime(0, c.currentTime + 0.2)
        osc.stop(c.currentTime + 0.25)
      } catch { /* ignore */ }
    })
  }
  activeOscs = []
  currentTrackId = null
  notifyStateChange()
}

export function toggleMusic() {
  if (isMusicPlaying()) {
    stopMusic()
  } else if (currentTrackId) {
    playMusic(currentTrackId)
  }
}

// Resume audio context on user interaction (handles browser autoplay restrictions)
export function unlockAudio() {
  const c = getCtx()
  if (c && c.state === 'suspended') {
    c.resume().catch(() => { /* ignore */ })
  }
}

// Stop music immediately (used when changing tracks)
export { }
