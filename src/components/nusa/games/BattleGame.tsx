'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import type { Question } from '@/store/gameStore'
import { playSound } from '@/lib/nusa/sound'
import { NovaMascot } from '@/components/nusa/NovaMascot'
import { HeroCharacterAvatar } from '@/components/nusa/HeroCharacterAvatar'

interface BattleGameProps {
  question: Question
  onAnswer: (answer: string) => void
  disabled?: boolean
}

// Player HP & enemy HP are local to this question (reset each question).
// Player picks an option. If correct: attack enemy (enemy HP -= 1). If wrong: enemy attacks (player HP -= 1).
// Once one HP reaches 0, the question is answered (with success or failure).
const MAX_HP = 3

export function BattleGame({ question, onAnswer, disabled }: BattleGameProps) {
  const soundOn = useGameStore((s) => s.settings.sound)
  const reduceMotion = useGameStore((s) => s.settings.reduceMotion)

  const [playerHP, setPlayerHP] = useState(MAX_HP)
  const [enemyHP, setEnemyHP] = useState(MAX_HP)
  const [picked, setPicked] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'hit' | 'hurt'; option?: string } | null>(null)
  const [shake, setShake] = useState<'player' | 'enemy' | null>(null)
  const [attack, setAttack] = useState<'player' | 'enemy' | null>(null)
  const [gameOver, setGameOver] = useState<null | 'win' | 'lose'>(null)

  const handlePick = (option: string) => {
    if (disabled || picked || gameOver) return
    setPicked(option)
    const correct = option === question.answer
    if (correct) {
      // Player attacks enemy
      setAttack('player')
      if (soundOn) playSound('correct')
      setTimeout(() => {
        setShake('enemy')
        setFeedback({ type: 'hit' })
        setEnemyHP((hp) => {
          const next = hp - 1
          if (next <= 0) {
            setGameOver('win')
            setTimeout(() => {
              if (soundOn) playSound('celebration')
              onAnswer(question.answer)
            }, 1200)
          }
          return Math.max(0, next)
        })
      }, 400)
    } else {
      // Enemy attacks player
      setAttack('enemy')
      if (soundOn) playSound('wrong')
      setTimeout(() => {
        setShake('player')
        setFeedback({ type: 'hurt', option })
        setPlayerHP((hp) => {
          const next = hp - 1
          if (next <= 0) {
            setGameOver('lose')
            setTimeout(() => {
              onAnswer('__wrong__')
            }, 1200)
          }
          return Math.max(0, next)
        })
      }, 400)
    }
    // Reset states
    setTimeout(() => {
      setAttack(null)
      setShake(null)
      setFeedback(null)
      setPicked(null)
    }, 1200)
  }

  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      <div className="text-center">
        <div className="text-xs font-bold uppercase tracking-widest text-rose-600">
          ⚔️ Pertarungan Robot · {question.subcategory}
        </div>
        <h2 className="mt-1 text-lg font-bold text-slate-800 sm:text-xl">{question.question}</h2>
        <p className="mt-1 text-xs text-slate-500">Jawab benar untuk menyerang musuh! Salah = kamu terluka.</p>
      </div>

      {/* Battle scene */}
      <div
        className="relative w-full overflow-hidden rounded-3xl border-2 border-rose-300 bg-gradient-to-b from-indigo-100 via-purple-50 to-rose-100"
        style={{ height: 'clamp(200px, 35dvh, 400px)' }}
      >
        {/* Player side (left) — Hero Character */}
        <motion.div
          className={`absolute bottom-3 left-4 sm:left-8 ${shake === 'player' && !reduceMotion ? 'animate-shake' : ''}`}
          animate={
            attack === 'player' && !reduceMotion
              ? { x: [0, 60, 0], scale: [1, 1.1, 1] }
              : { y: [0, -3, 0] }
          }
          transition={{ duration: attack === 'player' ? 0.5 : 1.5, repeat: attack === 'player' ? 0 : Infinity }}
        >
          <HeroCharacterAvatar
            char={character}
            size={60}
            pose={attack === 'player' ? 'celebrating' : 'idle'}
            float={false}
          />
          <div className="mt-1 text-center text-[10px] font-bold text-slate-600">KAMU</div>
        </motion.div>

        {/* Enemy side (right) — enemy robot */}
        <motion.div
          className={`absolute bottom-3 right-6 ${shake === 'enemy' && !reduceMotion ? 'animate-shake' : ''}`}
          animate={
            attack === 'enemy' && !reduceMotion
              ? { x: [0, -60, 0], scale: [1, 1.1, 1] }
              : { y: [0, -3, 0], rotate: [0, -2, 2, 0] }
          }
          transition={{ duration: attack === 'enemy' ? 0.5 : 2, repeat: attack === 'enemy' ? 0 : Infinity }}
        >
          <div className="relative">
            <NovaMascot
              expression={enemyHP <= 1 ? 'surprised' : 'thinking'}
              size={72}
              float={!attack}
            />
            <div className="absolute -right-2 -top-2 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
              👾
            </div>
          </div>
          <div className="mt-1 text-center text-[10px] font-bold text-slate-600">MUSUH</div>
        </motion.div>

        {/* Attack projectile animation */}
        <AnimatePresence>
          {attack === 'player' && (
            <motion.div
              initial={{ x: 60, y: 0, opacity: 0, scale: 0.3 }}
              animate={{ x: 240, y: 0, opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 2 }}
              transition={{ duration: 0.4 }}
              className="absolute bottom-12 left-1/3 text-3xl"
            >
              ⚡
            </motion.div>
          )}
          {attack === 'enemy' && (
            <motion.div
              initial={{ x: -60, y: 0, opacity: 0, scale: 0.3 }}
              animate={{ x: -240, y: 0, opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 2 }}
              transition={{ duration: 0.4 }}
              className="absolute bottom-12 right-1/3 text-3xl"
            >
              🔥
            </motion.div>
          )}
        </AnimatePresence>

        {/* HP bars (top) */}
        <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-3">
          <HPBar label="KAMU" hp={playerHP} max={MAX_HP} color="emerald" />
          <div className="text-2xl">⚔️</div>
          <HPBar label="MUSUH" hp={enemyHP} max={MAX_HP} color="rose" reverse />
        </div>

        {/* Feedback toast */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-x-4 bottom-20 rounded-xl p-2 text-center text-sm font-bold shadow-lg ${
                feedback.type === 'hit'
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-rose-500/90 text-white'
              }`}
            >
              {feedback.type === 'hit'
                ? `🎯 Serangan tepat sasaran! +${question.explanation.slice(0, 60)}`
                : `🔥 Aduh! Kamu terluka. Jawaban: ${question.answer}`}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game over overlay */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`absolute inset-0 flex items-center justify-center rounded-3xl backdrop-blur-sm ${
                gameOver === 'win' ? 'bg-emerald-100/80' : 'bg-rose-100/80'
              }`}
            >
              <div className="text-center">
                <div className="text-6xl">{gameOver === 'win' ? '🏆' : '💪'}</div>
                <div className={`mt-2 text-xl font-black ${gameOver === 'win' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {gameOver === 'win' ? 'Kamu Menang!' : 'Coba Lagi!'}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Option buttons (4 attack moves) */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {question.options.map((opt, i) => {
          const isPicked = picked === opt
          const isAnswer = opt === question.answer
          return (
            <motion.button
              key={opt + i}
              whileHover={disabled || picked ? undefined : { y: -2, scale: 1.03 }}
              whileTap={disabled || picked ? undefined : { scale: 0.96 }}
              disabled={disabled || !!picked || !!gameOver}
              onClick={() => handlePick(opt)}
              className={`relative flex items-center gap-2 rounded-2xl border-2 p-3 text-left transition-all ${
                picked
                  ? isAnswer
                    ? 'border-emerald-400 bg-emerald-50'
                    : isPicked
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-slate-200 opacity-50'
                  : 'border-slate-200 bg-white/80 hover:border-rose-300'
              }`}
            >
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 to-orange-500 text-xs font-bold text-white">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-sm font-semibold text-slate-700">{opt}</span>
            </motion.button>
          )
        })}
      </div>

      <p className="text-center text-[11px] text-slate-500">
        Setiap jawaban benar = serangan ke musuh. Salah = kamu terluka. Kalahkan musuh untuk menang!
      </p>
    </div>
  )
}

function HPBar({
  label,
  hp,
  max,
  color,
  reverse,
}: {
  label: string
  hp: number
  max: number
  color: 'emerald' | 'rose'
  reverse?: boolean
}) {
  const pct = (hp / max) * 100
  return (
    <div className="flex-1">
      <div className="mb-1 flex items-center justify-between text-[10px] font-bold">
        <span className={color === 'emerald' ? 'text-emerald-700' : 'text-rose-700'}>{label}</span>
        <span className="text-slate-500">
          {color === 'emerald' ? '❤️' : '👾'} {hp}/{max}
        </span>
      </div>
      <div className={`relative h-3 overflow-hidden rounded-full bg-slate-200 ${reverse ? 'scale-x-[-1]' : ''}`}>
        <motion.div
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
          className={`h-full rounded-full ${color === 'emerald' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-rose-400 to-red-500'}`}
        />
      </div>
    </div>
  )
}
