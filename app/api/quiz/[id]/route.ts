import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Quiz } from '@/lib/models'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  // Public: strip answers
  const quiz = await Quiz.findById(id, '-questions.correctIndex -questions.explanation').lean()
  if (!quiz) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(quiz)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  const body = await req.json()
  const quiz = await Quiz.findByIdAndUpdate(id, body, { new: true }).lean()
  return NextResponse.json(quiz)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  await Quiz.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}
