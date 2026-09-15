'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { GlassCard } from '@/components/nusa/GlassCard'
import { GlowButton } from '@/components/nusa/GlowButton'
import { NovaMascot } from '@/components/nusa/NovaMascot'
import { useQuestions } from '@/hooks/use-questions'
import { playSound } from '@/lib/nusa/sound'
import { Loader2, X } from 'lucide-react'
import { CatchGame } from '@/components/nusa/games/CatchGame'
import { ShopGame } from '@/components/nusa/games/ShopGame'
import { PathGame } from '@/components/nusa/games/PathGame'
import { BattleGame } from '@/components/nusa/games/BattleGame'
import { ChoiceGame, StoryGame, PatternGame, BuildGame } from '@/components/nusa/screens/GameScreen'

type ArcadeGameType = 'catch' | 'shop' | 'path' | 'battle' | 'choice' | 'story' | 'pattern' | 'build'

interface ArcadeGameDef {
  id: ArcadeGameType
  title: string
  description: string
  emoji: string
  color: string // gradient class
  category: 'numerik' | 'literasi'
  glow: 'cyan' | 'purple' | 'emerald' | 'orange' | 'pink'
  // For fetching questions
  defaultSubcategory?: string
  difficulty: 'easy' | 'medium' | 'hard'
  hint: string
}

const ARCADE_GAMES: ArcadeGameDef[] = [
  {
    id: 'catch',
    title: 'Number Catch',
    description: 'Tangkap angka jawaban yang benar!',
    emoji: '🎯',
    color: 'from-sky-400 to-cyan-500',
    category: 'numerik',
    glow: 'cyan',
    defaultSubcategory: 'penjumlahan',
    difficulty: 'easy',
    hint: 'Geser karaktermu kiri/kanan untuk menangkap angka',
  },
  {
    id: 'shop',
    title: 'Belanja Seru',
    description: 'Belanja barang sesuai target harga!',
    emoji: '🛒',
    color: 'from-amber-400 to-orange-500',
    category: 'numerik',
    glow: 'orange',
    defaultSubcategory: 'uang',
    difficulty: 'medium',
    hint: 'Tap barang di kios. Karaktermu akan berjalan & memeriksa harga',
  },
  {
    id: 'path',
    title: 'Penjelajah Jalur',
    description: 'Pilih jalur yang benar untuk melangkah!',
    emoji: '🚶',
    color: 'from-emerald-400 to-teal-500',
    category: 'numerik',
    glow: 'emerald',
    defaultSubcategory: 'pola',
    difficulty: 'medium',
    hint: 'Tap salah satu jalur. Karaktermu akan berjalan kesana',
  },
  {
    id: 'battle',
    title: 'Pertarungan Robot',
    description: 'Lawan robot musuh dengan jawaban benar!',
    emoji: '⚔️',
    color: 'from-rose-400 to-pink-500',
    category: 'numerik',
    glow: 'pink',
    defaultSubcategory: 'perkalian',
    difficulty: 'medium',
    hint: 'Jawab benar = serang musuh. Salah = kamu terluka',
  },
  {
    id: 'story',
    title: 'Story Explorer',
    description: 'Baca cerita & cari informasi penting',
    emoji: '📖',
    color: 'from-purple-400 to-fuchsia-500',
    category: 'literasi',
    glow: 'purple',
    defaultSubcategory: 'membaca',
    difficulty: 'easy',
    hint: 'Baca ceritanya dulu, lalu jawab pertanyaan',
  },
  {
    id: 'build',
    title: 'Sentence Builder',
    description: 'Susun kata menjadi kalimat benar',
    emoji: '🧩',
    color: 'from-purple-400 to-pink-500',
    category: 'literasi',
    glow: 'purple',
    defaultSubcategory: 'menyusun_kalimat',
    difficulty: 'medium',
    hint: 'Tap kata-kata untuk menyusun kalimat',
  },
  {
    id: 'pattern',
    title: 'Pattern Lab',
    description: 'Lengkapi pola bilangan',
    emoji: '🔢',
    color: 'from-emerald-400 to-cyan-500',
    category: 'numerik',
    glow: 'emerald',
    defaultSubcategory: 'pola',
    difficulty: 'easy',
    hint: 'Cari polanya, lalu pilih angka berikutnya',
  },
  {
    id: 'choice',
    title: 'Quick Quiz',
    description: 'Soal pilihan ganda cepat',
    emoji: '⚡',
    color: 'from-cyan-400 to-blue-500',
    category: 'numerik',
    glow: 'cyan',
    defaultSubcategory: 'penjumlahan',
    difficulty: 'medium',
    hint: 'Pilih jawaban A/B/C/D yang benar',
  },
]

