'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { TRACKS, playMusic, stopMusic, isMusicPlaying, getCurrentTrackId, subscribeStateChange, unlockAudio } from '@/lib/nusa/music'
import { playSound } from '@/lib/nusa/sound'
import { Music, Volume2, ChevronUp, X } from 'lucide-react'

// Floating music widget: bottom-right. Allows play/pause and switch track.
// Only visible after hydration (player exists).
export function MusicWidget() {
  const musicEnabled = useGameStore((s) => s.settings.music)
  const musicTrack = useGameStore((s) => s.settings.musicTrack)
  const updateSettings = useGameStore((s) => s.updateSettings)
  const soundOn = useGameStore((s) => s.settings.sound)
  const view = useGameStore((s) => s.view)

  const [open, setOpen] = useState(false)
  const [, force] = useState(0)

  useEffect(() => {
    const unsub = subscribeStateChange(() => force((x) => x + 1))
    return unsub
  }, [])

  // Auto-start music when enabled & track set (after user interaction)
  useEffect(() => {
    if (!musicEnabled || musicTrack === 'off' || musicTrack === '') {
      stopMusic()
      return
    }
    // Try to start the selected track if not already playing
    if (getCurrentTrackId() !== musicTrack) {
      playMusic(musicTrack)
    }
  }, [musicEnabled, musicTrack])

  // Hide widget on splash and onboarding
  if (view === 'splash' || view === 'onboarding') return null

  const currentTrack = TRACKS.find((t) => t.id === musicTrack) || TRACKS[0]
  const playing = isMusicPlaying()

  const handleTogglePlay = () => {
    unlockAudio()
    if (soundOn) playSound('click')
    if (playing) {
      stopMusic()
    } else {
      playMusic(musicEnabled && musicTrack !== 'off' ? musicTrack : 'petualangan')
    }
  }

  const handleSelectTrack = (trackId: string) => {
    unlockAudio()
    if (soundOn) playSound('click')
    if (trackId === 'off') {
      updateSettings({ music: false, musicTrack: 'off' })
      stopMusic()
    } else {
      updateSettings({ music: true, musicTrack: trackId })
      playMusic(trackId)
    }
  }

  return (
    <div className="fixed bottom-3 right-3 z-50 sm:bottom-5 sm:right-5">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="mb-2 w-64 rounded-2xl glass-strong p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-700">🎵 Musik Latar</div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Tutup"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {TRACKS.map((t) => {
                const isActive = (musicTrack === t.id) || (t.id === 'off' && (!musicEnabled || musicTrack === 'off'))
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTrack(t.id)}
                    className={`flex items-center gap-2 rounded-xl border-2 p-2 text-left transition-all ${
                      isActive
                        ? 'border-cyan-400 bg-cyan-50 shadow-sm'
                        : 'border-slate-200 bg-white/70 hover:border-cyan-300'
                    }`}
                  >
                    <span className="text-lg">{t.emoji}</span>
                    <div className="flex-1 overflow-hidden">
                      <div className="truncate text-xs font-bold text-slate-800">{t.name}</div>
                      <div className="truncate text-[9px] text-slate-500">{t.description}</div>
                    </div>
                    {isActive && playing && t.id !== 'off' && (
                      <motion.div
                        animate={{ scaleY: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="text-cyan-500"
                      >
                        🎵
                      </motion.div>
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setOpen((o) => !o); if (soundOn) playSound('click') }}
        className="relative flex h-12 w-12 items-center justify-center rounded-full glass-strong shadow-lg sm:h-14 sm:w-14"
        aria-label="Pengaturan musik"
      >
        <div className="flex h-full w-full items-center justify-center rounded-full">
          {playing ? (
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="text-2xl"
            >
              {currentTrack.emoji}
            </motion.div>
          ) : (
            <div className="text-2xl opacity-60">{currentTrack.emoji === '🔇' ? '🔇' : currentTrack.emoji}</div>
          )}
        </div>
        {/* Equalizer bars when playing */}
        {playing && (
          <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-end gap-0.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ height: [4, 8, 4] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                className="w-0.5 rounded-full bg-cyan-400"
              />
            ))}
          </div>
        )}
      </motion.button>
    </div>
  )
}
