'use client'

import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { getArea, getLevelsForArea, type LevelDef, areaToQuestionCategory } from '@/lib/nusa/world'
import { GlassCard } from '@/components/nusa/GlassCard'
import { GlowButton } from '@/components/nusa/GlowButton'
import { NovaMascot } from '@/components/nusa/NovaMascot'
import { StarRating } from '@/components/nusa/StarRating'
import { playSound } from '@/lib/nusa/sound'
import { Lock, Crown, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useQuestions } from '@/hooks/use-questions'

export function AreaScreen() {
  const areaId = useGameStore((s) => s.currentAreaId)
  const area = areaId ? getArea(areaId) : null
  const levels = areaId ? getLevelsForArea(areaId) : []
  const completedLevels = useGameStore((s) => s.completedLevels)
  const unlockedAreas = useGameStore((s) => s.unlockedAreas)
  const setView = useGameStore((s) => s.setView)
  const selectLevel = useGameStore((s) => s.selectLevel)
  const soundOn = useGameStore((s) => s.settings.sound)

  const [selected, setSelected] = useState<LevelDef | null>(null)

  if (!area) {
    return null
  }

  const isUnlocked = unlockedAreas.includes(area.id)
  const isLevelUnlocked = (lvl: LevelDef, idx: number) => {
    if (!isUnlocked) return false
    if (idx === 0) return true
    const prev = levels[idx - 1]
    return completedLevels.includes(`${area.id}-${prev.id}`)
  }

  const handleLevelClick = (lvl: LevelDef) => {
    if (soundOn) playSound('click')
    selectLevel(lvl.id) // sets currentLevelId + view=level_select
  }

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className={`mx-auto inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br text-5xl shadow-xl ${area.color} glow-${area.colorVar === 'sky' ? 'cyan' : area.colorVar}`}>
          {area.emoji}
        </div>
        <h1 className="mt-3 text-3xl font-black text-gradient-cyan sm:text-4xl">{area.name}</h1>
        <p className="mt-1 text-sm text-slate-600">{area.description}</p>
      </motion.div>

      {!isUnlocked ? (
        <GlassCard className="p-6 text-center">
          <Lock className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-3 font-bold text-slate-700">Area terkunci</p>
          <p className="text-sm text-slate-500">Kumpulkan {area.unlockXp} XP untuk membuka area ini.</p>
        </GlassCard>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {levels.map((lvl, i) => {
              const unlocked = isLevelUnlocked(lvl, i)
              const completed = completedLevels.includes(`${area.id}-${lvl.id}`)
              return (
                <motion.div
                  key={lvl.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={unlocked ? { y: -3 } : {}}
                >
                  <GlassCard
                    glow={lvl.isBoss ? 'orange' : completed ? (area.colorVar === 'sky' ? 'cyan' : area.colorVar) : 'none'}
                    className={`relative h-full p-4 ${unlocked ? 'cursor-pointer' : 'opacity-60'}`}
                    onClick={() => unlocked && handleLevelClick(lvl)}
                    role="button"
                    tabIndex={unlocked ? 0 : -1}
                  >
                    {lvl.isBoss && (
                      <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
                        <Crown className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-2xl ${
                        unlocked
                          ? `bg-gradient-to-br ${area.color} text-white shadow-md`
                          : 'bg-slate-200 text-slate-400'
                      }`}>
                        {unlocked ? lvl.emoji : <Lock className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-800">{lvl.name}</div>
                        <div className="text-[11px] text-slate-500">{lvl.subtitle}</div>
                        {completed && (
                          <div className="mt-2 flex items-center gap-1">
                            <StarRating stars={3} size={14} animate={false} />
                            <span className="text-[10px] text-emerald-600">Selesai!</span>
                          </div>
                        )}
                        {!unlocked && !completed && (
                          <div className="mt-2 text-[10px] text-slate-400">Selesaikan level sebelumnya dulu</div>
                        )}
                        {unlocked && !completed && (
                          <div className="mt-2 text-[10px] font-medium text-cyan-600">Tap untuk mulai →</div>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )
            })}
          </div>

          <GlassCard className="flex items-center gap-3 p-4">
            <NovaMascot expression="encouraging" size={44} />
            <p className="text-sm text-slate-600">
              <b className="text-slate-800">NOVA:</b> Selesaikan level dari 1 sampai Boss untuk membuka area berikutnya. Setiap jawaban benar = XP + bintang! ⭐
            </p>
          </GlassCard>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <GlowButton variant="soft" onClick={() => { if (soundOn) playSound('click'); setView('practice') }}>
              Latihan Bebas 📚
            </GlowButton>
          </div>
        </>
      )}
    </div>
  )
}

// LevelSelectScreen — shows brief + fetches questions + starts the session
export function LevelSelectScreen() {
  const areaId = useGameStore((s) => s.currentAreaId)
  const levelId = useGameStore((s) => s.currentLevelId)
  const grade = useGameStore((s) => s.grade)
  const goBack = useGameStore((s) => s.goBack)
  const startSession = useGameStore((s) => s.startSession)
  const soundOn = useGameStore((s) => s.settings.sound)

  const area = areaId ? getArea(areaId) : null
  const level = levelId ? getLevelsForArea(areaId || '').find((l) => l.id === levelId) : null
  const cat = area ? areaToQuestionCategory(area.id) : 'numerik'
  const { questions, loading, error } = useQuestions({
    grade,
    category: cat,
    subcategory: level?.subcategory,
    difficulty: level?.difficulty,
    limit: level?.questionCount || 5,
    mix: true,
    gameType: level?.gameType === 'build' ? 'build' : undefined,
    enabled: !!level,
  })

  if (!area || !level) {
    return null
  }

  const handleStart = () => {
    if (questions.length === 0) return
    if (soundOn) playSound('whoosh')
    startSession({
      area: area.id,
      level: level.id,
      category: cat,
      title: level.name,
      subtitle: level.subtitle,
      questions,
      gameType: level.gameType,
    })
  }

  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <GlassCard strong className="p-6 text-center">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className={`mx-auto inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br text-4xl shadow-xl ${area.color}`}
          >
            {level.emoji}
          </motion.div>
          <h2 className="mt-3 text-2xl font-black text-slate-800">{level.name}</h2>
          <p className="text-sm text-slate-500">{area.name} · {level.subtitle}</p>

          <p className="mt-4 text-sm text-slate-600">{level.brief}</p>

          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <Stat label="Soal" value={`${level.questionCount}`} />
            <Stat label="Tingkat" value={level.difficulty === 'easy' ? 'Mudah' : level.difficulty === 'medium' ? 'Sedang' : 'Sulit'} />
            <Stat label="Max XP" value={`~${level.questionCount * 40}`} />
          </div>

          {loading && (
            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Menyiapkan misi...
            </div>
          )}
          {error && (
            <p className="mt-4 text-sm text-rose-600">Yah, gagal memuat. Coba kembali dan klik lagi.</p>
          )}

          <div className="mt-6 flex gap-2">
            <GlowButton variant="soft" size="md" onClick={goBack}>
              ← Kembali
            </GlowButton>
            <GlowButton
              glow={level.isBoss ? 'orange' : 'cyan'}
              size="md"
              className="flex-1"
              onClick={handleStart}
              disabled={loading || questions.length === 0}
            >
              {loading ? 'Menyiapkan...' : 'Mulai Misi! 🚀'}
            </GlowButton>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/70 p-2">
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className="text-sm font-bold text-slate-700">{value}</div>
    </div>
  )
}
