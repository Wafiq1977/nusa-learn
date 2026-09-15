'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { AREAS, getLevelsForArea } from '@/lib/nusa/world'
import { GlassCard } from '@/components/nusa/GlassCard'
import { NovaMascot } from '@/components/nusa/NovaMascot'
import { playSound } from '@/lib/nusa/sound'
import { Lock, ChevronRight } from 'lucide-react'

// Position layout (percentages) for each area — disesuaikan untuk terrain gunung
const ISLAND_POSITIONS: Record<string, { x: number; y: number }> = {
  number_city: { x: 25, y: 22 },
  literacy_forest: { x: 72, y: 18 },
  logic_lab: { x: 18, y: 50 },
  knowledge_library: { x: 75, y: 48 },
  future_station: { x: 35, y: 75 },
  challenge_arena: { x: 72, y: 80 },
}

// Connector lines between areas
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
    <div className="space-y-3 sm:space-y-4">
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-black text-gradient-cyan sm:text-3xl md:text-4xl"
        >
          Peta Dunia NUSA 🗺️
        </motion.h1>
        <p className="mt-1 text-xs text-slate-600 sm:text-sm">Pilih area untuk mulai petualangan</p>
      </div>

      {/* The map — dengan terrain gunung SVG */}
      <div
        className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border-2 border-cyan-300/50 shadow-xl"
        style={{ aspectRatio: '3/4', minHeight: '55dvh', maxHeight: '80dvh' }}
      >
        {/* SVG Mountain Terrain Background */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            {/* Sky gradient */}
            <linearGradient id="sky-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E0F2FE" />
              <stop offset="40%" stopColor="#F0F9FF" />
              <stop offset="100%" stopColor="#DCFCE7" />
            </linearGradient>
            {/* Mountain gradient */}
            <linearGradient id="mtn-back" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="mtn-mid" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="mtn-front" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0.4" />
            </linearGradient>
            {/* Path gradient */}
            <linearGradient id="path-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
            {/* River gradient */}
            <linearGradient id="river-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Sky */}
          <rect width="300" height="400" fill="url(#sky-grad)" />

          {/* Clouds */}
          <ellipse cx="60" cy="40" rx="25" ry="8" fill="white" opacity="0.6" />
          <ellipse cx="220" cy="30" rx="30" ry="10" fill="white" opacity="0.5" />
          <ellipse cx="150" cy="55" rx="20" ry="7" fill="white" opacity="0.4" />

          {/* Back mountains (purple, far away) */}
          <path d="M 0 180 L 40 90 L 80 160 L 120 70 L 180 150 L 230 80 L 300 170 L 300 200 L 0 200 Z" fill="url(#mtn-back)" />
          {/* Snow caps back */}
          <path d="M 40 90 L 30 110 L 50 105 Z" fill="white" opacity="0.7" />
          <path d="M 120 70 L 108 95 L 132 90 Z" fill="white" opacity="0.7" />
          <path d="M 230 80 L 218 105 L 242 100 Z" fill="white" opacity="0.7" />

          {/* Mid mountains (cyan) */}
          <path d="M 0 260 L 30 180 L 60 230 L 100 160 L 150 220 L 190 170 L 240 240 L 300 200 L 300 280 L 0 280 Z" fill="url(#mtn-mid)" />
          {/* Snow caps mid */}
          <path d="M 100 160 L 88 185 L 112 180 Z" fill="white" opacity="0.6" />
          <path d="M 190 170 L 178 195 L 202 190 Z" fill="white" opacity="0.5" />

          {/* River flowing through */}
          <path d="M 150 55 Q 145 120 155 180 Q 165 240 140 300 Q 120 360 135 400" fill="none" stroke="url(#river-grad)" strokeWidth="6" strokeLinecap="round" opacity="0.5" />

          {/* Front hills (green) */}
          <path d="M 0 340 L 20 290 L 50 320 L 80 270 L 120 310 L 160 280 L 200 320 L 250 290 L 300 330 L 300 400 L 0 400 Z" fill="url(#mtn-front)" />

          {/* Trees scattered */}
          <g opacity="0.4">
            <text x="20" y="330" font-size="14">🌲</text>
            <text x="55" y="335" font-size="12">🌳</text>
            <text x="90" y="325" font-size="14">🌲</text>
            <text x="125" y="340" font-size="11">🌿</text>
            <text x="170" y="330" font-size="13">🌲</text>
            <text x="210" y="340" font-size="12">🌳</text>
            <text x="250" y="325" font-size="14">🌲</text>
            <text x="275" y="345" font-size="11">🌿</text>
            <text x="45" y="250" font-size="10">🌲</text>
            <text x="200" y="250" font-size="10">🌳</text>
            <text x="100" y="200" font-size="10">🌲</text>
          </g>

          {/* Trail paths (connectors) */}
          {CONNECTORS.map(([from, to], i) => {
            const a = ISLAND_POSITIONS[from]
            const b = ISLAND_POSITIONS[to]
            if (!a || !b) return null
            const unlocked = unlockedAreas.includes(from) && unlockedAreas.includes(to)
            return (
              <line
                key={`trail-${i}`}
                x1={`${a.x}%`}
                y1={`${a.y}%`}
                x2={`${b.x}%`}
                y2={`${b.y}%`}
                stroke={unlocked ? 'url(#path-grad)' : '#94A3B8'}
                strokeWidth="2.5"
                strokeDasharray={unlocked ? '0' : '5 5'}
                strokeLinecap="round"
                opacity={unlocked ? 0.7 : 0.3}
              />
            )
          })}
        </svg>

        {/* Floating area markers — on top of terrain */}
        {AREAS.map((area, i) => {
          const pos = ISLAND_POSITIONS[area.id]
          const unlocked = unlockedAreas.includes(area.id)
          const levels = getLevelsForArea(area.id)
          const completedCount = levels.filter((l) => completedLevels.includes(`${area.id}-${l.id}`)).length
          const isNext = !unlocked && area.unlockXp <= xp + 200

          return (
            <motion.button
              key={area.id}
              className="absolute"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, marginLeft: '-40px', marginTop: '-40px' }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
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
                animate={unlocked ? { y: [0, -5, 0] } : {}}
                transition={{ duration: 4 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={unlocked ? { scale: 1.1 } : {}}
                whileTap={unlocked ? { scale: 0.95 } : {}}
                className={`relative flex flex-col items-center gap-1 ${unlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
              >
                {/* Location pin / marker */}
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl shadow-xl sm:h-20 sm:w-20 sm:text-3xl ${
                    area.color
                  } ${unlocked ? 'ring-2 ring-white/60' : 'grayscale'}`}
                  style={{ filter: unlocked ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' : 'none' }}
                >
                  <span className="drop-shadow">{area.emoji}</span>
                </div>

                {/* Pin pointer (triangle ke bawah) */}
                <div
                  className={`-mt-2 h-0 w-0 border-x-[10px] border-t-[10px] border-x-transparent bg-gradient-to-b ${area.color}`}
                  style={{ borderTopColor: 'rgba(0,0,0,0.2)' }}
                />

                {/* Label */}
                <div className="rounded-xl bg-white/90 px-2 py-0.5 text-center shadow-md backdrop-blur-sm">
                  <div className="text-[10px] font-bold text-slate-800 sm:text-xs">{area.name}</div>
                  <div className="text-[8px] text-slate-500 sm:text-[10px]">
                    {unlocked ? `${completedCount}/${levels.length} selesai` : `🔒 ${area.unlockXp} XP`}
                  </div>
                </div>

                {/* Lock overlay */}
                {!unlocked && (
                  <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-white shadow-lg">
                    <Lock className="h-3 w-3" />
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

        {/* Compass rose di pojok kanan atas */}
        <div className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/60 text-xs font-bold text-slate-600 shadow-md backdrop-blur-sm sm:h-12 sm:w-12">
          <div className="flex flex-col items-center">
            <span className="text-cyan-600">N</span>
            <span className="text-[8px] text-slate-400">⬆</span>
          </div>
        </div>
      </div>

      {/* Detail panel: area list */}
      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
        {AREAS.map((area) => {
          const unlocked = unlockedAreas.includes(area.id)
          return (
            <GlassCard
              key={area.id}
              glow={unlocked ? (area.colorVar === 'sky' ? 'cyan' : area.colorVar) : 'none'}
              className={`p-2.5 sm:p-3 ${unlocked ? 'cursor-pointer hover:-translate-y-0.5' : 'opacity-60'}`}
              onClick={() => {
                if (!unlocked) return
                if (soundOn) playSound('whoosh')
                selectArea(area.id)
              }}
              role="button"
              tabIndex={unlocked ? 0 : -1}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br text-xl shadow sm:h-10 sm:w-10 sm:text-2xl ${area.color} ${unlocked ? '' : 'grayscale'}`}>
                  {area.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 sm:text-sm">{area.name}</div>
                  <div className="text-[10px] text-slate-500 sm:text-[11px]">{area.tagline}</div>
                </div>
                {unlocked ? (
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400 sm:h-5 sm:w-5" />
                ) : (
                  <Lock className="h-4 w-4 flex-shrink-0 text-slate-400" />
                )}
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* NOVA tip */}
      <div className="mx-auto max-w-2xl">
        <GlassCard className="flex items-center gap-3 p-3 sm:p-4">
          <NovaMascot expression="thinking" size={40} />
          <p className="text-xs text-slate-600 sm:text-sm">
            <b className="text-slate-800">NOVA:</b> Jelajahi setiap gunung dan lembah! Selesaikan level untuk membuka area baru. Makin banyak XP, makin jauh petualanganmu! 🏔️
          </p>
        </GlassCard>
      </div>
    </div>
  )
}
