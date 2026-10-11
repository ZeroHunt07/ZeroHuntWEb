import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { StoreItem, User, CreditTransaction } from '@/lib/models'

// POST /api/store/buy — purchase a store item with credits
export async function POST(req: Request) {
  await connectDB()
  const { userId, itemId } = await req.json()

  const [user, item] = await Promise.all([
    User.findById(userId),
    StoreItem.findById(itemId),
  ])

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (!item || !item.active) return NextResponse.json({ error: 'Item not available' }, { status: 404 })
  if (user.ownedItems.includes(itemId)) return NextResponse.json({ error: 'Already owned' }, { status: 409 })
  if (user.credits < item.creditCost) return NextResponse.json({ error: 'Not enough credits' }, { status: 402 })

  user.credits -= item.creditCost
  user.ownedItems.push(itemId)
  await user.save()

  await CreditTransaction.create({
    userId, amount: item.creditCost, type: 'spend',
    reason: `Purchased: ${item.name}`, balanceAfter: user.credits,
  })

  return NextResponse.json({
    ok: true,
    newCredits: user.credits,
    purchasedItem: {
      _id: item._id,
      name: item.name,
      icon: item.icon,
      type: item.type,
      deliverableType: item.deliverableType || 'link',
      deliverableContent: item.deliverableContent || '',
      deliverableLabel: item.deliverableLabel || 'Access Asset',
    },
  })
}
