'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { AREAS, getLevelsForArea } from '@/lib/nusa/world'
import { GlassCard } from '@/components/nusa/GlassCard'
import { NovaMascot } from '@/components/nusa/NovaMascot'
import { playSound } from '@/lib/nusa/sound'
import { Lock, ChevronRight } from 'lucide-react'

// Position layout (percentages) for each area island
const ISLAND_POSITIONS: Record<string, { x: number; y: number }> = {
  number_city: { x: 25, y: 18 },
  literacy_forest: { x: 72, y: 22 },
  logic_lab: { x: 18, y: 48 },
  knowledge_library: { x: 75, y: 52 },
  future_station: { x: 35, y: 78 },
  challenge_arena: { x: 78, y: 82 },
}

// Connector lines between areas (from -> to) for the "path"
const CONNECTORS: [string, string][] = [
  ['number_city', 'logic_lab'],
  ['literacy_forest', 'knowledge_library'],
  ['number_city', 'literacy_forest'],
  ['logic_lab', 'future_station'],
  ['knowledge_library', 'future_station'],
  ['future_station', 'challenge_arena'],
]

export function WorldMapScreen() {
  const unlockedAreas = useGameStore((s) => s.unlockedAreas)
  const xp = useGameStore((s) => s.xp)
  const completedLevels = useGameStore((s) => s.completedLevels)
  const selectArea = useGameStore((s) => s.selectArea)
  const soundOn = useGameStore((s) => s.settings.sound)

  return (
    <div className="space-y-4">
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-black text-gradient-cyan sm:text-4xl"
        >
          World Map 🌎
        </motion.h1>
        <p className="mt-1 text-sm text-slate-600">Pilih area untuk mulai petualangan</p>
      </div>

      {/* The map */}
      <div
        className="relative mx-auto w-full max-w-3xl"
        style={{ aspectRatio: '3/4', minHeight: '60dvh', maxHeight: '85dvh' }}
      >
        {/* SVG connectors */}
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          {CONNECTORS.map(([from, to], i) => {
            const a = ISLAND_POSITIONS[from]
            const b = ISLAND_POSITIONS[to]
            if (!a || !b) return null
            const unlocked = unlockedAreas.includes(from) && unlockedAreas.includes(to)
            return (
              <motion.line
                key={i}
                x1={`${a.x}%`}
                y1={`${a.y}%`}
                x2={`${b.x}%`}
                y2={`${b.y}%`}
                stroke={unlocked ? 'url(#path-grad)' : '#CBD5E1'}
                strokeWidth={3}
                strokeDasharray={unlocked ? '0' : '6 6'}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
              />
            )
          })}
          <defs>
            <linearGradient id="path-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating islands */}
        {AREAS.map((area, i) => {
          const pos = ISLAND_POSITIONS[area.id]
          const unlocked = unlockedAreas.includes(area.id)
          const levels = getLevelsForArea(area.id)
          const completedCount = levels.filter((l) => completedLevels.includes(`${area.id}-${l.id}`)).length
          const isNext = !unlocked && area.unlockXp <= xp + 200

          return (
            <motion.button
              key={area.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.08, type: 'spring', stiffness: 200, damping: 14 }}
              onClick={() => {
                if (!unlocked) return
                if (soundOn) playSound('whoosh')
                selectArea(area.id)
              }}
              disabled={!unlocked}
              aria-label={`${area.name}${unlocked ? '' : ' (terkunci)'}`}
            >
              <motion.div
                animate={unlocked ? { y: [0, -6, 0] } : {}}
                transition={{ duration: 4 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={unlocked ? { scale: 1.08, rotate: 1 } : {}}
                whileTap={unlocked ? { scale: 0.96 } : {}}
                className={`relative flex flex-col items-center gap-1 ${
                  unlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'
                }`}
              >
                {/* Island disc */}
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br text-3xl shadow-xl sm:h-24 sm:w-24 sm:rounded-[28px] ${
                    area.color
                  } ${unlocked ? 'glow-' + (area.colorVar === 'sky' ? 'cyan' : area.colorVar) : 'grayscale'}`}
                >
                  <span className="drop-shadow">{area.emoji}</span>
                </div>

                {/* Label */}
                <GlassCard className="px-3 py-1.5 text-center">
                  <div className="text-xs font-bold text-slate-800 sm:text-sm">{area.name}</div>
                  <div className="text-[10px] text-slate-500">
                    {unlocked ? `${completedCount}/${levels.length} level` : `🔒 ${area.unlockXp} XP`}
                  </div>
                </GlassCard>

                {/* Lock overlay */}
                {!unlocked && (
                  <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-white shadow-lg">
                    <Lock className="h-4 w-4" />
                  </div>
                )}

                {/* "Next" pulse */}
                {isNext && (
                  <motion.div
                    className="absolute -right-1 -top-1"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  >
                    <div className="h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_10px_2px_rgba(251,191,36,0.7)]" />
                  </motion.div>
                )}
              </motion.div>
            </motion.button>
          )
        })}
      </div>

      {/* Detail panel: selected / hover info */}
      <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
        {AREAS.map((area) => {
          const unlocked = unlockedAreas.includes(area.id)
          return (
            <GlassCard
              key={area.id}
              glow={unlocked ? (area.colorVar === 'sky' ? 'cyan' : area.colorVar) : 'none'}
              className={`p-3 ${unlocked ? 'cursor-pointer hover:-translate-y-0.5' : 'opacity-70'}`}
              onClick={() => {
                if (!unlocked) return
                if (soundOn) playSound('whoosh')
                selectArea(area.id)
              }}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl ${area.color}`}>
                  {area.emoji}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-800">{area.name}</div>
                  <div className="text-[11px] text-slate-500">{area.tagline}</div>
                </div>
                {unlocked ? (
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                ) : (
                  <Lock className="h-4 w-4 text-slate-400" />
                )}
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* NOVA tip */}
      <div className="mx-auto max-w-2xl">
        <GlassCard className="flex items-center gap-3 p-4">
          <NovaMascot expression="thinking" size={44} />
          <p className="text-sm text-slate-600">
            <b className="text-slate-800">NOVA:</b> Selesaikan level untuk membuka area baru. Makin banyak XP, makin banyak dunia yang bisa kamu jelajahi! 🗺️
          </p>
        </GlassCard>
      </div>
    </div>
  )
}
