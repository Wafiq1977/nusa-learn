'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SkillBarProps {
  value: number // 0..100
  label?: string
  color?: 'cyan' | 'purple' | 'emerald' | 'orange' | 'pink'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const colorMap = {
  cyan: 'from-sky-400 to-cyan-500',
  purple: 'from-purple-500 to-fuchsia-500',
  emerald: 'from-emerald-400 to-teal-500',
  orange: 'from-amber-400 to-orange-500',
  pink: 'from-rose-400 to-pink-500',
}

export function SkillBar({
  value,
  label,
  color = 'cyan',
  size = 'md',
  showLabel = true,
  className,
}: SkillBarProps) {
  const pct = Math.max(0, Math.min(100, value))
  const status =
    pct >= 75 ? { text: 'Sudah dikuasai', color: 'text-emerald-600', emoji: '✨' } :
    pct >= 40 ? { text: 'Sedang berkembang', color: 'text-sky-600', emoji: '🌱' } :
    { text: 'Yuk latihan lagi', color: 'text-amber-600', emoji: '💪' }

  const heightClass = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-5' : 'h-3'

  return (
    <div className={cn('w-full', className)}>
      {(label || showLabel) && (
        <div className="mb-1.5 flex items-center justify-between text-xs sm:text-sm">
          <span className="font-semibold text-slate-700">{label}</span>
          {showLabel && (
            <span className={cn('flex items-center gap-1 font-medium', status.color)}>
              <span>{status.emoji}</span>
              <span>{status.text}</span>
              <span className="text-slate-400">·</span>
              <span className="font-bold">{Math.round(pct)}%</span>
            </span>
          )}
        </div>
      )}
      <div className={cn('relative w-full overflow-hidden rounded-full bg-slate-200/70', heightClass)}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn('absolute left-0 top-0 h-full rounded-full bg-gradient-to-r', colorMap[color])}
        />
        {/* shimmer */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
            animation: 'nusa-shimmer 2.5s linear infinite',
            backgroundSize: '200% 100%',
          }}
        />
      </div>
    </div>
  )
}
