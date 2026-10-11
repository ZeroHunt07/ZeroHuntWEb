import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Badge } from '@/lib/models'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  await Badge.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}
