import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Quiz } from '@/lib/models'

// GET /api/quiz — list all quizzes (admin sees full questions + answers)
export async function GET(req: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const courseRef = searchParams.get('course')
    const isAdmin = searchParams.get('admin') === 'true'

    const query: Record<string, unknown> = {}
    if (courseRef) query.courseRef = courseRef
    if (!isAdmin) query.active = true

    const projection = isAdmin ? '' : '-questions.correctIndex -questions.explanation'
    const quizzes = await Quiz.find(query, projection).sort({ createdAt: -1 }).lean()
    return NextResponse.json(quizzes)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/quiz — admin: create quiz with questions & option answers
export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()
    if (!body.title) {
      return NextResponse.json({ error: 'Quiz title is required' }, { status: 400 })
    }
    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const quiz = await Quiz.create({ ...body, slug })
    return NextResponse.json(quiz, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
