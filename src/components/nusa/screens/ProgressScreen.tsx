'use client'

import { motion } from 'framer-motion'
import { useGameStore, getRankFromXp, getNextRank, RANK_THRESHOLDS } from '@/store/gameStore'
import { GlassCard } from '@/components/nusa/GlassCard'
import { GlowButton } from '@/components/nusa/GlowButton'
import { NovaMascot } from '@/components/nusa/NovaMascot'
import { SkillBar } from '@/components/nusa/SkillBar'
import { playSound } from '@/lib/nusa/sound'
import { TrendingUp, Target, Award, Flame, BookOpen, Calculator, Brain } from 'lucide-react'

export function ProgressScreen() {
  const name = useGameStore((s) => s.name)
  const xp = useGameStore((s) => s.xp)
  const coins = useGameStore((s) => s.coins)
  const stars = useGameStore((s) => s.stars)
  const completedLevels = useGameStore((s) => s.completedLevels)
  const skillProgress = useGameStore((s) => s.skillProgress)
  const stats = useGameStore((s) => s.stats)
  const badges = useGameStore((s) => s.badges)
  const setView = useGameStore((s) => s.setView)
  const soundOn = useGameStore((s) => s.settings.sound)

  const rank = getRankFromXp(xp)
  const nextRank = getNextRank(xp)
  const accuracy = stats.correct + stats.wrong > 0 ? Math.round((stats.correct / (stats.correct + stats.wrong)) * 100) : 0

  // Numerik & literasi overall scores
  const numScores = Object.values(skillProgress.numerik || {})
  const litScores = Object.values(skillProgress.literasi || {})
  const numAvg = numScores.length ? Math.round(numScores.reduce((a, b) => a + b, 0) / numScores.length) : 0
  const litAvg = litScores.length ? Math.round(litScores.reduce((a, b) => a + b, 0) / litScores.length) : 0
  // Generic "logic" score = average of pola/perbandingan/geometri
  const logicKeys = ['pola', 'perbandingan', 'geometri']
  const logicVals = logicKeys.map((k) => skillProgress.numerik?.[k] || 0).filter((v) => v > 0)
  const logicAvg = logicVals.length ? Math.round(logicVals.reduce((a, b) => a + b, 0) / logicVals.length) : 0

  // Detailed numerik subcategories
  const numerikSubs = [
    { key: 'penjumlahan', label: 'Penjumlahan', color: 'cyan' as const },
    { key: 'pengurangan', label: 'Pengurangan', color: 'cyan' as const },
    { key: 'perkalian', label: 'Perkalian', color: 'cyan' as const },
    { key: 'pembagian', label: 'Pembagian', color: 'cyan' as const },
    { key: 'pecahan', label: 'Pecahan', color: 'cyan' as const },
    { key: 'pola', label: 'Pola bilangan', color: 'emerald' as const },
    { key: 'uang', label: 'Uang', color: 'cyan' as const },
    { key: 'waktu', label: 'Waktu', color: 'cyan' as const },
    { key: 'geometri', label: 'Geometri', color: 'emerald' as const },
    { key: 'perbandingan', label: 'Perbandingan', color: 'emerald' as const },
    { key: 'soal_cerita', label: 'Soal cerita', color: 'orange' as const },
  ]
  const literasiSubs = [
    { key: 'membaca', label: 'Membaca', color: 'purple' as const },
    { key: 'ide_pokok', label: 'Ide pokok', color: 'purple' as const },
    { key: 'informasi', label: 'Mencari informasi', color: 'purple' as const },
    { key: 'kosakata', label: 'Kosakata', color: 'purple' as const },
    { key: 'karakter', label: 'Karakter', color: 'purple' as const },
    { key: 'sebab_akibat', label: 'Sebab-akibat', color: 'purple' as const },
    { key: 'menyimpulkan', label: 'Menyimpulkan', color: 'purple' as const },
    { key: 'fakta_opini', label: 'Fakta & opini', color: 'purple' as const },
    { key: 'menyusun_kalimat', label: 'Menyusun kalimat', color: 'purple' as const },
  ]

  return (
    <div className="space-y-5 pb-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl font-black text-gradient-cyan sm:text-4xl">My Learning Journey 📈</h1>
        <p className="mt-1 text-sm text-slate-600">Perjalanan belajar {name} sejauh ini</p>
      </motion.div>

      {/* Stat overview cards */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3 2xl:gap-4"
      >
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Total XP" value={xp} glow="cyan" />
        <StatCard icon={<Target className="h-5 w-5" />} label="Akurasi" value={`${accuracy}%`} glow="emerald" />
        <StatCard icon={<Award className="h-5 w-5" />} label="Badge" value={badges.length} glow="purple" />
        <StatCard icon={<Flame className="h-5 w-5" />} label="Streak" value={stats.bestStreak} glow="orange" />
      </motion.div>

      {/* Rank progress */}
      <GlassCard glow="cyan" className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{rank.emoji}</div>
            <div>
              <div className="text-sm font-bold text-slate-800">{rank.name}</div>
              <div className="text-xs text-slate-500">Level {rank.level} · {xp} XP</div>
            </div>
          </div>
          {nextRank && (
            <div className="text-right text-xs text-slate-500">
              <div className="font-bold text-slate-700">{nextRank.emoji} {nextRank.name}</div>
              <div>{nextRank.minXp - xp} XP lagi</div>
            </div>
          )}
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${nextRank ? ((xp - rank.minXp) / (nextRank.minXp - rank.minXp)) * 100 : 100}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-full bg-gradient-to-r from-sky-400 via-cyan-400 to-purple-400"
          />
        </div>
        {/* All rank tiers */}
        <div className="mt-3 flex items-center justify-between">
          {RANK_THRESHOLDS.map((r) => (
            <div key={r.level} className="flex flex-col items-center text-center">
              <div className={`text-lg ${r.level <= rank.level ? '' : 'opacity-40'}`}>{r.emoji}</div>
              <div className={`text-[9px] sm:text-[10px] ${r.level <= rank.level ? 'font-bold text-slate-700' : 'text-slate-400'}`}>
                {r.name.split(' ')[0]}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Overall skill bars */}
      <GlassCard className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-purple-500" />
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Rangkuman Skill</h3>
        </div>
        <div className="space-y-3">
          <SkillBar label="Numerik" value={numAvg} color="cyan" />
          <SkillBar label="Literasi" value={litAvg} color="purple" />
          <SkillBar label="Logika" value={logicAvg} color="emerald" />
        </div>
      </GlassCard>

      {/* Numerik detail */}
      <GlassCard className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Calculator className="h-4 w-4 text-cyan-500" />
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Numerik Detail</h3>
        </div>
        <div className="space-y-2.5">
          {numerikSubs.map((s) => (
            <SkillBar
              key={s.key}
              label={s.label}
              value={skillProgress.numerik?.[s.key] || 0}
              color={s.color}
              size="sm"
            />
          ))}
        </div>
      </GlassCard>

      {/* Literasi detail */}
      <GlassCard className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-purple-500" />
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Literasi Detail</h3>
        </div>
        <div className="space-y-2.5">
          {literasiSubs.map((s) => (
            <SkillBar
              key={s.key}
              label={s.label}
              value={skillProgress.literasi?.[s.key] || 0}
              color={s.color}
              size="sm"
            />
          ))}
        </div>
      </GlassCard>

      {/* Stats summary */}
      <GlassCard className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Brain className="h-4 w-4 text-emerald-500" />
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Statistik Belajar</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <MiniStat label="Total main" value={stats.totalPlayed} />
          <MiniStat label="Jawaban benar" value={stats.correct} />
          <MiniStat label="Jawaban salah" value={stats.wrong} />
          <MiniStat label="Level selesai" value={completedLevels.length} />
        </div>
      </GlassCard>

      <GlassCard className="flex items-center gap-3 p-4">
        <NovaMascot expression="encouraging" size={44} />
        <p className="text-sm text-slate-600">
          <b className="text-slate-800">NOVA:</b> Progresmu terlihat bagus! Kamu sedang berkembang pesat. Yuk lanjutkan petualanganmu! 🚀
        </p>
      </GlassCard>

      <div className="flex justify-center">
        <GlowButton glow="cyan" onClick={() => { if (soundOn) playSound('whoosh'); setView('rewards') }}>
          Lihat Badge & Rewards 🏆
        </GlowButton>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, glow }: { icon: React.ReactNode; label: string; value: number | string; glow: 'cyan' | 'purple' | 'emerald' | 'orange' }) {
  const grad = {
    cyan: 'from-sky-400 to-cyan-500',
    purple: 'from-purple-500 to-fuchsia-500',
    emerald: 'from-emerald-400 to-teal-500',
    orange: 'from-amber-400 to-orange-500',
  }[glow]
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
      <GlassCard className="p-4 text-center">
        <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} text-white shadow`}>
          {icon}
        </div>
        <div className="text-2xl font-black text-slate-800">{value}</div>
        <div className="text-[11px] text-slate-500">{label}</div>
      </GlassCard>
    </motion.div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/70 p-3 text-center">
      <div className="text-xl font-bold text-slate-800">{value}</div>
      <div className="text-[10px] text-slate-500">{label}</div>
    </div>
  )
}
