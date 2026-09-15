'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { GlassCard } from '@/components/nusa/GlassCard'
import { GlowButton } from '@/components/nusa/GlowButton'
import { NovaMascot } from '@/components/nusa/NovaMascot'
import { playSound } from '@/lib/nusa/sound'
import { Loader2, X, Plus, Edit, Trash2, Search, RefreshCw, Lock, BarChart3, BookOpen, Users, Activity, Save, ArrowLeft } from 'lucide-react'

const ADMIN_PASSWORD_DEFAULT = 'nusa-admin'

interface QuestionItem {
  id: string
  grade: number
  category: string
  subcategory: string
  difficulty: string
  gameType: string
  question: string
  story: string | null
  highlight: string | null
  options: string
  answer: string
  explanation: string
  hints: string
  xpReward: number
}

interface Stats {
  totals: {
    questions: number
    badges: number
    sessions: number
    players: number
    numerik: number
    literasi: number
  }
  byGrade: { grade: number; count: number }[]
  byDifficulty: { difficulty: string; count: number }[]
  bySubcategory: { subcategory: string; count: number }[]
  recentSessions: {
    id: string
    playerName: string
    grade: number
    area: string
    level: string
    category: string
    correct: number
    wrong: number
    xpGained: number
    starsGained: number
    duration: number
    createdAt: string
  }[]
  sessionAgg: {
    sumCorrect: number
    sumWrong: number
    sumXp: number
    sumStars: number
    avgCorrect: number
    avgWrong: number
  }
  recentPlayers: {
    id: string
    name: string
    grade: number
    xp: number
    coins: number
    stars: number
    updatedAt: string
  }[]
}

type Tab = 'dashboard' | 'questions' | 'sessions'

export function AdminScreen() {
  const setView = useGameStore((s) => s.setView)
  const soundOn = useGameStore((s) => s.settings.sound)
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

  // Persist token in sessionStorage so refresh doesn't lose login
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.sessionStorage.getItem('nusa-admin-token') : null
    if (saved) setToken(saved)
  }, [])

  const handleLogin = async () => {
    setLoggingIn(true)
    setLoginError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password || ADMIN_PASSWORD_DEFAULT }),
      })
      const data = await res.json()
      if (data.ok) {
        if (soundOn) playSound('unlock')
        setToken(data.token)
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('nusa-admin-token', data.token)
        }
      } else {
        setLoginError(data.message || 'Login gagal')
      }
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : 'Gagal login')
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = () => {
    setToken(null)
    if (typeof window !== 'undefined') window.sessionStorage.removeItem('nusa-admin-token')
  }

  if (!token) {
    return (
      <div className="flex min-h-[80dvh] items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <GlassCard strong className="p-6 text-center">
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <NovaMascot expression="thinking" size={90} />
            </motion.div>
            <h1 className="mt-3 text-2xl font-black text-gradient-cyan sm:text-3xl">Admin NUSA LEARN</h1>
            <p className="mt-1 text-sm text-slate-600">Masukkan password untuk mengelola soal & monitor</p>

            <div className="mt-5 text-left">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Password Admin</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleLogin() }}
                placeholder="••••••••••••"
                className="w-full rounded-2xl border-2 border-cyan-200 bg-white/80 px-4 py-3 text-slate-800 focus:border-cyan-400 focus:outline-none"
                aria-label="Password admin"
                autoComplete="off"
              />
              {loginError && (
                <p className="mt-2 text-sm font-medium text-rose-600">⚠️ {loginError}</p>
              )}
              <p className="mt-2 text-[11px] text-slate-500">
                🔒 Hubungi pengembang/admin untuk mendapatkan password admin. Password disimpan aman via environment variable.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <GlowButton variant="soft" size="md" onClick={() => { if (soundOn) playSound('click'); setView('home') }}>
                <ArrowLeft className="h-4 w-4" /> Beranda
              </GlowButton>
              <GlowButton glow="cyan" size="md" className="flex-1" onClick={handleLogin} disabled={loggingIn}>
                {loggingIn ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</> : <><Lock className="h-4 w-4" /> Masuk</>}
              </GlowButton>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    )
  }

  return <AdminDashboard token={token} onLogout={handleLogout} />
}

