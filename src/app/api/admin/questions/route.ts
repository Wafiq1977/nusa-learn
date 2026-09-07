// /api/admin/questions — admin CRUD for question bank
// GET: list all (with optional filters)
// POST: create new question
// PUT: update existing (id required in body)
// DELETE: delete (id in body or query)
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Simple admin token check (demo only — replace with proper auth in production)
function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  if (!auth) return false
  // Token format: "Bearer <base64>"
  const token = auth.replace(/^Bearer\s+/i, '')
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8')
    return decoded.endsWith('-nusa-learn-admin')
  } catch {
    return false
  }
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ ok: false, message: 'Tidak terautentikasi' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const grade = searchParams.get('grade')
  const category = searchParams.get('category')
  const subcategory = searchParams.get('subcategory')
  const difficulty = searchParams.get('difficulty')
  const search = searchParams.get('q') // search in question text
  const limitStr = searchParams.get('limit')
  const offsetStr = searchParams.get('offset')

  const where: Record<string, unknown> = {}
  if (grade) where.grade = parseInt(grade, 10)
  if (category) where.category = category
  if (subcategory) where.subcategory = subcategory
  if (difficulty) where.difficulty = difficulty
  if (search) {
    where.OR = [
      { question: { contains: search } },
      { story: { contains: search } },
      { id: { contains: search } },
    ]
  }
  const limit = limitStr ? Math.min(200, parseInt(limitStr, 10)) : 100
  const offset = offsetStr ? parseInt(offsetStr, 10) : 0

  const [items, total] = await Promise.all([
    db.question.findMany({
      where,
      orderBy: { id: 'asc' },
      take: limit,
      skip: offset,
    }),
    db.question.count({ where }),
  ])

  return NextResponse.json({ ok: true, items, total, limit, offset })
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ ok: false, message: 'Tidak terautentikasi' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const { id, grade, category, subcategory, difficulty, gameType, question, story, highlight, options, answer, explanation, hints, xpReward } = body

    // Validate
    if (!id || !grade || !category || !subcategory || !difficulty || !gameType || !question || !options || !answer || !explanation) {
      return NextResponse.json({ ok: false, message: 'Field wajib kurang. Pastikan: id, grade, category, subcategory, difficulty, gameType, question, options, answer, explanation' }, { status: 400 })
    }
    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json({ ok: false, message: 'Options harus array minimal 2 item' }, { status: 400 })
    }
    if (!options.includes(answer)) {
      return NextResponse.json({ ok: false, message: 'Answer harus salah satu dari options' }, { status: 400 })
    }
    if (!Array.isArray(hints) || hints.length < 1) {
      return NextResponse.json({ ok: false, message: 'Hints harus array minimal 1 item' }, { status: 400 })
    }

    // Check if id already exists
    const existing = await db.question.findUnique({ where: { id } })
    if (existing) {
      return NextResponse.json({ ok: false, message: `Soal dengan id ${id} sudah ada` }, { status: 409 })
    }

    const created = await db.question.create({
      data: {
        id,
        grade: parseInt(grade, 10),
        category,
        subcategory,
        difficulty,
        gameType,
        question,
        story: story || null,
        highlight: highlight ? JSON.stringify(highlight) : null,
        options: JSON.stringify(options),
        answer,
        explanation,
        hints: JSON.stringify(hints),
        xpReward: xpReward ? parseInt(xpReward, 10) : 20,
      },
    })
    return NextResponse.json({ ok: true, item: created })
  } catch (e) {
    return NextResponse.json({ ok: false, message: e instanceof Error ? e.message : 'Gagal membuat soal' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ ok: false, message: 'Tidak terautentikasi' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) {
      return NextResponse.json({ ok: false, message: 'ID wajib untuk update' }, { status: 400 })
    }
    const existing = await db.question.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ ok: false, message: 'Soal tidak ditemukan' }, { status: 404 })
    }

    // Build update data with JSON stringification
    const data: Record<string, unknown> = {}
    if (updates.grade !== undefined) data.grade = parseInt(updates.grade, 10)
    if (updates.category !== undefined) data.category = updates.category
    if (updates.subcategory !== undefined) data.subcategory = updates.subcategory
    if (updates.difficulty !== undefined) data.difficulty = updates.difficulty
    if (updates.gameType !== undefined) data.gameType = updates.gameType
    if (updates.question !== undefined) data.question = updates.question
    if (updates.story !== undefined) data.story = updates.story || null
    if (updates.highlight !== undefined) data.highlight = updates.highlight ? JSON.stringify(updates.highlight) : null
    if (updates.options !== undefined) {
      if (!Array.isArray(updates.options) || !updates.options.includes(updates.answer || existing.answer)) {
        return NextResponse.json({ ok: false, message: 'Options harus array & harus berisi answer' }, { status: 400 })
      }
      data.options = JSON.stringify(updates.options)
    }
    if (updates.answer !== undefined) data.answer = updates.answer
    if (updates.explanation !== undefined) data.explanation = updates.explanation
    if (updates.hints !== undefined) {
      if (!Array.isArray(updates.hints)) {
        return NextResponse.json({ ok: false, message: 'Hints harus array' }, { status: 400 })
      }
      data.hints = JSON.stringify(updates.hints)
    }
    if (updates.xpReward !== undefined) data.xpReward = parseInt(updates.xpReward, 10)

    const updated = await db.question.update({ where: { id }, data })
    return NextResponse.json({ ok: true, item: updated })
  } catch (e) {
    return NextResponse.json({ ok: false, message: e instanceof Error ? e.message : 'Gagal update soal' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ ok: false, message: 'Tidak terautentikasi' }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      const body = await req.json().catch(() => ({}))
      if (!body.id) {
        return NextResponse.json({ ok: false, message: 'ID wajib untuk delete' }, { status: 400 })
      }
      await db.question.delete({ where: { id: body.id } })
      return NextResponse.json({ ok: true })
    }
    await db.question.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, message: e instanceof Error ? e.message : 'Gagal hapus soal' }, { status: 500 })
  }
}
