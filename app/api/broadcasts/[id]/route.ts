import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Broadcast } from '@/lib/models'

// PATCH /api/broadcasts/[id] — update broadcast (e.g. toggle active/pinned or edit content)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB()
  const { id } = await params
  const body = await req.json()

  const updated = await Broadcast.findByIdAndUpdate(id, body, { new: true }).lean()
  if (!updated) return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 })

  return NextResponse.json(updated)
}

// DELETE /api/broadcasts/[id] — delete broadcast
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB()
  const { id } = await params

  await Broadcast.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}
