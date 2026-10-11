import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Badge } from '@/lib/models'

export async function GET() {
  await connectDB()
  const badges = await Badge.find().sort({ tier: 1, conditionValue: 1 }).lean()
  return NextResponse.json(badges)
}

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const badge = await Badge.create(body)
  return NextResponse.json(badge, { status: 201 })
}
