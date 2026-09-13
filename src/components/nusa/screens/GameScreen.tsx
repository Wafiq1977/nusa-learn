'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { NovaMascot, type NovaExpression } from '@/components/nusa/NovaMascot'
import { GlassCard } from '@/components/nusa/GlassCard'
import { GlowButton } from '@/components/nusa/GlowButton'
import { useNovaHint } from '@/hooks/use-questions'
import { playSound } from '@/lib/nusa/sound'
import { Lightbulb, X, Loader2 } from 'lucide-react'
import type { Question } from '@/store/gameStore'
import { CatchGame } from '@/components/nusa/games/CatchGame'
import { ShopGame } from '@/components/nusa/games/ShopGame'
import { PathGame } from '@/components/nusa/games/PathGame'
import { BattleGame } from '@/components/nusa/games/BattleGame'
import { TeamBattleGame } from '@/components/nusa/games/TeamBattleGame'

export function NovaHintBubble({
  hint,
  expression,
  loading,
  onDismiss,
}: {
  hint: string | null
  expression: NovaExpression
  loading: boolean
  onDismiss: () => void
}) {
  if (!hint && !loading) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="fixed inset-x-0 bottom-4 z-40 mx-auto w-full max-w-lg px-4"
    >
      <GlassCard strong className="relative flex items-start gap-3 p-4">
        <div className="flex-shrink-0">
          {loading ? (
            <div className="flex h-12 w-12 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
            </div>
          ) : (
            <NovaMascot expression={expression} size={56} float={false} />
          )}
        </div>
        <div className="flex-1 pt-1">
          <div className="text-xs font-bold uppercase tracking-wide text-cyan-600">NOVA</div>
          {loading ? (
            <p className="text-sm text-slate-500">Hmm, aku sedang berpikir...</p>
          ) : (
            <p className="text-sm text-slate-700">{hint}</p>
          )}
        </div>
        {!loading && (
          <button
            onClick={onDismiss}
            aria-label="Tutup petunjuk"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </GlassCard>
    </motion.div>
  )
}

// Hook to handle NOVA hint interactions during a session
export function useNovaAssistant() {
  const { hint, loading, expression, getHint, setHint } = useNovaHint()
  const session = useGameStore((s) => s.session)
  const consumeHint = useGameStore((s) => s.useHint)
  const grade = useGameStore((s) => s.grade)
  const recentStats = useGameStore((s) => s.stats)
  const soundOn = useGameStore((s) => s.settings.sound)

  const requestHint = async () => {
    if (!session) return
    const q = session.questions[session.currentIndex]
    if (!q) return
    if (soundOn) playSound('hint')
    consumeHint()
    await getHint({
      question: q.question,
      story: q.story || undefined,
      hintsUsed: session.hintsUsed,
      recentCorrect: recentStats.correct,
      recentWrong: recentStats.wrong,
      grade,
      existingHints: q.hints,
    })
  }

  const dismiss = () => setHint(null)

  return { hint, loading, expression, requestHint, dismiss }
}

interface BaseGameProps {
  question: Question
  onAnswer: (answer: string) => void
  disabled?: boolean
}

// ============ Choice Game ============
export function ChoiceGame({ question, onAnswer, disabled }: BaseGameProps) {
  const soundOn = useGameStore((s) => s.settings.sound)
  const [picked, setPicked] = useState<string | null>(null)
  return (
    <div className="space-y-4">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 sm:text-xs">{question.subcategory}</div>
        <h2 className="mt-2 text-lg font-bold text-slate-800 sm:text-xl md:text-2xl 2xl:text-3xl">{question.question}</h2>
      </motion.div>

      <div className="grid grid-cols-1 gap-2 sm:gap-3 sm:grid-cols-2">
        {question.options.map((opt, i) => {
          const letter = String.fromCharCode(65 + i)
          const isPicked = picked === opt
          return (
            <motion.button
              key={opt + i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={disabled ? undefined : { y: -2, scale: 1.01 }}
              whileTap={disabled ? undefined : { scale: 0.98 }}
              disabled={disabled}
              onClick={() => {
                if (disabled) return
                setPicked(opt)
                if (soundOn) playSound('click')
                onAnswer(opt)
              }}
              className={`relative flex items-center gap-2.5 rounded-2xl border-2 p-3 text-left transition-all sm:gap-3 sm:p-4 ${
                isPicked
                  ? 'border-cyan-400 bg-cyan-50 shadow-[0_6px_24px_-8px_rgba(14,165,233,0.4)]'
                  : 'border-slate-200 bg-white/80 hover:border-cyan-300'
              } ${disabled ? 'opacity-60' : 'cursor-pointer'}`}
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 text-xs font-bold text-white shadow sm:h-9 sm:w-9 sm:text-sm">
                {letter}
              </span>
              <span className="text-sm font-semibold text-slate-700 sm:text-base md:text-lg">{opt}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ============ Story Game (literacy with passage) ============
export function StoryGame({ question, onAnswer, disabled }: BaseGameProps) {
  const soundOn = useGameStore((s) => s.settings.sound)
  const [picked, setPicked] = useState<string | null>(null)

  // Highlight keywords in story
  const renderStory = (story: string, highlights: string[] | null | undefined) => {
    if (!highlights || highlights.length === 0) return story
    let parts: (string | { word: string; match: boolean })[] = [{ word: story, match: false }]
    highlights.forEach((h) => {
      parts = parts.flatMap((p) => {
        if (typeof p !== 'string') return [p]
        const regex = new RegExp(`(${h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
        const split = p.split(regex)
        return split.map((s, i) =>
          s.toLowerCase() === h.toLowerCase()
            ? { word: s, match: true }
            : { word: s, match: false }
        ).filter((s) => s.word !== '')
      })
    })
    return parts.map((p, i) =>
      typeof p === 'string' ? (
        <span key={i}>{p}</span>
      ) : p.match ? (
        <mark key={i} className="rounded bg-amber-200/70 px-1 font-semibold text-amber-900">{p.word}</mark>
      ) : (
        <span key={i}>{p.word}</span>
      )
    )
  }

  return (
    <div className="space-y-4">
      {question.story && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="relative overflow-hidden p-5">
            <div className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-sm text-white shadow">📖</div>
            <div className="pl-7">
              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-purple-600">Baca cerita</div>
              <p className="text-base leading-relaxed text-slate-700 sm:text-lg">
                {renderStory(question.story, question.highlight)}
              </p>
            </div>
          </GlassCard>
        </motion.div>
      )}

      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-xs font-bold uppercase tracking-widest text-purple-600">{question.subcategory}</div>
        <h2 className="mt-2 text-xl font-bold text-slate-800 sm:text-2xl">{question.question}</h2>
      </motion.div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {question.options.map((opt, i) => (
          <motion.button
            key={opt + i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={disabled ? undefined : { y: -2, scale: 1.01 }}
            whileTap={disabled ? undefined : { scale: 0.98 }}
            disabled={disabled}
            onClick={() => {
              if (disabled) return
              setPicked(opt)
              if (soundOn) playSound('click')
              onAnswer(opt)
            }}
            className={`relative flex items-start gap-3 rounded-2xl border-2 p-3.5 text-left transition-all ${
              picked === opt
                ? 'border-purple-400 bg-purple-50 shadow-[0_6px_24px_-8px_rgba(168,85,247,0.4)]'
                : 'border-slate-200 bg-white/80 hover:border-purple-300'
            } ${disabled ? 'opacity-60' : 'cursor-pointer'}`}
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 text-sm font-bold text-white shadow">
              {String.fromCharCode(65 + i)}
            </span>
            <span className="text-sm font-medium text-slate-700 sm:text-base">{opt}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ============ Pattern Game ============
export function PatternGame({ question, onAnswer, disabled }: BaseGameProps) {
  const soundOn = useGameStore((s) => s.settings.sound)
  const [picked, setPicked] = useState<string | null>(null)

  // Extract sequence from question (e.g. "Lengkapi pola: 2, 4, 6, 8, ...")
  const match = question.question.match(/:([^]+)/)
  const seqText = match ? match[1].trim() : question.question
  const seq = seqText.split(',').map((s) => s.trim())

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="text-xs font-bold uppercase tracking-widest text-emerald-600">Pola Bilangan</div>
        <h2 className="mt-2 text-xl font-bold text-slate-800 sm:text-2xl">Lengkapi pola:</h2>
      </div>

      {/* Sequence visualization */}
      <GlassCard glow="emerald" className="p-5">
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {seq.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 18 }}
              className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold shadow-md sm:h-16 sm:w-16 sm:text-2xl ${
                i === seq.length - 1
                  ? 'border-2 border-dashed border-emerald-400 bg-emerald-50 text-emerald-700 animate-pulse-glow'
                  : 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white'
              }`}
            >
              {s === '...' || s === '?' ? '?' : s}
            </motion.div>
          ))}
          {seq.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: seq.length * 0.08 }}
                className="text-3xl text-emerald-400"
              >
                →
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: seq.length * 0.08 + 0.1 }}
                className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-emerald-500 bg-emerald-100 text-3xl font-black text-emerald-700 shadow-lg sm:h-20 sm:w-20"
              >
                ?
              </motion.div>
            </>
          )}
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {question.options.map((opt, i) => (
          <motion.button
            key={opt + i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
            whileHover={disabled ? undefined : { y: -3, scale: 1.03 }}
            whileTap={disabled ? undefined : { scale: 0.96 }}
            disabled={disabled}
            onClick={() => {
              if (disabled) return
              setPicked(opt)
              if (soundOn) playSound('click')
              onAnswer(opt)
            }}
            className={`flex h-20 items-center justify-center rounded-2xl border-2 text-2xl font-bold shadow-md transition-all ${
              picked === opt
                ? 'border-emerald-500 bg-emerald-100 text-emerald-800'
                : 'border-slate-200 bg-white/90 text-slate-700 hover:border-emerald-300'
            } ${disabled ? 'opacity-60' : 'cursor-pointer'}`}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ============ Build Game (sentence builder) ============
export function BuildGame({ question, onAnswer, disabled }: BaseGameProps) {
  const soundOn = useGameStore((s) => s.settings.sound)
  const answerWords = question.answer.split(/\s+/).filter(Boolean)
  const [scrambled] = useState(() =>
    [...answerWords].map((w, i) => ({ word: w, id: i })).sort(() => Math.random() - 0.5)
  )
  const [placed, setPlaced] = useState<{ word: string; id: number }[]>([])
  const [checked, setChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  if (answerWords.length < 2) {
    // Fallback to choice if answer is a single word
    return <ChoiceGame question={question} onAnswer={onAnswer} disabled={disabled} />
  }

  const remaining = scrambled.filter((s) => !placed.some((p) => p.id === s.id))

  const toggle = (token: { word: string; id: number }) => {
    if (disabled) return
    if (soundOn) playSound('click')
    const isPlaced = placed.some((p) => p.id === token.id)
    if (isPlaced) {
      setPlaced(placed.filter((p) => p.id !== token.id))
    } else {
      setPlaced([...placed, token])
    }
  }

  const handleCheck = () => {
    const arranged = placed.map((p) => p.word).join(' ')
    const target = question.answer
    const correct = arranged.trim().toLowerCase() === target.trim().toLowerCase()
    setIsCorrect(correct)
    setChecked(true)
    if (soundOn) playSound(correct ? 'correct' : 'wrong')
    if (correct) {
      onAnswer(question.answer)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-xs font-bold uppercase tracking-widest text-purple-600">Susun Kalimat</div>
        <h2 className="mt-2 text-xl font-bold text-slate-800 sm:text-2xl">{question.question}</h2>
        {question.story && (
          <p className="mt-1 text-sm text-slate-500">{question.story}</p>
        )}
      </div>

      {/* Sentence builder bar */}
      <GlassCard
        glow={checked ? (isCorrect ? 'emerald' : 'orange') : 'purple'}
        className="min-h-24 p-4"
      >
        <div className="mb-2 text-[11px] uppercase tracking-wide text-slate-500">Susunanmu:</div>
        <div className="flex min-h-14 flex-wrap items-center gap-2 rounded-xl bg-white/60 p-3">
          <AnimatePresence>
            {placed.length === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm italic text-slate-400"
              >
                Tap kata di bawah untuk menyusun kalimat...
              </motion.p>
            )}
            {placed.map((p) => (
              <motion.button
                key={p.id}
                layout
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggle(p)}
                disabled={disabled}
                className="rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 px-3 py-2 text-sm font-bold text-white shadow-md"
              >
                {p.word}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
        {checked && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-2 text-sm font-medium ${isCorrect ? 'text-emerald-600' : 'text-orange-600'}`}
          >
            {isCorrect ? '✨ Hebat! Susunanmu benar.' : 'Belum tepat. Coba susun ulang yuk!'}
          </motion.div>
        )}
      </GlassCard>

      {/* Word tokens */}
      <div>
        <div className="mb-2 text-[11px] uppercase tracking-wide text-slate-500">Pilih kata:</div>
        <div className="flex flex-wrap gap-2">
          {remaining.map((s) => (
            <motion.button
              key={s.id}
              layout
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggle(s)}
              disabled={disabled}
              className="rounded-xl border-2 border-purple-300 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-purple-500"
            >
              {s.word}
            </motion.button>
          ))}
          {remaining.length === 0 && !checked && (
            <button
              onClick={handleCheck}
              disabled={disabled || placed.length === 0}
              className="rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 px-5 py-2 text-sm font-bold text-white shadow-md"
            >
              Periksa Jawaban ✨
            </button>
          )}
          {remaining.length === 0 && checked && !isCorrect && (
            <button
              onClick={() => { setChecked(false); setPlaced([]) }}
              className="rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 px-5 py-2 text-sm font-bold text-white shadow-md"
            >
              Coba Lagi 🔄
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============ Main Game Screen Shell ============
export function GameScreen() {
  const session = useGameStore((s) => s.session)
  const answerQuestion = useGameStore((s) => s.answerQuestion)
  const endSession = useGameStore((s) => s.endSession)
  const soundOn = useGameStore((s) => s.settings.sound)
  const goBack = useGameStore((s) => s.goBack)
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; xp?: number } | null>(null)
  const [showCorrect, setShowCorrect] = useState(false)
  const assistant = useNovaAssistant()

  if (!session) return null
  const q = session.questions[session.currentIndex]
  if (!q) return null

  const total = session.questions.length
  const progress = (session.currentIndex / total) * 100

  const handleAnswer = (answer: string) => {
    const res = answerQuestion(answer)
    setFeedback({ type: res.correct ? 'correct' : 'wrong', xp: res.xpGained })
    if (soundOn) playSound(res.correct ? 'correct' : 'wrong')
    setShowCorrect(res.correct)
    // After delay, advance or end session
    setTimeout(() => {
      setFeedback(null)
      setShowCorrect(false)
      assistant.dismiss()
      const s = useGameStore.getState().session
      if (!s) return
      if (s.currentIndex >= s.questions.length - 1) {
        // session complete
        endSession()
        if (soundOn) playSound('celebration')
      } else {
        useGameStore.setState({
          session: { ...s, currentIndex: s.currentIndex + 1 },
        })
      }
    }, res.correct ? 1200 : 1700)
  }

  const gameType = session.gameType || q.gameType
  const renderGame = () => {
    switch (gameType) {
      case 'story':
        return <StoryGame key={q.id} question={q} onAnswer={handleAnswer} disabled={!!feedback} />
      case 'pattern':
        return <PatternGame key={q.id} question={q} onAnswer={handleAnswer} disabled={!!feedback} />
      case 'build':
        return <BuildGame key={q.id} question={q} onAnswer={handleAnswer} disabled={!!feedback} />
      case 'catch':
        return <CatchGame key={q.id} question={q} onAnswer={handleAnswer} disabled={!!feedback} />
      case 'shop':
        return <ShopGame key={q.id} question={q} onAnswer={handleAnswer} disabled={!!feedback} />
      case 'path':
        return <PathGame key={q.id} question={q} onAnswer={handleAnswer} disabled={!!feedback} />
      case 'battle':
        return <BattleGame key={q.id} question={q} onAnswer={handleAnswer} disabled={!!feedback} />
      case 'team_battle':
        return <TeamBattleGame key={q.id} question={q} onAnswer={handleAnswer} disabled={!!feedback} />
      case 'choice':
      default:
        return <ChoiceGame key={q.id} question={q} onAnswer={handleAnswer} disabled={!!feedback} />
    }
  }

  return (
    <div className="space-y-4 pb-2">
      {/* Progress header */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">{session.title}</span>
            <span className="text-slate-500">
              Soal {session.currentIndex + 1}/{total}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
            <motion.div
              animate={{ width: `${progress + 100 / total}%` }}
              transition={{ duration: 0.4 }}
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400"
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="rounded-full bg-emerald-100 px-2 py-1 font-bold text-emerald-700">
            ✓ {session.correct}
          </span>
          <span className="rounded-full bg-orange-100 px-2 py-1 font-bold text-orange-700">
            ↻ {session.wrong}
          </span>
        </div>
      </div>

      {/* Question card */}
      <GlassCard
        glow={session.category === 'literasi' ? 'purple' : 'cyan'}
        className="relative overflow-hidden p-5 sm:p-6"
      >
        {/* NOVA corner */}
        <div className="absolute -right-2 -top-2 opacity-90">
          <NovaMascot expression={showCorrect ? 'celebrate' : feedback?.type === 'wrong' ? 'encouraging' : 'thinking'} size={56} />
        </div>

        {renderGame()}

        {/* Feedback overlay (hidden for animated games with their own feedback) */}
        <AnimatePresence>
          {feedback && !['catch', 'shop', 'path', 'battle', 'team_battle'].includes(gameType) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`absolute inset-0 flex items-center justify-center rounded-3xl backdrop-blur-sm ${
                feedback.type === 'correct' ? 'bg-emerald-50/80' : 'bg-amber-50/80'
              }`}
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 14 }}
                  className="text-6xl"
                >
                  {feedback.type === 'correct' ? '🎉' : '💡'}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className={`text-xl font-black ${feedback.type === 'correct' ? 'text-emerald-600' : 'text-amber-700'}`}>
                    {feedback.type === 'correct' ? 'Hebat! 🚀' : 'Belum tepat! 💡'}
                  </div>
                  {feedback.type === 'correct' ? (
                    <div className="mt-1 text-sm font-medium text-emerald-700">
                      +{feedback.xp} XP · {q.explanation}
                    </div>
                  ) : (
                    <div className="mt-1 max-w-md px-4 text-sm text-amber-700">
                      {q.explanation} — Yuk coba lagi di soal berikutnya! 💪
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Bottom hint bar */}
      <div className="flex items-center justify-between gap-2">
        <GlowButton
          variant="soft"
          size="md"
          onClick={assistant.requestHint}
          disabled={!!feedback || assistant.loading}
          className="text-amber-700"
        >
          <Lightbulb className="h-4 w-4" /> {assistant.loading ? 'NOVA berpikir...' : 'Minta Petunjuk'}
        </GlowButton>
        <button
          onClick={goBack}
          className="text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          Keluar dari misi
        </button>
      </div>

      {/* Hint bubble */}
      <AnimatePresence>
        {(assistant.hint || assistant.loading) && (
          <NovaHintBubble
            hint={assistant.hint}
            expression={assistant.expression}
            loading={assistant.loading}
            onDismiss={assistant.dismiss}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
