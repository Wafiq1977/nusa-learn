'use client'

import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { GlassCard } from '@/components/nusa/GlassCard'
import { NovaMascot } from '@/components/nusa/NovaMascot'
import { useBadges } from '@/hooks/use-questions'
import { playSound } from '@/lib/nusa/sound'
import { Lock } from 'lucide-react'

export function RewardsScreen() {
  const earnedBadges = useGameStore((s) => s.badges)
  const coins = useGameStore((s) => s.coins)
  const stars = useGameStore((s) => s.stars)
  const xp = useGameStore((s) => s.xp)
  const allBadges = useBadges()
  const soundOn = useGameStore((s) => s.settings.sound)

  // Cosmetics unlockable with coins
  const cosmetics = [
    { id: 'cos-1', name: 'Topi Astronot', icon: '👨‍🚀', cost: 200, desc: 'Pakai topi astronot keren' },
    { id: 'cos-2', name: 'Syal Pelangi', icon: '🌈', cost: 150, desc: 'Syal warna-warni untuk petualangan' },
    { id: 'cos-3', name: 'Tas Roket Pro', icon: '🚀', cost: 300, desc: 'Tas roket versi premium' },
    { id: 'cos-4', name: 'Syal Ksatria', icon: '⚔️', cost: 250, desc: 'Syal kemenangan ksatria' },
    { id: 'cos-5', name: 'Mahkota Bintang', icon: '👑', cost: 500, desc: 'Mahkota untuk sang Master Explorer' },
    { id: 'cos-6', name: 'Hologram Glow', icon: '💫', cost: 350, desc: 'Efek cahaya hologram di sekitar karakter' },
  ]

  return (
    <div className="space-y-5 pb-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl font-black text-gradient-purple sm:text-4xl">Rewards 🏆</h1>
        <p className="mt-1 text-sm text-slate-600">Koleksi badge, bintang, dan item seru</p>
      </motion.div>

      {/* Wallet summary */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard glow="cyan" className="p-4 text-center">
          <div className="text-3xl">✨</div>
          <div className="text-2xl font-black text-cyan-600">{xp.toLocaleString('id-ID')}</div>
          <div className="text-[11px] text-slate-500">XP Total</div>
        </GlassCard>
        <GlassCard glow="orange" className="p-4 text-center">
          <div className="text-3xl">⭐</div>
          <div className="text-2xl font-black text-amber-500">{stars}</div>
          <div className="text-[11px] text-slate-500">Bintang</div>
        </GlassCard>
        <GlassCard glow="emerald" className="p-4 text-center">
          <div className="text-3xl">🪙</div>
          <div className="text-2xl font-black text-emerald-600">{coins}</div>
          <div className="text-[11px] text-slate-500">Koin</div>
        </GlassCard>
      </div>

      {/* Badges grid */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Badge ({earnedBadges.length}/{allBadges.length})</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {allBadges.map((b, i) => {
            const earned = earnedBadges.includes(b.id)
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -3 }}
              >
                <GlassCard
                  glow={earned ? (b.category === 'numerik' ? 'cyan' : b.category === 'literasi' ? 'purple' : 'emerald') : 'none'}
                  className={`relative h-full p-4 text-center ${earned ? '' : 'opacity-60 grayscale'}`}
                >
                  <div className="text-4xl">{earned ? b.icon : '🔒'}</div>
                  <div className="mt-2 text-sm font-bold text-slate-800">{b.name}</div>
                  <div className="text-[10px] text-slate-500">{b.description}</div>
                  {!earned && (
                    <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-slate-400">
                      <Lock className="h-3 w-3" /> {b.requirement}
                    </div>
                  )}
                  {earned && (
                    <div className="mt-2 text-[10px] font-bold text-emerald-600">✨ Dimiliki</div>
                  )}
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Cosmetic shop */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Toko Kosmetik (demo)</h3>
        <GlassCard className="p-4">
          <p className="mb-3 text-xs text-slate-500">Tukar koinmu dengan item kosmetik untuk karakter. (Demo — tidak ada uang nyata.)</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {cosmetics.map((c) => {
              const canAfford = coins >= c.cost
              return (
                <div
                  key={c.id}
                  className={`rounded-2xl border-2 p-3 text-center transition-all ${
                    canAfford
                      ? 'border-emerald-300 bg-emerald-50/50 hover:-translate-y-1 cursor-pointer'
                      : 'border-slate-200 bg-white/50 opacity-70'
                  }`}
                  onClick={() => {
                    if (canAfford && soundOn) playSound('coin')
                  }}
                >
                  <div className="text-3xl">{c.icon}</div>
                  <div className="mt-1 text-sm font-bold text-slate-800">{c.name}</div>
                  <div className="text-[10px] text-slate-500">{c.desc}</div>
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                    🪙 {c.cost}
                  </div>
                </div>
              )
            })}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="flex items-center gap-3 p-4">
        <NovaMascot expression="happy" size={44} />
        <p className="text-sm text-slate-600">
          <b className="text-slate-800">NOVA:</b> Kumpulkan XP dan bintang untuk membuka badge baru. Makin sering berlatih, makin banyak koleksimu! ✨
        </p>
      </GlassCard>
    </div>
  )
}
