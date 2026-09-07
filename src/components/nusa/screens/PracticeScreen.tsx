'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { GlassCard } from '@/components/nusa/GlassCard'
import { GlowButton } from '@/components/nusa/GlowButton'
import { NovaMascot } from '@/components/nusa/NovaMascot'
import { useQuestions } from '@/hooks/use-questions'
import { playSound } from '@/lib/nusa/sound'
import { Loader2, Calculator, BookOpen, ChevronRight, ArrowLeft } from 'lucide-react'

const NUMERIK_SUBS = [
  { key: 'penjumlahan', label: 'Penjumlahan', emoji: '➕' },
  { key: 'pengurangan', label: 'Pengurangan', emoji: '➖' },
  { key: 'perkalian', label: 'Perkalian', emoji: '✖️' },
  { key: 'pembagian', label: 'Pembagian', emoji: '➗' },
  { key: 'pecahan', label: 'Pecahan', emoji: '🍕' },
  { key: 'pola', label: 'Pola Bilangan', emoji: '🔢' },
  { key: 'uang', label: 'Uang', emoji: '💰' },
  { key: 'waktu', label: 'Waktu', emoji: '⏰' },
  { key: 'geometri', label: 'Geometri', emoji: '📐' },
  { key: 'soal_cerita', label: 'Soal Cerita', emoji: '📝' },
  { key: 'perbandingan', label: 'Perbandingan', emoji: '⚖️' },
  { key: 'pengukuran', label: 'Pengukuran', emoji: '📏' },
]

const LITERASI_SUBS = [
  { key: 'membaca', label: 'Membaca', emoji: '📖' },
  { key: 'ide_pokok', label: 'Ide Pokok', emoji: '💡' },
  { key: 'informasi', label: 'Mencari Informasi', emoji: '🔍' },
  { key: 'kosakata', label: 'Kosakata', emoji: '🔤' },
  { key: 'karakter', label: 'Karakter Tokoh', emoji: '🧑' },
  { key: 'sebab_akibat', label: 'Sebab-Akibat', emoji: '🔗' },
  { key: 'menyimpulkan', label: 'Menyimpulkan', emoji: '🤔' },
  { key: 'fakta_opini', label: 'Fakta & Opini', emoji: '📰' },
  { key: 'menyusun_kalimat', label: 'Menyusun Kalimat', emoji: '🧩' },
]

