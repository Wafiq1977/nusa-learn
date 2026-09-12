'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { type ReactNode, useEffect, useState } from 'react'
import { useGameStore, getRankFromXp } from '@/store/gameStore'
import { ParticleBackground } from './ParticleBackground'
import { Home, ChevronLeft, Settings as SettingsIcon, ChevronDown, ChevronUp } from 'lucide-react'
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

// Views where HUD auto-collapses (games, battle) — kids can focus on play
const AUTO_COLLAPSE_VIEWS = ['game', 'multiplayer_battle']

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
  const tvMode = useGameStore((s) => s.settings.tvMode)

  // HUD collapse state — auto-collapse in game views
  const [hudCollapsed, setHudCollapsed] = useState(false)
  const [prevView, setPrevView] = useState<string>('')

  useEffect(() => {
    // Apply reduce-motion class globally
    const reduce = useGameStore.getState().settings.reduceMotion || !useGameStore.getState().settings.animations
    document.documentElement.classList.toggle('reduce-motion', reduce)
    // Apply TV mode class globally
    document.documentElement.classList.toggle('tv-mode', useGameStore.getState().settings.tvMode)
  }, [tvMode])

  // Auto-collapse/expand HUD when view changes
  useEffect(() => {
    if (view !== prevView) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHudCollapsed(AUTO_COLLAPSE_VIEWS.includes(view))
      setPrevView(view)
    }
  }, [view, prevView])

  const toggleHud = () => {
    if (soundOn) playSound('click')
    setHudCollapsed((c) => !c)
  }

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

      {/* HUD top bar — collapsible (full hidden saat collapsed) */}
      {!hideHud && (
        <>
          {/* Expanded HUD */}
          <AnimatePresence initial={false}>
            {!hudCollapsed && (
              <motion.header
                key="expanded-hud"
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -60, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="sticky top-0 z-30 w-full px-2 pt-2 sm:px-4 sm:pt-3 2xl:px-5 2xl:pt-4"
              >
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 2xl:px-5 2xl:py-4 glass">
                  <div className="flex items-center gap-2">
                    {(showBack || view !== 'splash') && view !== 'home' && (
                      <button
                        aria-label="Kembali"
                        onClick={() => {
                          if (soundOn) playSound('click')
                          goBack()
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-slate-700 hover:bg-white active:scale-95 transition sm:h-10 sm:w-10 2xl:h-12 2xl:w-12"
                      >
                        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 2xl:h-7 2xl:w-7" />
                      </button>
                    )}
                    {showHome && view !== 'home' && (
                      <button
                        aria-label="Beranda"
                        onClick={() => {
                          if (soundOn) playSound('click')
                          goHome()
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-slate-700 hover:bg-white active:scale-95 transition sm:h-10 sm:w-10 2xl:h-12 2xl:w-12"
                      >
                        <Home className="h-5 w-5 sm:h-6 sm:w-6 2xl:h-7 2xl:w-7" />
                      </button>
                    )}
                    {name && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm 2xl:text-base">
                        <span className="text-lg sm:text-xl 2xl:text-2xl">{rank.emoji}</span>
                        <div className="leading-tight">
                          <div className="font-bold text-slate-700">{name}</div>
                          <div className="text-[10px] text-slate-500 sm:text-xs 2xl:text-sm">{rank.name}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2.5 2xl:gap-3">
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
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-slate-700 hover:bg-white active:scale-95 transition sm:h-10 sm:w-10 2xl:h-12 2xl:w-12"
                      >
                        <SettingsIcon className="h-4 w-4 sm:h-5 sm:w-5 2xl:h-6 2xl:w-6" />
                      </button>
                    )}
                    {/* Collapse toggle button */}
                    <button
                      aria-label="Tutup panel"
                      onClick={toggleHud}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200/70 text-slate-600 hover:bg-slate-200 active:scale-95 transition sm:h-10 sm:w-10 2xl:h-12 2xl:w-12"
                      title="Sembunyikan panel agar tidak mengganggu"
                    >
                      <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 2xl:h-6 2xl:w-6" />
                    </button>
                  </div>
                </div>
              </motion.header>
            )}
          </AnimatePresence>

          {/* Floating expand button (muncul saat HUD collapsed — benar-benar hilang penuh) */}
          <AnimatePresence>
            {hudCollapsed && (
              <motion.button
                key="floating-expand"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                onClick={toggleHud}
                aria-label="Tampilkan panel"
                title="Tampilkan panel (⭐ ✨ 🪙 & navigasi)"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="fixed right-2 top-2 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-cyan-600 shadow-lg backdrop-blur-md hover:bg-white sm:h-11 sm:w-11 2xl:h-14 2xl:w-14 2xl:text-2xl"
              >
                <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 2xl:h-7 2xl:w-7" />
              </motion.button>
            )}
          </AnimatePresence>
        </>
      )}

      <main className="relative z-10 flex-1 px-2 pb-6 pt-3 sm:px-4 sm:pb-8 sm:pt-4 2xl:px-6 2xl:pb-10 2xl:pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto w-full max-w-5xl 2xl:max-w-6xl"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {footer && (
        <footer className="sticky bottom-0 z-30 mt-auto px-2 pb-2 sm:px-4 sm:pb-4 2xl:px-5 2xl:pb-5">
          <div className="mx-auto max-w-5xl 2xl:max-w-6xl">{footer}</div>
        </footer>
      )}

      {/* Always-on NUSA mini footer */}
      {!footer && bgVariant === 'light' && view !== 'game' && (
        <footer className="mt-auto px-2 pb-3 pt-2 sm:px-4 sm:pb-4 2xl:px-5 2xl:pb-5">
          <div className="mx-auto max-w-5xl 2xl:max-w-6xl text-center text-[10px] uppercase tracking-widest text-slate-400 sm:text-xs 2xl:text-sm">
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
    <div className="flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-[10px] font-bold shadow-sm sm:text-xs 2xl:text-sm 2xl:px-3 2xl:py-1.5">
      <span aria-hidden className="text-sm sm:text-base 2xl:text-lg">{icon}</span>
      <span className={cn('tabular-nums', valueClass ?? color)}>{value.toLocaleString('id-ID')}</span>
    </div>
  )
}
