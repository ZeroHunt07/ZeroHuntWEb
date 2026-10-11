import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { StoreItem } from '@/lib/models'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  const body = await req.json()
  const item = await StoreItem.findByIdAndUpdate(id, body, { new: true }).lean()
  return NextResponse.json(item)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  await StoreItem.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}
