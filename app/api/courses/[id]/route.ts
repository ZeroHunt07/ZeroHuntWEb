import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Course } from '@/lib/models'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  const course = await Course.findById(id).lean()
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(course)
}

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  const body = await _req.json()
  const course = await Course.findByIdAndUpdate(id, body, { new: true }).lean()
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(course)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  await Course.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}
