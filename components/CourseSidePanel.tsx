'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Code2,
  ExternalLink,
  FileText,
  Flame,
  Globe2,
  GraduationCap,
  HelpCircle,
  Play,
  Share2,
  Shield,
  Sparkles,
  Trophy,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface CourseData {
  _id?: string
  number?: string
  title: string
  slug?: string
  level?: string
  lessons?: number
  accent?: 'lime' | 'blue' | 'violet'
  description?: string
  longDescription?: string
  tags?: string[]
  enrolledCount?: number
  xpReward?: number
  creditReward?: number
  isPremium?: boolean
  courseFile?: string
}

interface CourseSidePanelProps {
  course: CourseData | null
  onClose: () => void
}

export default function CourseSidePanel({ course, onClose }: CourseSidePanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'syllabus' | 'resources'>('overview')
  const [enrolled, setEnrolled] = useState(false)
  const [activeLesson, setActiveLesson] = useState<number | null>(null)

  const targetCourseFile =
    course?.courseFile ||
    (course?.slug ? `/docs/${course.slug}.pdf` : '/docs/cybersecurity-foundations.pdf')

  useEffect(() => {
    if (!course) return

    const saved = localStorage.getItem(`zh_enrolled_${course.slug || course.title}`)
    setEnrolled(!!saved)
    setActiveLesson(null)
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
  }, [course, onClose])

  if (!course) return null

  const handleEnroll = () => {
    localStorage.setItem(`zh_enrolled_${course.slug || course.title}`, 'true')
    setEnrolled(true)

    // Open file specified in the setting of the course
    if (typeof window !== 'undefined' && targetCourseFile) {
      window.open(targetCourseFile, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="absolute inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-screen max-w-xl border-l border-white/15 bg-[#0a0f0b]/95 p-6 sm:p-8 backdrop-blur-2xl liquid-glass flex flex-col justify-between shadow-2xl transition-all duration-300 overflow-y-auto no-scrollbar">
          <div>
            {/* Top Bar with Liquid Glass Dot */}
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="liquid-glass-pill flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/15">
                  <span className="liquid-glass-dot" />
                  <span className="font-mono text-xs font-bold text-[#FF4D5E] tracking-wider uppercase">
                    PATH {course.number || '01'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-white/50 border border-white/10 px-2 py-0.5 rounded-full">
                  {(course.level || 'BEGINNER').toUpperCase()}
                </span>
                {enrolled && (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
                    <CheckCircle2 size={12} /> ENROLLED
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
                {course.title}
              </h2>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                {course.longDescription || course.description}
              </p>

              {/* Tags */}
              {course.tags && course.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {course.tags.map((tag) => (
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

            {/* Course Specified File Callout */}
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

            {/* Metrics */}
            <div className="mt-6 grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <div>
                <span className="block text-xl font-bold text-white">{course.lessons || 12}</span>
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">LESSONS</span>
              </div>
              <div className="border-x border-white/10">
                <span className="block text-xl font-bold text-[#FF4D5E]">+{course.xpReward || 120}</span>
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">XP REWARD</span>
              </div>
              <div>
                <span className="block text-xl font-bold text-amber-400">🪙 {course.creditReward || 18}</span>
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">CREDITS</span>
              </div>
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
                onClick={() => setActiveTab('syllabus')}
                className={`text-xs font-mono uppercase tracking-wider pb-1 transition-all ${
                  activeTab === 'syllabus'
                    ? 'text-[#FF4D5E] border-b-2 border-[#FF4D5E] font-bold'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                SYLLABUS
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

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-xs font-mono text-[#FF4D5E] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Shield size={14} /> WHAT YOU WILL LEARN
                  </h4>
                  <ul className="text-xs text-white/70 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF4D5E] mt-0.5">•</span>
                      <span>Master defensive architectures and core protocols.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF4D5E] mt-0.5">•</span>
                      <span>Hands-on challenge solutions without hand-holding.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF4D5E] mt-0.5">•</span>
                      <span>Real-world incident simulation and mitigation playbooks.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'syllabus' && (
              <div className="mt-6 space-y-2">
                {Array.from({ length: Math.min(course.lessons || 6, 8) }).map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveLesson(activeLesson === idx ? null : idx)}
                    className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-[#FF4D5E] font-bold">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-xs text-white/80 font-medium">
                        Lesson {idx + 1}: Module Essentials & Practicum
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-white/40" />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="mt-6 space-y-3">
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

                <div className="p-4 rounded-xl bg-gradient-to-r from-[#FF4D5E]/15 via-[#FF4D5E]/5 to-transparent border border-[#FF4D5E]/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-[#FF4D5E]/10 border border-[#FF4D5E]/30 flex items-center justify-center text-[#FF4D5E]">
                      <Award size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Course Certification Exam</h4>
                      <p className="text-xs text-white/50">Score 70%+ to earn official verifiable certificate</p>
                    </div>
                  </div>
                  <Link href={`/quizzes?course=${course.slug || ''}`}>
                    <Button size="sm" className="bg-[#FF4D5E] text-[#071007] hover:bg-[#dcff72] font-mono font-bold text-xs">
                      TAKE EXAM →
                    </Button>
                  </Link>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy size={18} className="text-amber-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Challenge Arena</h4>
                      <p className="text-xs text-white/50">Test skills & earn credits in official quizzes</p>
                    </div>
                  </div>
                  <Link href="/quizzes" className="text-xs font-mono font-bold text-amber-400 hover:underline">
                    VIEW ALL QUIZZES →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Actions */}
          <div className="mt-8 pt-5 border-t border-white/10">
            <Button
              onClick={handleEnroll}
              className={`w-full py-6 font-bold tracking-[.12em] text-xs transition-all active:scale-[0.98] ${
                enrolled
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-black'
                  : 'bg-[#FF4D5E] hover:bg-[#dcff72] text-[#071007]'
              }`}
            >
              {enrolled ? (
                <>
                  <CheckCircle2 size={16} className="mr-2" /> CONTINUE COURSE (LESSON 1)
                </>
              ) : (
                <>
                  <Zap size={16} className="mr-2" /> START COURSE NOW
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>
    </div>
  )
}
