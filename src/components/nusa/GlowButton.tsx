'use client'

import { motion } from 'framer-motion'
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { playSound } from '@/lib/nusa/sound'
import { useGameStore } from '@/store/gameStore'

type GlowColor = 'cyan' | 'purple' | 'emerald' | 'orange' | 'pink' | 'sky' | 'none'
type Size = 'sm' | 'md' | 'lg' | 'xl'

interface GlowButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'ref'> {
  glow?: GlowColor
  size?: Size
  variant?: 'solid' | 'soft' | 'ghost'
  children: ReactNode
}

const sizeMap: Record<Size, string> = {
  sm: 'text-sm px-4 py-2 min-h-9',
  md: 'text-base px-5 py-3 min-h-11',
  lg: 'text-lg px-7 py-4 min-h-12',
  xl: 'text-xl px-8 py-5 min-h-14',
}

const glowClass: Record<GlowColor, string> = {
  cyan: 'from-sky-400 to-cyan-500 shadow-[0_8px_24px_-8px_rgba(14,165,233,0.7)]',
  purple: 'from-purple-500 to-fuchsia-500 shadow-[0_8px_24px_-8px_rgba(168,85,247,0.7)]',
  emerald: 'from-emerald-400 to-teal-500 shadow-[0_8px_24px_-8px_rgba(16,185,129,0.7)]',
  orange: 'from-amber-400 to-orange-500 shadow-[0_8px_24px_-8px_rgba(249,115,22,0.7)]',
  pink: 'from-rose-400 to-pink-500 shadow-[0_8px_24px_-8px_rgba(244,114,182,0.7)]',
  sky: 'from-sky-400 to-blue-500 shadow-[0_8px_24px_-8px_rgba(14,165,233,0.7)]',
  none: 'from-slate-200 to-slate-300 text-slate-700',
}

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ glow = 'cyan', size = 'md', variant = 'solid', className, children, onClick, disabled, ...rest }, ref) => {
    const soundEnabled = useGameStore((s) => s.settings.sound)
    return (
      <motion.button
        ref={ref}
        whileHover={disabled ? undefined : { scale: 1.04, y: -1 }}
        whileTap={disabled ? undefined : { scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        onClick={(e) => {
          if (soundEnabled) playSound('click')
          onClick?.(e)
        }}
        disabled={disabled}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 rounded-2xl font-semibold text-white transition-all',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/50',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:saturate-50',
          variant === 'solid' && cn('bg-gradient-to-br text-white', glowClass[glow]),
          variant === 'soft' && cn('bg-white/70 text-slate-700 border border-white/80 backdrop-blur-md shadow-md'),
          variant === 'ghost' && 'bg-transparent text-slate-600 hover:bg-white/50',
          sizeMap[size],
          className,
        )}
        {...(rest as React.ComponentProps<typeof motion.button>)}
      >
        {children}
      </motion.button>
    )
  },
)
GlowButton.displayName = 'GlowButton'