export function PracticeScreen() {
  const grade = useGameStore((s) => s.grade)
  const setView = useGameStore((s) => s.setView)
  const addXp = useGameStore((s) => s.addXp)
  const addCoins = useGameStore((s) => s.addCoins)
  const soundOn = useGameStore((s) => s.settings.sound)

  const [tab, setTab] = useState<'numerik' | 'literasi'>('numerik')
  const [selectedSub, setSelectedSub] = useState<{ key: string; label: string; emoji: string } | null>(null)
  const [inProgress, setInProgress] = useState(false)

  const subs = tab === 'numerik' ? NUMERIK_SUBS : LITERASI_SUBS

  const { questions, loading } = useQuestions({
    grade,
    category: tab,
    subcategory: selectedSub?.key,
    limit: 5,
    mix: true,
    enabled: inProgress && !!selectedSub,
  })

  const [qidx, setQidx] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (questions.length > 0 && qidx === 0) {
      // ready
    }
  }, [questions])

  const startPractice = (sub: { key: string; label: string; emoji: string }) => {
    setSelectedSub(sub)
    setInProgress(true)
    setQidx(0)
    setCorrect(0)
    setDone(false)
  }

  const handleAnswer = (ans: string) => {
    const q = questions[qidx]
    if (!q) return
    const isCorrect = ans.trim().toLowerCase() === q.answer.trim().toLowerCase()
    if (soundOn) playSound(isCorrect ? 'correct' : 'wrong')
    setFeedback(isCorrect ? 'correct' : 'wrong')
    if (isCorrect) setCorrect((c) => c + 1)

    setTimeout(() => {
      setFeedback(null)
      if (qidx + 1 >= questions.length) {
        setDone(true)
        // Award rewards
        addXp(correct + (isCorrect ? 1 : 0) * 25)
        addCoins(correct * 5)
        if (soundOn) playSound('celebration')
      } else {
        setQidx((i) => i + 1)
      }
    }, 1200)
  }

  return (
    <div className="space-y-5 pb-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl font-black text-gradient-cyan sm:text-4xl">Practice Mode 📚</h1>
        <p className="mt-1 text-sm text-slate-600">Latihan bebas — pilih materi yang ingin kamu kuasai</p>
      </motion.div>

      {/* Subcategory picker */}
      {!inProgress && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { if (soundOn) playSound('click'); setTab('numerik') }}
              className={`flex items-center gap-2 rounded-2xl border-2 p-3 transition-all ${
                tab === 'numerik'
                  ? 'border-cyan-400 bg-cyan-50 shadow-[0_6px_24px_-8px_rgba(14,165,233,0.5)]'
                  : 'border-slate-200 bg-white/70 hover:border-cyan-300'
              }`}
            >
              <Calculator className={`h-6 w-6 ${tab === 'numerik' ? 'text-cyan-600' : 'text-slate-400'}`} />
              <div className="text-left">
                <div className="text-sm font-bold text-slate-800">Numerik</div>
                <div className="text-[10px] text-slate-500">Matematika & logika</div>
              </div>
            </button>
            <button
              onClick={() => { if (soundOn) playSound('click'); setTab('literasi') }}
              className={`flex items-center gap-2 rounded-2xl border-2 p-3 transition-all ${
                tab === 'literasi'
                  ? 'border-purple-400 bg-purple-50 shadow-[0_6px_24px_-8px_rgba(168,85,247,0.5)]'
                  : 'border-slate-200 bg-white/70 hover:border-purple-300'
              }`}
            >
              <BookOpen className={`h-6 w-6 ${tab === 'literasi' ? 'text-purple-600' : 'text-slate-400'}`} />
              <div className="text-left">
                <div className="text-sm font-bold text-slate-800">Literasi</div>
                <div className="text-[10px] text-slate-500">Membaca & memahami</div>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {subs.map((s, i) => (
              <motion.div
                key={s.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -3 }}
              >
                <GlassCard
                  glow={tab === 'numerik' ? 'cyan' : 'purple'}
                  className="flex h-full cursor-pointer items-center gap-3 p-3"
                  onClick={() => { if (soundOn) playSound('click'); startPractice(s) }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-2xl shadow-sm">
                    {s.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-800">{s.label}</div>
                    <div className="text-[10px] text-slate-500">5 soal acak</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <GlassCard className="flex items-center gap-3 p-4">
            <NovaMascot expression="happy" size={44} />
            <p className="text-sm text-slate-600">
              <b className="text-slate-800">NOVA:</b> Mode Latihan tidak ada batas level. Berlatihlah sebanyak yang kamu mau untuk menguasai materi! 🌟
            </p>
          </GlassCard>
        </>
      )}

      {/* Practice session */}
      {inProgress && !done && (
        <>
          <div className="flex items-center justify-between">
            <GlowButton variant="soft" size="sm" onClick={() => { setInProgress(false); setSelectedSub(null); setQidx(0) }}>
              <ArrowLeft className="h-4 w-4" /> Kembali
            </GlowButton>
            <div className="text-xs font-bold text-slate-600">
              {selectedSub?.emoji} {selectedSub?.label}
            </div>
          </div>

          {loading ? (
            <GlassCard className="p-8 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-cyan-500" />
              <p className="mt-3 text-sm text-slate-500">Menyiapkan 5 soal...</p>
            </GlassCard>
          ) : questions.length === 0 ? (
            <GlassCard className="p-6 text-center">
              <NovaMascot expression="thinking" size={80} />
              <p className="mt-3 text-sm text-slate-600">Belum ada soal untuk materi ini dulu. Coba pilih materi lain ya!</p>
              <GlowButton variant="soft" size="sm" className="mt-3" onClick={() => { setInProgress(false); setSelectedSub(null) }}>
                Pilih Lain
              </GlowButton>
            </GlassCard>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={qidx} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                <GlassCard glow={tab === 'literasi' ? 'purple' : 'cyan'} className="p-5">
                  <div className="mb-3 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Soal {qidx + 1}/{questions.length}</span>
                    <span className="text-emerald-600">✓ {correct}</span>
                  </div>

                  {questions[qidx].story && (
                    <div className="mb-3 rounded-xl bg-purple-50 p-3 text-sm text-slate-700">
                      📖 {questions[qidx].story}
                    </div>
                  )}

                  <h2 className="text-xl font-bold text-slate-800">{questions[qidx].question}</h2>

                  <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {questions[qidx].options.map((opt, i) => (
                      <motion.button
                        key={opt + i}
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ y: -2 }}
                        disabled={!!feedback}
                        onClick={() => handleAnswer(opt)}
                        className={`flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition-all ${
                          feedback
                            ? opt === questions[qidx].answer
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
                        {feedback === 'correct' ? '🎉 Mantap!' : '💡 Belum tepat. Yuk coba lagi di soal berikutnya.'}
                        <div className="mt-1 text-xs font-normal text-slate-600">{questions[qidx].explanation}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            </AnimatePresence>
          )}
        </>
      )}

      {/* Done */}
      {done && (
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard strong glow="emerald" className="p-6 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 240, damping: 14 }}>
              <NovaMascot expression="celebrate" size={90} />
            </motion.div>
            <h2 className="mt-3 text-3xl font-black text-gradient-cyan">Latihan Selesai! 🎉</h2>
            <p className="mt-1 text-sm text-slate-600">
              {correct} dari {questions.length} benar di materi {selectedSub?.label}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <GlowButton variant="soft" className="flex-1" onClick={() => { setInProgress(false); setSelectedSub(null); setDone(false); setQidx(0); setCorrect(0) }}>
                Pilih Materi Lain
              </GlowButton>
              <GlowButton glow="cyan" className="flex-1" onClick={() => { setDone(false); setQidx(0); setCorrect(0) }}>
                Latih Lagi 🔄
              </GlowButton>
            </div>
            <button onClick={() => { if (soundOn) playSound('click'); setView('world_map') }} className="mt-3 text-xs font-medium text-cyan-600">
              atau lanjut petualangan di World Map →
            </button>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
