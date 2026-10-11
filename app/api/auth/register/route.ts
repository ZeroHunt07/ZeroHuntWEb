import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { connectDB } from '@/lib/db'
import { User, SiteSettings } from '@/lib/models'
import { signToken } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    await connectDB()
    const { username, email, password, displayName } = await req.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Username, email and password are required' }, { status: 400 })
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
    const cleanEmail = email.trim().toLowerCase()

    if (cleanUsername.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const existing = await User.findOne({
      $or: [{ username: cleanUsername }, { email: cleanEmail }],
    })

    if (existing) {
      return NextResponse.json({ error: 'Username or email already taken' }, { status: 409 })
    }

    // Default settings
    const settings = await SiteSettings.findOne({ key: 'global' }).lean()
    const initialCredits = settings?.defaultUserCredits ?? 120
    const initialXp = settings?.defaultUserXp ?? 500

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      displayName: displayName?.trim() || cleanUsername,
      xp: initialXp,
      credits: initialCredits,
      streak: 1,
      badges: ['initiate'],
      completedCourses: [],
      completedQuizzes: [],
      ownedItems: [],
      settings: {
        emailNotifications: true,
        publicProfile: true,
        theme: 'dark',
      },
    })

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
    }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
