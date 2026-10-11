import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Quiz } from '@/lib/models'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const isAdmin = searchParams.get('admin') === 'true'

    const projection = isAdmin ? '' : '-questions.correctIndex -questions.explanation'
    const quiz = await Quiz.findById(id, projection).lean()
    if (!quiz) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(quiz)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const quiz = await Quiz.findByIdAndUpdate(id, body, { new: true }).lean()
    if (!quiz) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(quiz)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    await Quiz.findByIdAndDelete(id)
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
