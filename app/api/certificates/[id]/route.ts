import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Certificate } from '@/lib/models'

// GET /api/certificates/[id] — public verification route by certificateId or _id
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const cert = await Certificate.findOne({
      $or: [{ certificateId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    }).lean()

    if (!cert) {
      return NextResponse.json({ error: 'Certificate record not found or revoked' }, { status: 404 })
    }

    return NextResponse.json(cert)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
