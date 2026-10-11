import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User, Course, Quiz, StoreItem, Badge } from '@/lib/models'

export async function GET(req: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim()
    const type = searchParams.get('type') || 'all' // all | users | courses | quizzes | store

    if (!q) {
      return NextResponse.json({
        users: [],
        courses: [],
        quizzes: [],
        store: [],
        total: 0,
      })
    }

    const regex = new RegExp(q, 'i')

    // Fetch badges dictionary to enrich user profiles
    const badgesList = await Badge.find().lean()
    const badgeMap = new Map(badgesList.map((b) => [b.slug, b]))

    const results: {
      users: Array<Record<string, unknown>>
      courses: Array<Record<string, unknown>>
      quizzes: Array<Record<string, unknown>>
      store: Array<Record<string, unknown>>
      total: number
    } = {
      users: [],
      courses: [],
      quizzes: [],
      store: [],
      total: 0,
    }

    // 1. Search Users (Social profile searches with badges & visible points)
    if (type === 'all' || type === 'users') {
      const users = await User.find(
        {
          'settings.publicProfile': { $ne: false },
          $or: [{ username: regex }, { displayName: regex }, { bio: regex }],
        },
        '-passwordHash'
      )
        .sort({ xp: -1 })
        .limit(15)
        .lean()

      results.users = users.map((u) => {
        const enrichedBadges = (u.badges || []).map((slug: string) => {
          const badgeMeta = badgeMap.get(slug)
          return {
            slug,
            name: badgeMeta?.name || slug.replace(/_/g, ' ').toUpperCase(),
            icon: badgeMeta?.icon || '🏆',
            tier: badgeMeta?.tier || 'bronze',
            description: badgeMeta?.description || '',
          }
        })

        return {
          _id: u._id,
          username: u.username,
          displayName: u.displayName || u.username,
          bio: u.bio || 'Security Researcher',
          xp: u.xp || 0,
          credits: u.credits || 0,
          streak: u.streak || 1,
          avatarColor: u.avatarColor || '#FF4D5E',
          badges: enrichedBadges,
          completedCount: (u.completedCourses?.length || 0) + (u.completedQuizzes?.length || 0),
        }
      })
    }

    // 2. Search Courses
    if (type === 'all' || type === 'courses') {
      const courses = await Course.find(
        { $or: [{ title: regex }, { description: regex }, { tags: { $in: [regex] } }] }
      )
        .limit(10)
        .lean()

      results.courses = courses.map((c) => ({
        _id: c._id,
        title: c.title,
        slug: c.slug,
        description: c.description,
        lessons: c.lessons,
        level: c.level,
        xpReward: c.xpReward,
        creditReward: c.creditReward,
        tags: c.tags,
      }))
    }

    // 3. Search Quizzes
    if (type === 'all' || type === 'quizzes') {
      const quizzes = await Quiz.find(
        { active: true, $or: [{ title: regex }, { description: regex }] },
        '-questions.correctIndex -questions.explanation'
      )
        .limit(10)
        .lean()

      results.quizzes = quizzes.map((q) => ({
        _id: q._id,
        title: q.title,
        slug: q.slug,
        description: q.description,
        difficulty: q.difficulty,
        xpReward: q.xpReward,
        creditReward: q.creditReward,
        questionCount: q.questions?.length || 0,
      }))
    }

    // 4. Search Store
    if (type === 'all' || type === 'store') {
      const storeItems = await StoreItem.find(
        { active: true, $or: [{ name: regex }, { description: regex }, { type: regex }] }
      )
        .limit(10)
        .lean()

      results.store = storeItems.map((s) => ({
        _id: s._id,
        name: s.name,
        description: s.description,
        creditCost: s.creditCost,
        icon: s.icon,
        type: s.type,
      }))
    }

    results.total =
      results.users.length +
      results.courses.length +
      results.quizzes.length +
      results.store.length

    return NextResponse.json(results, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
