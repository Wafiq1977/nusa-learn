'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { GlassCard } from '@/components/nusa/GlassCard'
import { GlowButton } from '@/components/nusa/GlowButton'
import { NovaMascot } from '@/components/nusa/NovaMascot'
import { useDailyChallenge } from '@/hooks/use-questions'
import { playSound } from '@/lib/nusa/sound'
import { Loader2, Calendar, CheckCircle2, Flame } from 'lucide-react'
import type { Question } from '@/store/gameStore'

export function DailyChallengeScreen() {
  const grade = useGameStore((s) => s.grade)
  const dailyStreak = useGameStore((s) => s.dailyStreak)
  const lastDailyDate = useGameStore((s) => s.lastDailyDate)
  const recordDaily = useGameStore((s) => s.recordDaily)
  const answerQuestion = useGameStore((s) => s.answerQuestion)
  const endSession = useGameStore((s) => s.endSession)
  const addXp = useGameStore((s) => s.addXp)
  const addStars = useGameStore((s) => s.addStars)
  const awardBadge = useGameStore((s) => s.awardBadge)
  const setView = useGameStore((s) => s.setView)
  const soundOn = useGameStore((s) => s.settings.sound)

  const { items, loading } = useDailyChallenge(grade)
  const [started, setStarted] = useState(false)
  const [idx, setIdx] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [done, setDone] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const alreadyDoneToday = lastDailyDate === today

  useEffect(() => {
    if (done && !alreadyDoneToday) {
      recordDaily(today)
      addXp(correctCount * 30)
      addStars(Math.min(3, correctCount))
      if (soundOn) playSound('celebration')
      // Award daily hero if 7-day streak
      if (dailyStreak + 1 >= 7) {
        awardBadge('daily_hero')
      }
    }
  }, [done])

  const handleAnswer = (answer: string) => {
    const q = items[idx]
    if (!q) return
    const isCorrect = answer.trim().toLowerCase() === q.answer.trim().toLowerCase()
    if (soundOn) playSound(isCorrect ? 'correct' : 'wrong')
    setFeedback(isCorrect ? 'correct' : 'wrong')
    if (isCorrect) setCorrectCount((c) => c + 1)

    setTimeout(() => {
      setFeedback(null)
      if (idx + 1 >= items.length) {
        setDone(true)
      } else {
        setIdx((i) => i + 1)
      }
    }, 1200)
  }

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
          <p>Menyiapkan tantangan harian...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <GlassCard className="p-6 text-center">
        <NovaMascot expression="thinking" size={80} />
        <p className="mt-3 font-bold text-slate-700">Hmm, belum ada tantangan hari ini.</p>
        <p className="text-sm text-slate-500">Coba lagi nanti yuk!</p>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-5 pb-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl font-black text-gradient-cyan sm:text-4xl">Daily Challenge 🎯</h1>
        <p className="mt-1 text-sm text-slate-600">3 soal singkat untuk asah otak</p>
      </motion.div>

      {/* Streak banner */}
      <GlassCard glow="orange" className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">Streak Harian</div>
            <div className="text-xs text-slate-500">Berlatih tiap hari untuk bonus!</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-orange-600">{dailyStreak}</div>
          <div className="text-[10px] text-slate-500">hari beruntun</div>
        </div>
      </GlassCard>

      {!started && !done && (
        <GlassCard strong className="p-6 text-center">
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <NovaMascot expression="happy" size={90} />
          </motion.div>
          <h2 className="mt-3 text-xl font-bold text-slate-800">Tantangan Hari Ini</h2>
          <p className="mt-2 text-sm text-slate-600">
            1 soal numerik + 1 soal literasi + 1 soal logika. Selesaikan dalam 3-5 menit untuk bonus XP & bintang! ⚡
          </p>
          {alreadyDoneToday && (
            <p className="mt-3 rounded-xl bg-emerald-50 p-2 text-xs font-medium text-emerald-700">
              ✅ Kamu sudah menyelesaikan tantangan hari ini. Tetap bisa main lagi untuk berlatih!
            </p>
          )}
          <div className="mt-5">
            <GlowButton glow="orange" size="lg" onClick={() => { if (soundOn) playSound('whoosh'); setStarted(true) }}>
              Mulai Tantangan 🚀
            </GlowButton>
          </div>
        </GlassCard>
      )}

      {started && !done && (
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
            <GlassCard glow={items[idx].category === 'literasi' ? 'purple' : 'cyan'} className="p-5">
              {/* Progress dots */}
              <div className="mb-4 flex items-center justify-center gap-2">
                {items.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i === idx ? 'w-8 bg-cyan-500' : i < idx ? 'w-6 bg-emerald-400' : 'w-6 bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-widest text-cyan-600">
                  Soal {idx + 1} · {items[idx].category === 'numerik' ? 'Numerik' : 'Literasi'}
                </div>
                {items[idx].story && (
                  <div className="mt-3 mb-2 rounded-xl bg-purple-50 p-3 text-left text-sm text-slate-700">
                    📖 {items[idx].story}
                  </div>
                )}
                <h2 className="mt-3 text-xl font-bold text-slate-800">{items[idx].question}</h2>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {items[idx].options.map((opt, i) => (
                  <motion.button
                    key={opt + i}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ y: -2 }}
                    disabled={!!feedback}
                    onClick={() => handleAnswer(opt)}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition-all ${
                      feedback
                        ? opt === items[idx].answer
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 opacity-60'
                        : 'border-slate-200 bg-white/80 hover:border-cyan-300'
                    }`}
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 text-sm font-bold text-white">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm font-medium text-slate-700">{opt}</span>
                  </motion.button>
                ))}
              </div>

              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-3 rounded-xl p-3 text-center text-sm font-bold ${
                      feedback === 'correct' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {feedback === 'correct' ? '🎉 Hebat! Jawaban benar.' : '💡 Belum tepat. Tetap semangat!'}
                    <div className="mt-1 text-xs font-normal text-slate-600">{items[idx].explanation}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      )}

      {done && (
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard strong glow="emerald" className="p-6 text-center">
            <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 12 }}>
              <NovaMascot expression="celebrate" size={90} />
            </motion.div>
            <h2 className="mt-3 text-3xl font-black text-gradient-cyan">Tantangan Selesai! 🎉</h2>
            <p className="mt-1 text-sm text-slate-600">Kamu menjawab {correctCount} dari {items.length} dengan benar.</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Pill icon="✨" label="XP" value={`+${correctCount * 30}`} color="text-cyan-600" />
              <Pill icon="⭐" label="Bintang" value={`+${Math.min(3, correctCount)}`} color="text-amber-500" />
              <Pill icon="🔥" label="Streak" value={`${dailyStreak + (alreadyDoneToday ? 0 : 1)}`} color="text-orange-600" />
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <GlowButton variant="soft" className="flex-1" onClick={() => { if (soundOn) playSound('click'); setView('home') }}>
                Beranda 🏠
              </GlowButton>
              <GlowButton glow="cyan" className="flex-1" onClick={() => { setDone(false); setStarted(false); setIdx(0); setCorrectCount(0) }}>
                Main Lagi 🔄
              </GlowButton>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}

function Pill({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl bg-white/70 p-3 text-center">
      <div className="text-2xl">{icon}</div>
      <div className={`text-lg font-black ${color}`}>{value}</div>
      <div className="text-[10px] text-slate-500">{label}</div>
    </div>
  )
}
