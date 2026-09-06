'use client'

import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'

interface ParticleBackgroundProps {
  variant?: 'light' | 'deep' | 'splash'
  density?: number
  className?: string
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  color: string
  alpha: number
  life: number
  maxLife: number
}

const COLORS = ['#22D3EE', '#0EA5E9', '#A855F7', '#10B981', '#F472B6', '#FBBF24']

export function ParticleBackground({
  variant = 'light',
  density = 0.00009,
  className = '',
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animations = useGameStore((s) => s.settings.animations)
  const reduceMotion = useGameStore((s) => s.settings.reduceMotion)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let particles: Particle[] = []
    let w = 0
    let h = 0
    const dpr = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      w = parent.clientWidth
      h = parent.clientHeight
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const target = Math.min(60, Math.max(20, Math.floor(w * h * density)))
      if (particles.length < target) {
        while (particles.length < target) particles.push(makeParticle(w, h, true))
      } else {
        particles = particles.slice(0, target)
      }
    }

    const makeParticle = (W: number, H: number, initial = false): Particle => {
      const maxLife = 8 + Math.random() * 8
      return {
        x: Math.random() * W,
        y: initial ? Math.random() * H : H + 10,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.2 - Math.random() * 0.4,
        r: 1.5 + Math.random() * 3.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 0,
        life: 0,
        maxLife,
      }
    }

    const step = () => {
      ctx.clearRect(0, 0, w, h)
      // soft radial backdrop
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.1, 0, w * 0.5, h * 0.1, Math.max(w, h))
      if (variant === 'deep' || variant === 'splash') {
        grad.addColorStop(0, 'rgba(34, 211, 238, 0.12)')
        grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.08)')
        grad.addColorStop(1, 'rgba(11, 30, 63, 0)')
      } else {
        grad.addColorStop(0, 'rgba(14, 165, 233, 0.06)')
        grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.04)')
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)')
      }
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      for (const p of particles) {
        p.life += 1 / 60
        p.x += p.vx
        p.y += p.vy
        p.alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.6

        if (p.life >= p.maxLife || p.y < -10) {
          Object.assign(p, makeParticle(w, h))
        }

        ctx.beginPath()
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0, p.alpha) * 0.7
        ctx.shadowColor = p.color
        ctx.shadowBlur = 12
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      raf = requestAnimationFrame(step)
    }

    resize()
    window.addEventListener('resize', resize)
    if (!animations || reduceMotion) {
      // static frame
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = variant === 'deep' || variant === 'splash' ? '#0B1E3F' : '#F0F9FF'
      ctx.fillRect(0, 0, w, h)
    } else {
      raf = requestAnimationFrame(step)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [variant, density, animations, reduceMotion])

  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        aria-hidden="true"
      />
    </div>
  )
}
