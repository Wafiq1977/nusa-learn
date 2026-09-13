'use client'

import { motion } from 'framer-motion'
import { useGameStore, getRankFromXp, getNextRank } from '@/store/gameStore'
import { GlassCard } from '@/components/nusa/GlassCard'
import { GlowButton } from '@/components/nusa/GlowButton'
import { NovaMascot } from '@/components/nusa/NovaMascot'
import { CharacterAvatar } from './OnboardingScreen'
import { playSound } from '@/lib/nusa/sound'
import { Compass, Calendar, BarChart3, Trophy, User, Zap, ChevronRight, Star, Sparkles, Gamepad2, Shield, Users } from 'lucide-react'

export function HomeScreen() {
  const name = useGameStore((s) => s.name)
  const grade = useGameStore((s) => s.grade)
  const xp = useGameStore((s) => s.xp)
  const character = useGameStore((s) => s.character)
  const setView = useGameStore((s) => s.setView)
  const completedLevels = useGameStore((s) => s.completedLevels)
  const dailyStreak = useGameStore((s) => s.dailyStreak)
  const soundOn = useGameStore((s) => s.settings.sound)

  const rank = getRankFromXp(xp)
  const nextRank = getNextRank(xp)
  const progressInRank = nextRank
    ? Math.min(100, Math.round(((xp - rank.minXp) / (nextRank.minXp - rank.minXp)) * 100))
    : 100

  const nav = (target: 'world_map' | 'daily' | 'progress' | 'rewards' | 'profile', sound: 'whoosh' | 'click' = 'whoosh') => {
    if (soundOn) playSound(sound)
    setView(target)
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center sm:text-left"
      >
        <p className="text-xs text-slate-500 sm:text-sm md:text-base">Selamat datang kembali di</p>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">
          <span className="text-gradient-cyan">Halo, {name}</span>{' '}
          <motion.span
            animate={{ rotate: [0, 18, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.5 }}
            className="inline-block"
          >
            👋
          </motion.span>
        </h1>
      </motion.div>

      {/* Hero card: character + rank progress */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        <GlassCard glow="cyan" className="overflow-hidden p-3 sm:p-5 md:p-6">
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
            <div className="flex-shrink-0 rounded-2xl bg-gradient-to-br from-sky-100 to-purple-100 p-1.5 shadow-inner sm:p-2">
              <CharacterAvatar char={character} size={64} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="text-xl sm:text-2xl">{rank.emoji}</span>
                <div className="min-w-0">
                  <div className="font-bold text-slate-800">{rank.name}</div>
                  <div className="text-xs text-slate-500">Kelas {grade} · {xp} XP</div>
                </div>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[11px] text-slate-500">
                  <span>{rank.name}</span>
                  <span>{nextRank ? nextRank.name : 'Maksimum!'}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressInRank}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-purple-400"
                  />
                </div>
                {nextRank && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    {nextRank.minXp - xp} XP lagi untuk jadi {nextRank.name} {nextRank.emoji}
                  </p>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Continue Adventure */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <GlassCard
          glow="purple"
          className="flex cursor-pointer items-center gap-3 p-4 transition-transform hover:-translate-y-0.5 sm:p-5"
          onClick={() => {
            if (soundOn) playSound('whoosh')
            setView('world_map')
          }}
          role="button"
          tabIndex={0}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white shadow-lg">
            <Zap className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 text-lg font-bold text-slate-800">
              Continue Adventure
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </div>
            <div className="text-xs text-slate-500">
              {completedLevels.length > 0
                ? `Lanjut dari level terakhir · ${completedLevels.length} level selesai`
                : 'Mulai petualangan pertamamu di dunia NUSA!'}
            </div>
          </div>
          <NovaMascot expression="encouraging" size={56} float />
        </GlassCard>
      </motion.div>

      {/* Main menu grid */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
        }}
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 2xl:grid-cols-4 2xl:gap-5"
      >
        <MenuCard
          icon={<Compass className="h-6 w-6" />}
          title="Explore World"
          subtitle="Jelajahi dunia"
          glow="cyan"
          onClick={() => nav('world_map')}
          delay={0.2}
        />
        <MenuCard
          icon={<Calendar className="h-6 w-6" />}
          title="Daily Challenge"
          subtitle={dailyStreak > 0 ? `${dailyStreak} hari streak 🔥` : 'Tantangan harian'}
          glow="orange"
          onClick={() => nav('daily')}
          delay={0.26}
        />
        <MenuCard
          icon={<BarChart3 className="h-6 w-6" />}
          title="My Progress"
          subtitle="Perkembangan"
          glow="emerald"
          onClick={() => nav('progress')}
          delay={0.32}
        />
        <MenuCard
          icon={<Trophy className="h-6 w-6" />}
          title="Rewards"
          subtitle="Badge & koleksi"
          glow="purple"
          onClick={() => nav('rewards')}
          delay={0.38}
        />
        <MenuCard
          icon={<User className="h-6 w-6" />}
          title="Profile"
          subtitle="Karakter & info"
          glow="pink"
          onClick={() => nav('profile')}
          delay={0.44}
        />
        <MenuCard
          icon={<Sparkles className="h-6 w-6" />}
          title="Practice"
          subtitle="Latihan bebas"
          glow="cyan"
          onClick={() => {
            if (soundOn) playSound('whoosh')
            setView('practice')
          }}
          delay={0.5}
        />
        <MenuCard
          icon={<Gamepad2 className="h-6 w-6" />}
          title="Arcade"
          subtitle="Mini-game seru"
          glow="purple"
          onClick={() => {
            if (soundOn) playSound('whoosh')
            setView('arcade')
          }}
          delay={0.55}
        />
        <MenuCard
          icon={<Users className="h-6 w-6" />}
          title="Multiplayer"
          subtitle="Main bareng teman"
          glow="cyan"
          onClick={() => {
            if (soundOn) playSound('whoosh')
            setView('multiplayer_setup')
          }}
          delay={0.6}
        />
        <MenuCard
          icon={<Shield className="h-6 w-6" />}
          title="Admin"
          subtitle="Kelola soal & monitor"
          glow="cyan"
          onClick={() => {
            if (soundOn) playSound('whoosh')
            setView('admin')
          }}
          delay={0.65}
        />
      </motion.div>

      {/* NOVA greeting at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-2 rounded-2xl bg-white/60 p-3 text-sm text-slate-600 glass"
      >
        <NovaMascot expression="happy" size={36} />
        <p>
          <b className="text-slate-700">NOVA:</b> Petualangan seru menanti! Pilih “Explore World” untuk mulai, atau “Daily Challenge” untuk latihan singkat hari ini. ✨
        </p>
      </motion.div>
    </div>
  )
}

function MenuCard({
  icon,
  title,
  subtitle,
  glow,
  onClick,
  delay,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  glow: 'cyan' | 'purple' | 'emerald' | 'orange' | 'pink'
  onClick: () => void
  delay: number
}) {
  const grad = {
    cyan: 'from-sky-400 to-cyan-500',
    purple: 'from-purple-500 to-fuchsia-500',
    emerald: 'from-emerald-400 to-teal-500',
    orange: 'from-amber-400 to-orange-500',
    pink: 'from-rose-400 to-pink-500',
  }[glow]

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16, scale: 0.96 }, show: { opacity: 1, y: 0, scale: 1 } }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      <GlassCard
        glow={glow === 'pink' ? 'purple' : glow}
        className="flex h-full min-h-28 cursor-pointer flex-col items-center justify-center gap-1.5 p-2.5 text-center sm:min-h-32 sm:p-4 sm:gap-2 2xl:min-h-44 2xl:p-5"
        onClick={onClick}
        role="button"
        tabIndex={0}
      >
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} text-white shadow-lg sm:h-14 sm:w-14 2xl:h-16 2xl:w-16`}>
          {icon}
        </div>
        <div>
          <div className="text-sm font-bold text-slate-800 sm:text-base 2xl:text-lg">{title}</div>
          <div className="text-[10px] text-slate-500 sm:text-[11px] 2xl:text-xs">{subtitle}</div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
