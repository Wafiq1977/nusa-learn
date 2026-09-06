'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  stars: number // 0..3
  size?: number
  animate?: boolean
  className?: string
}

export function StarRating({ stars, size = 36, animate = true, className }: StarRatingProps) {
  return (
    <div className={cn('inline-flex items-center justify-center gap-1.5', className)} aria-label={`${stars} dari 3 bintang`}>
      {[0, 1, 2].map((i) => {
        const filled = i < stars
        return (
          <motion.svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            initial={animate ? { scale: 0, rotate: -45 } : false}
            animate={animate ? { scale: 1, rotate: 0 } : undefined}
            transition={{ delay: 0.15 * i, type: 'spring', stiffness: 260, damping: 18 }}
            className={cn(
              'drop-shadow-sm transition-colors',
              filled ? 'text-amber-400' : 'text-slate-300',
            )}
          >
            <path
              d="M12 2l2.95 6.95L22 9.97l-5.5 4.73L18.45 22 12 18.27 5.55 22l1.95-7.3L2 9.97l7.05-1.02L12 2z"
              fill={filled ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={filled ? 0 : 1.5}
            />
          </motion.svg>
        )
      })}
    </div>
  )
}
