// GET /api/badges — returns all badge definitions
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const badges = await db.badge.findMany({ orderBy: { category: 'asc' } })
  return NextResponse.json({ badges })
}
