'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { GlassCard } from '@/components/nusa/GlassCard'
import { GlowButton } from '@/components/nusa/GlowButton'
import { NovaMascot } from '@/components/nusa/NovaMascot'
import { StarRating } from '@/components/nusa/StarRating'
import { playSound } from '@/lib/nusa/sound'
import { useBadges } from '@/hooks/use-questions'

export function ResultScreen() {
  const result = useGameStore((s) => s.lastResult)
  const goHome = useGameStore((s) => s.goHome)
  const goBack = useGameStore((s) => s.goBack)
  const setView = useGameStore((s) => s.setView)
  const soundOn = useGameStore((s) => s.settings.sound)
  const badges = useBadges()
  const [showStars, setShowStars] = useState(0)

  useEffect(() => {
    if (!result) return
    // Animate stars one by one
    if (result.stars > 0 && soundOn) playSound('star')
    let i = 0
    const t = setInterval(() => {
      i++
      setShowStars(i)
      if (i < result.stars) {
        if (soundOn) playSound('star')
      } else {
        clearInterval(t)
      }
    }, 400)
    return () => clearInterval(t)
  }, [result])

  if (!result) {
    return null
  }

  const pct = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0
  const heading =
    result.stars === 3 ? 'MISSION COMPLETE!' : result.stars >= 1 ? 'MISI SELESAI!' : 'TERNYATA...'
  const subheading =
    result.stars === 3
      ? 'Luar biasa! Semuanya benar 🚀'
      : result.stars >= 1
        ? 'Kerja bagus! Terus berlatih yuk ✨'
        : 'Belum tepat — tapi tidak apa-apa, kita coba lagi! 🌱'

  return (
    <div className="flex min-h-[80dvh] items-center justify-center py-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 18 }}
        className="w-full max-w-md"
      >
        <GlassCard strong glow={result.stars === 3 ? 'cyan' : result.stars >= 1 ? 'emerald' : 'orange'} className="relative overflow-hidden p-6 text-center">
          {/* Confetti dots for 3 stars */}
          {result.stars === 3 && (
            <div className="pointer-events-none absolute inset-0">
              {Array.from({ length: 18 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -20, x: 0 }}
                  animate={{ opacity: 1, y: 400, x: (Math.random() - 0.5) * 200 }}
                  transition={{ duration: 1.6, delay: 0.5 + Math.random(), repeat: Infinity, repeatDelay: 0.5 }}
                  className="absolute top-0 left-1/2 h-2 w-2 rounded"
                  style={{ background: ['#22D3EE', '#A855F7', '#10B981', '#F472B6'][i % 4] }}
                />
              ))}
            </div>
          )}

          {/* Nova mascot */}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 12 }}
          >
            <NovaMascot expression={result.stars === 3 ? 'celebrate' : 'encouraging'} size={90} />
          </motion.div>

          <h1 className="mt-3 text-3xl font-black text-gradient-cyan sm:text-4xl">{heading}</h1>
          <p className="mt-1 text-sm text-slate-600">{subheading}</p>

          {/* Stars */}
          <div className="mt-5 flex justify-center">
            <StarRating stars={showStars} size={48} />
          </div>

          {/* Rewards summary */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <RewardPill icon="✨" label="XP" value={`+${result.xp}`} color="text-cyan-600" />
            <RewardPill icon="🪙" label="Koin" value={`+${result.coins}`} color="text-amber-600" />
            <RewardPill icon="✓" label="Benar" value={`${result.correct}/${result.total}`} color="text-emerald-600" />
          </div>

          {/* Accuracy bar */}
          <div className="mt-3">
            <div className="mb-1 text-xs text-slate-500">Akurasi: {pct}%</div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="h-full bg-gradient-to-r from-sky-400 via-emerald-400 to-emerald-500"
              />
            </div>
          </div>

          {/* Mastered + Next practice */}
          {result.mastered.length > 0 && (
            <div className="mt-5 rounded-2xl bg-emerald-50 p-3 text-left">
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-emerald-700">Yang sudah kamu kuasai</div>
              <ul className="space-y-1">
                {result.mastered.map((m, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-emerald-700">
                    <span>✓</span> {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.nextPractice.length > 0 && (
            <div className="mt-2 rounded-2xl bg-amber-50 p-3 text-left">
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-amber-700">Latihan berikutnya</div>
              <ul className="space-y-1">
                {result.nextPractice.map((m, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-amber-700">
                    <span>→</span> {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* New badges */}
          {result.newBadges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-4 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 p-3"
            >
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-purple-700">🏆 Badge Baru!</div>
              <div className="flex flex-wrap gap-2">
                {result.newBadges.map((bid) => {
                  const b = badges.find((x) => x.id === bid)
                  if (!b) return null
                  return (
                    <motion.div
                      key={bid}
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 12 }}
                      className="flex items-center gap-2 rounded-xl bg-white/70 px-2.5 py-1.5 shadow-sm"
                    >
                      <span className="text-2xl">{b.icon}</span>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{b.name}</div>
                        <div className="text-[10px] text-slate-500">{b.description}</div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <GlowButton variant="soft" size="md" className="flex-1" onClick={() => { if (soundOn) playSound('click'); goHome() }}>
              🏠 Beranda
            </GlowButton>
            <GlowButton glow="cyan" size="md" className="flex-1" onClick={() => { if (soundOn) playSound('whoosh'); goBack() }}>
              Lanjut Bermain →
            </GlowButton>
          </div>
          <button
            onClick={() => { if (soundOn) playSound('click'); setView('progress') }}
            className="mt-2 w-full text-xs font-medium text-cyan-600 hover:text-cyan-700"
          >
            Lihat Progress Lengkap →
          </button>
        </GlassCard>
      </motion.div>
    </div>
  )
}

function RewardPill({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl bg-white/70 p-3 text-center shadow-sm">
      <div className="text-2xl">{icon}</div>
      <div className="text-[10px] uppercase text-slate-500">{label}</div>
      <div className={`text-lg font-black ${color}`}>{value}</div>
    </div>
  )
}
