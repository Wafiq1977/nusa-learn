'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import type { Question } from '@/store/gameStore'
import { playSound } from '@/lib/nusa/sound'
import { CharacterAvatar } from '@/components/nusa/screens/OnboardingScreen'

interface PathGameProps {
  question: Question
  onAnswer: (answer: string) => void
  disabled?: boolean
}

interface PathNode {
  id: number
  x: number
  y: number
  option: string
  isAnswer: boolean
}

// We build a small "tree": start -> 3 paths, each ending at a node with one option
// Player taps a path, character walks it, and we reveal if it was correct.
export function PathGame({ question, onAnswer, disabled }: PathGameProps) {
  const character = useGameStore((s) => s.character)
  const soundOn = useGameStore((s) => s.settings.sound)
  const reduceMotion = useGameStore((s) => s.settings.reduceMotion)

  const [nodes, setNodes] = useState<PathNode[]>([])
  const [charPos, setCharPos] = useState({ x: 50, y: 90 })
  const [walking, setWalking] = useState(false)
  const [chosen, setChosen] = useState<number | null>(null)
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [resultRevealed, setResultRevealed] = useState(false)

  // Build path nodes for this question
  useEffect(() => {
    const opts = [...question.options]
    // Ensure the answer is included, then pick 3 paths that always contain the answer
    const answerIdx = opts.indexOf(question.answer)
    let paths: string[]
    if (answerIdx >= 0 && answerIdx < 3) {
      // Answer is in the first 3 options, use those
      paths = opts.slice(0, 3)
    } else {
      // Answer is at index 3 or missing — swap it into the first 3
      const otherOpts = opts.filter((o) => o !== question.answer)
      paths = [question.answer, ...otherOpts.slice(0, 2)]
    }
    const start = { x: 50, y: 88 }
    // 3 branches: left, center, right
    const endPoints = [
      { x: 18, y: 18 },
      { x: 50, y: 12 },
      { x: 82, y: 18 },
    ]
    const newNodes: PathNode[] = paths.map((opt, i) => ({
      id: i,
      x: endPoints[i].x,
      y: endPoints[i].y,
      option: opt,
      isAnswer: opt === question.answer,
    }))
    setNodes(newNodes)
    setCharPos(start)
    setWalking(false)
    setChosen(null)
    setResult(null)
    setResultRevealed(false)
  }, [question])

  const handleChoosePath = (node: PathNode) => {
    if (disabled || walking || result) return
    setChosen(node.id)
    setWalking(true)
    if (soundOn) playSound('whoosh')
    // Walk through intermediate point then to node
    const start = { x: 50, y: 88 }
    const mid = { x: (start.x + node.x) / 2, y: 60 }
    const end = { x: node.x, y: node.y + 12 }
    const steps = reduceMotion ? 4 : 14
    let step = 0
    const walkInterval = setInterval(() => {
      step++
      const t = step / steps
      // Bezier-ish: start -> mid -> end
      const x =
        t < 0.5
          ? start.x + (mid.x - start.x) * (t * 2)
          : mid.x + (end.x - mid.x) * ((t - 0.5) * 2)
      const y =
        t < 0.5
          ? start.y + (mid.y - start.y) * (t * 2)
          : mid.y + (end.y - mid.y) * ((t - 0.5) * 2)
      setCharPos({ x, y })
      if (step >= steps) {
        clearInterval(walkInterval)
        setCharPos(end)
        setWalking(false)
        // Reveal answer
        const correct = node.isAnswer
        setResult(correct ? 'correct' : 'wrong')
        setResultRevealed(true)
        if (soundOn) playSound(correct ? 'correct' : 'wrong')
        setTimeout(() => {
          onAnswer(node.option)
        }, 1400)
      }
    }, 70)
  }

  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      <div className="text-center">
        <div className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          🚶 Penjelajah Jalur · {question.subcategory}
        </div>
        <h2 className="mt-1 text-lg font-bold text-slate-800 sm:text-xl">{question.question}</h2>
        <p className="mt-1 text-xs text-slate-500">Pilih jalur yang benar untuk karaktermu melangkah!</p>
      </div>

      {/* Path area */}
      <div
        className="relative w-full overflow-hidden rounded-3xl border-2 border-emerald-300 bg-gradient-to-b from-emerald-50 via-teal-50 to-sky-100"
        style={{ height: 'clamp(250px, 45dvh, 500px)' }}
      >
        {/* Background mountains/clouds decoration */}
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute left-6 top-10 text-4xl">🌲</div>
          <div className="absolute right-8 top-12 text-4xl">🌳</div>
          <div className="absolute left-20 top-6 text-2xl">☁️</div>
          <div className="absolute right-20 top-8 text-2xl">☁️</div>
          <div className="absolute bottom-3 left-3 text-3xl">🌲</div>
          <div className="absolute bottom-3 right-3 text-3xl">🌳</div>
        </div>

        {/* Path SVG (start to each node) */}
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          {nodes.map((node) => {
            const start = { x: '50%', y: '88%' }
            const mid = { x: `${(50 + node.x) / 2}%`, y: '60%' }
            const end = { x: `${node.x}%`, y: `${node.y + 12}%` }
            const isChosen = chosen === node.id
            return (
              <motion.path
                key={node.id}
                d={`M ${start.x} ${start.y} Q ${mid.x} ${mid.y} ${end.x} ${end.y}`}
                fill="none"
                stroke={
                  resultRevealed && isChosen
                    ? node.isAnswer
                      ? '#10B981'
                      : '#F97316'
                    : resultRevealed && node.isAnswer
                      ? '#10B981'
                      : isChosen
                        ? '#22D3EE'
                        : '#94A3B8'
                }
                strokeWidth={isChosen ? 5 : 3}
                strokeDasharray={isChosen ? '0' : '6 6'}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{ duration: 0.5, delay: 0.1 + node.id * 0.08 }}
              />
            )
          })}
        </svg>

        {/* Path nodes (answer options) */}
        {nodes.map((node) => {
          const isChosen = chosen === node.id
          const showCorrect = resultRevealed && (isChosen || node.isAnswer)
          return (
            <button
              key={node.id}
              onClick={() => handleChoosePath(node)}
              disabled={disabled || walking || !!result}
              className={`absolute flex flex-col items-center justify-center rounded-2xl px-3 py-2 shadow-md transition-all ${
                showCorrect
                  ? node.isAnswer
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white scale-110 ring-4 ring-emerald-300'
                    : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white scale-105 ring-4 ring-amber-300'
                  : isChosen
                    ? 'bg-gradient-to-br from-cyan-400 to-sky-500 text-white scale-105'
                    : 'bg-white/80 hover:bg-white hover:-translate-y-1 cursor-pointer'
              }`}
              style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
              aria-label={`Jalur ${node.option}`}
            >
              <div className="text-sm font-bold sm:text-base">{node.option}</div>
            </button>
          )
        })}

        {/* Walking character */}
        <motion.div
          className="absolute z-10"
          style={{ left: `${charPos.x}%`, top: `${charPos.y}%`, transform: 'translate(-50%, -50%)' }}
          animate={
            walking && !reduceMotion
              ? { y: [0, -5, 0], rotate: [-3, 3, -3] }
              : { y: [0, -2, 0] }
          }
          transition={{ duration: walking ? 0.2 : 1.5, repeat: Infinity }}
        >
          <CharacterAvatar char={character} size={64} />
        </motion.div>

        {/* Result overlay */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute right-3 top-3 text-4xl ${result === 'correct' ? 'animate-bob' : ''}`}
            >
              {result === 'correct' ? '🎉' : '💡'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-center text-[11px] text-slate-500">
        Tap salah satu jalur untuk membuat karaktermu berjalan ke sana!
      </p>
    </div>
  )
}
