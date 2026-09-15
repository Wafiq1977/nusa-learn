'use client'

import { motion } from 'framer-motion'
import type { Character } from '@/store/gameStore'

const OUTFIT_COLORS: Record<string, string> = {
  cyan: '#0EA5E9',
  purple: '#A855F7',
  emerald: '#10B981',
  orange: '#F97316',
  pink: '#EC4899',
}

const HAIR_COLORS: Record<string, string> = {
  black: '#1F2937',
  brown: '#92400E',
  blonde: '#FBBF24',
  blue: '#0EA5E9',
  purple: '#A855F7',
}

interface HeroCharacterAvatarProps {
  char: Character
  size?: number
  pose?: 'idle' | 'running' | 'celebrating' | 'thinking'
  float?: boolean
}

// Superhero-style character with cape, dynamic pose, and animations
export function HeroCharacterAvatar({
  char,
  size = 80,
  pose = 'idle',
  float = true,
}: HeroCharacterAvatarProps) {
  const outfitColor = OUTFIT_COLORS[char.outfitColor] || '#0EA5E9'
  const hairColor = HAIR_COLORS[char.hairColor] || '#92400E'
  const skin = char.skinTone === 'light' ? '#FFE0BD' : char.skinTone === 'tan' ? '#F1C27D' : '#C68642'
  const capeColor = outfitColor
  const accentColor = '#FBBF24' // gold accent

  // Pose animations
  const bodyAnim =
    pose === 'running'
      ? { y: [0, -3, 0], rotate: [-2, 2, -2] }
      : pose === 'celebrating'
        ? { y: [0, -8, 0], rotate: [0, 5, -5, 0] }
        : pose === 'thinking'
          ? { y: [0, -2, 0] }
          : { y: [0, -3, 0] } // idle

  const armAnim =
    pose === 'running'
      ? { rotate: [10, -10, 10] }
      : pose === 'celebrating'
        ? { rotate: [-30, -45, -30] }
        : { rotate: [0, 5, 0] }

  return (
    <motion.div
      animate={float ? bodyAnim : undefined}
      transition={{ duration: pose === 'running' ? 0.4 : 1.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: size, height: (size * 140) / 100 }}
    >
      <svg viewBox="0 0 100 140" width={size} height={(size * 140) / 100} aria-hidden="true">
        <defs>
          <linearGradient id={`cape-${outfitColor}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={capeColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={capeColor} stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id={`suit-${outfitColor}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={outfitColor} />
            <stop offset="100%" stopColor={outfitColor} stopOpacity="0.8" />
          </linearGradient>
          <radialGradient id="glow-hero" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Hero glow aura */}
        <circle cx="50" cy="70" r="50" fill="url(#glow-hero)" />

        {/* Cape flowing behind */}
        <motion.path
          d="M 30 60 Q 15 75 18 110 Q 25 115 35 105 Q 40 95 38 80 Z"
          fill={`url(#cape-${outfitColor})`}
          animate={pose === 'running' ? { d: ['M 30 60 Q 15 75 18 110 Q 25 115 35 105 Q 40 95 38 80 Z', 'M 30 60 Q 10 70 12 115 Q 22 120 32 108 Q 38 98 36 80 Z', 'M 30 60 Q 15 75 18 110 Q 25 115 35 105 Q 40 95 38 80 Z'] } : {}}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '30px 60px' }}
        />
        <motion.path
          d="M 70 60 Q 85 75 82 110 Q 75 115 65 105 Q 60 95 62 80 Z"
          fill={`url(#cape-${outfitColor})`}
          animate={pose === 'running' ? { d: ['M 70 60 Q 85 75 82 110 Q 75 115 65 105 Q 60 95 62 80 Z', 'M 70 60 Q 90 70 88 115 Q 78 120 68 108 Q 62 98 64 80 Z', 'M 70 60 Q 85 75 82 110 Q 75 115 65 105 Q 60 95 62 80 Z'] } : {}}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '70px 60px' }}
        />

        {/* Backpack (behind body) */}
        {char.backpack !== 'none' && (
          <g transform="translate(50 85)">
            {char.backpack === 'rocket' && (
              <g transform="translate(-10 -18)">
                <rect x="0" y="0" width="20" height="26" rx="5" fill="#A855F7" />
                <circle cx="10" cy="8" r="2.5" fill="#FBBF24" />
                <path d="M3 26 L7 32 L10 26 L13 32 L17 26 Z" fill="#F97316" />
              </g>
            )}
            {char.backpack === 'star' && (
              <g transform="translate(-10 -18)">
                <rect x="0" y="0" width="20" height="26" rx="5" fill="#F59E0B" />
                <path d="M10 5l1.5 4 4 0-3 2.5 1 4L10 13l-3.5 2.5 1-4-3-2.5 4 0z" fill="#FFFFFF" />
              </g>
            )}
            {char.backpack === 'cloud' && (
              <g transform="translate(-12 -18)">
                <rect x="0" y="0" width="24" height="26" rx="8" fill="#BAE6FD" />
                <circle cx="7" cy="8" r="3.5" fill="#FFFFFF" />
                <circle cx="17" cy="12" r="3.5" fill="#FFFFFF" />
              </g>
            )}
          </g>
        )}

        {/* Body / superhero suit */}
        <rect x="35" y="65" width="30" height="40" rx="10" fill={`url(#suit-${outfitColor})`} />
        {/* Suit emblem (star/diamond on chest) */}
        <path d="M50 75 L52 80 L57 80 L53 83 L54.5 88 L50 85 L45.5 88 L47 83 L43 80 L48 80 Z" fill={accentColor} opacity="0.9" />
        {/* Belt */}
        <rect x="35" y="95" width="30" height="4" fill={accentColor} opacity="0.8" />
        <circle cx="50" cy="97" r="2.5" fill="#FFFFFF" />

        {/* Left arm (animated) */}
        <motion.g
          animate={armAnim}
          transition={{ duration: pose === 'running' ? 0.4 : 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '35px 70px' }}
        >
          <rect x="28" y="68" width="10" height="22" rx="5" fill={outfitColor} />
          <circle cx="33" cy="92" r="5" fill={skin} />
        </motion.g>

        {/* Right arm (animated, opposite phase) */}
        <motion.g
          animate={pose === 'running' ? { rotate: [-10, 10, -10] } : pose === 'celebrating' ? { rotate: [30, 45, 30] } : { rotate: [0, -5, 0] }}
          transition={{ duration: pose === 'running' ? 0.4 : 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '65px 70px' }}
        >
          <rect x="62" y="68" width="10" height="22" rx="5" fill={outfitColor} />
          <circle cx="67" cy="92" r="5" fill={skin} />
        </motion.g>

        {/* Legs (animated for running) */}
        {pose === 'running' ? (
          <>
            <motion.rect x="38" y="105" width="10" height="18" rx="4" fill={outfitColor}
              animate={{ y: [105, 108, 105] }}
              transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.rect x="52" y="105" width="10" height="18" rx="4" fill={outfitColor}
              animate={{ y: [108, 105, 108] }}
              transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        ) : (
          <>
            <rect x="38" y="105" width="10" height="18" rx="4" fill={outfitColor} />
            <rect x="52" y="105" width="10" height="18" rx="4" fill={outfitColor} />
          </>
        )}
        {/* Boots */}
        <rect x="36" y="121" width="13" height="5" rx="2" fill="#1F2937" />
        <rect x="51" y="121" width="13" height="5" rx="2" fill="#1F2937" />

        {/* Head */}
        <circle cx="50" cy="40" r="22" fill={skin} />

        {/* Hair */}
        {char.hair === 'short' && <path d="M28 38 Q50 10 72 38 L72 32 Q50 18 28 32 Z" fill={hairColor} />}
        {char.hair === 'long' && <path d="M27 42 Q50 12 73 42 L73 68 L67 68 L67 42 Q50 26 33 42 L33 68 L27 68 Z" fill={hairColor} />}
        {char.hair === 'curly' && (
          <g fill={hairColor}>
            <circle cx="32" cy="26" r="8" />
            <circle cx="42" cy="20" r="8" />
            <circle cx="50" cy="18" r="8" />
            <circle cx="58" cy="20" r="8" />
            <circle cx="68" cy="26" r="8" />
          </g>
        )}
        {char.hair === 'bun' && (
          <>
            <circle cx="50" cy="16" r="9" fill={hairColor} />
            <path d="M30 38 Q50 24 70 38 L70 32 Q50 22 30 32 Z" fill={hairColor} />
          </>
        )}
        {char.hair === 'cap' && (
          <>
            {/* Hero mask instead of cap */}
            <path d="M28 32 L72 32 L70 24 L30 24 Z" fill={outfitColor} />
            <rect x="30" y="32" width="40" height="3" fill={accentColor} />
            {/* Eye mask */}
            <path d="M32 38 Q50 32 68 38 L68 44 Q50 40 32 44 Z" fill={outfitColor} opacity="0.8" />
          </>
        )}

        {/* Hero mask (always show for superhero look) */}
        {char.hair !== 'cap' && (
          <path d="M30 38 Q50 34 70 38 L70 44 Q50 40 30 44 Z" fill={outfitColor} opacity="0.7" />
        )}

        {/* Eyes (determined hero look) */}
        <ellipse cx="42" cy="40" rx="3" ry="3.5" fill="#1F2937" />
        <ellipse cx="58" cy="40" rx="3" ry="3.5" fill="#1F2937" />
        <circle cx="43" cy="39" r="1" fill="#FFFFFF" />
        <circle cx="59" cy="39" r="1" fill="#FFFFFF" />

        {/* Smile / determined mouth */}
        {pose === 'celebrating' ? (
          <path d="M42 50 Q50 58 58 50" stroke="#7C2D12" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        ) : pose === 'running' ? (
          <path d="M44 52 L56 52" stroke="#7C2D12" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M43 50 Q50 56 57 50" stroke="#7C2D12" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}

        {/* Accessories */}
        {char.accessory === 'glasses' && (
          <g stroke={accentColor} strokeWidth="1.5" fill="none">
            <circle cx="42" cy="40" r="5" />
            <circle cx="58" cy="40" r="5" />
            <line x1="47" y1="40" x2="53" y2="40" />
          </g>
        )}
        {char.accessory === 'headphones' && (
          <g>
            <path d="M28 36 Q50 18 72 36" stroke="#1F2937" strokeWidth="2.5" fill="none" />
            <rect x="25" y="36" width="7" height="12" rx="3" fill="#1F2937" />
            <rect x="68" y="36" width="7" height="12" rx="3" fill="#1F2937" />
          </g>
        )}
        {char.accessory === 'scarf' && (
          <g>
            <path d="M35 62 Q50 68 65 62 L65 68 Q50 74 35 68 Z" fill="#EF4444" />
            <rect x="60" y="68" width="5" height="16" fill="#EF4444" />
          </g>
        )}
      </svg>
    </motion.div>
  )
}
