import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const tokenUser = await getUserFromRequest(req)
    if (!tokenUser || !tokenUser.id) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 })
    }

    await connectDB()
    const user = await User.findById(tokenUser.id, '-passwordHash').lean()
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 })
    }

    return NextResponse.json({ authenticated: true, user })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
