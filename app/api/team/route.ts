import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { TeamMember } from '@/lib/models'

export async function GET() {
  await connectDB()
  const members = await TeamMember.find().sort({ order: 1 }).lean()
  return NextResponse.json(members)
}

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const member = await TeamMember.create(body)
  return NextResponse.json(member, { status: 201 })
}
