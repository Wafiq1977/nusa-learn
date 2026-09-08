'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Question } from '@/store/gameStore'

interface UseQuestionsArgs {
  grade: number
  category: 'numerik' | 'literasi' | 'mixed'
  subcategory?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  limit: number
  mix?: boolean
  gameType?: 'choice' | 'story' | 'pattern' | 'match' | 'build' | 'catch' | 'shop' | 'path' | 'battle'
  enabled?: boolean
}

export function useQuestions({
  grade,
  category,
  subcategory,
  difficulty,
  limit,
  mix,
  gameType,
  enabled = true,
}: UseQuestionsArgs) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQ = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const buildParams = (cat: 'numerik' | 'literasi') => {
        const params = new URLSearchParams({
          grade: String(grade),
          category: cat,
          limit: String(limit),
        })
        if (subcategory) params.set('subcategory', subcategory)
        if (difficulty) params.set('difficulty', difficulty)
        if (mix) params.set('mix', 'true')
        if (gameType) params.set('gameType', gameType)
        return params.toString()
      }

      let combined: Question[] = []
      if (category === 'mixed') {
        // Fetch both numerik and literasi, then shuffle together
        const [numRes, litRes] = await Promise.all([
          fetch(`/api/questions?${buildParams('numerik')}`),
          fetch(`/api/questions?${buildParams('literasi')}`),
        ])
        if (!numRes.ok || !litRes.ok) throw new Error('Gagal memuat soal')
        const numData = await numRes.json()
        const litData = await litRes.json()
        combined = [...(numData.questions || []), ...(litData.questions || [])]
        // Shuffle & take limit
        for (let i = combined.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[combined[i], combined[j]] = [combined[j], combined[i]]
        }
        combined = combined.slice(0, limit)
      } else {
        const res = await fetch(`/api/questions?${buildParams(category)}`)
        if (!res.ok) throw new Error('Gagal memuat soal')
        const data = await res.json()
        combined = data.questions || []
      }
      setQuestions(combined)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat soal')
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }, [grade, category, subcategory, difficulty, limit, mix, gameType])

  useEffect(() => {
    if (enabled) fetchQ()
  }, [enabled, fetchQ])

  return { questions, loading, error, refetch: fetchQ }
}

// Hook to fetch a daily challenge mix (1 numerik + 1 literasi + 1 logic)
export function useDailyChallenge(grade: number, enabled = true) {
  const [items, setItems] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const [num, lit, log] = await Promise.all([
          fetch(`/api/questions?grade=${grade}&category=numerik&limit=1`).then((r) => r.json()),
          fetch(`/api/questions?grade=${grade}&category=literasi&limit=1`).then((r) => r.json()),
          fetch(`/api/questions?grade=${grade}&category=numerik&subcategory=pola&limit=1`).then((r) => r.json()),
        ])
        if (cancelled) return
        const out = [
          ...(num.questions || []),
          ...(lit.questions || []),
          ...(log.questions || []),
        ]
        setItems(out.slice(0, 3))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [grade, enabled])

  return { items, loading }
}

export interface BadgeDef {
  id: string
  name: string
  description: string
  icon: string
  category: string
  requirement: string
}

export function useBadges() {
  const [badges, setBadges] = useState<BadgeDef[]>([])
  useEffect(() => {
    fetch('/api/badges')
      .then((r) => r.json())
      .then((d) => setBadges(d.badges || []))
      .catch(() => setBadges([]))
  }, [])
  return badges
}

// Hook to fetch a NOVA hint (LLM-powered)
export function useNovaHint() {
  const [hint, setHint] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [expression, setExpression] = useState<'happy' | 'thinking' | 'helping' | 'encouraging'>('helping')

  const getHint = useCallback(
    async (params: {
      question: string
      story?: string
      hintsUsed: number
      recentCorrect?: number
      recentWrong?: number
      grade?: number
      existingHints?: string[]
    }) => {
      setLoading(true)
      try {
        const res = await fetch('/api/hint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        })
        if (!res.ok) throw new Error('hint failed')
        const data = await res.json()
        setHint(data.hint)
        setExpression(data.expression || 'helping')
        return data.hint as string
      } catch {
        // Fallback to existing hints
        const fallback = params.existingHints?.[params.hintsUsed] || 'Yuk baca soal sekali lagi dengan teliti. 💡'
        setHint(fallback)
        setExpression('helping')
        return fallback
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return { hint, loading, expression, getHint, setHint }
}
