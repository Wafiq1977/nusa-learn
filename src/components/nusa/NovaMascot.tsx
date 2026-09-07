'use client'

import { motion } from 'framer-motion'

export type NovaExpression = 'happy' | 'thinking' | 'helping' | 'encouraging' | 'surprised' | 'celebrate'

interface NovaMascotProps {
  expression?: NovaExpression
  size?: number
  float?: boolean
  className?: string
}

// NOVA — small friendly futuristic robot. Pure SVG.
export function NovaMascot({
  expression = 'happy',
  size = 80,
  float = true,
  className = '',
}: NovaMascotProps) {
  // eye color & shape based on expression
  const eyeColor =
    expression === 'thinking'
      ? '#FBBF24'
      : expression === 'surprised'
        ? '#F472B6'
        : expression === 'celebrate'
          ? '#10B981'
          : expression === 'encouraging'
            ? '#A855F7'
            : '#22D3EE'
  const mouthPath =
    expression === 'surprised'
      ? 'M 36 56 Q 50 72 64 56 Q 50 64 36 56 Z'
      : expression === 'celebrate'
        ? 'M 32 54 Q 50 80 68 54'
        : expression === 'encouraging'
          ? 'M 36 54 Q 50 64 64 54'
          : 'M 36 52 Q 50 64 64 52'

  return (
    <motion.div
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
      animate={
        float
          ? { y: [0, -6, 0], rotate: [0, -2, 2, 0] }
          : { y: [0, -3, 0] }
      }
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
        {/* Glow halo */}
        <circle cx="50" cy="50" r="46" fill={eyeColor} opacity="0.08" />
        <circle cx="50" cy="50" r="40" fill={eyeColor} opacity="0.06" />

        {/* Antenna */}
        <line x1="50" y1="14" x2="50" y2="6" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        <circle cx="50" cy="5" r="3" fill={eyeColor}>
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite" />
        </circle>

        {/* Head/Body — rounded robot */}
        <defs>
          <linearGradient id="nova-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F0F9FF" />
            <stop offset="50%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>
          <linearGradient id="nova-face" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B1E3F" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
        </defs>

        {/* Ears */}
        <circle cx="20" cy="50" r="6" fill="#94A3B8" />
        <circle cx="80" cy="50" r="6" fill="#94A3B8" />
        <circle cx="20" cy="50" r="3" fill={eyeColor} opacity="0.7" />
        <circle cx="80" cy="50" r="3" fill={eyeColor} opacity="0.7" />

        {/* Body */}
        <rect x="20" y="20" width="60" height="60" rx="22" fill="url(#nova-body)" stroke="#7DD3FC" strokeWidth="1.5" />

        {/* Face screen */}
        <rect x="28" y="28" width="44" height="36" rx="14" fill="url(#nova-face)" />

        {/* Eyes */}
        {expression === 'surprised' ? (
          <>
            <circle cx="40" cy="44" r="6" fill={eyeColor}>
              <animate attributeName="r" values="6;7;6" dur="0.7s" repeatCount="indefinite" />
            </circle>
            <circle cx="60" cy="44" r="6" fill={eyeColor}>
              <animate attributeName="r" values="6;7;6" dur="0.7s" repeatCount="indefinite" />
            </circle>
          </>
        ) : (
          <>
            <ellipse cx="40" cy="44" rx="3.5" ry="4.5" fill={eyeColor} />
            <ellipse cx="60" cy="44" rx="3.5" ry="4.5" fill={eyeColor} />
          </>
        )}
        {/* eye highlights */}
        <circle cx="41.5" cy="42.5" r="1.2" fill="#FFFFFF" opacity="0.85" />
        <circle cx="61.5" cy="42.5" r="1.2" fill="#FFFFFF" opacity="0.85" />

        {/* Mouth */}
        <path d={mouthPath} fill="none" stroke={eyeColor} strokeWidth="2.4" strokeLinecap="round" />

        {/* Cheek glow when encouraging */}
        {expression === 'encouraging' && (
          <>
            <circle cx="33" cy="55" r="2.5" fill="#F472B6" opacity="0.55" />
            <circle cx="67" cy="55" r="2.5" fill="#F472B6" opacity="0.55" />
          </>
        )}

        {/* Body highlight */}
        <rect x="28" y="68" width="44" height="6" rx="3" fill={eyeColor} opacity="0.18" />
      </svg>
    </motion.div>
  )
}
