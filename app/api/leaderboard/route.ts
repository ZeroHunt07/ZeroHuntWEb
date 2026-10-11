import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { LeaderboardEntry } from '@/lib/models'

export async function GET(req: Request) {
  await connectDB()
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '10')
  const entries = await LeaderboardEntry.find().sort({ xp: -1 }).limit(limit).lean()
  return NextResponse.json(entries)
}

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const entry = await LeaderboardEntry.create(body)
  return NextResponse.json(entry, { status: 201 })
}
