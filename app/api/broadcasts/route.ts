import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Broadcast } from '@/lib/models'

// GET /api/broadcasts — list broadcasts (active only for users, all if ?all=true)
export async function GET(req: Request) {
  await connectDB()
  const { searchParams } = new URL(req.url)
  const showAll = searchParams.get('all') === 'true'

  const query = showAll ? {} : { active: true }
  const broadcasts = await Broadcast.find(query)
    .sort({ pinned: -1, createdAt: -1 })
    .limit(20)
    .lean()

  return NextResponse.json(broadcasts)
}

// POST /api/broadcasts — create new broadcast (Admin)
export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const { title, message, level, link, linkText, pinned, author } = body

  if (!title || !message) {
    return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })
  }

  const broadcast = await Broadcast.create({
    title,
    message,
    level: level || 'info',
    link: link || '',
    linkText: linkText || 'VIEW INTEL',
    pinned: !!pinned,
    author: author || 'HQ Security Command',
    active: true,
  })

  return NextResponse.json(broadcast, { status: 201 })
}
