'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type GlowColor = 'cyan' | 'purple' | 'emerald' | 'orange' | 'pink' | 'sky' | 'none'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  glow?: GlowColor
  strong?: boolean
  hover?: boolean
  children: ReactNode
}

const glowMap: Record<GlowColor, string> = {
  cyan: 'glow-cyan',
  purple: 'glow-purple',
  emerald: 'glow-emerald',
  orange: 'glow-orange',
  pink: 'glow-purple',
  sky: 'glow-cyan',
  none: '',
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ glow = 'none', strong = false, hover = false, className, children, ...rest }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          strong ? 'glass-strong' : 'glass',
          'rounded-3xl',
          glowMap[glow],
          hover && 'transition-transform duration-300 hover:-translate-y-1',
          className,
        )}
        {...rest}
      >
        {children}
      </motion.div>
    )
  },
)
GlassCard.displayName = 'GlassCard'
