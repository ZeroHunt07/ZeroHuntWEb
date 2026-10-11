import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { SiteSettings } from '@/lib/models'

export async function GET() {
  await connectDB()
  const settings = await SiteSettings.findOne({ key: 'global' }).lean()
  return NextResponse.json(settings ?? {})
}

export async function PATCH(req: Request) {
  await connectDB()
  const body = await req.json()
  const settings = await SiteSettings.findOneAndUpdate(
    { key: 'global' },
    body,
    { new: true, upsert: true },
  ).lean()
  return NextResponse.json(settings)
}
