'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { GlassCard } from '@/components/nusa/GlassCard'
import { GlowButton } from '@/components/nusa/GlowButton'
import { NovaMascot } from '@/components/nusa/NovaMascot'
import { playSound } from '@/lib/nusa/sound'
import { Users, Plus, Minus, Trash2, Sparkles, Trophy, ChevronRight } from 'lucide-react'

// Team color palettes (4 max)
export const TEAM_PALETTE = [
  {
    id: 'merah',
    name: 'Tim Merah',
    emoji: '🔴',
    color: 'from-rose-400 to-red-500',
    badge: 'bg-rose-100 text-rose-700',
    text: 'text-rose-600',
    border: 'border-rose-400',
    glow: 'shadow-[0_8px_24px_-8px_rgba(244,63,94,0.6)]' as const,
  },
  {
    id: 'biru',
    name: 'Tim Biru',
    emoji: '🔵',
    color: 'from-sky-400 to-blue-500',
    badge: 'bg-sky-100 text-sky-700',
    text: 'text-sky-600',
    border: 'border-sky-400',
    glow: 'shadow-[0_8px_24px_-8px_rgba(14,165,233,0.6)]' as const,
  },
  {
    id: 'hijau',
    name: 'Tim Hijau',
    emoji: '🟢',
    color: 'from-emerald-400 to-teal-500',
    badge: 'bg-emerald-100 text-emerald-700',
    text: 'text-emerald-600',
    border: 'border-emerald-400',
    glow: 'shadow-[0_8px_24px_-8px_rgba(16,185,129,0.6)]' as const,
  },
  {
    id: 'kuning',
    name: 'Tim Kuning',
    emoji: '🟡',
    color: 'from-amber-400 to-orange-500',
    badge: 'bg-amber-100 text-amber-700',
    text: 'text-amber-600',
    border: 'border-amber-400',
    glow: 'shadow-[0_8px_24px_-8px_rgba(251,191,36,0.6)]' as const,
  },
]

export interface MultiplayerTeam {
  id: string
  name: string
  paletteIndex: number
  score: number
  correct: number
  wrong: number
  streak: number
}

export interface MultiplayerConfig {
  teams: MultiplayerTeam[]
  grade: number
  category: 'numerik' | 'literasi' | 'mixed'
  difficulty: 'easy' | 'medium' | 'hard'
  questionCount: number
  roundMode: 'turn' | 'buzzer' // turn = round-robin, buzker = siapa cepat dia dapat (single-tap)
  attackAnimation: boolean
  timePerQuestion: number // 0 = no timer, else seconds per question
}

