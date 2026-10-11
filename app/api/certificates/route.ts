import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Certificate, User } from '@/lib/models'

// GET /api/certificates — fetch certificates by username, userId, or id
export async function GET(req: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const certificateId = searchParams.get('id')
    const username = searchParams.get('username')
    const userId = searchParams.get('userId')
    const course = searchParams.get('course')

    if (certificateId) {
      const cert = await Certificate.findOne({ certificateId }).lean()
      if (!cert) return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
      return NextResponse.json(cert)
    }

    const query: Record<string, unknown> = {}
    if (userId) {
      query.userId = userId
    } else if (username) {
      const u = await User.findOne({ username }).lean()
      if (u) {
        query.userId = u._id.toString()
      } else {
        query.username = username
      }
    }
    if (course) query.courseSlug = course

    const certs = await Certificate.find(query).sort({ issuedAt: -1 }).lean()
    return NextResponse.json(certs)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
