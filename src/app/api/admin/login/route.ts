// POST /api/admin/login — simple password check
// Body: { password: string }
// Returns: { ok: true, token: string } if correct; { ok: false } if wrong
//
// Default password: "nusa-admin" (can be overridden via ADMIN_PASSWORD env var)
// For demo purposes only — in production use proper auth (NextAuth, JWT, etc.)

import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'nusa-admin'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    if (password === ADMIN_PASSWORD) {
      // Simple token: base64 of timestamp + secret (not real security, demo only)
      const token = Buffer.from(`${Date.now()}-nusa-learn-admin`).toString('base64')
      return NextResponse.json({ ok: true, token, message: 'Login berhasil' })
    }
    return NextResponse.json({ ok: false, message: 'Password salah' }, { status: 401 })
  } catch {
    return NextResponse.json({ ok: false, message: 'Permintaan tidak valid' }, { status: 400 })
  }
}
