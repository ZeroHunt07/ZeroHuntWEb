'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  Flame,
  Globe2,
  HelpCircle,
  Play,
  Share2,
  Shield,
  Sparkles,
  Trophy,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface GenericItemData {
  _id?: string
  title: string
  slug?: string
  copy?: string
  description?: string
  longDescription?: string
  meta?: string
  type?: 'course' | 'academy' | 'mission' | 'team' | 'leaderboard' | 'quiz' | 'store' | 'general'
  // Course / Quiz properties
  number?: string
  level?: string
  lessons?: number
  xpReward?: number
  creditReward?: number
  enrolledCount?: number
  tags?: string[]
  courseFile?: string
  // Team properties
  role?: string
  category?: string
  bio?: string
  // Leaderboard properties
  rank?: number
  username?: string
  xp?: number
  streak?: number
  specialty?: string
  // Store properties
  creditCost?: number
  stock?: number
  icon?: string
}

interface ItemDetailSidePanelProps {
  item: GenericItemData | null
  itemType?: 'course' | 'academy' | 'mission' | 'team' | 'leaderboard' | 'quiz' | 'store' | 'general'
  onClose: () => void
  onAction?: (item: GenericItemData) => void
}

export default function ItemDetailSidePanel({
  item,
  itemType = 'general',
  onClose,
  onAction,
}: ItemDetailSidePanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'resources'>('overview')
  const [actionDone, setActionDone] = useState(false)

  const resolvedType = item?.type || itemType

  // Determine course file specified in settings or fallback
  const targetCourseFile =
    item?.courseFile ||
    (item as any)?.raw?.courseFile ||
    (item as any)?.fileUrl ||
    (item?.slug ? `/docs/${item.slug}.pdf` : '/docs/cybersecurity-foundations.pdf')

  useEffect(() => {
    if (!item) return

    setActionDone(false)
    setActiveTab('overview')

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'auto'
    }
  }, [item, onClose])

  if (!item) return null

  // Handle Start Course and Actions
  const handlePrimaryAction = () => {
    setActionDone(true)
    if (onAction) onAction(item)

    // When clicking Start Course, open the file specified in the setting of the course
    if (resolvedType === 'course') {
      if (typeof window !== 'undefined' && targetCourseFile) {
        window.open(targetCourseFile, '_blank', 'noopener,noreferrer')
      }
    } else if (resolvedType === 'leaderboard' && item.username) {
      window.location.href = `/profile?u=${item.username}`
    }
  }

  // Type specific details
  let typeLabel = 'SECURITY ARTIFACT'
  let primaryActionLabel = 'ENGAGE NOW'

  if (resolvedType === 'course') {
    typeLabel = 'TRAINING PATH'
    primaryActionLabel = actionDone ? 'CONTINUE COURSE' : 'START COURSE NOW'
  } else if (resolvedType === 'academy') {
    typeLabel = 'ACADEMY METHODOLOGY'
    primaryActionLabel = actionDone ? 'TRAINING INITIALIZED' : 'APPLY THIS METHOD'
  } else if (resolvedType === 'mission') {
    typeLabel = 'MISSION DOCTRINE'
    primaryActionLabel = actionDone ? 'DOCTRINE ADOPTED' : 'COMMIT TO CHARTER'
  } else if (resolvedType === 'team') {
    typeLabel = 'OPERATOR DOSSIER'
    primaryActionLabel = actionDone ? 'COMM LINK ESTABLISHED' : 'CONTACT OPERATOR'
  } else if (resolvedType === 'leaderboard') {
    typeLabel = 'HUNTER TELEMETRY'
    primaryActionLabel = 'VIEW OPERATIVE DOSSIER'
  } else if (resolvedType === 'quiz') {
    typeLabel = 'CHALLENGE ARENA'
    primaryActionLabel = 'LAUNCH QUIZ'
  } else if (resolvedType === 'store') {
    typeLabel = 'ARMORY ASSET'
    primaryActionLabel = 'REDEEM ITEM'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel — Apple UI Liquid Glass Sheet without Scrollbar */}
      <aside
        className="absolute inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-screen max-w-xl border-l border-white/15 bg-[#0a0f0b]/95 p-6 sm:p-8 backdrop-blur-2xl liquid-glass flex flex-col justify-between shadow-2xl transition-all duration-300 overflow-y-auto no-scrollbar transform animate-slideInRight">
          {/* Top Bar */}
          <div>
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                {/* Apple Liquid Glass Status Pill & Dot */}
                <div className="liquid-glass-pill flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/15">
                  <span className="liquid-glass-dot" />
                  <span className="font-mono text-xs font-bold text-[#FF4D5E] tracking-wider uppercase">
                    {typeLabel}
                  </span>
                </div>
                {item.meta && (
                  <span className="text-[11px] font-mono text-white/50 border border-white/10 px-2 py-0.5 rounded-full">
                    {item.meta}
                  </span>
                )}
                {actionDone && (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
                    <CheckCircle2 size={12} /> ACTIVE
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="grid size-9 place-items-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close panel"
              >
                <X size={18} />
              </button>
            </div>

            {/* Title & Description */}
            <div className="mt-6">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                {item.title}
              </h2>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                {item.longDescription || item.description || item.copy || item.bio || 'Comprehensive tactical overview and operational framework.'}
              </p>

              {/* Tags / Badges */}
              {item.tags && item.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-white/50 border border-white/10"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Course Specified File Callout (Apple Glass Banner) */}
            {resolvedType === 'course' && (
              <div className="mt-5 p-3.5 rounded-2xl bg-white/[0.04] border border-[#FF4D5E]/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="liquid-glass-dot" />
                  <div className="min-w-0">
                    <span className="block text-[10px] font-mono uppercase tracking-widest text-white/40">
                      COURSE SPECIFIED FILE
                    </span>
                    <span className="block text-xs font-mono font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                      {targetCourseFile}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined' && targetCourseFile) {
                      window.open(targetCourseFile, '_blank', 'noopener,noreferrer')
                    }
                  }}
                  className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#FF4D5E] hover:text-white bg-[#FF4D5E]/10 hover:bg-[#FF4D5E]/20 px-3 py-1.5 rounded-lg border border-[#FF4D5E]/30 transition-all shrink-0"
                >
                  <ExternalLink size={12} /> OPEN FILE
                </button>
              </div>
            )}

            {/* Dynamic Metric Tiles Matrix */}
            <div className="mt-6 grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              {resolvedType === 'course' ? (
                <>
                  <div>
                    <span className="block text-xl font-bold text-white">{item.lessons || 12}</span>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">LESSONS</span>
                  </div>
                  <div className="border-x border-white/10">
                    <span className="block text-xl font-bold text-[#FF4D5E]">+{item.xpReward || 120}</span>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">XP REWARD</span>
                  </div>
                  <div>
                    <span className="block text-xl font-bold text-amber-400">🪙 {item.creditReward || 18}</span>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">CREDITS</span>
                  </div>
                </>
              ) : resolvedType === 'leaderboard' ? (
                <>
                  <div>
                    <span className="block text-xl font-bold text-[#FF4D5E]">#{String(item.rank || 1).padStart(3, '0')}</span>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">GLOBAL RANK</span>
                  </div>
                  <div className="border-x border-white/10">
                    <span className="block text-xl font-bold text-white">{(item.xp || 10000).toLocaleString()}</span>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">TOTAL XP</span>
                  </div>
                  <div>
                    <span className="block text-xl font-bold text-orange-400">🔥 {item.streak || 7}d</span>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">STREAK</span>
                  </div>
                </>
              ) : resolvedType === 'team' ? (
                <>
                  <div>
                    <span className="block text-xl font-bold text-white">{item.role || 'CORE TEAM'}</span>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">DIVISION</span>
                  </div>
                  <div className="border-x border-white/10">
                    <span className="block text-xl font-bold text-[#FF4D5E]">VERIFIED</span>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">STATUS</span>
                  </div>
                  <div>
                    <span className="block text-xl font-bold text-emerald-400">ACTIVE</span>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">DEPLOYMENT</span>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="block text-xl font-bold text-white">STAGE 01</span>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">PILLAR</span>
                  </div>
                  <div className="border-x border-white/10">
                    <span className="block text-xl font-bold text-[#FF4D5E]">PRACTICAL</span>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">FOCUS</span>
                  </div>
                  <div>
                    <span className="block text-xl font-bold text-emerald-400">100% REAL</span>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">TOOLSET</span>
                  </div>
                </>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="mt-8 flex gap-6 border-b border-white/10 pb-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`text-xs font-mono uppercase tracking-wider pb-1 transition-all ${
                  activeTab === 'overview'
                    ? 'text-[#FF4D5E] border-b-2 border-[#FF4D5E] font-bold'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                OVERVIEW
              </button>
              <button
                onClick={() => setActiveTab('breakdown')}
                className={`text-xs font-mono uppercase tracking-wider pb-1 transition-all ${
                  activeTab === 'breakdown'
                    ? 'text-[#FF4D5E] border-b-2 border-[#FF4D5E] font-bold'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                TACTICAL BREAKDOWN
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`text-xs font-mono uppercase tracking-wider pb-1 transition-all ${
                  activeTab === 'resources'
                    ? 'text-[#FF4D5E] border-b-2 border-[#FF4D5E] font-bold'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                RESOURCES & LABS
              </button>
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-xs font-mono text-[#FF4D5E] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Shield size={14} /> CORE DIRECTIVE & PRINCIPLES
                  </h4>
                  <ul className="text-xs text-white/70 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF4D5E] mt-0.5">•</span>
                      <span>Focused execution using authentic tooling with no artificial safety wheels.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF4D5E] mt-0.5">•</span>
                      <span>Defensive depth built from an intimate understanding of offensive mechanics.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF4D5E] mt-0.5">•</span>
                      <span>Real telemetry recorded directly into the global defender registry.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap size={18} className="text-[#FF4D5E]" />
                    <div>
                      <span className="block text-sm font-bold text-white">Interactive Readiness</span>
                      <span className="text-[10px] font-mono text-white/40">Verified on live security modules</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">READY</span>
                </div>
              </div>
            )}

            {/* Tab: Breakdown */}
            {activeTab === 'breakdown' && (
              <div className="mt-6 space-y-3">
                {[
                  {
                    step: '01',
                    title: 'Intelligence & Scoping',
                    desc: 'Define scope, isolate threat model, and establish secure observation points.',
                  },
                  {
                    step: '02',
                    title: 'Hands-on Execution',
                    desc: 'Execute real tactical workflows in sandboxed security runtime environments.',
                  },
                  {
                    step: '03',
                    title: 'Remediation & Flag Capture',
                    desc: 'Synthesize findings into hardened security controls and capture validation hashes.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#FF4D5E]">
                        PHASE {item.step}
                      </span>
                      <span className="text-[10px] font-mono text-white/30">MANDATORY</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">{item.title}</h4>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Resources (Clean — No Terminal) */}
            {activeTab === 'resources' && (
              <div className="mt-6 space-y-3">
                {/* Official Course File */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-[#FF4D5E]" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Course Syllabus & File</h4>
                      <p className="text-xs text-white/50 font-mono truncate max-w-[200px] sm:max-w-xs">{targetCourseFile}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined' && targetCourseFile) {
                        window.open(targetCourseFile, '_blank', 'noopener,noreferrer')
                      }
                    }}
                    className="text-xs font-mono font-bold text-[#FF4D5E] hover:underline flex items-center gap-1"
                  >
                    OPEN FILE <ExternalLink size={12} />
                  </button>
                </div>

                {resolvedType === 'course' && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#FF4D5E]/15 via-[#FF4D5E]/5 to-transparent border border-[#FF4D5E]/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-[#FF4D5E]/10 border border-[#FF4D5E]/30 flex items-center justify-center text-[#FF4D5E]">
                        <Award size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Course Certification Exam</h4>
                        <p className="text-xs text-white/50">Pass with 70%+ to earn verified accreditation</p>
                      </div>
                    </div>
                    <Link href={`/quizzes?course=${item.slug || ''}`}>
                      <Button size="sm" className="bg-[#FF4D5E] text-[#071007] hover:bg-[#dcff72] font-mono font-bold text-xs">
                        TAKE EXAM →
                      </Button>
                    </Link>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy size={18} className="text-amber-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Challenge Arena</h4>
                      <p className="text-xs text-white/50">Test skills & earn credits in official quizzes</p>
                    </div>
                  </div>
                  <Link href="/quizzes" className="text-xs font-mono font-bold text-amber-400 hover:underline">
                    VIEW QUIZZES →
                  </Link>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe2 size={18} className="text-cyan-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Global Leaderboard</h4>
                      <p className="text-xs text-white/50">Inspect live defender rankings & streaks</p>
                    </div>
                  </div>
                  <Link href="/leaderboard" className="text-xs font-mono font-bold text-cyan-400 hover:underline">
                    RANKS →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Actions */}
          <div className="mt-8 pt-5 border-t border-white/10">
            <Button
              onClick={handlePrimaryAction}
              className={`w-full py-6 font-bold tracking-[.12em] text-xs transition-all active:scale-[0.98] ${
                actionDone
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-black'
                  : 'bg-[#FF4D5E] hover:bg-[#dcff72] text-[#071007]'
              }`}
            >
              {actionDone ? (
                <>
                  <CheckCircle2 size={16} className="mr-2" /> {primaryActionLabel}
                </>
              ) : (
                <>
                  <Zap size={16} className="mr-2" /> {primaryActionLabel}
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>
    </div>
  )
}
