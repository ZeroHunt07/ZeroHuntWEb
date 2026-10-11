import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { LeaderboardEntry } from '@/lib/models'

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  const body = await _req.json()
  const entry = await LeaderboardEntry.findByIdAndUpdate(id, body, { new: true }).lean()
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(entry)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  await LeaderboardEntry.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}
