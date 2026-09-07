// GET /api/questions
// Query params: grade, category, subcategory, difficulty, limit, mix (boolean)
// Returns questions matching the filters with graceful fallback.
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface RawQ {
  id: string
  grade: number
  category: string
  subcategory: string
  difficulty: string
  gameType: string
  question: string
  story: string | null
  highlight: string | null
  options: string
  answer: string
  explanation: string
  hints: string
  xpReward: number
}

function parseQ(r: RawQ) {
  return {
    id: r.id,
    grade: r.grade,
    category: r.category as 'numerik' | 'literasi',
    subcategory: r.subcategory,
    difficulty: r.difficulty as 'easy' | 'medium' | 'hard',
    gameType: r.gameType as 'choice' | 'story' | 'pattern' | 'match' | 'build',
    question: r.question,
    story: r.story,
    highlight: r.highlight ? (JSON.parse(r.highlight) as string[]) : null,
    options: JSON.parse(r.options) as string[],
    answer: r.answer,
    explanation: r.explanation,
    hints: JSON.parse(r.hints) as string[],
    xpReward: r.xpReward,
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const gradeStr = searchParams.get('grade')
  const category = searchParams.get('category')
  const subcategory = searchParams.get('subcategory')
  const difficulty = searchParams.get('difficulty')
  const limitStr = searchParams.get('limit')
  const mix = searchParams.get('mix') === 'true'
  const gameType = searchParams.get('gameType')
  const excludeStr = searchParams.get('exclude')

  const grade = gradeStr ? parseInt(gradeStr, 10) : undefined
  const limit = limitStr ? Math.min(20, Math.max(1, parseInt(limitStr, 10))) : 5
  const exclude = excludeStr ? excludeStr.split(',').filter(Boolean) : []

  const baseWhere: Record<string, unknown> = {}
  if (category) baseWhere.category = category
  if (subcategory) baseWhere.subcategory = subcategory
  if (gameType) baseWhere.gameType = gameType

  let questions: RawQ[] = []

  if (difficulty && !mix) {
    for (const g of uniqueGrades(grade)) {
      const items = await db.question.findMany({
        where: { ...baseWhere, grade: g, difficulty },
        take: limit * 2,
      })
      questions.push(...items)
      if (questions.length >= limit) break
    }
  } else if (difficulty && mix) {
    const dist = difficultyMix(difficulty, limit)
    for (const [diff, count] of Object.entries(dist)) {
      const need = count as number
      if (need === 0) continue
      for (const g of uniqueGrades(grade)) {
        const items = await db.question.findMany({
          where: { ...baseWhere, grade: g, difficulty: diff },
          take: need * 2,
        })
        questions.push(...items.slice(0, need))
        if (questions.filter((q) => q.difficulty === diff).length >= need) break
      }
    }
  } else {
    for (const g of uniqueGrades(grade)) {
      const items = await db.question.findMany({
        where: { ...baseWhere, grade: g },
        take: limit * 2,
      })
      questions.push(...items)
      if (questions.length >= limit) break
    }
  }

  const seen = new Set<string>()
  let filtered = questions.filter((q) => {
    if (exclude.includes(q.id)) return false
    if (seen.has(q.id)) return false
    seen.add(q.id)
    return true
  })

  filtered = shuffle(filtered)
  filtered = filtered.slice(0, limit)

  if (filtered.length < limit) {
    const existingIds = new Set(filtered.map((q) => q.id))
    for (const g of uniqueGrades(grade)) {
      if (filtered.length >= limit) break
      const more = await db.question.findMany({
        where: {
          ...baseWhere,
          grade: g,
          id: { notIn: [...existingIds, ...exclude] },
        },
        take: (limit - filtered.length) * 2,
      })
      const moreFiltered = shuffle(more).filter((q) => !existingIds.has(q.id))
      for (const q of moreFiltered) {
        if (filtered.length >= limit) break
        filtered.push(q)
        existingIds.add(q.id)
      }
    }
  }

  const parsed = filtered.map(parseQ)
  return NextResponse.json({ questions: parsed, count: parsed.length })
}

function difficultyMix(base: string, limit: number): Record<string, number> {
  if (base === 'easy') return { easy: Math.ceil(limit * 0.7), medium: limit - Math.ceil(limit * 0.7) }
  if (base === 'medium') {
    const easy = Math.ceil(limit * 0.2)
    const medium = Math.ceil(limit * 0.6)
    return { easy, medium, hard: Math.max(0, limit - easy - medium) }
  }
  if (base === 'hard') return { medium: Math.ceil(limit * 0.3), hard: limit - Math.ceil(limit * 0.3) }
  return { [base]: limit }
}

function uniqueGrades(grade?: number): number[] {
  if (!grade) return [1, 2, 3, 4, 5, 6]
  const out = [grade]
  if (grade > 1) out.push(grade - 1)
  if (grade < 6) out.push(grade + 1)
  if (grade > 2) out.push(grade - 2)
  if (grade < 5) out.push(grade + 2)
  return out
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
