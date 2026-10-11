import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { StoreItem, User } from '@/lib/models'

// GET /api/store/inventory?userId=... — list user's purchased store items with unlocked deliverables
export async function GET(req: Request) {
  await connectDB()
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const user = await User.findById(userId).lean()
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const ownedIds = user.ownedItems || []
  if (ownedIds.length === 0) {
    return NextResponse.json([])
  }

  const items = await StoreItem.find({ _id: { $in: ownedIds } }).lean()
  return NextResponse.json(items)
}
