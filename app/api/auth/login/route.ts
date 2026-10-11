import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models'
import { signToken } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()
    const identifier = (body.identifier || body.email || body.username || '').trim().toLowerCase()
    const password = body.password || ''

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Username/email and password are required' }, { status: 400 })
    }

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Update lastActive
    user.lastActive = new Date()
    await user.save()

    const token = await signToken({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    })

    const cookieStore = await cookies()
    cookieStore.set('zh_user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    const { passwordHash: _, ...safeUser } = user.toObject()

    return NextResponse.json({
      ok: true,
      token,
      user: safeUser,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
