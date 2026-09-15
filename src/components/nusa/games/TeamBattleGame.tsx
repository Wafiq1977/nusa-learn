'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import type { Question } from '@/store/gameStore'
import { playSound } from '@/lib/nusa/sound'
import { HeroCharacterAvatar } from '@/components/nusa/HeroCharacterAvatar'

interface TeamBattleGameProps {
  question: Question
  onAnswer: (answer: string) => void
  disabled?: boolean
}

// Team Battle: Tim Merah (kiri, pemain) vs Tim Biru (kanan, AI)
// Race to answer correctly. Whoever answers first AND correctly attacks the other.
// AI answers after a random delay based on difficulty.
const MAX_HP = 5

export function TeamBattleGame({ question, onAnswer, disabled }: TeamBattleGameProps) {
  const character = useGameStore((s) => s.character)
  const soundOn = useGameStore((s) => s.settings.sound)
  const reduceMotion = useGameStore((s) => s.settings.reduceMotion)

  const [playerHP, setPlayerHP] = useState(MAX_HP)
  const [enemyHP, setEnemyHP] = useState(MAX_HP)
  const [picked, setPicked] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'player_hit' | 'player_hurt' | 'enemy_hit' | 'enemy_hurt' | 'tie' | null>(null)
  const [attack, setAttack] = useState<'player' | 'enemy' | null>(null)
  const [shake, setShake] = useState<'player' | 'enemy' | null>(null)
  const [gameOver, setGameOver] = useState<null | 'win' | 'lose'>(null)
  const [aiThinking, setAiThinking] = useState(false)
  const [aiProgress, setAiProgress] = useState(0)
  const [playerAnswered, setPlayerAnswered] = useState(false)
  const aiTimerRef = useRef<number | null>(null)
  const aiProgressRef = useRef<number | null>(null)
  const gameOverRef = useRef<boolean>(false)
  const playerAnsweredRef = useRef<boolean>(false)

  // Determine AI speed based on question difficulty
  const getAiDelay = () => {
    if (question.difficulty === 'easy') return 5000 + Math.random() * 3000
    if (question.difficulty === 'medium') return 3500 + Math.random() * 2500
    return 2500 + Math.random() * 2000
  }

  // AI correctness probability (becomes smarter at higher difficulty)
  const aiAccuracy = question.difficulty === 'easy' ? 0.55 : question.difficulty === 'medium' ? 0.7 : 0.85

  // Helper: apply damage to player, handle game-over
  const damagePlayer = () => {
    setPlayerHP((hp) => {
      const next = Math.max(0, hp - 1)
      if (next <= 0 && !gameOverRef.current) {
        gameOverRef.current = true
        setGameOver('lose')
        setTimeout(() => onAnswer('__wrong__'), 1800)
      }
      return next
    })
  }
  const damageEnemy = () => {
    setEnemyHP((hp) => {
      const next = Math.max(0, hp - 1)
      if (next <= 0 && !gameOverRef.current) {
        gameOverRef.current = true
        setGameOver('win')
        setTimeout(() => { if (soundOn) playSound('celebration') }, 300)
        setTimeout(() => onAnswer(question.answer), 1800)
      }
      return next
    })
  }

  // AI's turn to attack (after delay elapses)
  const triggerAiAnswer = () => {
    if (gameOverRef.current || playerAnsweredRef.current) return
    const willBeCorrect = Math.random() < aiAccuracy
    const selected = willBeCorrect
      ? question.answer
      : question.options.find((o) => o !== question.answer) || question.options[0]
    setAiThinking(false)

    if (willBeCorrect) {
      // AI attacks player
      setAttack('enemy')
      if (soundOn) playSound('correct')
      setTimeout(() => {
        setShake('player')
        setFeedback('enemy_hit')
        damagePlayer()
      }, 400)
    } else {
      // AI answered wrong — player can still answer (re-enable picking)
      setFeedback('enemy_hurt')
      setPlayerAnswered(false)
      setPicked(null)
      playerAnsweredRef.current = false
    }

    setTimeout(() => {
      setAttack(null)
      setShake(null)
      setFeedback(null)
    }, 1500)
  }

  // Reset on question change & start AI countdown
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPicked(null)
    setFeedback(null)
    setAttack(null)
    setShake(null)
    setPlayerAnswered(false)
    setAiThinking(true)
    setAiProgress(0)
    gameOverRef.current = false
    playerAnsweredRef.current = false

    const aiDelay = getAiDelay()
    const startTime = Date.now()

    // Animate progress bar
    aiProgressRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = Math.min(100, (elapsed / aiDelay) * 100)
      setAiProgress(pct)
      if (pct >= 100) {
        if (aiProgressRef.current) clearInterval(aiProgressRef.current)
      }
    }, 50)

    // Trigger AI answer after delay
    aiTimerRef.current = window.setTimeout(() => {
      triggerAiAnswer()
    }, aiDelay)

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current)
      if (aiProgressRef.current) clearInterval(aiProgressRef.current)
    }
  }, [question])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current)
      if (aiProgressRef.current) clearInterval(aiProgressRef.current)
    }
  }, [])

  // Player answers
  const handlePlayerPick = (option: string) => {
    if (disabled || picked || playerAnswered || gameOverRef.current) return
    setPicked(option)
    setPlayerAnswered(true)
    playerAnsweredRef.current = true
    const isCorrect = option === question.answer
    if (soundOn) playSound(isCorrect ? 'correct' : 'wrong')

    // Stop AI
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current)
    if (aiProgressRef.current) clearInterval(aiProgressRef.current)
    setAiThinking(false)

    if (isCorrect) {
      setAttack('player')
      setTimeout(() => {
        setShake('enemy')
        setFeedback('player_hit')
        damageEnemy()
      }, 400)
    } else {
      // Player answered wrong — AI gets a chance to attack immediately
      setFeedback('player_hurt')
      setTimeout(() => {
        setAttack('enemy')
        if (soundOn) playSound('wrong')
        setTimeout(() => {
          setShake('player')
          damagePlayer()
        }, 400)
      }, 500)
    }

    setTimeout(() => {
      setAttack(null)
      setShake(null)
      setFeedback(null)
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      <div className="text-center">
        <div className="text-[10px] font-bold uppercase tracking-widest text-rose-600 sm:text-xs 2xl:text-sm">
          ⚔️ Pertarungan Kelompok · {question.subcategory}
        </div>
        <h2 className="mt-1 text-sm font-bold text-slate-800 sm:text-base md:text-lg 2xl:text-xl">{question.question}</h2>
        {question.story && (
          <p className="mt-2 mx-auto max-w-2xl text-sm sm:text-base 2xl:text-lg bg-purple-50 rounded-xl p-3 text-slate-700">
            📖 {question.story}
          </p>
        )}
        <p className="mt-1 text-xs sm:text-sm text-rose-600 font-semibold">
          ⚡ Cepat-cepatan! Siapa yang jawab duluan & benar, dia yang menyerang!
        </p>
      </div>

      {/* Battle arena */}
      <div
        className="relative w-full overflow-hidden rounded-3xl border-2 border-rose-300 bg-gradient-to-b from-indigo-100 via-purple-50 to-rose-100"
        style={{ height: 'clamp(200px, 40dvh, 500px)' }}
      >
        {/* Team labels (top) */}
        <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-3 z-20">
          <TeamHPBar label="TIM MERAH" hp={playerHP} max={MAX_HP} color="rose" />
          <div className="text-2xl sm:text-3xl 2xl:text-4xl">⚔️</div>
          <TeamHPBar label="TIM BIRU (AI)" hp={enemyHP} max={MAX_HP} color="sky" reverse />
        </div>

        {/* Player team (left) */}
        <motion.div
          className={`absolute bottom-3 left-4 sm:left-8 2xl:left-12 ${shake === 'player' && !reduceMotion ? 'animate-shake' : ''}`}
          animate={
            attack === 'player' && !reduceMotion
              ? { x: [0, 80, 0], scale: [1, 1.15, 1] }
              : { y: [0, -3, 0] }
          }
          transition={{ duration: attack === 'player' ? 0.5 : 1.5, repeat: attack === 'player' ? 0 : Infinity }}
        >
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="rounded-2xl bg-rose-100 p-1"
            >
              <HeroCharacterAvatar char={character} size={72} pose="celebrating" />
            </motion.div>
            <div className="mt-1 rounded-full bg-rose-500 px-3 py-0.5 text-[10px] font-bold text-white sm:text-xs 2xl:text-sm">
              KAMU (TIM MERAH)
            </div>
            <div className="mt-1 flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${i < Math.ceil(playerHP / 2) ? 'bg-rose-500' : 'bg-slate-300'}`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Enemy team (right) */}
        <motion.div
          className={`absolute bottom-3 right-4 sm:right-8 2xl:right-12 ${shake === 'enemy' && !reduceMotion ? 'animate-shake' : ''}`}
          animate={
            attack === 'enemy' && !reduceMotion
              ? { x: [0, -80, 0], scale: [1, 1.15, 1] }
              : { y: [0, -3, 0], rotate: [0, -2, 2, 0] }
          }
          transition={{ duration: attack === 'enemy' ? 0.5 : 2, repeat: attack === 'enemy' ? 0 : Infinity }}
        >
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="rounded-2xl bg-sky-100 p-1"
            >
              <div className="text-5xl sm:text-6xl 2xl:text-7xl">🤖</div>
            </motion.div>
            <div className="mt-1 rounded-full bg-sky-500 px-3 py-0.5 text-[10px] font-bold text-white sm:text-xs 2xl:text-sm">
              TIM BIRU (AI)
            </div>
            <div className="mt-1 flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${i < Math.ceil(enemyHP / 2) ? 'bg-sky-500' : 'bg-slate-300'}`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* AI thinking indicator */}
        <AnimatePresence>
          {aiThinking && !playerAnswered && !gameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-1/2 top-20 z-10 -translate-x-1/2"
            >
              <div className="flex flex-col items-center gap-1 rounded-2xl bg-sky-100/90 px-3 py-2 shadow-md">
                <div className="flex items-center gap-1 text-[10px] font-bold text-sky-700 sm:text-xs">
                  🤖 AI berpikir
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    ⏱️
                  </motion.div>
                </div>
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-sky-200">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all"
                    style={{ width: `${aiProgress}%` }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attack projectiles */}
        <AnimatePresence>
          {attack === 'player' && (
            <motion.div
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
              animate={{ x: 180, y: -20, opacity: 1, scale: 1.3 }}
              exit={{ opacity: 0, scale: 2 }}
              transition={{ duration: 0.4 }}
              className="absolute bottom-16 left-1/4 text-3xl sm:text-4xl 2xl:text-5xl"
            >
              ⚡
            </motion.div>
          )}
          {attack === 'enemy' && (
            <motion.div
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
              animate={{ x: -180, y: -20, opacity: 1, scale: 1.3 }}
              exit={{ opacity: 0, scale: 2 }}
              transition={{ duration: 0.4 }}
              className="absolute bottom-16 right-1/4 text-3xl sm:text-4xl 2xl:text-5xl"
            >
              🔥
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback toast */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute left-1/2 top-32 z-20 -translate-x-1/2 rounded-2xl px-4 py-2 text-center text-xs font-bold shadow-lg sm:text-sm 2xl:text-base ${
                feedback === 'player_hit'
                  ? 'bg-rose-500/90 text-white'
                  : feedback === 'enemy_hit'
                    ? 'bg-sky-500/90 text-white'
                    : feedback === 'player_hurt'
                      ? 'bg-amber-500/90 text-white'
                      : 'bg-emerald-500/90 text-white'
              }`}
            >
              {feedback === 'player_hit' && '🎯 Tim Merah menyerang!'}
              {feedback === 'enemy_hit' && '💥 Tim Biru menyerang!'}
              {feedback === 'player_hurt' && '❌ Salah! Tim Biru dapat giliran menyerang'}
              {feedback === 'enemy_hurt' && '😅 Tim Biru salah! Kamu masih punya kesempatan'}
              {feedback === 'tie' && '🤝 Seri!'}
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
                gameOver === 'win' ? 'bg-rose-100/85' : 'bg-sky-100/85'
              }`}
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                  className="text-6xl sm:text-7xl 2xl:text-8xl"
                >
                  {gameOver === 'win' ? '🏆' : '💪'}
                </motion.div>
                <div className={`mt-2 text-xl font-black sm:text-2xl 2xl:text-4xl ${gameOver === 'win' ? 'text-rose-700' : 'text-sky-700'}`}>
                  {gameOver === 'win' ? 'TIM MERAH MENANG!' : 'TIM BIRU MENANG!'}
                </div>
                <div className="mt-1 text-xs text-slate-600 sm:text-sm 2xl:text-base">
                  {gameOver === 'win' ? 'Kerja bagus, tim! 🎉' : 'Yuk coba lagi, tim! 💪'}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Option buttons (4 attack moves) */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {question.options.map((opt, i) => {
          const isPicked = picked === opt
          const isAnswer = opt === question.answer
          return (
            <motion.button
              key={opt + i}
              whileHover={disabled || picked || playerAnswered ? undefined : { y: -2, scale: 1.03 }}
              whileTap={disabled || picked || playerAnswered ? undefined : { scale: 0.96 }}
              disabled={disabled || !!picked || playerAnswered || !!gameOver}
              onClick={() => handlePlayerPick(opt)}
              className={`relative flex items-center justify-center gap-2 rounded-2xl border-2 p-3 text-center transition-all sm:p-4 ${
                picked
                  ? isAnswer
                    ? 'border-emerald-400 bg-emerald-50'
                    : isPicked
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-slate-200 opacity-50'
                  : 'border-slate-200 bg-white/80 hover:border-rose-300 hover:bg-white'
              }`}
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 to-orange-500 text-xs font-bold text-white sm:h-10 sm:w-10 2xl:h-12 2xl:w-12 2xl:text-base">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-sm font-semibold text-slate-700 sm:text-base 2xl:text-lg">{opt}</span>
            </motion.button>
          )
        })}
      </div>

      <p className="text-center text-[11px] sm:text-xs 2xl:text-sm text-slate-500">
        ⚡ Cepat jawab sebelum AI selesai berpikir! Jawaban benar = serang musuh. Jawaban salah = musuh dapat giliran menyerang!
      </p>
    </div>
  )
}

function TeamHPBar({
  label,
  hp,
  max,
  color,
  reverse,
}: {
  label: string
  hp: number
  max: number
  color: 'rose' | 'sky'
  reverse?: boolean
}) {
  const pct = (hp / max) * 100
  return (
    <div className="flex-1">
      <div className="mb-1 flex items-center justify-between text-[10px] font-bold sm:text-xs 2xl:text-sm">
        <span className={color === 'rose' ? 'text-rose-700' : 'text-sky-700'}>{label}</span>
        <span className="text-slate-600">
          {color === 'rose' ? '❤️' : '💙'} {hp}/{max}
        </span>
      </div>
      <div className={`relative h-3 overflow-hidden rounded-full bg-slate-200 sm:h-4 2xl:h-5 ${reverse ? 'scale-x-[-1]' : ''}`}>
        <motion.div
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
          className={`h-full rounded-full ${color === 'rose' ? 'bg-gradient-to-r from-rose-400 to-red-500' : 'bg-gradient-to-r from-sky-400 to-blue-500'}`}
        />
      </div>
    </div>
  )
}
