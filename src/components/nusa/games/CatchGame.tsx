'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import type { Question } from '@/store/gameStore'
import { playSound } from '@/lib/nusa/sound'
import { HeroCharacterAvatar } from '@/components/nusa/HeroCharacterAvatar'

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

  // Detect: when a token reaches the bottom (~88% y), check if character is under it
  useEffect(() => {
    if (result) return
    // Character center is at charX%, catch zone is ±7% around it
    const charLeft = charX - 7
    const charRight = charX + 7
    tokens.forEach((tk) => {
      if (tk.y >= 83 && tk.y <= 92 && !caught) {
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
    setCharX((x) => Math.max(10, x - 10))
  }, [disabled, result])
  const moveRight = useCallback(() => {
    if (disabled || result) return
    setCharX((x) => Math.min(90, x + 10))
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
    <div className="flex flex-col gap-2 sm:gap-3">
      <div className="text-center flex-shrink-0">
        <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 sm:text-xs">
          🎯 Number Catch · {question.subcategory}
        </div>
        <h2 className="mt-1 text-base font-bold text-slate-800 sm:text-lg md:text-xl 2xl:text-2xl">{question.question}</h2>
        <p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">Geser karaktermu untuk menangkap jawaban yang benar!</p>
      </div>

      {/* Play area — diperpanjang ke bawah, adaptif */}
      <div
        ref={playAreaRef}
        className="relative w-full flex-1 overflow-hidden rounded-3xl border-2 border-cyan-300 bg-gradient-to-b from-sky-100 via-cyan-50 to-emerald-100 min-h-[350px] sm:min-h-[450px]"
        style={{ height: 'clamp(350px, 55dvh, 650px)' }}
      >
        {/* Background grid */}
        <div className="pointer-events-none absolute inset-0 opacity-30">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-dashed border-cyan-300"
              style={{ top: `${(i + 1) * 11}%` }}
            />
          ))}
        </div>

        {/* Falling tokens — wrapper untuk centering, inner untuk animasi */}
        <AnimatePresence>
          {tokens.map((tk) => (
            <div
              key={tk.id}
              className="absolute"
              style={{ left: `${tk.x}%`, top: `${tk.y}%`, marginLeft: '-22px', marginTop: '-22px' }}
            >
              <motion.div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-black shadow-lg sm:h-12 sm:w-12 sm:text-base ${
                  tk.isAnswer && result
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white'
                    : result === 'wrong' && tk.isAnswer
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                      : 'bg-gradient-to-br from-sky-400 to-cyan-500 text-white'
                }`}
                exit={{ scale: 0, opacity: 0 }}
              >
                {tk.value}
              </motion.div>
            </div>
          ))}
        </AnimatePresence>

        {/* Character at bottom — calc() positioning, no transform/margin */}
        <div
          className="absolute bottom-3 z-10"
          style={{ left: `calc(${charX}% - 30px)` }}
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className={`rounded-2xl p-1 ${result === 'correct' ? 'bg-emerald-200' : result === 'wrong' ? 'bg-amber-200' : ''}`}
          >
            <HeroCharacterAvatar char={character} size={56} pose="running" float={false} />
          </motion.div>
        </div>

        {/* Catch zone indicator */}
        <div
          className="absolute bottom-1 h-3 rounded-full bg-cyan-300/40 transition-all duration-200"
          style={{
            left: `calc(${charX}% - 40px)`,
            width: '80px',
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
      <div className="flex items-center justify-center gap-3 flex-shrink-0">
        <button
          onClick={moveLeft}
          disabled={disabled || !!result}
          aria-label="Geser kiri"
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 text-2xl text-white shadow-lg active:scale-95 transition disabled:opacity-50 sm:h-16 sm:w-16 sm:text-3xl"
        >
          ⬅️
        </button>
        <button
          onClick={moveRight}
          disabled={disabled || !!result}
          aria-label="Geser kanan"
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 text-2xl text-white shadow-lg active:scale-95 transition disabled:opacity-50 sm:h-16 sm:w-16 sm:text-3xl"
        >
          ➡️
        </button>
      </div>
      <p className="text-center text-[10px] text-slate-400">Tombol ⬅️ ➡️ atau gunakan tombol panah di keyboard</p>
    </div>
  )
}
