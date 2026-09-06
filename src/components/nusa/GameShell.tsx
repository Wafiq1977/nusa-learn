'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { type ReactNode, useEffect } from 'react'
import { useGameStore, getRankFromXp } from '@/store/gameStore'
import { ParticleBackground } from './ParticleBackground'
import { Home, ChevronLeft, Settings as SettingsIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { playSound } from '@/lib/nusa/sound'

interface GameShellProps {
  children: ReactNode
  showBack?: boolean
  showHome?: boolean
  showSettings?: boolean
  bgVariant?: 'light' | 'deep' | 'splash'
  footer?: ReactNode
  hideHud?: boolean
}

export function GameShell({
  children,
  showBack = false,
  showHome = false,
  showSettings = false,
  bgVariant = 'light',
  footer,
  hideHud = false,
}: GameShellProps) {
  const view = useGameStore((s) => s.view)
  const goBack = useGameStore((s) => s.goBack)
  const goHome = useGameStore((s) => s.goHome)
  const setView = useGameStore((s) => s.setView)
  const name = useGameStore((s) => s.name)
  const xp = useGameStore((s) => s.xp)
  const coins = useGameStore((s) => s.coins)
  const stars = useGameStore((s) => s.stars)
  const rank = getRankFromXp(xp)
  const soundOn = useGameStore((s) => s.settings.sound)

  useEffect(() => {
    // Apply reduce-motion class globally
    const reduce = useGameStore.getState().settings.reduceMotion || !useGameStore.getState().settings.animations
    document.documentElement.classList.toggle('reduce-motion', reduce)
  }, [])

  return (
    <div
      className={cn(
        'relative flex min-h-[100dvh] flex-col',
        bgVariant === 'deep' && 'bg-nusa-deep text-white',
        bgVariant === 'splash' && 'bg-nusa-deep text-white',
        bgVariant === 'light' && 'bg-nusa-sky',
      )}
    >
      <ParticleBackground variant={bgVariant} />

      {/* HUD top bar */}
      {!hideHud && (
        <header className="sticky top-0 z-30 w-full px-3 pt-3 sm:px-5 sm:pt-4">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-2xl px-3 py-2 sm:px-4 glass">
            <div className="flex items-center gap-2">
              {(showBack || view !== 'splash') && view !== 'home' && (
                <button
                  aria-label="Kembali"
                  onClick={() => {
                    if (soundOn) playSound('click')
                    goBack()
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-slate-700 hover:bg-white active:scale-95 transition"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              {showHome && view !== 'home' && (
                <button
                  aria-label="Beranda"
                  onClick={() => {
                    if (soundOn) playSound('click')
                    goHome()
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-slate-700 hover:bg-white active:scale-95 transition"
                >
                  <Home className="h-5 w-5" />
                </button>
              )}
              {name && (
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="text-lg sm:text-xl">{rank.emoji}</span>
                  <div className="leading-tight">
                    <div className="font-bold text-slate-700">{name}</div>
                    <div className="text-[10px] text-slate-500 sm:text-xs">{rank.name}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <HudPill icon="⭐" value={stars} color="text-amber-500" />
              <HudPill icon="🪙" value={coins} color="text-amber-600" />
              <HudPill icon="✨" value={xp} valueClass="text-gradient-cyan font-bold" color="text-cyan-600" />
              {showSettings && (
                <button
                  aria-label="Pengaturan"
                  onClick={() => {
                    if (soundOn) playSound('click')
                    setView('settings')
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-slate-700 hover:bg-white active:scale-95 transition"
                >
                  <SettingsIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="relative z-10 flex-1 px-3 pb-6 pt-4 sm:px-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto w-full max-w-5xl"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {footer && (
        <footer className="sticky bottom-0 z-30 mt-auto px-3 pb-3 sm:px-5 sm:pb-5">
          <div className="mx-auto max-w-5xl">{footer}</div>
        </footer>
      )}

      {/* Always-on NUSA mini footer (sticks to bottom on short pages, pushed down on long) */}
      {!footer && bgVariant === 'light' && view !== 'game' && (
        <footer className="mt-auto px-3 pb-3 pt-2 sm:px-5 sm:pb-4">
          <div className="mx-auto max-w-5xl text-center text-[10px] uppercase tracking-widest text-slate-400">
            <span className="text-gradient-cyan font-bold">NUSA</span>
            <span className="text-gradient-purple font-bold"> LEARN</span>
            <span className="mx-2">·</span>
            <span>Play · Explore · Learn</span>
          </div>
        </footer>
      )}
    </div>
  )
}

function HudPill({
  icon,
  value,
  color,
  valueClass,
}: {
  icon: string
  value: number
  color: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-xs sm:text-sm shadow-sm">
      <span aria-hidden>{icon}</span>
      <span className={cn('font-bold tabular-nums', valueClass ?? color)}>{value.toLocaleString('id-ID')}</span>
    </div>
  )
}
