'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import type { Character } from '@/store/gameStore'
import { ParticleBackground } from '@/components/nusa/ParticleBackground'
import { NovaMascot } from '@/components/nusa/NovaMascot'
import { GlowButton } from '@/components/nusa/GlowButton'
import { GlassCard } from '@/components/nusa/GlassCard'
import { playSound } from '@/lib/nusa/sound'

const GRADES = [
  { value: 1, label: 'Kelas 1', emoji: '🐣' },
  { value: 2, label: 'Kelas 2', emoji: '🌱' },
  { value: 3, label: 'Kelas 3', emoji: '⭐' },
  { value: 4, label: 'Kelas 4', emoji: '🚀' },
  { value: 5, label: 'Kelas 5', emoji: '🛸' },
  { value: 6, label: 'Kelas 6', emoji: '👑' },
]

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

export function OnboardingScreen() {
  const createPlayer = useGameStore((s) => s.createPlayer)
  const soundOn = useGameStore((s) => s.settings.sound)

  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [name, setName] = useState('')
  const [grade, setGrade] = useState(3)
  const [char, setChar] = useState<Character>({
    skinTone: 'tan',
    hair: 'short',
    hairColor: 'brown',
    outfit: 'explorer',
    outfitColor: 'cyan',
    accessory: 'none',
    backpack: 'rocket',
  })

  const handleStart = () => {
    if (soundOn) playSound('levelup')
    const finalName = name.trim() || 'Petualang'
    createPlayer(finalName, grade, char)
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-nusa-deep px-4 py-10 text-white">
      <ParticleBackground variant="splash" />

      <div className="relative z-10 w-full max-w-xl">
        <GlassCard strong className="p-5 sm:p-7 text-slate-800">
          {/* Stepper */}
          <div className="mb-5 flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === step ? 'w-10 bg-gradient-to-r from-sky-400 to-cyan-400' : i < step ? 'w-6 bg-cyan-200' : 'w-6 bg-slate-200'
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="s0"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                  <NovaMascot expression="happy" size={100} />
                </motion.div>
                <h2 className="mt-4 text-2xl font-extrabold text-gradient-cyan">Hai! Aku NOVA 🤖</h2>
                <p className="mt-2 text-slate-600">
                  Aku akan menemanimu menjelajah dunia <b>NUSA</b> — tempat seru penuh angka, cerita, dan tantangan. Tapi dulu, siapa namamu?
                </p>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 16))}
                  placeholder="Tulis namamu di sini..."
                  className="mt-5 w-full max-w-xs rounded-2xl border-2 border-cyan-200 bg-white/80 px-4 py-3 text-center text-lg font-semibold text-slate-800 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
                  aria-label="Nama pemain"
                  maxLength={16}
                />
                <div className="mt-6">
                  <GlowButton glow="cyan" size="lg" onClick={() => setStep(1)} disabled={name.trim().length < 2}>
                    Lanjut →
                  </GlowButton>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                className="flex flex-col items-center text-center"
              >
                <h2 className="text-xl font-extrabold text-gradient-cyan sm:text-2xl">Kamu kelas berapa? 🎒</h2>
                <p className="mt-2 text-xs text-slate-600 sm:text-sm">Pilih kelasmu — materi akan menyesuaikan tingkatmu.</p>
                <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-2.5">
                  {GRADES.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => {
                        if (soundOn) playSound('click')
                        setGrade(g.value)
                      }}
                      className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 transition-all ${
                        grade === g.value
                          ? 'border-cyan-400 bg-cyan-50 shadow-[0_4px_18px_-6px_rgba(14,165,233,0.5)]'
                          : 'border-slate-200 bg-white/70 hover:border-cyan-300'
                      }`}
                      aria-pressed={grade === g.value}
                    >
                      <span className="text-3xl">{g.emoji}</span>
                      <span className="text-sm font-bold text-slate-700">{g.label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex gap-2">
                  <GlowButton variant="soft" size="md" onClick={() => setStep(0)}>
                    ← Kembali
                  </GlowButton>
                  <GlowButton glow="cyan" size="md" onClick={() => setStep(2)}>
                    Lanjut →
                  </GlowButton>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                className="flex flex-col"
              >
                <h2 className="text-center text-2xl font-extrabold text-gradient-cyan">Wujudkan karaktermu! ✨</h2>
                <p className="mt-1 text-center text-sm text-slate-600">Pilih gaya rambut, pakaian, dan aksesori.</p>

                <div className="mt-4 grid gap-4 sm:grid-cols-[180px_1fr]">
                  {/* Character preview */}
                  <div className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-b from-sky-50 to-purple-50 p-4">
                    <CharacterAvatar char={char} size={140} />
                    <div className="text-center text-xs text-slate-500">
                      {name.trim() || 'Petualang'} · Kelas {grade}
                    </div>
                  </div>

                  {/* Customization controls */}
                  <div className="space-y-3 text-left">
                    <CustomizeRow label="Rambut">
                      {HAIR_STYLES.map((h) => (
                        <Chip key={h.value} active={char.hair === h.value} onClick={() => setChar({ ...char, hair: h.value })}>
                          {h.label}
                        </Chip>
                      ))}
                    </CustomizeRow>
                    <CustomizeRow label="Warna Rambut">
                      {HAIR_COLORS.map((c) => (
                        <ColorDot
                          key={c.value}
                          color={c.color}
                          label={c.label}
                          active={char.hairColor === c.value}
                          onClick={() => setChar({ ...char, hairColor: c.value })}
                        />
                      ))}
                    </CustomizeRow>
                    <CustomizeRow label="Pakaian">
                      {OUTFITS.map((o) => (
                        <Chip key={o.value} active={char.outfit === o.value} onClick={() => setChar({ ...char, outfit: o.value })}>
                          {o.emoji} {o.label}
                        </Chip>
                      ))}
                    </CustomizeRow>
                    <CustomizeRow label="Warna Pakaian">
                      {OUTFIT_COLORS.map((c) => (
                        <ColorDot
                          key={c.value}
                          color={c.color}
                          label={c.label}
                          active={char.outfitColor === c.value}
                          onClick={() => setChar({ ...char, outfitColor: c.value })}
                        />
                      ))}
                    </CustomizeRow>
                    <CustomizeRow label="Aksesori">
                      {ACCESSORIES.map((a) => (
                        <Chip key={a.value} active={char.accessory === a.value} onClick={() => setChar({ ...char, accessory: a.value })}>
                          {a.emoji} {a.label}
                        </Chip>
                      ))}
                    </CustomizeRow>
                    <CustomizeRow label="Tas">
                      {BACKPACKS.map((b) => (
                        <Chip key={b.value} active={char.backpack === b.value} onClick={() => setChar({ ...char, backpack: b.value })}>
                          {b.emoji} {b.label}
                        </Chip>
                      ))}
                    </CustomizeRow>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-2">
                  <GlowButton variant="soft" size="md" onClick={() => setStep(1)}>
                    ← Kembali
                  </GlowButton>
                  <GlowButton glow="emerald" size="lg" onClick={handleStart}>
                    Mulai Bermain! 🚀
                  </GlowButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  )
}

function CustomizeRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
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

function ColorDot({
  color,
  label,
  active,
  onClick,
}: {
  color: string
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`h-8 w-8 rounded-full border-2 transition-all ${
        active ? 'scale-110 border-slate-700 ring-2 ring-cyan-300' : 'border-white shadow-md hover:scale-105'
      }`}
      style={{ background: color }}
    />
  )
}

// Lightweight character preview (SVG-based, matches CharacterAvatar used elsewhere)
export function CharacterAvatar({ char, size = 120 }: { char: Character; size?: number }) {
  const outfitColor =
    OUTFIT_COLORS.find((o) => o.value === char.outfitColor)?.color || '#0EA5E9'
  const hairColor = HAIR_COLORS.find((h) => h.value === char.hairColor)?.color || '#92400E'
  const skin = char.skinTone === 'light' ? '#FFE0BD' : char.skinTone === 'tan' ? '#F1C27D' : '#C68642'

  return (
    <svg viewBox="0 0 120 140" width={size} height={(size * 140) / 120} aria-hidden="true">
      {/* Backpack (behind body) */}
      {char.backpack !== 'none' && (
        <g transform="translate(60 100)">
          {char.backpack === 'rocket' && (
            <g transform="translate(-12 -22)">
              <rect x="0" y="0" width="24" height="32" rx="6" fill="#A855F7" />
              <circle cx="12" cy="10" r="3" fill="#FBBF24" />
              <path d="M4 32 L8 38 L12 32 L16 38 L20 32 Z" fill="#F97316" />
            </g>
          )}
          {char.backpack === 'star' && (
            <g transform="translate(-12 -22)">
              <rect x="0" y="0" width="24" height="32" rx="6" fill="#F59E0B" />
              <path d="M12 6l2 5 5 0-4 3 1.5 5L12 16l-4.5 3 1.5-5-4-3 5 0z" fill="#FFFFFF" />
            </g>
          )}
          {char.backpack === 'cloud' && (
            <g transform="translate(-14 -22)">
              <rect x="0" y="0" width="28" height="32" rx="10" fill="#BAE6FD" />
              <circle cx="8" cy="10" r="4" fill="#FFFFFF" />
              <circle cx="20" cy="14" r="4" fill="#FFFFFF" />
            </g>
          )}
        </g>
      )}

      {/* Body / outfit */}
      <rect x="38" y="80" width="44" height="44" rx="14" fill={outfitColor} />
      {/* Outfit accent */}
      {char.outfit === 'scientist' && (
        <rect x="40" y="92" width="40" height="3" fill="#FFFFFF" opacity="0.7" />
      )}
      {char.outfit === 'astronaut' && (
        <circle cx="60" cy="92" r="10" fill="#FFFFFF" opacity="0.3" />
      )}
      {char.outfit === 'explorer' && (
        <rect x="38" y="100" width="44" height="3" fill="#FFFFFF" opacity="0.7" />
      )}

      {/* Head */}
      <circle cx="60" cy="48" r="26" fill={skin} />

      {/* Hair */}
      {char.hair === 'short' && <path d="M34 46 Q60 12 86 46 L86 38 Q60 22 34 38 Z" fill={hairColor} />}
      {char.hair === 'long' && <path d="M32 50 Q60 14 88 50 L88 78 L82 78 L82 50 Q60 30 38 50 L38 78 L32 78 Z" fill={hairColor} />}
      {char.hair === 'curly' && (
        <g fill={hairColor}>
          <circle cx="38" cy="32" r="9" />
          <circle cx="50" cy="26" r="9" />
          <circle cx="60" cy="24" r="9" />
          <circle cx="70" cy="26" r="9" />
          <circle cx="82" cy="32" r="9" />
        </g>
      )}
      {char.hair === 'bun' && (
        <>
          <circle cx="60" cy="22" r="10" fill={hairColor} />
          <path d="M36 46 Q60 30 84 46 L84 38 Q60 28 36 38 Z" fill={hairColor} />
        </>
      )}
      {char.hair === 'cap' && (
        <>
          <path d="M32 38 L88 38 L86 30 L34 30 Z" fill="#0EA5E9" />
          <rect x="36" y="38" width="48" height="4" fill="#0284C7" />
        </>
      )}

      {/* Eyes */}
      <circle cx="50" cy="48" r="3.5" fill="#1F2937" />
      <circle cx="70" cy="48" r="3.5" fill="#1F2937" />
      <circle cx="51" cy="46.5" r="1" fill="#FFFFFF" />
      <circle cx="71" cy="46.5" r="1" fill="#FFFFFF" />

      {/* Smile */}
      <path d="M50 60 Q60 68 70 60" stroke="#7C2D12" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Accessories */}
      {char.accessory === 'glasses' && (
        <g stroke="#1F2937" strokeWidth="1.5" fill="none">
          <circle cx="50" cy="48" r="6" />
          <circle cx="70" cy="48" r="6" />
          <line x1="56" y1="48" x2="64" y2="48" />
        </g>
      )}
      {char.accessory === 'headphones' && (
        <g>
          <path d="M32 44 Q60 22 88 44" stroke="#1F2937" strokeWidth="3" fill="none" />
          <rect x="28" y="44" width="8" height="14" rx="3" fill="#1F2937" />
          <rect x="84" y="44" width="8" height="14" rx="3" fill="#1F2937" />
        </g>
      )}
      {char.accessory === 'scarf' && (
        <g>
          <path d="M38 72 Q60 80 82 72 L82 78 Q60 86 38 78 Z" fill="#EF4444" />
          <rect x="76" y="78" width="6" height="20" fill="#EF4444" />
        </g>
      )}
    </svg>
  )
}
