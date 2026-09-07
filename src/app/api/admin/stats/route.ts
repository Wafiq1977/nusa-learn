// /api/admin/stats — dashboard stats for admin
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  if (!auth) return false
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
  try {
    // Counts
    const [totalQuestions, totalBadges, totalSessions, totalPlayers] = await Promise.all([
      db.question.count(),
      db.badge.count(),
      db.sessionLog.count(),
      db.player.count(),
    ])

    // By category
    const numerikCount = await db.question.count({ where: { category: 'numerik' } })
    const literasiCount = await db.question.count({ where: { category: 'literasi' } })

    // By grade
    const byGrade = await db.question.groupBy({
      by: ['grade'],
      _count: { id: true },
      orderBy: { grade: 'asc' },
    })

    // By difficulty
    const byDifficulty = await db.question.groupBy({
      by: ['difficulty'],
      _count: { id: true },
    })

    // By subcategory (top 15)
    const bySubcategory = await db.question.groupBy({
      by: ['subcategory'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 15,
    })

    // Recent sessions
    const recentSessions = await db.sessionLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    // Aggregate session stats
    const sessionAgg = await db.sessionLog.aggregate({
      _sum: { correct: true, wrong: true, xpGained: true, starsGained: true },
      _avg: { correct: true, wrong: true },
    })

    // Recent players
    const recentPlayers = await db.player.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: { id: true, name: true, grade: true, xp: true, coins: true, stars: true, updatedAt: true },
    })

    return NextResponse.json({
      ok: true,
      stats: {
        totals: {
          questions: totalQuestions,
          badges: totalBadges,
          sessions: totalSessions,
          players: totalPlayers,
          numerik: numerikCount,
          literasi: literasiCount,
        },
        byGrade: byGrade.map((g) => ({ grade: g.grade, count: g._count.id })),
        byDifficulty: byDifficulty.map((d) => ({ difficulty: d.difficulty, count: d._count.id })),
        bySubcategory: bySubcategory.map((s) => ({ subcategory: s.subcategory, count: s._count.id })),
        recentSessions,
        sessionAgg: {
          sumCorrect: sessionAgg._sum.correct || 0,
          sumWrong: sessionAgg._sum.wrong || 0,
          sumXp: sessionAgg._sum.xpGained || 0,
          sumStars: sessionAgg._sum.starsGained || 0,
          avgCorrect: sessionAgg._avg.correct || 0,
          avgWrong: sessionAgg._avg.wrong || 0,
        },
        recentPlayers,
      },
    })
  } catch (e) {
    return NextResponse.json({ ok: false, message: e instanceof Error ? e.message : 'Gagal memuat stats' }, { status: 500 })
  }
}
