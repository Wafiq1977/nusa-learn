'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import type { Character } from '@/store/gameStore'
import { GlassCard } from '@/components/nusa/GlassCard'
import { GlowButton } from '@/components/nusa/GlowButton'
import { NovaMascot } from '@/components/nusa/NovaMascot'
import { CharacterAvatar } from './OnboardingScreen'
import { playSound } from '@/lib/nusa/sound'
import { getRankFromXp } from '@/store/gameStore'

const HAIR_STYLES: { value: Character['hair']; label: string }[] = [
  { value: 'short', label: 'Pendek' },
  { value: 'long', label: 'Panjang' },
  { value: 'curly', label: 'Keriting' },
  { value: 'bun', label: 'Cepol' },
  { value: 'cap', label: 'Topi' },
]
const HAIR_COLORS: { value: Character['hairColor']; color: string; label: string }[] = [
  { value: 'black', color: '#1F2937', label: 'Hitam' },
  { value: 'brown', color: '#92400E', label: 'Cokelat' },
  { value: 'blonde', color: '#FBBF24', label: 'Pirang' },
  { value: 'blue', color: '#0EA5E9', label: 'Biru' },
  { value: 'purple', color: '#A855F7', label: 'Ungu' },
]
const OUTFITS: { value: Character['outfit']; label: string; emoji: string }[] = [
  { value: 'explorer', label: 'Penjelajah', emoji: '🧭' },
  { value: 'scientist', label: 'Ilmuwan', emoji: '🔬' },
  { value: 'astronaut', label: 'Antariksawan', emoji: '👨‍🚀' },
  { value: 'casual', label: 'Santai', emoji: '👕' },
]
const OUTFIT_COLORS: { value: Character['outfitColor']; color: string; label: string }[] = [
  { value: 'cyan', color: '#0EA5E9', label: 'Cyan' },
  { value: 'purple', color: '#A855F7', label: 'Ungu' },
  { value: 'emerald', color: '#10B981', label: 'Hijau' },
  { value: 'orange', color: '#F97316', label: 'Oranye' },
  { value: 'pink', color: '#EC4899', label: 'Pink' },
]
const ACCESSORIES: { value: Character['accessory']; label: string; emoji: string }[] = [
  { value: 'none', label: 'Tidak ada', emoji: '🚫' },
  { value: 'glasses', label: 'Kacamata', emoji: '👓' },
  { value: 'headphones', label: 'Headset', emoji: '🎧' },
  { value: 'scarf', label: 'Syal', emoji: '🧣' },
]
const BACKPACKS: { value: Character['backpack']; label: string; emoji: string }[] = [
  { value: 'none', label: 'Tidak ada', emoji: '🚫' },
  { value: 'rocket', label: 'Roket', emoji: '🚀' },
  { value: 'star', label: 'Bintang', emoji: '⭐' },
  { value: 'cloud', label: 'Awan', emoji: '☁️' },
]
const GRADES = [1, 2, 3, 4, 5, 6]

