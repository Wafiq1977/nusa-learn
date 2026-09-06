'use client'

import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { GlassCard } from '@/components/nusa/GlassCard'
import { GlowButton } from '@/components/nusa/GlowButton'
import { NovaMascot } from '@/components/nusa/NovaMascot'
import { playSound, setSoundEnabled } from '@/lib/nusa/sound'
import { useEffect } from 'react'
import { Volume2, VolumeX, Music, Music2, Sparkles, Zap, Type } from 'lucide-react'

export function SettingsScreen() {
  const settings = useGameStore((s) => s.settings)
  const updateSettings = useGameStore((s) => s.updateSettings)
  const goHome = useGameStore((s) => s.goHome)

  useEffect(() => {
    setSoundEnabled(settings.sound)
  }, [settings.sound])

  return (
    <div className="space-y-5 pb-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl font-black text-gradient-cyan sm:text-4xl">Pengaturan ⚙️</h1>
        <p className="mt-1 text-sm text-slate-600">Sesuaikan pengalaman bermainmu</p>
      </motion.div>

      <GlassCard className="p-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Audio</h3>
        <div className="space-y-2">
          <ToggleRow
            icon={settings.sound ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            label="Sound Effect"
            desc="Suara klik, benar, salah, dll"
            value={settings.sound}
            onToggle={(v) => {
              updateSettings({ sound: v })
              setSoundEnabled(v)
              if (v) playSound('click')
            }}
          />
          <ToggleRow
            icon={settings.music ? <Music className="h-5 w-5" /> : <Music2 className="h-5 w-5" />}
            label="Musik Latar"
            desc="Musik lembut saat bermain (segera hadir)"
            value={settings.music}
            onToggle={(v) => updateSettings({ music: v })}
          />
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Animasi & Tampilan</h3>
        <div className="space-y-2">
          <ToggleRow
            icon={<Sparkles className="h-5 w-5" />}
            label="Animasi"
            desc="Efek partikel & transisi"
            value={settings.animations}
            onToggle={(v) => updateSettings({ animations: v })}
          />
          <ToggleRow
            icon={<Zap className="h-5 w-5" />}
            label="Kurangi Animasi"
            desc="Untuk perangkat lambat atau sensitif gerakan"
            value={settings.reduceMotion}
            onToggle={(v) => updateSettings({ reduceMotion: v })}
          />
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
            <Type className="h-4 w-4" /> Ukuran Teks
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['small', 'normal', 'large'] as const).map((s) => (
              <button
                key={s}
                onClick={() => updateSettings({ textScale: s })}
                className={`rounded-2xl border-2 p-3 text-center font-bold transition-all ${
                  settings.textScale === s
                    ? 'border-cyan-400 bg-cyan-50 text-cyan-700'
                    : 'border-slate-200 bg-white/70 text-slate-600 hover:border-cyan-300'
                }`}
              >
                <div className={`${s === 'small' ? 'text-xs' : s === 'normal' ? 'text-sm' : 'text-lg'}`}>Aa</div>
                <div className="text-[10px] font-medium">{s === 'small' ? 'Kecil' : s === 'normal' ? 'Normal' : 'Besar'}</div>
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="flex items-center gap-3 p-4">
        <NovaMascot expression="thinking" size={44} />
        <p className="text-sm text-slate-600">
          <b className="text-slate-800">NOVA:</b> Jika suara mengganggu, matikan kapan saja. Kamu bisa kurangi animasi jika perangkatmu terasa berat. 💙
        </p>
      </GlassCard>

      <div className="flex justify-center">
        <GlowButton glow="cyan" onClick={() => { playSound('click'); goHome() }}>
          Kembali ke Beranda 🏠
        </GlowButton>
      </div>
    </div>
  )
}

function ToggleRow({
  icon,
  label,
  desc,
  value,
  onToggle,
}: {
  icon: React.ReactNode
  label: string
  desc: string
  value: boolean
  onToggle: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 p-3">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${value ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-100 text-slate-400'}`}>
          {icon}
        </div>
        <div>
          <div className="text-sm font-bold text-slate-800">{label}</div>
          <div className="text-[11px] text-slate-500">{desc}</div>
        </div>
      </div>
      <button
        onClick={() => onToggle(!value)}
        className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors ${value ? 'bg-cyan-500' : 'bg-slate-300'}`}
        aria-pressed={value}
        aria-label={`Toggle ${label}`}
      >
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 600, damping: 30 }}
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md ${value ? 'right-1' : 'left-1'}`}
        />
      </button>
    </div>
  )
}
