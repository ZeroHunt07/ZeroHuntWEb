import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { LeaderboardEntry, User } from '@/lib/models'

export async function GET(req: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    // Fetch all public users sorted by XP descending
    const users = await User.find(
      { 'settings.publicProfile': { $ne: false } },
      '-passwordHash'
    )
      .sort({ xp: -1, createdAt: 1 })
      .lean()

    if (users.length > 0) {
      // Recalculate dynamic ranks and build fresh leaderboard entries
      const leaderboardData = []

      for (let i = 0; i < users.length; i++) {
        const u = users[i]
        const currentRank = i + 1
        const primaryBadge = u.badges && u.badges.length > 0
          ? u.badges[u.badges.length - 1]
          : 'initiate'
        const specialty = u.bio ? u.bio.slice(0, 80) : 'Security Researcher'

        // Synchronize in LeaderboardEntry collection
        try {
          await LeaderboardEntry.findOneAndUpdate(
            { username: u.username },
            {
              rank: currentRank,
              username: u.username,
              xp: u.xp,
              streak: u.streak || 1,
              badge: primaryBadge,
              specialty,
              userId: u._id.toString(),
            },
            { upsert: true }
          )
        } catch {
          // ignore duplicate key or background sync errors
        }

        leaderboardData.push({
          _id: u._id,
          rank: currentRank,
          username: u.username,
          displayName: u.displayName || u.username,
          xp: u.xp,
          streak: u.streak || 1,
          badge: primaryBadge,
          badges: u.badges || [],
          specialty,
          avatarColor: u.avatarColor || '#FF4D5E',
          lastActive: u.lastActive || u.updatedAt,
        })
      }

      return NextResponse.json(leaderboardData.slice(0, limit), {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      })
    }

    // Fallback if no users in db yet
    const fallbackEntries = await LeaderboardEntry.find()
      .sort({ xp: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json(fallbackEntries, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const entry = await LeaderboardEntry.create(body)
  return NextResponse.json(entry, { status: 201 })
}
