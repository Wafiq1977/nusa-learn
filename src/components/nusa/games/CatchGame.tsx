'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import type { Question } from '@/store/gameStore'
import { playSound } from '@/lib/nusa/sound'
import { CharacterAvatar } from '@/components/nusa/screens/OnboardingScreen'

interface CatchGameProps {
  question: Question
  onAnswer: (answer: string) => void
  disabled?: boolean
}

interface FallingToken {
  id: number
  value: string
  x: number // 0..100 percent
  y: number // 0..100 percent
  speed: number
  isAnswer: boolean
}

const PLAY_HEIGHT_PCT = 100

export function CatchGame({ question, onAnswer, disabled }: CatchGameProps) {
  const character = useGameStore((s) => s.character)
  const soundOn = useGameStore((s) => s.settings.sound)
  const reduceMotion = useGameStore((s) => s.settings.reduceMotion)

  // Character x position (percent of play area, 0-100)
  const [charX, setCharX] = useState(50)
  const [tokens, setTokens] = useState<FallingToken[]>([])
  const [caught, setCaught] = useState<FallingToken | null>(null)
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [ticker, setTicker] = useState(0)
  const playAreaRef = useRef<HTMLDivElement>(null)
  const idCounter = useRef(0)

  // The "target" is the answer; spawn 4 falling tokens (1 correct + 3 distractors)
  const initialTokens = useCallback(() => {
    const opts = [...question.options]
    // Shuffle and ensure answer is included
    const shuffled = opts.sort(() => Math.random() - 0.5).slice(0, 4)
    if (!shuffled.includes(question.answer)) {
      shuffled[Math.floor(Math.random() * shuffled.length)] = question.answer
    }
    // Stagger spawn times via initial y offsets
    return shuffled.map((value, i) => ({
      id: idCounter.current++,
      value,
      x: 10 + (i * 80) / (shuffled.length - 1),
      y: -10 - i * 25, // staggered start above the play area
      speed: 1.6 + Math.random() * 0.6,
      isAnswer: value === question.answer,
    }))
  }, [question])

  // Initialize tokens on mount / question change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTokens(initialTokens())
    setCaught(null)
    setResult(null)
    setCharX(50)
  }, [initialTokens])

  // Game loop: move tokens down, check catches
  useEffect(() => {
    if (disabled || result) return
    const speed = reduceMotion ? 0.8 : 1
    const tick = setInterval(() => {
      setTicker((t) => t + 1)
      setTokens((prev) =>
        prev.map((tk) => ({
          ...tk,
          y: tk.y + tk.speed * speed,
        }))
      )
    }, 80)
    return () => clearInterval(tick)
  }, [disabled, result, reduceMotion])

  // Detect: when a token reaches the bottom (~90% y), check if character is under it
  useEffect(() => {
    if (result) return
    const charLeft = charX - 8 // catch zone
    const charRight = charX + 8
    tokens.forEach((tk) => {
      if (tk.y >= 85 && tk.y <= 95 && !caught) {
        // Check overlap with character
        if (tk.x >= charLeft && tk.x <= charRight) {
          // Catch!
          setCaught(tk)
          const correct = tk.isAnswer
          setResult(correct ? 'correct' : 'wrong')
          if (soundOn) playSound(correct ? 'correct' : 'wrong')
          // Tell parent after small delay so user sees feedback
          setTimeout(() => {
            onAnswer(tk.value)
          }, 600)
        }
      }
    })
    // Check missed tokens (passed bottom without being caught)
    tokens.forEach((tk) => {
      if (tk.y > 105 && !caught && !result) {
        // Token missed — if it was the answer, mark as wrong
        if (tk.isAnswer) {
          setResult('wrong')
          if (soundOn) playSound('wrong')
          setTimeout(() => onAnswer(''), 400)
        }
      }
    })
  }, [tokens, charX, caught, result, onAnswer, soundOn])

  // Touch/keyboard controls: move character left/right
  const moveLeft = useCallback(() => {
    if (disabled || result) return
    setCharX((x) => Math.max(8, x - 12))
  }, [disabled, result])
  const moveRight = useCallback(() => {
    if (disabled || result) return
    setCharX((x) => Math.min(92, x + 12))
  }, [disabled, result])

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') moveLeft()
      if (e.key === 'ArrowRight' || e.key === 'd') moveRight()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [moveLeft, moveRight])

  return (
    <div className="space-y-3">
      <div className="text-center">
        <div className="text-xs font-bold uppercase tracking-widest text-cyan-600">
          🎯 Number Catch · {question.subcategory}
        </div>
        <h2 className="mt-1 text-xl font-bold text-slate-800 sm:text-2xl">{question.question}</h2>
        <p className="mt-1 text-xs text-slate-500">Geser karaktermu untuk menangkap jawaban yang benar!</p>
      </div>

      {/* Play area */}
      <div
        ref={playAreaRef}
        className="relative w-full overflow-hidden rounded-3xl border-2 border-cyan-300 bg-gradient-to-b from-sky-100 via-cyan-50 to-emerald-100"
        style={{ aspectRatio: '3/4', minHeight: 380 }}
      >
        {/* Background grid */}
        <div className="pointer-events-none absolute inset-0 opacity-30">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-dashed border-cyan-300"
              style={{ top: `${(i + 1) * 14}%` }}
            />
          ))}
        </div>

        {/* Falling tokens */}
        <AnimatePresence>
          {tokens.map((tk) => (
            <motion.div
              key={tk.id}
              className={`absolute flex h-12 w-12 items-center justify-center rounded-2xl text-base font-black shadow-lg sm:h-14 sm:w-14 ${
                tk.isAnswer && result
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white scale-110'
                  : result === 'wrong' && tk.isAnswer
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                    : 'bg-gradient-to-br from-sky-400 to-cyan-500 text-white'
              }`}
              style={{
                left: `${tk.x}%`,
                top: `${tk.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{ y: [0, 2, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              exit={{ scale: 0, opacity: 0 }}
            >
              {tk.value}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Character at bottom */}
        <motion.div
          className="absolute bottom-2 z-10"
          style={{ left: `${charX}%`, transform: 'translateX(-50%)' }}
          animate={{ x: 0, y: [0, -3, 0] }}
          transition={{ duration: 0.4, repeat: Infinity }}
        >
          <div
            className={`rounded-2xl p-1 ${result === 'correct' ? 'bg-emerald-200' : result === 'wrong' ? 'bg-amber-200' : ''}`}
            style={{ transition: 'background-color 0.3s' }}
          >
            <CharacterAvatar char={character} size={64} />
          </div>
        </motion.div>

        {/* Catch zone indicator */}
        <div
          className="absolute bottom-1 h-3 rounded-full bg-cyan-300/40 transition-all duration-200"
          style={{
            left: `${charX - 8}%`,
            width: '16%',
          }}
        />

        {/* Result overlay */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 flex items-center justify-center rounded-3xl backdrop-blur-sm ${result === 'correct' ? 'bg-emerald-100/80' : 'bg-amber-100/80'}`}
            >
              <div className="text-6xl">{result === 'correct' ? '🎉' : '💡'}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={moveLeft}
          disabled={disabled || !!result}
          aria-label="Geser kiri"
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 text-3xl text-white shadow-lg active:scale-95 transition disabled:opacity-50"
        >
          ⬅️
        </button>
        <button
          onClick={moveRight}
          disabled={disabled || !!result}
          aria-label="Geser kanan"
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 text-3xl text-white shadow-lg active:scale-95 transition disabled:opacity-50"
        >
          ➡️
        </button>
      </div>
      <p className="text-center text-[10px] text-slate-400">Tombol ⬅️ ➡️ atau gunakan tombol panah di keyboard</p>
    </div>
  )
}