export function ArcadeScreen() {
  const grade = useGameStore((s) => s.grade)
  const setView = useGameStore((s) => s.setView)
  const addXp = useGameStore((s) => s.addXp)
  const addCoins = useGameStore((s) => s.addCoins)
  const updateSkill = useGameStore((s) => s.updateSkill)
  const soundOn = useGameStore((s) => s.settings.sound)

  const [selected, setSelected] = useState<ArcadeGameDef | null>(null)
  const [qIdx, setQIdx] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' } | null>(null)
  const [done, setDone] = useState(false)

  // Only filter by gameType for game types that have dedicated DB questions
  // (catch/shop/path/battle use standard choice/story questions, so don't filter)
  const gameTypeForApi: 'build' | 'story' | 'pattern' | undefined =
    selected?.id === 'build' ? 'build'
    : selected?.id === 'story' ? 'story'
    : selected?.id === 'pattern' ? 'pattern'
    : undefined

  const { questions, loading } = useQuestions({
    grade,
    category: selected?.category || 'numerik',
    subcategory: selected?.defaultSubcategory,
    gameType: gameTypeForApi,
    difficulty: selected?.difficulty,
    limit: 5,
    enabled: !!selected,
  })

  const handleStart = (g: ArcadeGameDef) => {
    if (soundOn) playSound('whoosh')
    setSelected(g)
    setQIdx(0)
    setCorrectCount(0)
    setDone(false)
  }

  const handleAnswer = (answer: string) => {
    const q = questions[qIdx]
    if (!q) return
    const isCorrect = answer === q.answer || (answer !== '__wrong__' && answer.trim().toLowerCase() === q.answer.trim().toLowerCase())
    if (soundOn) playSound(isCorrect ? 'correct' : 'wrong')
    setFeedback({ type: isCorrect ? 'correct' : 'wrong' })
    if (isCorrect) setCorrectCount((c) => c + 1)
    updateSkill(q.category, q.subcategory, isCorrect)

    setTimeout(() => {
      setFeedback(null)
      if (qIdx + 1 >= questions.length) {
        setDone(true)
        addXp(correctCount * 25 + (isCorrect ? 25 : 0))
        addCoins(correctCount * 5 + (isCorrect ? 5 : 0))
        if (soundOn) playSound('celebration')
      } else {
        setQIdx((i) => i + 1)
      }
    }, isCorrect ? 1100 : 1500)
  }

  const renderGame = () => {
    if (!selected || !questions[qIdx]) return null
    const q = questions[qIdx]
    switch (selected.id) {
      case 'catch': return <CatchGame key={q.id} question={q} onAnswer={handleAnswer} disabled={!!feedback} />
      case 'shop': return <ShopGame key={q.id} question={q} onAnswer={handleAnswer} disabled={!!feedback} />
      case 'path': return <PathGame key={q.id} question={q} onAnswer={handleAnswer} disabled={!!feedback} />
      case 'battle': return <BattleGame key={q.id} question={q} onAnswer={handleAnswer} disabled={!!feedback} />
      case 'story': return <StoryGame key={q.id} question={q} onAnswer={handleAnswer} disabled={!!feedback} />
      case 'build': return <BuildGame key={q.id} question={q} onAnswer={handleAnswer} disabled={!!feedback} />
      case 'pattern': return <PatternGame key={q.id} question={q} onAnswer={handleAnswer} disabled={!!feedback} />
      case 'choice':
      default: return <ChoiceGame key={q.id} question={q} onAnswer={handleAnswer} disabled={!!feedback} />
    }
  }

  return (
    <div className="space-y-5 pb-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl font-black text-gradient-cyan sm:text-4xl">Arcade 🕹️</h1>
        <p className="mt-1 text-sm text-slate-600">Pilih mini-game favoritmu dan mainkan langsung!</p>
      </motion.div>

      {/* Game grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 2xl:gap-4">
        {ARCADE_GAMES.map((g, i) => (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <GlassCard
              glow={g.glow}
              className="flex h-full min-h-36 cursor-pointer flex-col items-center gap-2 p-3 text-center sm:min-h-44 sm:p-4 2xl:min-h-52 2xl:p-5"
              onClick={() => handleStart(g)}
              role="button"
              tabIndex={0}
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.5 + i * 0.2, repeat: Infinity }}
                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl shadow-lg ${g.color}`}
              >
                {g.emoji}
              </motion.div>
              <div>
                <div className="text-sm font-bold text-slate-800">{g.title}</div>
                <div className="mt-0.5 text-[11px] text-slate-500">{g.description}</div>
              </div>
              <div className="mt-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {g.category === 'numerik' ? '🔢 Numerik' : '📖 Literasi'}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* NOVA tip */}
      <GlassCard className="flex items-center gap-3 p-4">
        <NovaMascot expression="happy" size={44} />
        <p className="text-sm text-slate-600">
          <b className="text-slate-800">NOVA:</b> Arcade tempat bermain bebas! Coba semua mini-game seru: tangkap angka, belanja, jalur, pertarungan, dan lainnya! 🎮
        </p>
      </GlassCard>

      {/* Game modal */}
      <AnimatePresence>
        {selected && !done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto scroll-game bg-slate-900/40 p-3 backdrop-blur-sm sm:items-center"
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl my-auto"
            >
              <GlassCard strong className="max-h-[90dvh] overflow-y-auto scroll-game p-3 sm:p-5">
                {/* Header */}
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl shadow ${selected.color}`}>
                      {selected.emoji}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{selected.title}</div>
                      <div className="text-[10px] text-slate-500">Soal {qIdx + 1}/5 · ✓ {correctCount}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { if (soundOn) playSound('click'); setSelected(null); setQIdx(0); setCorrectCount(0) }}
                    aria-label="Tutup"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Hint banner */}
                <div className="mb-3 rounded-xl bg-cyan-50 p-2 text-xs text-cyan-700">
                  💡 {selected.hint}
                </div>

                {/* Game content */}
                {loading ? (
                  <div className="flex h-48 items-center justify-center text-slate-500">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                  </div>
                ) : questions.length === 0 || !questions[qIdx] ? (
                  <div className="flex h-48 flex-col items-center justify-center gap-3 text-slate-500">
                    <NovaMascot expression="thinking" size={60} />
                    <p className="text-sm">Belum ada soal untuk game ini. Coba game lain ya!</p>
                    <GlowButton variant="soft" size="sm" onClick={() => setSelected(null)}>
                      Pilih Game Lain
                    </GlowButton>
                  </div>
                ) : (
                  renderGame()
                )}
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Done screen */}
      <AnimatePresence>
        {done && selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              className="w-full max-w-md"
            >
              <GlassCard strong glow="emerald" className="p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 240, damping: 14 }}
                >
                  <NovaMascot expression="celebrate" size={90} />
                </motion.div>
                <h2 className="mt-3 text-2xl font-black text-gradient-cyan">Game Selesai! 🎉</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {selected.emoji} {selected.title}: {correctCount} dari {questions.length} benar
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-cyan-50 p-3">
                    <div className="text-2xl">✨</div>
                    <div className="text-lg font-black text-cyan-600">+{correctCount * 25}</div>
                    <div className="text-[10px] text-slate-500">XP</div>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-3">
                    <div className="text-2xl">🪙</div>
                    <div className="text-lg font-black text-amber-600">+{correctCount * 5}</div>
                    <div className="text-[10px] text-slate-500">Koin</div>
                  </div>
                </div>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <GlowButton variant="soft" className="flex-1" onClick={() => { setDone(false); setQIdx(0); setCorrectCount(0); setSelected(null) }}>
                    Pilih Game Lain
                  </GlowButton>
                  <GlowButton glow="cyan" className="flex-1" onClick={() => { setDone(false); setQIdx(0); setCorrectCount(0) }}>
                    Main Lagi 🔄
                  </GlowButton>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
