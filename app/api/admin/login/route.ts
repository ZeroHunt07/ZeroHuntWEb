import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { AdminUser } from '@/lib/models'
import { signToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  await connectDB()
  const { email, password } = await req.json()

  const admin = await AdminUser.findOne({ email })
  if (!admin) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const ok = await bcrypt.compare(password, admin.passwordHash)
  if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const token = await signToken({ id: admin._id.toString(), email: admin.email, name: admin.name })

  const cookieStore = await cookies()
  cookieStore.set('zh_admin', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return NextResponse.json({ ok: true, name: admin.name })
}
