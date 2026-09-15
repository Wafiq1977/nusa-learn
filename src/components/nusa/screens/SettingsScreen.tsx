'use client'

import { motion } from 'framer-motion'
import { useGameStore, type DisplayMode } from '@/store/gameStore'
import { GlassCard } from '@/components/nusa/GlassCard'
import { GlowButton } from '@/components/nusa/GlowButton'
import { NovaMascot } from '@/components/nusa/NovaMascot'
import { playSound, setSoundEnabled } from '@/lib/nusa/sound'
import { TRACKS, playMusic, stopMusic, unlockAudio, isMusicPlaying, getCurrentTrackId } from '@/lib/nusa/music'
import { useEffect, useState } from 'react'
import { Volume2, VolumeX, Music, Music2, Sparkles, Zap, Type, Tv, Smartphone, Tablet, Monitor, Moon, Sun } from 'lucide-react'

export function SettingsScreen() {
  const settings = useGameStore((s) => s.settings)
  const updateSettings = useGameStore((s) => s.updateSettings)
  const goHome = useGameStore((s) => s.goHome)
  const [, force] = useState(0)

  useEffect(() => {
    setSoundEnabled(settings.sound)
  }, [settings.sound])

  const handleMusicToggle = (v: boolean) => {
    updateSettings({ music: v })
    unlockAudio()
    if (v && settings.musicTrack && settings.musicTrack !== 'off') {
      playMusic(settings.musicTrack)
    } else {
      stopMusic()
    }
    force((x) => x + 1)
  }

  const handleTrackSelect = (trackId: string) => {
    unlockAudio()
    playSound('click')
    if (trackId === 'off') {
      updateSettings({ music: false, musicTrack: 'off' })
      stopMusic()
    } else {
      updateSettings({ music: true, musicTrack: trackId })
      playMusic(trackId)
    }
    force((x) => x + 1)
  }

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
            desc="Musik seru saat bermain"
            value={settings.music}
            onToggle={handleMusicToggle}
          />
        </div>

        {/* Track picker */}
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
            <Music className="h-4 w-4" /> Pilih Musik
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:gap-3">
            {TRACKS.map((t) => {
              const isActive = settings.musicTrack === t.id || (t.id === 'off' && (!settings.music || settings.musicTrack === 'off'))
              const isPlaying = isActive && isMusicPlaying() && t.id !== 'off'
              return (
                <button
                  key={t.id}
                  onClick={() => handleTrackSelect(t.id)}
                  className={`relative flex items-center gap-2 rounded-2xl border-2 p-2.5 text-left transition-all ${
                    isActive
                      ? 'border-cyan-400 bg-cyan-50 shadow-sm'
                      : 'border-slate-200 bg-white/70 hover:border-cyan-300'
                  }`}
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate text-xs font-bold text-slate-800">{t.name}</div>
                    <div className="truncate text-[10px] text-slate-500">{t.description}</div>
                  </div>
                  {isPlaying && (
                    <motion.div
                      animate={{ scaleY: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="absolute right-1 top-1 text-cyan-500"
                    >
                      🎵
                    </motion.div>
                  )}
                </button>
              )
            })}
          </div>
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
          <ToggleRow
            icon={settings.darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            label={settings.darkMode ? '🌙 Mode Gelap' : '☀️ Mode Terang'}
            desc="Beralih antara tema terang dan gelap"
            value={settings.darkMode}
            onToggle={(v) => updateSettings({ darkMode: v })}
          />
        </div>

        {/* Display Mode selector */}
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
            <Tv className="h-4 w-4" /> Mode Tampilan
          </div>
          <p className="mb-3 text-xs text-slate-500">
            Pilih mode yang sesuai dengan perangkatmu. Auto akan mendeteksi otomatis.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:gap-3">
            {([
              { value: 'auto', label: 'Auto', icon: <Sparkles className="h-5 w-5" />, desc: 'Deteksi otomatis' },
              { value: 'mobile', label: 'Mobile', icon: <Smartphone className="h-5 w-5" />, desc: 'HP kecil' },
              { value: 'tablet', label: 'Tablet', icon: <Tablet className="h-5 w-5" />, desc: 'iPad/Tab' },
              { value: 'desktop', label: 'Desktop', icon: <Monitor className="h-5 w-5" />, desc: 'Laptop/PC' },
              { value: 'tv', label: 'TV/PED', icon: <Tv className="h-5 w-5" />, desc: 'Proyektor/TV' },
            ] as const).map((m) => (
              <button
                key={m.value}
                onClick={() => {
                  playSound('click')
                  const dm = m.value as DisplayMode
                  updateSettings({
                    displayMode: dm,
                    tvMode: dm === 'tv',
                    textScale: dm === 'tv' ? 'large' : dm === 'mobile' ? 'small' : 'normal',
                  })
                }}
                className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2.5 text-center transition-all sm:p-3 ${
                  settings.displayMode === m.value
                    ? 'border-cyan-400 bg-cyan-50 text-cyan-700 shadow-sm'
                    : 'border-slate-200 bg-white/70 text-slate-600 hover:border-cyan-300'
                }`}
              >
                {m.icon}
                <div className="text-xs font-bold sm:text-sm">{m.label}</div>
                <div className="text-[9px] text-slate-500 sm:text-[10px]">{m.desc}</div>
              </button>
            ))}
          </div>
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
          <b className="text-slate-800">NOVA:</b> Pilih musik favoritmu untuk menemani petualangan! Musik bisa diganti kapan saja. 🎵
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
