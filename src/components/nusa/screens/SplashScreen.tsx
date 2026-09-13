'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { ParticleBackground } from '@/components/nusa/ParticleBackground'
import { NovaMascot } from '@/components/nusa/NovaMascot'
import { GlowButton } from '@/components/nusa/GlowButton'
import { playSound } from '@/lib/nusa/sound'

export function SplashScreen() {
  const name = useGameStore((s) => s.name)
  const setView = useGameStore((s) => s.setView)
  const [phase, setPhase] = useState<'logo' | 'tagline' | 'cta'>('logo')
  const soundOn = useGameStore((s) => s.settings.sound)

  useEffect(() => {
    if (soundOn) {
      try {
        playSound('whoosh')
      } catch {
        /* ignore */
      }
    }
    const t1 = setTimeout(() => setPhase('tagline'), 900)
    const t2 = setTimeout(() => setPhase('cta'), 1900)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [soundOn])

  const handleEnter = () => {
    if (soundOn) playSound('unlock')
    setView(name ? 'home' : 'onboarding')
  }

  return (
    <div
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-nusa-deep text-white cursor-pointer"
      onClick={handleEnter}
      role="button"
      tabIndex={0}
      aria-label="Masuk ke NUSA LEARN"
    >
      <ParticleBackground variant="splash" density={0.00015} />

      {/* Floating accent orbs */}
      <motion.div
        className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl"
        animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -right-16 bottom-24 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl"
        animate={{ y: [0, -20, 0], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 16 }}
          className="relative"
        >
          <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-cyan-400/40 via-purple-400/40 to-pink-400/40 blur-2xl" />
          <div className="relative flex flex-col items-center">
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, -3, 3, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <NovaMascot expression="happy" size={90} />
            </motion.div>
            <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="text-gradient-cyan drop-shadow-[0_4px_20px_rgba(34,211,238,0.4)]">NUSA</span>
              <span className="ml-2 text-gradient-purple drop-shadow-[0_4px_20px_rgba(168,85,247,0.4)]">LEARN</span>
            </h1>
          </div>
        </motion.div>

        {/* Tagline */}
        <AnimatePresence>
          {phase !== 'logo' && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-4 text-sm font-medium text-cyan-100/90 sm:text-lg md:text-xl 2xl:text-2xl"
            >
              Belajar jadi petualangan.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Sub-tagline */}
        <AnimatePresence>
          {phase === 'cta' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 flex flex-col items-center gap-3 sm:mt-10 sm:gap-4"
            >
              <p className="text-xs text-cyan-100/70 sm:text-sm md:text-base px-4 text-center">
                Jelajahi dunia futuristik. Asah numerik & literasi sambil bermain.
              </p>
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              >
                <GlowButton
                  glow="cyan"
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEnter()
                  }}
                >
                  {name ? `Lanjutkan, ${name}! 🚀` : 'Mulai Petualangan ✨'}
                </GlowButton>
              </motion.div>
              <p className="text-[11px] text-cyan-200/40">Ketuk layar mana saja untuk masuk</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom corner badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-cyan-200/40"
      >
        Play · Explore · Learn
      </motion.div>
    </div>
  )
}