export function ProfileScreen() {
  const character = useGameStore((s) => s.character)
  const updateCharacter = useGameStore((s) => s.updateCharacter)
  const name = useGameStore((s) => s.name)
  const grade = useGameStore((s) => s.grade)
  const xp = useGameStore((s) => s.xp)
  const createPlayer = useGameStore((s) => s.createPlayer)
  const resetProgress = useGameStore((s) => s.resetProgress)
  const soundOn = useGameStore((s) => s.settings.sound)
  const setView = useGameStore((s) => s.setView)

  const [newName, setNewName] = useState(name)
  const rank = getRankFromXp(xp)

  const handleSaveName = () => {
    if (newName.trim().length >= 2 && newName !== name) {
      if (soundOn) playSound('levelup')
      createPlayer(newName.trim(), grade, character)
    }
  }

  return (
    <div className="space-y-5 pb-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl font-black text-gradient-pink sm:text-4xl">Profil Saya 👤</h1>
      </motion.div>

      {/* Character preview card */}
      <GlassCard glow="purple" className="flex flex-col items-center gap-4 p-5 sm:flex-row sm:items-center">
        <div className="rounded-3xl bg-gradient-to-br from-sky-100 to-purple-100 p-3 shadow-inner">
          <CharacterAvatar char={character} size={140} />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value.slice(0, 16))}
            className="w-full rounded-2xl border-2 border-pink-200 bg-white/80 px-4 py-2 text-center text-xl font-bold text-slate-800 focus:border-pink-400 focus:outline-none sm:text-left"
            aria-label="Nama"
            maxLength={16}
          />
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm sm:justify-start">
            <span className="rounded-full bg-purple-100 px-3 py-1 font-bold text-purple-700">{rank.emoji} {rank.name}</span>
            <span className="rounded-full bg-cyan-100 px-3 py-1 font-bold text-cyan-700">Kelas {grade}</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-bold text-emerald-700">✨ {xp} XP</span>
          </div>
          <div className="mt-3">
            <GlowButton glow="purple" size="sm" onClick={handleSaveName} disabled={newName.trim().length < 2 || newName === name}>
              Simpan Nama
            </GlowButton>
          </div>
        </div>
      </GlassCard>

      {/* Class selection */}
      <GlassCard className="p-5">
        <div className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-700">Kelas SD</div>
        <p className="mb-3 text-xs text-slate-500">Materi akan menyesuaikan kelas yang kamu pilih.</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {GRADES.map((g) => (
            <button
              key={g}
              onClick={() => {
                if (soundOn) playSound('click')
                createPlayer(name, g, character)
              }}
              className={`rounded-2xl border-2 p-2.5 text-center text-sm font-bold transition-all ${
                grade === g
                  ? 'border-cyan-400 bg-cyan-50 text-cyan-700 shadow'
                  : 'border-slate-200 bg-white/70 text-slate-600 hover:border-cyan-300'
              }`}
            >
              Kelas {g}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Customization */}
      <GlassCard className="p-5">
        <div className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Kustomisasi Karakter</div>

        <Row label="Rambut">
          {HAIR_STYLES.map((h) => (
            <Chip key={h.value} active={character.hair === h.value} onClick={() => { if (soundOn) playSound('click'); updateCharacter({ hair: h.value }) }}>
              {h.label}
            </Chip>
          ))}
        </Row>
        <Row label="Warna Rambut">
          {HAIR_COLORS.map((c) => (
            <ColorDot key={c.value} color={c.color} label={c.label} active={character.hairColor === c.value} onClick={() => { if (soundOn) playSound('click'); updateCharacter({ hairColor: c.value }) }} />
          ))}
        </Row>
        <Row label="Pakaian">
          {OUTFITS.map((o) => (
            <Chip key={o.value} active={character.outfit === o.value} onClick={() => { if (soundOn) playSound('click'); updateCharacter({ outfit: o.value }) }}>
              {o.emoji} {o.label}
            </Chip>
          ))}
        </Row>
        <Row label="Warna Pakaian">
          {OUTFIT_COLORS.map((c) => (
            <ColorDot key={c.value} color={c.color} label={c.label} active={character.outfitColor === c.value} onClick={() => { if (soundOn) playSound('click'); updateCharacter({ outfitColor: c.value }) }} />
          ))}
        </Row>
        <Row label="Aksesori">
          {ACCESSORIES.map((a) => (
            <Chip key={a.value} active={character.accessory === a.value} onClick={() => { if (soundOn) playSound('click'); updateCharacter({ accessory: a.value }) }}>
              {a.emoji} {a.label}
            </Chip>
          ))}
        </Row>
        <Row label="Tas">
          {BACKPACKS.map((b) => (
            <Chip key={b.value} active={character.backpack === b.value} onClick={() => { if (soundOn) playSound('click'); updateCharacter({ backpack: b.value }) }}>
              {b.emoji} {b.label}
            </Chip>
          ))}
        </Row>
      </GlassCard>

      <GlassCard className="flex items-center gap-3 p-4">
        <NovaMascot expression="happy" size={44} />
        <p className="text-sm text-slate-600">
          <b className="text-slate-800">NOVA:</b> Karaktermu bisa diubah kapan saja. Jangan lupa berlatih biar makin pinter! 🌟
        </p>
      </GlassCard>

      <div className="flex flex-wrap gap-2">
        <GlowButton variant="soft" size="sm" onClick={() => { if (soundOn) playSound('click'); setView('settings') }}>
          ⚙️ Pengaturan
        </GlowButton>
        <GlowButton
          variant="soft"
          size="sm"
          className="text-rose-600"
          onClick={() => {
            if (confirm('Yakin ingin reset semua progres? Tindakan ini tidak bisa dibatalkan.')) {
              resetProgress()
            }
          }}
        >
          🗑️ Reset Progres
        </GlowButton>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-all ${
        active ? 'border-cyan-400 bg-cyan-50 text-cyan-700 shadow-sm' : 'border-slate-200 bg-white/70 text-slate-600 hover:border-cyan-300'
      }`}
    >
      {children}
    </button>
  )
}
function ColorDot({ color, label, active, onClick }: { color: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`h-8 w-8 rounded-full border-2 transition-all ${
        active ? 'scale-110 border-slate-700 ring-2 ring-cyan-300' : 'border-white shadow hover:scale-105'
      }`}
      style={{ background: color }}
    />
  )
}
