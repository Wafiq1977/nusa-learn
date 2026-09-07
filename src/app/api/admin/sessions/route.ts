// POST /api/admin/sessions — log a session for analytics (called by client when session ends)
// Body: { playerName, grade, area, level, category, correct, wrong, xpGained, starsGained, duration }
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { playerName, grade, area, level, category, correct, wrong, xpGained, starsGained, duration } = body

    if (!playerName || !area || !level) {
      return NextResponse.json({ ok: false, message: 'Field wajib kurang' }, { status: 400 })
    }

    const session = await db.sessionLog.create({
      data: {
        playerName,
        grade: grade ? parseInt(grade, 10) : 1,
        area,
        level,
        category: category || 'numerik',
        correct: correct || 0,
        wrong: wrong || 0,
        xpGained: xpGained || 0,
        starsGained: starsGained || 0,
        duration: duration || 0,
      },
    })
    return NextResponse.json({ ok: true, session })
  } catch (e) {
    return NextResponse.json({ ok: false, message: e instanceof Error ? e.message : 'Gagal log session' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  // Check admin auth
  const auth = req.headers.get('authorization')
  if (!auth) return NextResponse.json({ ok: false, message: 'Tidak terautentikasi' }, { status: 401 })
  const token = auth.replace(/^Bearer\s+/i, '')
  let isAdmin = false
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8')
    isAdmin = decoded.endsWith('-nusa-learn-admin')
  } catch {
    /* ignore */
  }
  if (!isAdmin) return NextResponse.json({ ok: false, message: 'Tidak terautentikasi' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const sessions = await db.sessionLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: Math.min(200, limit),
  })
  return NextResponse.json({ ok: true, sessions })
}