export function MultiplayerSetupScreen() {
  const grade = useGameStore((s) => s.grade)
  const setView = useGameStore((s) => s.setView)
  const soundOn = useGameStore((s) => s.settings.sound)
  const tvMode = useGameStore((s) => s.settings.tvMode)

  const [teamCount, setTeamCount] = useState(2)
  const [teams, setTeams] = useState<MultiplayerTeam[]>([
    { id: 't1', name: 'Tim Merah', paletteIndex: 0, score: 0, correct: 0, wrong: 0, streak: 0 },
    { id: 't2', name: 'Tim Biru', paletteIndex: 1, score: 0, correct: 0, wrong: 0, streak: 0 },
  ])
  const [config, setConfig] = useState<Omit<MultiplayerConfig, 'teams'>>({
    grade,
    category: 'mixed',
    difficulty: 'medium',
    questionCount: 8,
    roundMode: 'turn',
    attackAnimation: true,
    timePerQuestion: 20,
  })

  const updateTeamName = (id: string, name: string) => {
    setTeams((ts) => ts.map((t) => (t.id === id ? { ...t, name: name.slice(0, 24) } : t)))
  }

  const addTeam = () => {
    if (teams.length >= 4) return
    if (soundOn) playSound('click')
    const idx = teams.length
    setTeams([...teams, {
      id: `t${Date.now()}`,
      name: TEAM_PALETTE[idx].name,
      paletteIndex: idx,
      score: 0, correct: 0, wrong: 0, streak: 0,
    }])
    setTeamCount(teams.length + 1)
  }

  const removeTeam = (id: string) => {
    if (teams.length <= 2) return
    if (soundOn) playSound('click')
    setTeams(teams.filter((t) => t.id !== id))
    setTeamCount(teams.length - 1)
  }

  const handleStart = () => {
    if (teams.length < 2) return
    if (soundOn) playSound('whoosh')
    // Stash config in sessionStorage so battle screen can read it
    const fullConfig: MultiplayerConfig = { ...config, teams }
    sessionStorage.setItem('nusa-multiplayer-config', JSON.stringify(fullConfig))
    setView('multiplayer_battle')
  }

  return (
    <div className="space-y-5 pb-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl font-black text-gradient-cyan sm:text-4xl 2xl:text-5xl">
          Pertarungan Kelompok 👥
        </h1>
        <p className="mt-1 text-sm sm:text-base 2xl:text-lg text-slate-600">
          Main bareng teman sekelas di satu monitor! Buat 2-4 tim, berlomba jawab soal.
        </p>
      </motion.div>

      {/* Team setup */}
      <GlassCard className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700 sm:text-base 2xl:text-lg">
            <Users className="h-4 w-4 2xl:h-5 2xl:w-5" /> Tim ({teams.length}/4)
          </h3>
          <div className="flex gap-2">
            <GlowButton
              variant="soft"
              size="sm"
              onClick={removeTeam.length > 2 ? () => removeTeam(teams[teams.length - 1].id) : undefined}
              disabled={teams.length <= 2}
            >
              <Minus className="h-4 w-4" /> Kurangi
            </GlowButton>
            <GlowButton
              glow="cyan"
              size="sm"
              onClick={addTeam}
              disabled={teams.length >= 4}
            >
              <Plus className="h-4 w-4" /> Tambah Tim
            </GlowButton>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {teams.map((t, i) => {
            const p = TEAM_PALETTE[t.paletteIndex]
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className={`relative rounded-2xl border-2 ${p.border} bg-gradient-to-br ${p.color} p-3 text-white shadow-lg ${p.glow}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl 2xl:text-3xl">{p.emoji}</span>
                    <span className="text-xs font-bold uppercase tracking-wide opacity-90 2xl:text-sm">Tim {i + 1}</span>
                  </div>
                  {teams.length > 2 && (
                    <button
                      onClick={() => removeTeam(t.id)}
                      aria-label={`Hapus ${t.name}`}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-white/30 hover:bg-white/50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <input
                  value={t.name}
                  onChange={(e) => updateTeamName(t.id, e.target.value)}
                  placeholder={`Tim ${i + 1}`}
                  maxLength={24}
                  className="w-full rounded-xl border-2 border-white/40 bg-white/30 px-3 py-2 text-sm font-bold text-white placeholder:text-white/60 focus:border-white focus:outline-none 2xl:text-base"
                  aria-label={`Nama ${p.name}`}
                />
              </motion.div>
            )
          })}
        </div>
      </GlassCard>

      {/* Game config */}
      <GlassCard className="p-4 sm:p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700 sm:text-base 2xl:text-lg">
          <Sparkles className="h-4 w-4 2xl:h-5 2xl:w-5" /> Pengaturan Permainan
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Grade */}
          <Field label="Kelas">
            <select
              value={config.grade}
              onChange={(e) => setConfig({ ...config, grade: Number(e.target.value) })}
              className="w-full rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold focus:border-cyan-400 focus:outline-none 2xl:text-base"
            >
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <option key={g} value={g}>Kelas {g}</option>
              ))}
            </select>
          </Field>

          {/* Category */}
          <Field label="Kategori Soal">
            <select
              value={config.category}
              onChange={(e) => setConfig({ ...config, category: e.target.value as 'numerik' | 'literasi' | 'mixed' })}
              className="w-full rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold focus:border-cyan-400 focus:outline-none 2xl:text-base"
            >
              <option value="mixed">🔢📖 Campuran</option>
              <option value="numerik">🔢 Numerik Saja</option>
              <option value="literasi">📖 Literasi Saja</option>
            </select>
          </Field>

          {/* Difficulty */}
          <Field label="Tingkat Kesulitan">
            <select
              value={config.difficulty}
              onChange={(e) => setConfig({ ...config, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
              className="w-full rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold focus:border-cyan-400 focus:outline-none 2xl:text-base"
            >
              <option value="easy">Mudah</option>
              <option value="medium">Sedang</option>
              <option value="hard">Sulit</option>
            </select>
          </Field>

          {/* Question count */}
          <Field label="Jumlah Soal">
            <select
              value={config.questionCount}
              onChange={(e) => setConfig({ ...config, questionCount: Number(e.target.value) })}
              className="w-full rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold focus:border-cyan-400 focus:outline-none 2xl:text-base"
            >
              {[5, 8, 10, 12, 15, 20].map((n) => (
                <option key={n} value={n}>{n} soal</option>
              ))}
            </select>
          </Field>

          {/* Round mode */}
          <Field label="Mode Giliran">
            <select
              value={config.roundMode}
              onChange={(e) => setConfig({ ...config, roundMode: e.target.value as 'turn' | 'buzzer' })}
              className="w-full rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold focus:border-cyan-400 focus:outline-none 2xl:text-base"
            >
              <option value="turn">🔄 Bergiliran (adil)</option>
              <option value="buzzer">⚡ Siapa Cepat (seru)</option>
            </select>
          </Field>

          {/* Attack animation toggle */}
          <Field label="Animasi Serangan">
            <select
              value={config.attackAnimation ? 'on' : 'off'}
              onChange={(e) => setConfig({ ...config, attackAnimation: e.target.value === 'on' })}
              className="w-full rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold focus:border-cyan-400 focus:outline-none 2xl:text-base"
            >
              <option value="on">⚔️ Aktif</option>
              <option value="off">🚫 Mati</option>
            </select>
          </Field>

          {/* Timer per question */}
          <Field label="⏱ Waktu per Soal">
            <select
              value={config.timePerQuestion}
              onChange={(e) => setConfig({ ...config, timePerQuestion: Number(e.target.value) })}
              className="w-full rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold focus:border-cyan-400 focus:outline-none 2xl:text-base"
            >
              <option value={0}>∞ Tanpa Batas</option>
              <option value={15}>15 detik (cepat)</option>
              <option value={20}>20 detik (standar)</option>
              <option value={30}>30 detik (santai)</option>
              <option value={45}>45 detik (tenang)</option>
              <option value={60}>60 detik (pemikir)</option>
            </select>
          </Field>
        </div>

        <div className="mt-3 rounded-xl bg-cyan-50 p-3 text-xs text-cyan-700 sm:text-sm 2xl:text-base">
          💡 <b>Mode Bergiliran:</b> Setiap soal dijawab tim yang giliran (round-robin). Tim lain menunggu giliran.
          <br />
          ⚡ <b>Mode Siapa Cepat:</b> Semua tim bisa jawab kapan saja. Tim pertama yang jawab benar dapat poin. Cocok untuk kelas aktif!
          <br />
          ⏱ <b>Waktu per Soal:</b> Timer hitung mundur per soal. Kalau habis, tim dianggap salah & soal lanjut.
        </div>
      </GlassCard>

      {/* NOVA tip */}
      <GlassCard className="flex items-center gap-3 p-4">
        <NovaMascot expression="encouraging" size={48} />
        <p className="text-sm text-slate-600 2xl:text-base">
          <b className="text-slate-800">NOVA:</b> Ajak teman sekelasmu main bareng! Buat 2-4 tim, isi nama tim, lalu mulai pertarungan. Tim dengan skor tertinggi jadi juara! 🏆
        </p>
      </GlassCard>

      {/* Start button */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <GlowButton variant="soft" size="lg" onClick={() => { if (soundOn) playSound('click'); setView('home') }}>
          ← Beranda
        </GlowButton>
        <GlowButton glow="purple" size="xl" onClick={handleStart} disabled={teams.length < 2}>
          <Trophy className="h-5 w-5 2xl:h-6 2xl:w-6" /> Mulai Pertarungan! 🚀
        </GlowButton>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 2xl:text-xs">{label}</div>
      {children}
    </div>
  )
}
