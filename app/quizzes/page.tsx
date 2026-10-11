'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  HelpCircle,
  Menu,
  RotateCcw,
  Search,
  Shield,
  Sparkles,
  Trophy,
  X,
  XCircle,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import CursorGrid from '@/components/CursorGrid'
import TechText from '@/components/TechText'
import ItemDetailSidePanel, { type GenericItemData } from '@/components/ItemDetailSidePanel'
import GlobalSearchModal from '@/components/GlobalSearchModal'
import MorphSlider, { type MorphItem } from '@/components/MorphSlider'
import { CertificateModal, type CertificateData } from '@/components/CertificateModal'

interface Question {
  question: string
  options: string[]
  explanation?: string
}

interface Quiz {
  _id: string
  title: string
  slug: string
  courseRef?: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  questions: Question[]
  xpReward: number
  creditReward: number
  passingScore: number
  timeLimit: number
  attemptCount: number
}

interface UserSummary {
  _id: string
  username: string
  displayName: string
  xp: number
  credits: number
  badges: string[]
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null)
  const [selectedQuizDetail, setSelectedQuizDetail] = useState<GenericItemData | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  
  // Active test user
  const [user, setUser] = useState<UserSummary | null>(null)
  const [viewingCertificate, setViewingCertificate] = useState<CertificateData | null>(null)
  const [userCertificates, setUserCertificates] = useState<CertificateData[]>([])
  
  // Results modal state
  interface AttemptResult {
    score: number
    passed: boolean
    correct: number
    total: number
    xpEarned: number
    creditsEarned: number
    newXP: number
    newCredits: number
    newBadges: string[]
    certificate?: CertificateData | null
  }
  const [result, setResult] = useState<AttemptResult | null>(null)

  useEffect(() => {
    // Load session / active user
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user)
          fetch(`/api/certificates?userId=${data.user._id}`)
            .then((res) => res.json())
            .then((certs) => {
              if (Array.isArray(certs)) setUserCertificates(certs)
            })
            .catch(() => {})
        } else {
          const storedUsername = localStorage.getItem('zh_active_user')
          if (storedUsername) {
            fetch(`/api/users?username=${encodeURIComponent(storedUsername)}`)
              .then((r) => r.json())
              .then((u) => {
                if (u && !u.error) {
                  setUser(u)
                  fetch(`/api/certificates?userId=${u._id}`)
                    .then((res) => res.json())
                    .then((certs) => {
                      if (Array.isArray(certs)) setUserCertificates(certs)
                    })
                    .catch(() => {})
                }
              })
              .catch(() => {})
          }
        }
      })
      .catch(() => {})

    // Load quizzes
    fetch('/api/quiz')
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.quizzes || []
        setQuizzes(list)
        setLoading(false)

        if (typeof window !== 'undefined') {
          const courseParam = new URLSearchParams(window.location.search).get('course')
          if (courseParam) {
            const matched = list.find((q: Quiz) => q.courseRef === courseParam)
            if (matched) {
              setActiveQuiz(matched)
              setSelectedAnswers({})
              setCurrentQuestionIdx(0)
              setResult(null)
            }
          }
        }
      })
      .catch(() => setLoading(false))
  }, [])

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz)
    setSelectedAnswers({})
    setCurrentQuestionIdx(0)
    setResult(null)
  }

  const handleSelectOption = (optIdx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIdx]: optIdx,
    }))
  }

  const submitQuiz = async () => {
    if (!activeQuiz || !user) return
    setSubmitting(true)

    // Build answers array matching question index
    const answersArray = activeQuiz.questions.map((_, i) =>
      selectedAnswers[i] !== undefined ? selectedAnswers[i] : -1
    )

    try {
      const res = await fetch(`/api/quiz/${activeQuiz._id}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          answers: answersArray,
          timeTaken: 60,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
        if (data.certificate) {
          setUserCertificates((prev) => [data.certificate, ...prev.filter((c) => c.certificateId !== data.certificate.certificateId)])
        }
        setUser((prev) =>
          prev
            ? {
                ...prev,
                xp: data.newXP,
                credits: data.newCredits,
                badges: data.newBadges || prev.badges,
              }
            : null
        )
      } else {
        alert(data.error || 'Failed to submit quiz')
      }
    } catch {
      alert('Error communicating with server')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="inner-page">
      <div className="site-cursor-grid" aria-hidden="true">
        <CursorGrid
          cellSize={88}
          color="#FF4D5E"
          radius={220}
          falloff="smooth"
          fadeDuration={1200}
          maxOpacity={0.38}
          gridOpacity={0.035}
          fillOpacity={0.025}
          clickPulse
        />
      </div>

      <div className="inner-ambient" aria-hidden="true">
        <div className="inner-blob inner-blob-a" />
        <div className="inner-blob inner-blob-b" />
      </div>

      <div className="inner-shell">
        {/* Navigation */}
        <header className="inner-header">
          <Link href="/" className="inner-brand" aria-label="Zero Hunt home">
            <span className="brand-mark"><Shield /></span>ZERO HUNT
          </Link>
          <nav className="inner-nav" aria-label="Secondary navigation">
            <Link href="/academy">ACADEMY</Link>
            <Link href="/courses">COURSES</Link>
            <Link href="/quizzes" className="text-[#FF4D5E]">QUIZZES</Link>
            <Link href="/store">STORE</Link>
            <Link href="/leaderboard">RANKS</Link>
            <Link href="/profile">PROFILE</Link>
          </nav>
          <div className="inner-header-actions">
            {user && (
              <div className="hidden sm:flex items-center gap-4 text-xs font-mono">
                <span className="text-white/60">XP: <strong className="text-white">{user.xp.toLocaleString()}</strong></span>
                <span className="text-[#FF4D5E] bg-[#FF4D5E]/10 px-3 py-1 rounded-full border border-[#FF4D5E]/20">
                  🪙 {user.credits} CREDITS
                </span>
              </div>
            )}
            {/* Global Search trigger */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-mono transition-all"
              title="Search hunters, badges, courses..."
            >
              <Search size={13} className="text-[#FF4D5E]" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] rounded bg-white/10 text-white/40">⌘K</kbd>
            </button>
            <Link href="/profile">
              <Button size="sm" className="bg-[#FF4D5E] text-xs font-bold tracking-[.12em] text-[#071007] hover:bg-[#dcff72]">
                MY PROFILE
              </Button>
            </Link>
            <button
              className="grid size-9 place-items-center rounded-full border border-white/15 md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </header>

        {menuOpen && (
          <nav className="inner-mobile-menu">
            <Link href="/academy">ACADEMY</Link>
            <Link href="/courses">COURSES</Link>
            <Link href="/quizzes">QUIZZES</Link>
            <Link href="/store">STORE</Link>
            <Link href="/leaderboard">RANKS</Link>
            <Link href="/profile">PROFILE</Link>
          </nav>
        )}

        {/* Hero Section */}
        <section className="inner-hero">
          <div className="inner-eyebrow">
            <span className="eyebrow-rule" />
            <TechText text="THE ARENA / CHALLENGE QUIZZES" />
          </div>
          <div className="inner-hero-body">
            <p className="inner-section-kicker">01 / TEST YOUR CAPABILITIES</p>
            <h1 className="inner-title">
              PROVE KNOWLEDGE.<br />
              <span className="accent-span">EARN CREDITS.</span>
            </h1>
            <p className="inner-desc">
              Solve real security problem sets. Passing unlocks badges, awards live XP, and grants credits you can redeem for exclusive gear in the armory.
            </p>
            <div className="inner-cta-row">
              <a href="#quiz-list">
                <Button className="bg-[#FF4D5E] px-7 font-bold tracking-[.12em] text-[#071007] hover:bg-[#dcff72]">
                  EXPLORE QUIZZES <ArrowRight data-icon="inline-end" />
                </Button>
              </a>
              <Link href="/store" className="inner-ghost-link">
                VISIT ARMORY STORE <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <aside className="inner-stats liquid-glass">
            <div className="stat-slot">
              <div className="stat-val">{quizzes.length}</div>
              <div className="stat-lbl">ACTIVE QUIZZES</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-slot">
              <div className="stat-val">70%</div>
              <div className="stat-lbl">PASSING BENCHMARK</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-slot">
              <div className="stat-val">+15</div>
              <div className="stat-lbl">CREDITS PER PASS</div>
            </div>
          </aside>
        </section>

        {/* Quiz List */}
        <section id="quiz-list" className="inner-list-section">
          <div className="inner-list-header">
            <h2 className="list-heading">AVAILABLE CHALLENGES ({quizzes.length})</h2>
            <span className="list-counter">LIVE DATABASE</span>
          </div>

          {/* MorphSlider interactive WebGL deck for Quizzes */}
          {quizzes.length > 0 && (() => {
            const quizMorphImages = [
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1600&auto=format&fit=crop',
            ]
            const quizMorphItems: MorphItem[] = quizzes.map((q, i) => ({
              image: quizMorphImages[i % quizMorphImages.length],
              title: q.title,
              subtitle: q.description || 'Test your cybersecurity knowledge and earn live points.',
              badge: `${q.difficulty.toUpperCase()} PROTOCOL · ${q.passingScore}% PASS`,
              meta: `+${q.xpReward} XP · 🪙 ${q.creditReward} CREDITS · ${q.questions.length} QUESTIONS`,
              caption: q.title,
              onClick: () => startQuiz(q),
            }))

            return (
              <div className="mb-10 w-full rounded-2xl overflow-hidden border border-white/15 shadow-[0_0_50px_rgba(255,77,94,0.14)] h-[380px] sm:h-[460px]">
                <MorphSlider
                  items={quizMorphItems}
                  transition="swirl"
                  intensity={0.65}
                  scale={2.4}
                  drift={0.35}
                  autoplay={true}
                  autoplayDelay={5}
                  radius={16}
                  overlayColor="#070c0e"
                  showCaptions={true}
                  showControls={true}
                  showIndicators={true}
                  onCardClick={(_, mItem) => mItem.onClick?.()}
                />
              </div>
            )
          })()}

          {loading ? (
            <div className="text-center py-20 text-white/40 font-mono text-sm">
              CONNECTING TO SECURE ARENA...
            </div>
          ) : (
            <div className="inner-grid">
              {quizzes.map((quiz) => (
                <article
                  key={quiz._id}
                  className="inner-card liquid-glass flex flex-col justify-between cursor-pointer hover:border-[#FF4D5E]/60 transition-all hover:-translate-y-1.5 group"
                  onClick={() => {
                    setSelectedQuizDetail({
                      _id: quiz._id,
                      title: quiz.title,
                      description: quiz.description,
                      copy: quiz.description,
                      type: 'quiz',
                      level: quiz.difficulty,
                      xpReward: quiz.xpReward,
                      creditReward: quiz.creditReward,
                      lessons: quiz.questions.length,
                      meta: `${quiz.difficulty.toUpperCase()} · ${quiz.questions.length} QUESTIONS`,
                    })
                  }}
                >
                  <div>
                    <div className="card-top">
                      <span className="card-icon-shell">
                        <Award size={18} />
                      </span>
                      <div className="flex items-center gap-2">
                        {quiz.courseRef && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FF4D5E]/10 border border-[#FF4D5E]/30 text-[#FF4D5E] font-semibold">
                            ACCREDITATION
                          </span>
                        )}
                        <span className="card-meta">
                          {quiz.difficulty.toUpperCase()} · {quiz.questions.length} QUESTIONS
                        </span>
                      </div>
                    </div>
                    <h3 className="card-title text-xl font-bold mt-4 group-hover:text-[#FF4D5E] transition-colors">{quiz.title}</h3>
                    <p className="card-copy mt-2 text-white/60 text-sm leading-relaxed">
                      {quiz.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-4 text-xs font-mono">
                      <span className="text-[#FF4D5E]">+{quiz.xpReward} XP</span>
                      <span className="text-amber-400">+{quiz.creditReward} CREDITS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const earnedCert = userCertificates.find((c) => c.courseSlug === quiz.courseRef)
                        if (earnedCert) {
                          return (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setViewingCertificate(earnedCert)}
                              className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-xs font-mono gap-1 h-8"
                            >
                              <Award size={12} /> CERTIFIED
                            </Button>
                          )
                        }
                        return null
                      })()}
                      <Button
                        onClick={() => startQuiz(quiz)}
                        className="bg-[#FF4D5E] text-[#071007] font-bold text-xs hover:bg-[#dcff72] h-8"
                      >
                        TAKE QUIZ
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Interactive Quiz Runner Modal */}
        {activeQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-2xl rounded-2xl border border-white/20 bg-[#0d120e] p-6 sm:p-8 liquid-glass max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <span className="text-xs font-mono text-[#FF4D5E] uppercase tracking-wider">
                    {activeQuiz.difficulty} · {activeQuiz.questions.length} QUESTIONS
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1">{activeQuiz.title}</h2>
                </div>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="text-white/50 hover:text-white p-1 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              {!result ? (
                /* Question View */
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-white/50 mb-3">
                    <span>QUESTION {currentQuestionIdx + 1} OF {activeQuiz.questions.length}</span>
                    <span>PASS REQUIREMENT: {activeQuiz.passingScore}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-6">
                    <div
                      className="h-full bg-[#FF4D5E] transition-all duration-300"
                      style={{
                        width: `${((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Current Question */}
                  {activeQuiz.questions[currentQuestionIdx] && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-5 leading-snug">
                        {activeQuiz.questions[currentQuestionIdx].question}
                      </h3>

                      <div className="space-y-3 mb-8">
                        {activeQuiz.questions[currentQuestionIdx].options.map((opt, optIdx) => {
                          const isSelected = selectedAnswers[currentQuestionIdx] === optIdx
                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectOption(optIdx)}
                              className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                                isSelected
                                  ? 'border-[#FF4D5E] bg-[#FF4D5E]/15 text-white font-medium'
                                  : 'border-white/10 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10'
                              }`}
                            >
                              <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-mono ${
                                  isSelected
                                    ? 'border-[#FF4D5E] bg-[#FF4D5E] text-[#071007] font-bold'
                                    : 'border-white/30 text-white/60'
                                }`}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </button>
                          )
                        })}
                      </div>

                      {/* Navigation buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <Button
                          variant="ghost"
                          disabled={currentQuestionIdx === 0}
                          onClick={() => setCurrentQuestionIdx((p) => p - 1)}
                          className="text-xs text-white/60 hover:text-white"
                        >
                          <ArrowLeft size={14} className="mr-1" /> PREVIOUS
                        </Button>

                        {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
                          <Button
                            onClick={() => setCurrentQuestionIdx((p) => p + 1)}
                            className="bg-white/10 text-white hover:bg-white/20 text-xs font-semibold"
                          >
                            NEXT QUESTION <ArrowRight size={14} className="ml-1" />
                          </Button>
                        ) : (
                          <Button
                            disabled={submitting}
                            onClick={submitQuiz}
                            className="bg-[#FF4D5E] text-[#071007] hover:bg-[#dcff72] text-xs font-bold px-6"
                          >
                            {submitting ? 'EVALUATING...' : 'SUBMIT QUIZ'}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Results View */
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center size-20 rounded-full mb-4 bg-white/5 border border-white/10">
                    {result.passed ? (
                      <Trophy className="size-10 text-[#FF4D5E]" />
                    ) : (
                      <XCircle className="size-10 text-red-400" />
                    )}
                  </div>

                  <h3 className="text-2xl font-black text-white">
                    {result.passed ? 'MISSION ACCOMPLISHED!' : 'REQUIREMENT NOT MET'}
                  </h3>
                  <p className="text-sm text-white/60 mt-1">
                    {result.passed
                      ? `You scored ${result.score}% (${result.correct}/${result.total} correct).`
                      : `You scored ${result.score}%. Minimum passing is ${activeQuiz.passingScore}%.`}
                  </p>

                  {/* Rewards summary */}
                  {result.passed && (
                    <div className="my-6 grid grid-cols-2 gap-4 max-w-sm mx-auto">
                      <div className="p-3 rounded-xl bg-[#FF4D5E]/10 border border-[#FF4D5E]/20 text-center">
                        <div className="text-2xl font-black text-[#FF4D5E]">+{result.xpEarned}</div>
                        <div className="text-[10px] font-mono text-white/50 tracking-wider">XP REWARD</div>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-center">
                        <div className="text-2xl font-black text-amber-400">+{result.creditsEarned}</div>
                        <div className="text-[10px] font-mono text-white/50 tracking-wider">CREDITS ADDED</div>
                      </div>
                    </div>
                  )}

                  {/* Certificate celebration banner */}
                  {result.certificate && (
                    <div className="my-6 p-4 rounded-xl bg-gradient-to-r from-[#FF4D5E]/20 via-[#FF4D5E]/10 to-transparent border border-[#FF4D5E]/40 text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="size-11 rounded-lg bg-[#FF4D5E] text-[#071007] flex items-center justify-center font-bold shrink-0">
                            <Award size={24} />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono tracking-widest text-[#FF4D5E] uppercase block font-bold">
                              CERTIFICATE OF COMPLETION AWARDED!
                            </span>
                            <h4 className="text-sm font-bold text-white">
                              {result.certificate.courseTitle}
                            </h4>
                            <span className="text-[11px] font-mono text-white/50">
                              ID: {result.certificate.certificateId} • Grade: {result.certificate.grade}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => setViewingCertificate(result.certificate || null)}
                          className="bg-[#FF4D5E] text-[#071007] hover:bg-[#dcff72] text-xs font-mono font-bold shrink-0 gap-1.5"
                        >
                          <Award size={13} /> VIEW CREDENTIAL
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Badges won */}
                  {result.newBadges && result.newBadges.length > 0 && (
                    <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-xs font-mono text-[#FF4D5E] mb-2 flex items-center justify-center gap-2">
                        <Sparkles size={14} /> NEW BADGES UNLOCKED!
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {result.newBadges.map((b) => (
                          <span
                            key={b}
                            className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20 font-bold uppercase tracking-wider"
                          >
                            🏅 {b.replace(/-/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center gap-4 mt-6">
                    <Button
                      onClick={() => {
                        setSelectedAnswers({})
                        setCurrentQuestionIdx(0)
                        setResult(null)
                      }}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 text-xs"
                    >
                      <RotateCcw size={14} className="mr-1" /> RETRY
                    </Button>
                    <Link href="/store">
                      <Button className="bg-[#FF4D5E] text-[#071007] hover:bg-[#dcff72] text-xs font-bold">
                        SPEND CREDITS IN STORE <ArrowRight size={14} className="ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="inner-footer">
          <p className="inner-footer-copy">© 2026 ZERO HUNT ACADEMY. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <Link href="/courses" className="inner-footer-link">COURSES</Link>
            <Link href="/store" className="inner-footer-link">ARMORY STORE</Link>
            <Link href="/leaderboard" className="inner-footer-link">LEADERBOARD</Link>
            <Link href="/admin" className="inner-footer-link opacity-50 hover:opacity-100">ADMIN</Link>
          </div>
        </footer>
      </div>

      {/* Challenge Quiz Side Panel */}
      <ItemDetailSidePanel
        item={selectedQuizDetail}
        itemType="quiz"
        onClose={() => setSelectedQuizDetail(null)}
        onAction={(itm) => {
          const raw = quizzes.find((q) => q._id === itm._id)
          if (raw) {
            setSelectedQuizDetail(null)
            startQuiz(raw)
          }
        }}
      />
      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      {/* Verified Certificate Modal */}
      <CertificateModal
        certificate={viewingCertificate}
        isOpen={!!viewingCertificate}
        onClose={() => setViewingCertificate(null)}
      />
    </main>
  )
}
