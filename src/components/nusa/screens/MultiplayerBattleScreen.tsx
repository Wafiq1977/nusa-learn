'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { GlassCard } from '@/components/nusa/GlassCard'
import { GlowButton } from '@/components/nusa/GlowButton'
import { NovaMascot } from '@/components/nusa/NovaMascot'
import { useQuestions } from '@/hooks/use-questions'
import { playSound } from '@/lib/nusa/sound'
import { TEAM_PALETTE, type MultiplayerConfig, type MultiplayerTeam } from './MultiplayerSetupScreen'
import { Trophy, ArrowLeft, RotateCw, Home, Zap, Clock, ChevronRight, Crown } from 'lucide-react'

type Phase = 'intro' | 'question' | 'reveal' | 'finished'

interface ActiveStrike {
  from: number // team index
  to: number // team index
  correct: boolean
}

export function MultiplayerBattleScreen() {
  const setView = useGameStore((s) => s.setView)
  const goHome = useGameStore((s) => s.goHome)
  const soundOn = useGameStore((s) => s.settings.sound)
  const reduceMotion = useGameStore((s) => s.settings.reduceMotion)

  const [config, setConfig] = useState<MultiplayerConfig | null>(null)
  const [phase, setPhase] = useState<Phase>('intro')
  const [qIdx, setQIdx] = useState(0)
  const [teams, setTeams] = useState<MultiplayerTeam[]>([])
  const [currentTeamIdx, setCurrentTeamIdx] = useState(0) // for turn mode
  const [picked, setPicked] = useState<string | null>(null)
  const [pickedBy, setPickedBy] = useState<number | null>(null) // team index who picked
  const [showReveal, setShowReveal] = useState<'correct' | 'wrong' | null>(null)
  const [strike, setStrike] = useState<ActiveStrike | null>(null)
  const [countdown, setCountdown] = useState(3) // for buzzer question countdown
  const [buzzerLock, setBuzzerLock] = useState(false) // for buzzer mode, first to buzz
  const [timeLeft, setTimeLeft] = useState(0) // seconds left for current question (0 = no timer)

  // Load config from sessionStorage
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('nusa-multiplayer-config') : null
    if (!saved) {
      setView('multiplayer_setup')
      return
    }
    try {
      const cfg = JSON.parse(saved) as MultiplayerConfig
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConfig(cfg)
      setTeams(cfg.teams.map((t) => ({ ...t })))
    } catch {
      setView('multiplayer_setup')
    }
  }, [setView])

  // Fetch questions (mixed = don't filter category, fetch both)
  const fetchCategory = config?.category === 'mixed' ? 'mixed' : config?.category
  const { questions, loading } = useQuestions({
    grade: config?.grade || 3,
    category: (fetchCategory as 'numerik' | 'literasi' | 'mixed') || 'mixed',
    difficulty: config?.difficulty,
    limit: config?.questionCount || 8,
    enabled: !!config,
  })

  // Auto-start intro phase countdown
  useEffect(() => {
    if (phase !== 'intro') return
    let c = 3
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCountdown(3)
    const t = setInterval(() => {
      c -= 1
      setCountdown(c)
      if (soundOn) playSound('hint')
      if (c <= 0) {
        clearInterval(t)
        setPhase('question')
      }
    }, 1000)
    return () => clearInterval(t)
  }, [phase, soundOn])

  const q = questions[qIdx]

  // Pick a target team to attack (the one with highest score, excluding attacker)
  const pickAttackTarget = (attackerIdx: number) => {
    if (teams.length <= 1) return -1
    const others = teams.map((t, i) => ({ ...t, idx: i })).filter((t) => t.idx !== attackerIdx)
    if (others.length === 0) return -1
    // Attack the team with highest score
    others.sort((a, b) => b.score - a.score)
    return others[0].idx
  }

  // Advance to next question or finish — called from handleTeamAnswer & timeout
  const advanceToNext = useCallback(() => {
    setShowReveal(null)
    setPicked(null)
    setPickedBy(null)
    setBuzzerLock(false)
    if (qIdx + 1 >= questions.length) {
      if (soundOn) playSound('celebration')
      setPhase('finished')
    } else {
      setQIdx((i) => i + 1)
      if (config?.roundMode === 'turn') {
        setCurrentTeamIdx((i) => (i + 1) % teams.length)
      }
    }
  }, [qIdx, questions.length, config, teams.length, soundOn])

  // Handle team answer (turn mode)
  const handleTeamAnswer = useCallback((teamIdx: number, option: string) => {
    if (phase !== 'question' || !q) return
    // Turn mode: only current team can answer
    if (config?.roundMode === 'turn' && teamIdx !== currentTeamIdx) return
    // Buzzer mode: team must have claimed (pickedBy === teamIdx) and not already answered
    if (config?.roundMode === 'buzzer') {
      // already answered (picked set) — ignore
      if (picked) return
      // must be the claiming team
      if (pickedBy !== teamIdx) return
    }

    setPicked(option)
    setPickedBy(teamIdx)
    const isCorrect = option === q.answer
    if (soundOn) playSound(isCorrect ? 'correct' : 'wrong')
    setShowReveal(isCorrect ? 'correct' : 'wrong')

    // Update team score
    setTeams((ts) => ts.map((t, i) => {
      if (i !== teamIdx) return t
      const newStreak = isCorrect ? t.streak + 1 : 0
      // Streak bonus: +10 base, +5 per streak (max +25)
      const points = isCorrect ? 10 + Math.min(15, newStreak * 5) : 0
      return {
        ...t,
        score: t.score + points,
        correct: t.correct + (isCorrect ? 1 : 0),
        wrong: t.wrong + (isCorrect ? 0 : 1),
        streak: newStreak,
      }
    }))

    // Trigger attack animation if enabled & correct
    if (config?.attackAnimation && isCorrect) {
      const targetIdx = pickAttackTarget(teamIdx)
      if (targetIdx >= 0) {
        setStrike({ from: teamIdx, to: targetIdx, correct: true })
        setTeams((ts) => ts.map((t, i) => i === targetIdx ? { ...t, score: Math.max(0, t.score - 3) } : t))
        if (soundOn) playSound('whoosh')
        setTimeout(() => setStrike(null), 1200)
      }
    }

    // Reveal answer then advance
    setTimeout(() => {
      advanceToNext()
    }, 1800)
  }, [phase, q, qIdx, questions.length, currentTeamIdx, teams, teams.length, config, picked, pickedBy, soundOn, advanceToNext, pickAttackTarget])

  // Handle timeout — when timer runs out
  const handleTimeout = useCallback(() => {
    if (phase !== 'question' || picked) return // already answered, ignore
    if (!q) return

    // Mark as wrong (no answer)
    if (soundOn) playSound('wrong')
    setShowReveal('wrong')

    // In turn mode, count as wrong for current team
    if (config?.roundMode === 'turn') {
      const teamIdx = currentTeamIdx
      setTeams((ts) => ts.map((t, i) => i === teamIdx ? {
        ...t,
        wrong: t.wrong + 1,
        streak: 0,
      } : t))
    }
    // In buzzer mode, no team loses (just skip)

    // Reveal correct answer then advance
    setTimeout(() => {
      advanceToNext()
    }, 1500)
  }, [phase, picked, q, config, currentTeamIdx, soundOn, advanceToNext])

  // Timer effect — runs only in question phase, when not yet picked, with timePerQuestion > 0
  useEffect(() => {
    if (phase !== 'question') return
    if (!config || config.timePerQuestion <= 0) return
    if (picked) return // already answered, stop timer

    // Reset timer when question changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimeLeft(config.timePerQuestion)

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          // Trigger timeout
          handleTimeout()
          return 0
        }
        // Beep warning at 5 seconds
        if (prev <= 5 && prev > 0 && soundOn) {
          playSound('hint')
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
     
  }, [phase, qIdx, config, picked, handleTimeout])

  const restart = () => {
    if (soundOn) playSound('click')
    setTeams((ts) => ts.map((t) => ({ ...t, score: 0, correct: 0, wrong: 0, streak: 0 })))
    setQIdx(0)
    setCurrentTeamIdx(0)
    setPicked(null)
    setPickedBy(null)
    setShowReveal(null)
    setStrike(null)
    setBuzzerLock(false)
    setTimeLeft(0)
    setPhase('intro')
  }

  // ============ Render ============
  if (!config) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <p className="text-slate-500">Menyiapkan pertarungan...</p>
      </div>
    )
  }

  // Finished phase — show podium
  if (phase === 'finished') {
    const sorted = [...teams].sort((a, b) => b.score - a.score)
    const winner = sorted[0]
    const wPal = TEAM_PALETTE[winner.paletteIndex]
    return (
      <div className="space-y-5 pb-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            className="text-7xl 2xl:text-8xl"
          >
            🏆
          </motion.div>
          <h1 className="mt-2 text-3xl font-black text-gradient-cyan sm:text-4xl 2xl:text-5xl">
            Pertarungan Selesai!
          </h1>
          <p className="mt-1 text-base sm:text-lg 2xl:text-xl font-bold text-slate-700">
            Juara: <span className={`${wPal.text}`}>{wPal.emoji} {winner.name}</span>
          </p>
        </motion.div>

        {/* Podium */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {sorted.map((t, i) => {
            const p = TEAM_PALETTE[t.paletteIndex]
            const isWinner = i === 0
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🎖️'
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`rounded-2xl border-2 ${p.border} bg-gradient-to-br ${p.color} p-4 text-white shadow-lg ${isWinner ? 'scale-105 sm:scale-110' : ''}`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-3xl 2xl:text-4xl">{medal}</span>
                  <span className="text-2xl 2xl:text-3xl">{p.emoji}</span>
                </div>
                <div className="text-base font-black sm:text-lg 2xl:text-xl">{t.name}</div>
                <div className="mt-2 text-3xl font-black sm:text-4xl 2xl:text-5xl">{t.score}</div>
                <div className="text-xs opacity-90 sm:text-sm 2xl:text-base">poin</div>
                <div className="mt-2 flex justify-around text-xs sm:text-sm 2xl:text-base">
                  <span>✓ {t.correct}</span>
                  <span>✗ {t.wrong}</span>
                  <span>🔥 {t.streak}</span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <GlowButton variant="soft" size="lg" onClick={() => { if (soundOn) playSound('click'); setView('multiplayer_setup') }}>
            <ArrowLeft className="h-5 w-5" /> Atur Ulang Tim
          </GlowButton>
          <GlowButton glow="cyan" size="lg" onClick={restart}>
            <RotateCw className="h-5 w-5" /> Main Lagi
          </GlowButton>
          <GlowButton glow="purple" size="lg" onClick={() => { if (soundOn) playSound('click'); goHome() }}>
            <Home className="h-5 w-5" /> Beranda
          </GlowButton>
        </div>
      </div>
    )
  }

  // Intro phase — 3-2-1 countdown
  if (phase === 'intro') {
    return (
      <div className="flex min-h-[70dvh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <NovaMascot expression="celebrate" size={120} />
          <h1 className="mt-4 text-4xl font-black text-gradient-cyan sm:text-5xl 2xl:text-6xl">Bersiap... 🚀</h1>
          <p className="mt-2 text-sm sm:text-base 2xl:text-lg text-slate-600">
            {config.roundMode === 'turn' ? 'Mode Bergiliran' : 'Mode Siapa Cepat'} · {questions.length} soal · {teams.length} tim
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {teams.map((t) => {
              const p = TEAM_PALETTE[t.paletteIndex]
              return (
                <div key={t.id} className={`rounded-2xl bg-gradient-to-br ${p.color} px-4 py-2 text-white shadow-md`}>
                  <div className="text-2xl 2xl:text-3xl">{p.emoji}</div>
                  <div className="text-xs font-bold 2xl:text-sm">{t.name}</div>
                </div>
              )
            })}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={countdown}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14 }}
              className="mt-8 text-8xl font-black text-gradient-purple 2xl:text-9xl"
            >
              {countdown > 0 ? countdown : 'Mulai!'}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    )
  }

  // Loading question
  if (loading || !q) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-500" />
          <p className="mt-3 text-sm text-slate-500 2xl:text-base">Menyiapkan soal berikutnya...</p>
        </div>
      </div>
    )
  }

  // Question phase
  const currentPal = config.roundMode === 'turn' ? TEAM_PALETTE[teams[currentTeamIdx].paletteIndex] : null

  return (
    <div className="space-y-4 pb-4">
      {/* Top: progress + scoreboard */}
      <div className="space-y-3">
        {/* Progress header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { if (soundOn) playSound('click'); setView('multiplayer_setup') }}
            aria-label="Keluar"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-slate-700 hover:bg-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between text-xs sm:text-sm 2xl:text-base">
              <span className="font-bold text-slate-700">Soal {qIdx + 1}/{questions.length}</span>
              <span className="text-slate-500">{config.roundMode === 'turn' ? 'Bergiliran' : 'Siapa Cepat'}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
              <motion.div
                animate={{ width: `${((qIdx) / questions.length) * 100}%` }}
                transition={{ duration: 0.4 }}
                className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-purple-400"
              />
            </div>
          </div>
        </div>

        {/* Live scoreboard */}
        <div className="grid gap-2 sm:gap-3 2xl:gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(teams.length, 4)}, minmax(0, 1fr))` }}>
          {teams.map((t, i) => {
            const p = TEAM_PALETTE[t.paletteIndex]
            const isActive = config.roundMode === 'turn' && i === currentTeamIdx
            const isPicked = pickedBy === i
            return (
              <motion.div
                key={t.id}
                animate={isActive ? { scale: [1, 1.04, 1] } : { scale: isPicked ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
                className={`relative rounded-2xl border-2 ${p.border} bg-gradient-to-br ${p.color} p-2 text-white shadow-lg ${isActive ? `ring-4 ring-white ${p.glow}` : ''}`}
              >
                {/* Strike animation */}
                <AnimatePresence>
                  {strike && strike.to === i && (
                    <motion.div
                      initial={{ x: strike.from < i ? -200 : 200, y: -10, opacity: 0, scale: 0.3 }}
                      animate={{ x: 0, y: 0, opacity: 1, scale: 1.5 }}
                      exit={{ opacity: 0, scale: 2 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 flex items-center justify-center text-4xl 2xl:text-5xl"
                    >
                      💥
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <span className="text-lg 2xl:text-xl">{p.emoji}</span>
                    <span className="truncate text-[10px] font-bold sm:text-xs 2xl:text-sm">{t.name}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="text-base 2xl:text-lg"
                    >
                      🎯
                    </motion.div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-xl font-black sm:text-2xl 2xl:text-3xl">{t.score}</div>
                  <div className="text-[9px] opacity-90 sm:text-[10px] 2xl:text-xs">poin</div>
                </div>
                <div className="flex justify-around text-[9px] sm:text-[10px] 2xl:text-xs">
                  <span>✓{t.correct}</span>
                  <span>✗{t.wrong}</span>
                  <span>🔥{t.streak}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Question card */}
      <GlassCard
        glow={currentPal ? (currentPal.id === 'merah' ? 'orange' : currentPal.id === 'biru' ? 'cyan' : currentPal.id === 'hijau' ? 'emerald' : 'orange') : 'purple'}
        className="relative overflow-hidden p-4 sm:p-5"
      >
        {/* Question header */}
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-cyan-600 2xl:text-sm">
            {q.category === 'numerik' ? '🔢 Numerik' : '📖 Literasi'} · {q.subcategory} · {q.difficulty === 'easy' ? 'Mudah' : q.difficulty === 'medium' ? 'Sedang' : 'Sulit'}
          </div>

          {/* Timer display */}
          {config.timePerQuestion > 0 && phase === 'question' && !picked && (
            <QuestionTimer
              seconds={timeLeft}
              total={config.timePerQuestion}
            />
          )}

          {currentPal && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-bold 2xl:text-base"
            >
              <span className="text-lg 2xl:text-xl">{currentPal.emoji}</span>
              <span className={currentPal.text}>Giliran: {teams[currentTeamIdx].name}</span>
            </motion.div>
          )}
          {config.roundMode === 'buzzer' && !buzzerLock && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-700 2xl:text-base"
            >
              <Zap className="h-4 w-4 2xl:h-5 2xl:w-5" />
              <span>Siapa cepat dia dapat! Tim pertama yang tap jawab menang</span>
            </motion.div>
          )}
          {buzzerLock && pickedBy !== null && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-1.5 text-sm font-bold text-cyan-700 2xl:text-base"
            >
              <Clock className="h-4 w-4 2xl:h-5 2xl:w-5" />
              <span>{TEAM_PALETTE[teams[pickedBy].paletteIndex].emoji} {teams[pickedBy].name} duluan!</span>
            </motion.div>
          )}
        </div>

        {/* Story (if any) */}
        {q.story && (
          <div className="mt-3 rounded-xl bg-purple-50 p-3 text-sm text-slate-700 sm:text-base 2xl:text-lg">
            📖 {q.story}
          </div>
        )}

        {/* Question text */}
        <h2 className="mt-3 text-center text-xl font-bold text-slate-800 sm:text-2xl 2xl:text-3xl">
          {q.question}
        </h2>

        {/* Answer options */}
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 2xl:gap-3">
          {q.options.map((opt, i) => {
            const isAnswer = opt === q.answer
            const isPickedThis = picked === opt
            const canAnswer = config.roundMode === 'turn' ? !picked : !picked && pickedBy !== null
            return (
              <motion.button
                key={opt + i}
                whileHover={canAnswer ? { y: -2, scale: 1.02 } : undefined}
                whileTap={canAnswer ? { scale: 0.97 } : undefined}
                disabled={!canAnswer}
                onClick={() => {
                  if (config.roundMode === 'turn') {
                    handleTeamAnswer(currentTeamIdx, opt)
                  } else {
                    // Buzzer mode: pickedBy must be set first (team claimed), now they answer
                    if (pickedBy !== null) {
                      handleTeamAnswer(pickedBy, opt)
                    }
                  }
                }}
                className={`relative flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all sm:p-4 2xl:p-5 ${
                  picked
                    ? isAnswer
                      ? 'border-emerald-400 bg-emerald-50 shadow-[0_6px_24px_-8px_rgba(16,185,129,0.5)]'
                      : isPickedThis
                        ? 'border-rose-400 bg-rose-50'
                        : 'border-slate-200 opacity-60'
                    : 'border-slate-200 bg-white/85 hover:border-cyan-300 hover:bg-white'
                }`}
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 text-sm font-bold text-white shadow sm:h-10 sm:w-10 2xl:h-12 2xl:w-12 2xl:text-base">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-base font-semibold text-slate-700 sm:text-lg 2xl:text-xl">{opt}</span>
                {picked && isAnswer && (
                  <motion.span
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="ml-auto text-2xl 2xl:text-3xl"
                  >
                    ✓
                  </motion.span>
                )}
                {picked && isPickedThis && !isAnswer && (
                  <motion.span
                    initial={{ scale: 0, rotate: 30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="ml-auto text-2xl 2xl:text-3xl"
                  >
                    ✗
                  </motion.span>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Reveal explanation */}
        <AnimatePresence>
          {showReveal && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-3 rounded-xl p-3 text-center text-sm sm:text-base 2xl:text-lg ${
                showReveal === 'correct'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {showReveal === 'correct' ? (
                <span className="font-bold">🎉 Benar! +{10 + Math.min(15, (teams[pickedBy ?? 0]?.streak || 0) * 5)} poin</span>
              ) : (
                <span className="font-bold">💡 Belum tepat. Jawaban: {q.answer}</span>
              )}
              <div className="mt-1 text-xs font-normal 2xl:text-sm">{q.explanation}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* NOVA corner */}
        <div className="absolute -right-2 -top-2 opacity-80">
          <NovaMascot
            expression={showReveal === 'correct' ? 'celebrate' : showReveal === 'wrong' ? 'encouraging' : 'thinking'}
            size={56}
          />
        </div>
      </GlassCard>

      {/* Buzzer mode: team claim buttons */}
      {config.roundMode === 'buzzer' && !picked && (
        <GlassCard className="p-3 sm:p-4">
          <div className="mb-2 text-center text-xs font-bold uppercase tracking-wide text-slate-600 2xl:text-sm">
            ⚡ Tekan tombol tim kamu dulu untuk menjawab soal ini!
          </div>
          <div className="grid gap-2 2xl:gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(teams.length, 4)}, minmax(0, 1fr))` }}>
            {teams.map((t, i) => {
              const p = TEAM_PALETTE[t.paletteIndex]
              return (
                <motion.button
                  key={t.id}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={buzzerLock}
                  onClick={() => {
                    if (soundOn) playSound('whoosh')
                    setPickedBy(i)
                    setBuzzerLock(true)
                    // Auto-show that team is now allowed to answer
                  }}
                  className={`rounded-2xl border-2 ${p.border} bg-gradient-to-br ${p.color} p-3 text-center text-white shadow-md ${buzzerLock && pickedBy !== i ? 'opacity-40' : ''}`}
                >
                  <div className="text-2xl 2xl:text-3xl">{p.emoji}</div>
                  <div className="text-xs font-bold 2xl:text-sm">{t.name}</div>
                  <div className="text-[10px] opacity-90 2xl:text-xs">Tekan!</div>
                </motion.button>
              )
            })}
          </div>
          {buzzerLock && pickedBy !== null && (
            <div className="mt-2 text-center text-sm text-slate-600 2xl:text-base">
              <b>{TEAM_PALETTE[teams[pickedBy].paletteIndex].emoji} {teams[pickedBy].name}</b> mengambil soal ini. Pilih jawaban di atas! ⚡
            </div>
          )}
        </GlassCard>
      )}

      {/* Turn mode hint */}
      {config.roundMode === 'turn' && (
        <p className="text-center text-xs text-slate-500 2xl:text-sm">
          💡 Hanya tim yang giliran yang boleh menjawab. Giliran akan pindah ke tim lain setelah soal selesai.
        </p>
      )}
    </div>
  )
}

// ============ Question Timer Component ============
// Visual timer with circular progress + numeric countdown
// Color shifts green → amber → red as time runs out
function QuestionTimer({ seconds, total }: { seconds: number; total: number }) {
  // Don't render if no timer set or already answered
  if (total <= 0) return null

  const pct = Math.max(0, Math.min(1, seconds / total))
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - pct)

  // Color by remaining time
  const isLow = seconds <= 5
  const isMid = seconds <= 10 && seconds > 5
  const color = isLow ? '#EF4444' : isMid ? '#F59E0B' : '#10B981'
  const bgClass = isLow ? 'bg-rose-100' : isMid ? 'bg-amber-100' : 'bg-emerald-100'
  const textClass = isLow ? 'text-rose-700' : isMid ? 'text-amber-700' : 'text-emerald-700'

  return (
    <div className="mt-2 flex items-center justify-center gap-2">
      <motion.div
        initial={{ scale: 1 }}
        animate={isLow ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, repeat: isLow ? Infinity : 0 }}
        className={`relative flex h-14 w-14 items-center justify-center rounded-full ${bgClass} shadow-md sm:h-16 sm:w-16 2xl:h-20 2xl:w-20`}
      >
        {/* Circular progress ring (SVG) */}
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="4"
          />
          <motion.circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.95, ease: 'linear' }}
          />
        </svg>
        <div className={`relative text-lg font-black sm:text-xl 2xl:text-2xl ${textClass}`}>
          {Math.max(0, seconds)}
        </div>
      </motion.div>
      <div className={`rounded-xl px-3 py-1.5 text-xs font-bold sm:text-sm 2xl:text-base ${bgClass} ${textClass}`}>
        {isLow ? '⚠️ Waktu hampir habis!' : isMid ? '⏰ Cepat!' : '⏱️ Waktu menjawab'}
      </div>
    </div>
  )
}
