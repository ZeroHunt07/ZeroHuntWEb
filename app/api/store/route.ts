import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { StoreItem } from '@/lib/models'

export async function GET(req: Request) {
  await connectDB()
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all') === 'true'
  const query = all ? {} : { active: true }
  const items = await StoreItem.find(query).sort({ creditCost: 1 }).lean()
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const item = await StoreItem.create(body)
  return NextResponse.json(item, { status: 201 })
}
