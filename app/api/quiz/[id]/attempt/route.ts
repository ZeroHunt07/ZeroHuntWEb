import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/db'
import { Quiz, QuizAttempt, User, CreditTransaction, Badge, Course, Certificate } from '@/lib/models'

// POST /api/quiz/[id]/attempt — submit answers, score, award XP + credits, issue certificate
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await params
  const { userId, answers, timeTaken } = await req.json()

  const quiz = await Quiz.findById(id)
  if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })

  const user = await User.findById(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Check already passed
  const alreadyPassed = await QuizAttempt.findOne({ userId, quizId: id, passed: true })

  // Score it
  let correct = 0
  const questionCount = quiz.questions.length
  quiz.questions.forEach((q: { correctIndex: number }, i: number) => {
    if (answers[i] === q.correctIndex) correct++
  })
  const score = questionCount > 0 ? Math.round((correct / questionCount) * 100) : 0
  const passed = score >= quiz.passingScore

  // Certificate issuance if passed and course-linked
  let certificate = null
  if (passed && quiz.courseRef) {
    const course = await Course.findOne({ slug: quiz.courseRef })
    if (course && !user.completedCourses.includes(quiz.courseRef)) {
      user.completedCourses.push(quiz.courseRef)
    }

    let existingCert = await Certificate.findOne({ userId: user._id.toString(), courseSlug: quiz.courseRef })
    const grade = score >= 90 ? 'Distinction' : score >= 80 ? 'Proficient' : 'Certified'

    if (!existingCert) {
      const prefix = (quiz.courseRef.split('-')[0] || 'CERT').substring(0, 4).toUpperCase()
      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase()
      const certificateId = `ZH-CERT-${prefix}-${randomSuffix}`
      const signature = crypto.createHash('sha256').update(`${certificateId}:${user.username}:${score}:${Date.now()}`).digest('hex').substring(0, 24).toUpperCase()

      existingCert = await Certificate.create({
        certificateId,
        userId: user._id.toString(),
        username: user.username,
        userDisplayName: user.displayName || user.username,
        courseSlug: quiz.courseRef,
        courseTitle: course ? course.title : quiz.title,
        quizId: quiz._id.toString(),
        quizTitle: quiz.title,
        score,
        grade,
        issuedAt: new Date(),
        signature,
      })

      if (!user.certificates) user.certificates = []
      if (!user.certificates.includes(certificateId)) {
        user.certificates.push(certificateId)
      }
    } else if (score > existingCert.score) {
      existingCert.score = score
      existingCert.grade = grade
      await existingCert.save()
    }
    certificate = existingCert
  }

  // Award XP + credits only on first pass
  let xpEarned = 0
  let creditsEarned = 0
  if (passed && !alreadyPassed) {
    xpEarned = quiz.xpReward
    creditsEarned = quiz.creditReward
    user.xp += xpEarned
    user.credits += creditsEarned
    if (!user.completedQuizzes.includes(id)) user.completedQuizzes.push(id)

    // Log credit transaction
    await CreditTransaction.create({
      userId, amount: creditsEarned, type: 'earn',
      reason: `Passed quiz: ${quiz.title}`, balanceAfter: user.credits,
    })

    // Check badge conditions
    const quizCount = user.completedQuizzes.length
    const badges = await Badge.find({ condition: 'quiz_count', conditionValue: { $lte: quizCount } })
    for (const badge of badges) {
      if (!user.badges.includes(badge.slug)) {
        user.badges.push(badge.slug)
        user.credits += badge.creditBonus
      }
    }
    const xpBadges = await Badge.find({ condition: 'xp_threshold', conditionValue: { $lte: user.xp } })
    for (const badge of xpBadges) {
      if (!user.badges.includes(badge.slug)) {
        user.badges.push(badge.slug)
        user.credits += badge.creditBonus
      }
    }

    await user.save()
    await Quiz.findByIdAndUpdate(id, { $inc: { attemptCount: 1 } })
  } else {
    if (passed) {
      await user.save()
    }
    await Quiz.findByIdAndUpdate(id, { $inc: { attemptCount: 1 } })
  }

  const attempt = await QuizAttempt.create({
    userId, quizId: id, quizTitle: quiz.title,
    answers, score, passed, xpEarned, creditsEarned, timeTaken,
  })

  return NextResponse.json({
    score, passed, correct, total: questionCount,
    xpEarned, creditsEarned,
    newXP: user.xp, newCredits: user.credits,
    newBadges: user.badges,
    attemptId: attempt._id,
    certificate,
  })
}
