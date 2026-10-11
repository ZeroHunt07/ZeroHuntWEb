import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models'

// GET /api/users — admin list all users
export async function GET(req: Request) {
  await connectDB()
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '50')
  const users = await User.find({}, '-passwordHash').sort({ xp: -1 }).limit(limit).lean()
  return NextResponse.json(users)
}

// POST /api/users — register new user
export async function POST(req: Request) {
  await connectDB()
  const { username, email, password, displayName } = await req.json()

  if (!username || !email || !password)
    return NextResponse.json({ error: 'username, email and password are required' }, { status: 400 })

  const existing = await User.findOne({ $or: [{ email }, { username }] })
  if (existing) return NextResponse.json({ error: 'Username or email already taken' }, { status: 409 })

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await User.create({ username, email, passwordHash, displayName: displayName || username })
  const { passwordHash: _, ...safe } = user.toObject()
  return NextResponse.json(safe, { status: 201 })
}
