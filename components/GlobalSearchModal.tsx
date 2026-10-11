'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Award,
  BookOpen,
  ChevronRight,
  Flame,
  HelpCircle,
  Search,
  ShoppingBag,
  Sparkles,
  Trophy,
  User,
  X,
  Zap,
} from 'lucide-react'

interface BadgeInfo {
  slug: string
  name: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  description?: string
}

interface UserSearchResult {
  _id: string
  username: string
  displayName: string
  bio: string
  xp: number
  credits: number
  streak: number
  avatarColor: string
  badges: BadgeInfo[]
  completedCount: number
}

interface CourseSearchResult {
  _id: string
  title: string
  slug: string
  description: string
  lessons: number
  level: string
  xpReward: number
}

interface QuizSearchResult {
  _id: string
  title: string
  slug: string
  description: string
  difficulty: string
  xpReward: number
  questionCount: number
}

interface StoreSearchResult {
  _id: string
  name: string
  description: string
  creditCost: number
  icon: string
  type: string
}

interface SearchResults {
  users: UserSearchResult[]
  courses: CourseSearchResult[]
  quizzes: QuizSearchResult[]
  store: StoreSearchResult[]
  total: number
}

const TIER_COLORS: Record<string, string> = {
  bronze: '#d97706',
  silver: '#94a3b8',
  gold: '#fbbf24',
  platinum: '#38bdf8',
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'users' | 'courses' | 'quizzes' | 'store'>('all')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResults>({
    users: [],
    courses: [],
    quizzes: [],
    store: [],
    total: 0,
  })

  // Auto focus on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
      setQuery('')
      setResults({ users: [], courses: [], quizzes: [], store: [], total: 0 })
    }
  }, [isOpen])

  // Keydown esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Automatic debounced live search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], courses: [], quizzes: [], store: [], total: 0 })
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${filterType}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }, 180)

    return () => clearTimeout(timer)
  }, [query, filterType])

  if (!isOpen) return null

  const handleSelectHunter = (username: string) => {
    onClose()
    router.push(`/profile?u=${username}`)
  }

  const handleSelectCourse = () => {
    onClose()
    router.push(`/courses`)
  }

  const handleSelectQuiz = () => {
    onClose()
    router.push(`/quizzes`)
  }

  const handleSelectStore = () => {
    onClose()
    router.push(`/store`)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl border border-white/15 bg-[#0b0f14]/95 shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header / input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <Search size={20} className="text-[#FF4D5E] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hunters, badges, courses, quizzes, items…"
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-white/40 outline-none font-mono tracking-wide"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-white/40 hover:text-white text-xs px-2 py-1 rounded bg-white/5"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white p-1 rounded-lg border border-white/10"
            aria-label="Close search"
          >
            <X size={16} />
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-white/5 bg-black/40 overflow-x-auto text-xs font-mono">
          <span className="text-white/30 text-[11px] uppercase tracking-wider shrink-0">Filter:</span>
          {(
            [
              { id: 'all', label: 'All Things' },
              { id: 'users', label: 'Hunters & Profiles' },
              { id: 'courses', label: 'Courses' },
              { id: 'quizzes', label: 'Quizzes' },
              { id: 'store', label: 'Store Items' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`px-3 py-1 rounded-full transition-all text-xs whitespace-nowrap ${
                filterType === t.id
                  ? 'bg-[#FF4D5E] text-[#071007] font-bold shadow-[0_0_12px_rgba(255,77,94,0.3)]'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
          {loading && (
            <span className="ml-auto text-[11px] text-[#FF4D5E] animate-pulse">Searching…</span>
          )}
        </div>

        {/* Results scroll area */}
        <div className="overflow-y-auto p-5 space-y-6 flex-1 min-h-[220px]">
          {!query.trim() && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-white/40">
              <Search size={36} className="mb-3 text-white/20" />
              <p className="text-sm font-medium text-white/60">Search across all Zero Hunt systems</p>
              <p className="text-xs text-white/30 mt-1 max-w-sm">
                Type hunter usernames, badges, cybersecurity courses, active quizzes, or store assets.
              </p>
            </div>
          )}

          {query.trim() && !loading && results.total === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-white/40">
              <p className="text-sm font-medium text-white/60">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-white/30 mt-1">Try another keyword or change your filter.</p>
            </div>
          )}

          {/* HUNTERS / SOCIAL PROFILES */}
          {results.users.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#FF4D5E] font-bold flex items-center gap-1.5">
                  <User size={13} /> Hunters & Social Profiles ({results.users.length})
                </span>
                <span className="text-[10px] text-white/40 font-mono">Points & Badges Visible</span>
              </div>
              <div className="grid gap-3">
                {results.users.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => handleSelectHunter(u.username)}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-[#FF4D5E]/40 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Avatar */}
                      <div
                        className="size-11 rounded-xl flex items-center justify-center text-sm font-bold text-white uppercase border border-white/20 shadow-inner shrink-0"
                        style={{ backgroundColor: u.avatarColor || '#FF4D5E' }}
                      >
                        {u.username.slice(0, 2)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white group-hover:text-[#FF4D5E] transition-colors">
                            {u.displayName || u.username}
                          </span>
                          <span className="text-xs font-mono text-white/40">@{u.username}</span>
                          {u.streak > 1 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono">
                              <Flame size={10} /> {u.streak}d
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/50 line-clamp-1 mt-0.5">
                          {u.bio || 'Security Researcher'}
                        </p>

                        {/* Badges preview */}
                        {u.badges.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {u.badges.map((b) => (
                              <span
                                key={b.slug}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono border"
                                style={{
                                  backgroundColor: `${TIER_COLORS[b.tier] || '#FF4D5E'}15`,
                                  borderColor: `${TIER_COLORS[b.tier] || '#FF4D5E'}40`,
                                  color: TIER_COLORS[b.tier] || '#FF4D5E',
                                }}
                                title={`${b.name} (${b.tier})`}
                              >
                                <span>{b.icon}</span>
                                <span className="font-semibold">{b.name}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Visible Points (XP & Credits) */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0 shrink-0">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#FF4D5E]">
                        <Zap size={13} />
                        <span>{u.xp.toLocaleString()} XP</span>
                      </div>
                      <div className="text-[11px] font-mono text-amber-400/90 flex items-center gap-1 mt-0.5">
                        <Trophy size={11} />
                        <span>{u.credits} CREDITS</span>
                      </div>
                      <span className="text-[10px] text-white/40 group-hover:text-white flex items-center gap-0.5 mt-1 transition-colors">
                        View Dossier <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COURSES */}
          {results.courses.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#5eead4] font-bold flex items-center gap-1.5">
                  <BookOpen size={13} /> Courses & Paths ({results.courses.length})
                </span>
              </div>
              <div className="grid gap-2.5">
                {results.courses.map((c) => (
                  <div
                    key={c._id}
                    onClick={handleSelectCourse}
                    className="group flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-[#5eead4]/40 transition-all cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-[#5eead4] transition-colors">
                          {c.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/60">
                          {c.level.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 line-clamp-1 mt-0.5">{c.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono text-[#5eead4] font-bold">+{c.xpReward} XP</span>
                      <p className="text-[10px] text-white/40">{c.lessons} Lessons</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUIZZES */}
          {results.quizzes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#a78bfa] font-bold flex items-center gap-1.5">
                  <Sparkles size={13} /> Active Quizzes ({results.quizzes.length})
                </span>
              </div>
              <div className="grid gap-2.5">
                {results.quizzes.map((q) => (
                  <div
                    key={q._id}
                    onClick={handleSelectQuiz}
                    className="group flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-[#a78bfa]/40 transition-all cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-[#a78bfa] transition-colors">
                          {q.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                          {q.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 line-clamp-1 mt-0.5">{q.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono text-[#a78bfa] font-bold">+{q.xpReward} XP</span>
                      <p className="text-[10px] text-white/40">{q.questionCount} Questions</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STORE */}
          {results.store.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#f59e0b] font-bold flex items-center gap-1.5">
                  <ShoppingBag size={13} /> Black Market Items ({results.store.length})
                </span>
              </div>
              <div className="grid gap-2.5">
                {results.store.map((s) => (
                  <div
                    key={s._id}
                    onClick={handleSelectStore}
                    className="group flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-[#f59e0b]/40 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{s.icon}</span>
                      <div>
                        <span className="text-sm font-bold text-white group-hover:text-[#f59e0b] transition-colors">
                          {s.name}
                        </span>
                        <p className="text-xs text-white/50 line-clamp-1 mt-0.5">{s.description}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono text-[#f59e0b] font-bold">🪙 {s.creditCost}</span>
                      <p className="text-[10px] text-white/40 uppercase font-mono">{s.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-white/10 bg-black/40 flex items-center justify-between text-[11px] font-mono text-white/40">
          <span>Search auto-updates as you type</span>
          <div className="flex items-center gap-3">
            <span>ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  )
}
