import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { TeamMember } from '@/lib/models'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  const member = await TeamMember.findById(id).lean()
  if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(member)
}

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  const body = await _req.json()
  const member = await TeamMember.findByIdAndUpdate(id, body, { new: true }).lean()
  if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(member)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  await TeamMember.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}
