import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models'
import { getUserFromRequest, getAdminFromRequest } from '@/lib/auth'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  const user = await User.findById(id, '-passwordHash').lean()
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(user)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params

  // Verify authorization
  const admin = await getAdminFromRequest(req)
  const tokenUser = await getUserFromRequest(req)

  const isOwner = tokenUser && (tokenUser.id === id || tokenUser.username === id)
  const isAdmin = !!admin

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized: You can only edit your own profile' }, { status: 403 })
  }

  const body = await req.json()
  delete body.passwordHash

  // If not admin, sanitize fields to prevent XP/credit tampering
  if (!isAdmin) {
    delete body.xp
    delete body.credits
    delete body.badges
    delete body.completedCourses
    delete body.completedQuizzes
    delete body.ownedItems
    delete body.globalRank
  }

  const user = await User.findByIdAndUpdate(id, body, { new: true }).select('-passwordHash').lean()
  return NextResponse.json(user)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params

  const admin = await getAdminFromRequest(req)
  const tokenUser = await getUserFromRequest(req)

  const isOwner = tokenUser && (tokenUser.id === id || tokenUser.username === id)
  const isAdmin = !!admin

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await User.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}
