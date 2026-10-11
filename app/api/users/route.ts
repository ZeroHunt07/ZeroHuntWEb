import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { User, SiteSettings } from '@/lib/models'
import { getAdminFromRequest, getUserFromRequest } from '@/lib/auth'

// GET /api/users — list or search users
export async function GET(req: Request) {
  await connectDB()
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')
  const search = searchParams.get('search')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

  // Single user lookup by username
  if (username) {
    const user = await User.findOne(
      { username: username.toLowerCase() },
      '-passwordHash'
    ).lean()
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json(user)
  }

  // Filter query
  const query: Record<string, unknown> = {}
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { displayName: { $regex: search, $options: 'i' } },
    ]
  }

  const users = await User.find(query, '-passwordHash').sort({ xp: -1 }).limit(limit).lean()
  return NextResponse.json(users)
}

// POST /api/users — register new user
export async function POST(req: Request) {
  await connectDB()
  const { username, email, password, displayName } = await req.json()

  if (!username || !email || !password)
    return NextResponse.json({ error: 'username, email and password are required' }, { status: 400 })

  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
  const cleanEmail = email.trim().toLowerCase()

  const existing = await User.findOne({ $or: [{ email: cleanEmail }, { username: cleanUsername }] })
  if (existing) return NextResponse.json({ error: 'Username or email already taken' }, { status: 409 })

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
  })

  const { passwordHash: _, ...safe } = user.toObject()
  return NextResponse.json(safe, { status: 201 })
}