// ============ Admin Dashboard ============
function AdminDashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const soundOn = useGameStore((s) => s.settings.sound)
  const setView = useGameStore((s) => s.setView)
  const [tab, setTab] = useState<Tab>('dashboard')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Gagal memuat stats')
      const data = await res.json()
      setStats(data.stats)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingStats(false)
    }
  }, [token])

  useEffect(() => {
    if (tab === 'dashboard' && !stats) fetchStats()
  }, [tab, stats, fetchStats])

  return (
    <div className="space-y-4 pb-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-gradient-cyan sm:text-3xl 2xl:text-4xl">Admin Dashboard 🛠️</h1>
          <p className="text-xs sm:text-sm text-slate-600">Kelola soal & monitor perkembangan siswa</p>
        </div>
        <div className="flex gap-2">
          <GlowButton variant="soft" size="sm" onClick={() => { if (soundOn) playSound('click'); setView('home') }}>
            <ArrowLeft className="h-4 w-4" /> Beranda
          </GlowButton>
          <GlowButton variant="soft" size="sm" className="text-rose-600" onClick={onLogout}>
            Keluar
          </GlowButton>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 2xl:gap-4">
        <TabButton active={tab === 'dashboard'} onClick={() => setTab('dashboard')} icon={<BarChart3 className="h-4 w-4" />} label="Dashboard" />
        <TabButton active={tab === 'questions'} onClick={() => setTab('questions')} icon={<BookOpen className="h-4 w-4" />} label="Soal" />
        <TabButton active={tab === 'sessions'} onClick={() => setTab('sessions')} icon={<Activity className="h-4 w-4" />} label="Sesi" />
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'dashboard' && (
            <DashboardTab stats={stats} loading={loadingStats} onRefresh={fetchStats} token={token} />
          )}
          {tab === 'questions' && <QuestionsTab token={token} />}
          {tab === 'sessions' && <SessionsTab token={token} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-2xl border-2 p-2.5 text-sm font-bold transition-all sm:p-3 2xl:text-base ${
        active
          ? 'border-cyan-400 bg-cyan-50 text-cyan-700 shadow-sm'
          : 'border-slate-200 bg-white/70 text-slate-600 hover:border-cyan-300'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

// ============ Dashboard Tab ============
function DashboardTab({ stats, loading, onRefresh, token }: { stats: Stats | null; loading: boolean; onRefresh: () => void; token: string }) {
  if (loading && !stats) {
    return (
      <GlassCard className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </GlassCard>
    )
  }
  if (!stats) {
    return (
      <GlassCard className="p-6 text-center">
        <p className="text-sm text-slate-500">Gagal memuat stats. Coba refresh.</p>
        <GlowButton variant="soft" size="sm" className="mt-3" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </GlowButton>
      </GlassCard>
    )
  }

  const accuracy = stats.sessionAgg.sumCorrect + stats.sessionAgg.sumWrong > 0
    ? Math.round((stats.sessionAgg.sumCorrect / (stats.sessionAgg.sumCorrect + stats.sessionAgg.sumWrong)) * 100)
    : 0

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <GlowButton variant="soft" size="sm" onClick={onRefresh}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </GlowButton>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={<BookOpen className="h-5 w-5" />} label="Total Soal" value={stats.totals.questions} grad="from-sky-400 to-cyan-500" />
        <StatCard icon={<Users className="h-5 w-5" />} label="Pemain" value={stats.totals.players} grad="from-purple-500 to-fuchsia-500" />
        <StatCard icon={<Activity className="h-5 w-5" />} label="Sesi" value={stats.totals.sessions} grad="from-emerald-400 to-teal-500" />
        <StatCard icon={<BarChart3 className="h-5 w-5" />} label="Akurasi" value={`${accuracy}%`} grad="from-amber-400 to-orange-500" />
        <StatCard icon={<span className="text-lg">🔢</span>} label="Numerik" value={stats.totals.numerik} grad="from-sky-400 to-blue-500" />
        <StatCard icon={<span className="text-lg">📖</span>} label="Literasi" value={stats.totals.literasi} grad="from-purple-400 to-pink-500" />
      </div>

      {/* By grade & difficulty */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <GlassCard className="p-4">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Soal per Kelas</h3>
          <div className="space-y-2">
            {stats.byGrade.map((g) => {
              const max = Math.max(...stats.byGrade.map((x) => x.count))
              const pct = max > 0 ? (g.count / max) * 100 : 0
              return (
                <div key={g.grade} className="flex items-center gap-2">
                  <div className="w-16 text-xs font-bold text-slate-600">Kelas {g.grade}</div>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-8 text-right text-xs font-bold text-slate-700">{g.count}</div>
                </div>
              )
            })}
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Soal per Tingkat</h3>
          <div className="space-y-2">
            {stats.byDifficulty.map((d) => {
              const max = Math.max(...stats.byDifficulty.map((x) => x.count))
              const pct = max > 0 ? (d.count / max) * 100 : 0
              const color = d.difficulty === 'easy' ? 'from-emerald-400 to-teal-500' : d.difficulty === 'medium' ? 'from-amber-400 to-orange-500' : 'from-rose-400 to-pink-500'
              const label = d.difficulty === 'easy' ? 'Mudah' : d.difficulty === 'medium' ? 'Sedang' : 'Sulit'
              return (
                <div key={d.difficulty} className="flex items-center gap-2">
                  <div className="w-16 text-xs font-bold text-slate-600">{label}</div>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-8 text-right text-xs font-bold text-slate-700">{d.count}</div>
                </div>
              )
            })}
          </div>
        </GlassCard>
      </div>

      {/* By subcategory */}
      <GlassCard className="p-4">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Top Subkategori</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {stats.bySubcategory.map((s) => {
            const max = Math.max(...stats.bySubcategory.map((x) => x.count))
            const pct = max > 0 ? (s.count / max) * 100 : 0
            return (
              <div key={s.subcategory} className="flex items-center gap-2">
                <div className="w-24 truncate text-xs font-bold text-slate-600">{s.subcategory}</div>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-gradient-to-r from-purple-400 to-fuchsia-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="w-8 text-right text-xs font-bold text-slate-700">{s.count}</div>
              </div>
            )
          })}
        </div>
      </GlassCard>

      {/* Session aggregate */}
      <GlassCard className="p-4">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Statistik Sesi</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label="Total Benar" value={stats.sessionAgg.sumCorrect} color="text-emerald-600" />
          <MiniStat label="Total Salah" value={stats.sessionAgg.sumWrong} color="text-rose-600" />
          <MiniStat label="Total XP" value={stats.sessionAgg.sumXp} color="text-cyan-600" />
          <MiniStat label="Total Bintang" value={stats.sessionAgg.sumStars} color="text-amber-600" />
        </div>
      </GlassCard>

      {/* Recent players */}
      <GlassCard className="p-4">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Pemain Terbaru</h3>
        {stats.recentPlayers.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada pemain terdaftar.</p>
        ) : (
          <div className="space-y-2">
            {stats.recentPlayers.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl bg-white/70 p-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-500 text-xs font-bold text-white">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-700">{p.name}</div>
                    <div className="text-[10px] text-slate-500">Kelas {p.grade} · {new Date(p.updatedAt).toLocaleDateString('id-ID')}</div>
                  </div>
                </div>
                <div className="flex gap-2 text-[11px] font-bold">
                  <span className="text-cyan-600">✨ {p.xp}</span>
                  <span className="text-amber-500">⭐ {p.stars}</span>
                  <span className="text-amber-600">🪙 {p.coins}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}

function StatCard({ icon, label, value, grad }: { icon: React.ReactNode; label: string; value: number | string; grad: string }) {
  return (
    <GlassCard className="p-3 text-center sm:p-4">
      <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} text-white shadow sm:h-12 sm:w-12`}>
        {icon}
      </div>
      <div className="text-lg font-black text-slate-800 sm:text-xl 2xl:text-2xl">{typeof value === 'number' ? value.toLocaleString('id-ID') : value}</div>
      <div className="text-[10px] text-slate-500 sm:text-xs">{label}</div>
    </GlassCard>
  )
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl bg-white/70 p-3 text-center">
      <div className={`text-xl font-black ${color} sm:text-2xl 2xl:text-3xl`}>{value.toLocaleString('id-ID')}</div>
      <div className="text-[10px] text-slate-500 sm:text-xs">{label}</div>
    </div>
  )
}

// ============ Questions Tab ============
function QuestionsTab({ token }: { token: string }) {
  const soundOn = useGameStore((s) => s.settings.sound)
  const [items, setItems] = useState<QuestionItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    grade: '',
    category: '',
    subcategory: '',
    difficulty: '',
    q: '',
  })
  const [editing, setEditing] = useState<QuestionItem | null>(null)
  const [creating, setCreating] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.grade) params.set('grade', filters.grade)
      if (filters.category) params.set('category', filters.category)
      if (filters.subcategory) params.set('subcategory', filters.subcategory)
      if (filters.difficulty) params.set('difficulty', filters.difficulty)
      if (filters.q) params.set('q', filters.q)
      params.set('limit', '200')
      const res = await fetch(`/api/admin/questions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Gagal memuat soal')
      const data = await res.json()
      setItems(data.items || [])
      setTotal(data.total || 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [token, filters])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleDelete = async (id: string) => {
    if (!confirm(`Yakin hapus soal ${id}? Tindakan ini tidak bisa dibatalkan.`)) return
    try {
      const res = await fetch(`/api/admin/questions?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.ok) {
        if (soundOn) playSound('click')
        fetchItems()
      } else {
        alert(data.message || 'Gagal hapus')
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Gagal hapus')
    }
  }

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <GlassCard className="p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <FilterInput label="Cari" value={filters.q} onChange={(v) => setFilters({ ...filters, q: v })} placeholder="Kata kunci..." />
          <FilterSelect label="Kelas" value={filters.grade} onChange={(v) => setFilters({ ...filters, grade: v })} options={[{ value: '', label: 'Semua' }, ...[1, 2, 3, 4, 5, 6].map((g) => ({ value: String(g), label: `Kelas ${g}` }))]} />
          <FilterSelect label="Kategori" value={filters.category} onChange={(v) => setFilters({ ...filters, category: v })} options={[{ value: '', label: 'Semua' }, { value: 'numerik', label: 'Numerik' }, { value: 'literasi', label: 'Literasi' }]} />
          <FilterSelect label="Tingkat" value={filters.difficulty} onChange={(v) => setFilters({ ...filters, difficulty: v })} options={[{ value: '', label: 'Semua' }, { value: 'easy', label: 'Mudah' }, { value: 'medium', label: 'Sedang' }, { value: 'hard', label: 'Sulit' }]} />
          <FilterInput label="Subkategori" value={filters.subcategory} onChange={(v) => setFilters({ ...filters, subcategory: v })} placeholder="mis. penjumlahan" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <GlowButton glow="cyan" size="sm" onClick={() => { if (soundOn) playSound('click'); setCreating(true) }}>
            <Plus className="h-4 w-4" /> Tambah Soal
          </GlowButton>
          <GlowButton variant="soft" size="sm" onClick={fetchItems}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </GlowButton>
          <span className="self-center text-xs text-slate-500">{total} soal total</span>
        </div>
      </GlassCard>

      {/* Question list */}
      {loading ? (
        <GlassCard className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        </GlassCard>
      ) : items.length === 0 ? (
        <GlassCard className="p-6 text-center text-sm text-slate-500">Tidak ada soal yang cocok dengan filter.</GlassCard>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <QuestionRow
              key={item.id}
              item={item}
              onEdit={() => { if (soundOn) playSound('click'); setEditing(item) }}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}

      {/* Edit/Create modal */}
      <AnimatePresence>
        {(editing || creating) && (
          <QuestionEditor
            item={editing}
            token={token}
            onClose={() => { setEditing(null); setCreating(false) }}
            onSaved={() => { setEditing(null); setCreating(false); fetchItems() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function FilterInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
      />
    </div>
  )
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

function QuestionRow({ item, onEdit, onDelete }: { item: QuestionItem; onEdit: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const options = JSON.parse(item.options)
  const hints = JSON.parse(item.hints)

  const diffBadge = item.difficulty === 'easy'
    ? 'bg-emerald-100 text-emerald-700'
    : item.difficulty === 'medium'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-rose-100 text-rose-700'
  const diffLabel = item.difficulty === 'easy' ? 'Mudah' : item.difficulty === 'medium' ? 'Sedang' : 'Sulit'
  const catBadge = item.category === 'numerik' ? 'bg-cyan-100 text-cyan-700' : 'bg-purple-100 text-purple-700'

  return (
    <GlassCard className="overflow-visible">
      <div className="flex items-start gap-2 p-3 sm:p-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs">
            <span className={`rounded-full px-2 py-0.5 font-bold ${catBadge}`}>{item.category}</span>
            <span className={`rounded-full px-2 py-0.5 font-bold ${diffBadge}`}>{diffLabel}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-600">Kelas {item.grade}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-600">{item.subcategory}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-600">{item.gameType}</span>
            <span className="text-slate-400">·</span>
            <code className="font-mono text-[10px] text-slate-500">{item.id}</code>
          </div>
          <p className="mt-1.5 text-sm font-bold text-slate-800 sm:text-base">{item.question}</p>
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 space-y-1.5 text-xs sm:text-sm">
              {item.story && <p className="rounded-lg bg-purple-50 p-2 text-slate-700">📖 {item.story}</p>}
              <div>
                <span className="font-bold text-slate-600">Opsi:</span>
                <ul className="ml-3 list-disc text-slate-700">
                  {options.map((o: string, i: number) => (
                    <li key={i} className={o === item.answer ? 'font-bold text-emerald-600' : ''}>
                      {o} {o === item.answer && '✓'}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-bold text-slate-600">Penjelasan:</span>
                <p className="text-slate-700">{item.explanation}</p>
              </div>
              <div>
                <span className="font-bold text-slate-600">Petunjuk ({hints.length}):</span>
                <ol className="ml-3 list-decimal text-slate-700">
                  {hints.map((h: string, i: number) => (
                    <li key={i}>{h}</li>
                  ))}
                </ol>
              </div>
              <div className="text-[11px] text-slate-500">XP Reward: {item.xpReward}</div>
            </motion.div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-200"
            aria-label={expanded ? 'Tutup detail' : 'Lihat detail'}
          >
            {expanded ? 'Tutup' : 'Detail'}
          </button>
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-1 rounded-lg bg-cyan-100 px-2 py-1 text-[11px] font-bold text-cyan-700 hover:bg-cyan-200"
            aria-label="Edit soal"
          >
            <Edit className="h-3 w-3" /> Edit
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-1 rounded-lg bg-rose-100 px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-200"
            aria-label="Hapus soal"
          >
            <Trash2 className="h-3 w-3" /> Hapus
          </button>
        </div>
      </div>
    </GlassCard>
  )
}

// ============ Question Editor Modal ============
function QuestionEditor({ item, token, onClose, onSaved }: { item: QuestionItem | null; token: string; onClose: () => void; onSaved: () => void }) {
  const soundOn = useGameStore((s) => s.settings.sound)
  const [form, setForm] = useState({
    id: item?.id || '',
    grade: item?.grade || 1,
    category: item?.category || 'numerik',
    subcategory: item?.subcategory || 'penjumlahan',
    difficulty: item?.difficulty || 'easy',
    gameType: item?.gameType || 'choice',
    question: item?.question || '',
    story: item?.story || '',
    highlight: item?.highlight ? JSON.parse(item.highlight).join(', ') : '',
    options: item ? JSON.parse(item.options).join('\n') : '',
    answer: item?.answer || '',
    explanation: item?.explanation || '',
    hints: item ? JSON.parse(item.hints).join('\n') : '',
    xpReward: item?.xpReward || 20,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isNew = !item

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...form,
        grade: Number(form.grade),
        xpReward: Number(form.xpReward),
        options: form.options.split('\n').map((s) => s.trim()).filter(Boolean),
        hints: form.hints.split('\n').map((s) => s.trim()).filter(Boolean),
        highlight: form.highlight.split(',').map((s) => s.trim()).filter(Boolean),
      }

      if (payload.options.length < 2) {
        setError('Minimal 2 opsi jawaban')
        setSaving(false)
        return
      }
      if (!payload.options.includes(payload.answer)) {
        setError('Jawaban harus salah satu dari opsi')
        setSaving(false)
        return
      }
      if (payload.hints.length < 1) {
        setError('Minimal 1 petunjuk')
        setSaving(false)
        return
      }

      const method = isNew ? 'POST' : 'PUT'
      const res = await fetch('/api/admin/questions', {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.ok) {
        if (soundOn) playSound('levelup')
        onSaved()
      } else {
        setError(data.message || 'Gagal menyimpan')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-3 backdrop-blur-sm sm:p-5"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl"
      >
        <GlassCard strong className="my-5 max-h-[85dvh] overflow-y-auto scroll-game p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 sm:text-xl">
              {isNew ? '➕ Tambah Soal Baru' : '✏️ Edit Soal'}
            </h2>
            <button onClick={onClose} aria-label="Tutup" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            {/* ID */}
            <Field label="ID Soal (unik, mis. NUM-G3-001)">
              <input
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                disabled={!isNew}
                placeholder="NUM-G3-099"
                className="w-full rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
              />
            </Field>

            {/* Grade, Category, Difficulty, GameType in grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field label="Kelas">
                <select value={form.grade} onChange={(e) => setForm({ ...form, grade: Number(e.target.value) })} className="w-full rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none">
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <option key={g} value={g}>Kelas {g}</option>
                  ))}
                </select>
              </Field>
              <Field label="Kategori">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none">
                  <option value="numerik">Numerik</option>
                  <option value="literasi">Literasi</option>
                </select>
              </Field>
              <Field label="Tingkat">
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="w-full rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none">
                  <option value="easy">Mudah</option>
                  <option value="medium">Sedang</option>
                  <option value="hard">Sulit</option>
                </select>
              </Field>
              <Field label="Game Type">
                <select value={form.gameType} onChange={(e) => setForm({ ...form, gameType: e.target.value })} className="w-full rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none">
                  <option value="choice">Pilihan Ganda</option>
                  <option value="story">Cerita</option>
                  <option value="pattern">Pola</option>
                  <option value="build">Susun Kalimat</option>
                  <option value="catch">Number Catch</option>
                  <option value="shop">Belanja</option>
                  <option value="path">Jalur</option>
                  <option value="battle">Pertarungan</option>
                  <option value="team_battle">Pertarungan Kelompok</option>
                </select>
              </Field>
            </div>

            <Field label="Subkategori (mis. penjumlahan, ide_pokok)">
              <input
                value={form.subcategory}
                onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                placeholder="penjumlahan"
                className="w-full rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
              />
            </Field>

            <Field label="Pertanyaan">
              <textarea
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="Berapa hasil dari 4 + 9?"
                rows={2}
                className="w-full rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
              />
            </Field>

            <Field label="Cerita/Teks (opsional, untuk soal literasi)">
              <textarea
                value={form.story}
                onChange={(e) => setForm({ ...form, story: e.target.value })}
                placeholder="Raka pergi ke perpustakaan..."
                rows={3}
                className="w-full rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
              />
            </Field>

            <Field label="Highlight kata kunci (pisah dengan koma, opsional)">
              <input
                value={form.highlight}
                onChange={(e) => setForm({ ...form, highlight: e.target.value })}
                placeholder="perpustakaan, buku, tata surya"
                className="w-full rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
              />
            </Field>

            <Field label="Opsi jawaban (satu per baris, salah satu harus sama dengan jawaban)">
              <textarea
                value={form.options}
                onChange={(e) => setForm({ ...form, options: e.target.value })}
                placeholder={'11\n16\n14\n13'}
                rows={4}
                className="w-full rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2 text-sm font-mono focus:border-cyan-400 focus:outline-none"
              />
            </Field>

            <Field label="Jawaban benar (harus sama persis dengan salah satu opsi)">
              <input
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                placeholder="13"
                className="w-full rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2 text-sm font-bold focus:border-emerald-400 focus:outline-none"
              />
            </Field>

            <Field label="Penjelasan (mengapa jawaban benar)">
              <textarea
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                placeholder="4 + 9 = 13. Hitung dengan jari..."
                rows={2}
                className="w-full rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
              />
            </Field>

            <Field label="Petunjuk (satu per baris, dari umum ke spesifik, JANGAN ungkap jawaban)">
              <textarea
                value={form.hints}
                onChange={(e) => setForm({ ...form, hints: e.target.value })}
                placeholder={'Lihat angka pertama...\nCoba pecah 9 jadi 6 dan 3...\nHitung: 4 + 6 = 10, lalu + 3 = ?'}
                rows={3}
                className="w-full rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field label="XP Reward">
                <input
                  type="number"
                  value={form.xpReward}
                  onChange={(e) => setForm({ ...form, xpReward: Number(e.target.value) })}
                  min={5}
                  max={100}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
                />
              </Field>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">
                ⚠️ {error}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <GlowButton variant="soft" size="md" onClick={onClose}>
                Batal
              </GlowButton>
              <GlowButton glow="emerald" size="md" className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</> : <><Save className="h-4 w-4" /> Simpan Soal</>}
              </GlowButton>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</div>
      {children}
    </div>
  )
}

// ============ Sessions Tab ============
function SessionsTab({ token }: { token: string }) {
  const [sessions, setSessions] = useState<Stats['recentSessions']>([])
  const [loading, setLoading] = useState(false)

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/sessions?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Gagal memuat sesi')
      const data = await res.json()
      setSessions(data.sessions || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return (
    <div className="space-y-3">
      <GlassCard className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Riwayat Sesi Belajar ({sessions.length})</h3>
          <GlowButton variant="soft" size="sm" onClick={fetchSessions}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </GlowButton>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          💡 Data sesi dicatat saat pemain selesai bermain. Untuk demo: hanya pemain yang mendaftar via DB yang akan muncul.
        </p>
      </GlassCard>

      {loading ? (
        <GlassCard className="flex h-32 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        </GlassCard>
      ) : sessions.length === 0 ? (
        <GlassCard className="p-6 text-center text-sm text-slate-500">
          Belum ada sesi tercatat. Mainkan game untuk mengisi log ini!
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => {
            const total = s.correct + s.wrong
            const accuracy = total > 0 ? Math.round((s.correct / total) * 100) : 0
            return (
              <GlassCard key={s.id} className="p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs">
                      <span className="rounded-full bg-cyan-100 px-2 py-0.5 font-bold text-cyan-700">{s.category}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-600">{s.area}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-600">{s.level}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-600">Kelas {s.grade}</span>
                    </div>
                    <div className="mt-1 font-bold text-slate-800 sm:text-base">{s.playerName}</div>
                    <div className="text-[10px] text-slate-500">{new Date(s.createdAt).toLocaleString('id-ID')}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                    <span className="text-emerald-600">✓ {s.correct}</span>
                    <span className="text-rose-600">✗ {s.wrong}</span>
                    <span className="text-amber-600">{accuracy}%</span>
                    <span className="text-cyan-600">✨ {s.xpGained}</span>
                    <span className="text-amber-500">⭐ {s.starsGained}</span>
                    <span className="text-slate-500">⏱ {s.duration}s</span>
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
