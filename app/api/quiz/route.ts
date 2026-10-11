import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Quiz, QuizAttempt, User, CreditTransaction, Badge } from '@/lib/models'

// GET /api/quiz — list all quizzes (strip correct answers for public)
export async function GET(req: Request) {
  await connectDB()
  const { searchParams } = new URL(req.url)
  const courseRef = searchParams.get('course')
  const query = courseRef ? { courseRef, active: true } : { active: true }
  const quizzes = await Quiz.find(query, '-questions.correctIndex -questions.explanation').lean()
  return NextResponse.json(quizzes)
}

// POST /api/quiz — admin: create quiz
export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const quiz = await Quiz.create(body)
  return NextResponse.json(quiz, { status: 201 })
}
