import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Course } from '@/lib/models'

export async function GET(req: Request) {
  await connectDB()
  const { searchParams } = new URL(req.url)
  const featured = searchParams.get('featured')
  const limit = parseInt(searchParams.get('limit') || '100')

  const query = featured === 'true' ? { featured: true } : {}
  const courses = await Course.find(query)
    .sort({ order: 1 })
    .limit(limit)
    .lean()

  return NextResponse.json(courses)
}

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const course = await Course.create(body)
  return NextResponse.json(course, { status: 201 })
}
