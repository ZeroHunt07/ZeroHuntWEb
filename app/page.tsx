'use client'

import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
  CirclePlay,
  Code2,
  Globe2,
  Menu,
  Shield,
  Sparkles,
  Trophy,
  X,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import CursorGrid from '@/components/CursorGrid'
import CircularCarousel, { type CircularCarouselItem } from '@/components/CircularCarousel'
import ParticleText from '@/components/ParticleText'
import TechText from '@/components/TechText'
import ItemDetailSidePanel, { type GenericItemData } from '@/components/ItemDetailSidePanel'

/* ─── Types ──────────────────────────────────────────────────────── */

type Course = {
  _id: string
  number: string
  title: string
  slug: string
  level: string
  lessons: number
  accent: 'lime' | 'blue' | 'violet'
  description: string
  enrolledCount: number
  xpReward: number
  isPremium: boolean
  featured: boolean
}

type SiteSettings = {
  hunterCount: number
  challengeCount: number
  badgeCount: number
  academyMethods: { title: string; copy: string }[]
}

/* ─── Scroll reveal hook ─────────────────────────────────────────── */

function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }),
      { threshold: 0.14, rootMargin: '0px 0px -8% 0px' },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

/* ─── Build carousel SVG card ────────────────────────────────────── */

function buildCarouselItem(course: Course): CircularCarouselItem {
  const accentMap = { lime: '#FF4D5E', blue: '#67e8f9', violet: '#c4b5fd' }
  const accent = accentMap[course.accent] ?? '#FF4D5E'
  const title = course.title.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 620"><rect width="900" height="620" fill="#101712"/><circle cx="720" cy="100" r="250" fill="${accent}" opacity=".16"/><path d="M0 520L900 80" stroke="${accent}" stroke-width="2" opacity=".32"/><text x="70" y="110" fill="${accent}" font-family="monospace" font-size="24">/ ${course.number} · ${course.level.toUpperCase()}</text><text x="70" y="300" fill="#f2f4ef" font-family="Arial,sans-serif" font-size="58" font-weight="800">${title}</text><text x="70" y="545" fill="#f2f4ef" opacity=".48" font-family="monospace" font-size="22">${course.lessons} LESSONS · ZERO HUNT</text></svg>`
  return {
    src: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    alt: course.title,
    title: course.title,
    subtitle: `${course.level} · ${course.lessons} lessons`,
  }
}

/* ─── Page ───────────────────────────────────────────────────────── */

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedItem, setSelectedItem] = useState<GenericItemData | null>(null)
  const [settings, setSettings] = useState<SiteSettings>({
    hunterCount: 24000,
    challengeCount: 145,
    badgeCount: 42,
    academyMethods: [
      { title: 'LEARN BY DOING', copy: 'Short lessons, real tools, zero filler.' },
      { title: 'PRACTICE ANYWHERE', copy: 'Curated labs for every stage of your journey.' },
      { title: 'EARN YOUR EDGE', copy: 'Collect XP, unlock perks, rise through the ranks.' },
    ],
  })

  useScrollReveal()

  /* Fetch real data */
  useEffect(() => {
    fetch('/api/courses?featured=true&limit=10')
      .then((r) => r.json())
      .then((data: Course[]) => { if (Array.isArray(data)) setCourses(data) })
      .catch(() => {}) // silently keep empty — carousel just won't show

    fetch('/api/settings')
      .then((r) => r.json())
      .then((data: SiteSettings) => {
        if (data && typeof data.hunterCount === 'number') setSettings(data)
      })
      .catch(() => {})
  }, [])

  const carouselItems: CircularCarouselItem[] = courses.map(buildCarouselItem)

  /* XP total across all courses */
  const totalXP = courses.reduce((t, c) => t + c.xpReward, 0)

  const activities = [
    { label: 'QUIZ COMPLETED', title: 'HTTP Methods', points: '+120 XP', icon: Trophy },
    { label: 'LESSON FINISHED', title: 'Linux Permissions', points: '+60 XP', icon: BookOpen },
    { label: 'NEW RANK', title: 'You moved to #24', points: '↑ 8 PLACES', icon: Zap },
  ]

  const methodIcons = [Code2, Globe2, Sparkles]

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-[#f2f4ef] selection:bg-[#FF4D5E] selection:text-[#081009]">
      <div className="site-cursor-grid" aria-hidden="true">
        <CursorGrid cellSize={88} color="#FF4D5E" radius={220} falloff="smooth" fadeDuration={1200} maxOpacity={0.72} gridOpacity={0.045} fillOpacity={0.035} clickPulse />
      </div>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[780px] overflow-hidden border-b border-white/10">
        <div className="relative mx-auto flex min-h-[780px] max-w-[1440px] flex-col px-6 lg:px-14">
          <header className="flex items-center justify-between border-b border-white/15 py-6">
            <a href="#top" className="flex items-center gap-3" aria-label="Zero Hunt home">
              <span className="grid size-8 place-items-center rounded-full bg-[#FF4D5E] text-[#071007]"><Shield className="size-4" strokeWidth={3} /></span>
              <span className="font-mono text-sm font-bold tracking-[.24em]">ZERO HUNT</span>
            </a>
            <nav className="hidden items-center gap-7 text-[11px] font-semibold tracking-[.2em] text-white/65 md:flex">
              <a href="/academy" className="transition hover:text-[#FF4D5E]">ACADEMY</a>
              <a href="/courses" className="transition hover:text-[#FF4D5E]">COURSES</a>
              <a href="/quizzes" className="transition hover:text-[#FF4D5E]">QUIZZES</a>
              <a href="/store" className="transition hover:text-[#FF4D5E]">STORE</a>
              <a href="/leaderboard" className="transition hover:text-[#FF4D5E]">RANKS</a>
              <a href="/profile" className="transition hover:text-[#FF4D5E]">PROFILE</a>
            </nav>
            <div className="flex items-center gap-3">
              <a href="/sign-in"><Button variant="ghost" className="hidden text-xs tracking-[.16em] text-white/70 hover:bg-white/10 hover:text-white sm:inline-flex">SIGN IN</Button></a>
              <a href="/profile"><Button className="bg-[#FF4D5E] px-5 text-xs font-bold tracking-[.12em] text-[#071007] hover:bg-[#dcff72]">START HUNT <ArrowRight data-icon="inline-end" /></Button></a>
              <button id="home-menu-toggle" className="grid size-10 place-items-center rounded-full border border-white/15 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X /> : <Menu />}</button>
            </div>
          </header>

          {menuOpen && (
            <nav className="absolute inset-x-6 top-20 z-20 flex flex-col gap-5 rounded-2xl border border-white/15 bg-[#0b110d]/95 p-6 text-sm tracking-[.15em] backdrop-blur-xl md:hidden">
              <a href="/academy">ACADEMY</a><a href="/courses">COURSES</a><a href="/quizzes">QUIZZES</a><a href="/store">STORE</a><a href="/leaderboard">RANKS</a><a href="/profile">PROFILE</a><a href="/admin" className="opacity-50">ADMIN PANEL</a>
            </nav>
          )}

          <div id="top" className="flex flex-1 items-center justify-center pb-24 pt-20 text-center lg:pt-12">
            <div className="flex max-w-4xl flex-col items-center">
              <div className="mb-8 flex items-center gap-3 text-[10px] font-bold tracking-[.3em] text-[#FF4D5E]"><span className="h-px w-10 bg-[#FF4D5E]" /> THE CYBERSECURITY ACADEMY</div>
              <div className="hero-particle-title" aria-label="Zero Hunt">
                <ParticleText text="ZERO HUNT" color="#f2f4ef" highlightColor="#FF4D5E" particleSize={2.4} density={4} scatter={260} gatherDuration={1900} stagger={520} pointerRepel={55} repelRadius={150} idleDrift={0.9} trigger="mount" fontSize="clamp(5rem, 14vw, 12rem)" fontWeight={900} fontFamily="Inter, sans-serif" glow />
              </div>
              <p className="mt-10 max-w-md text-base leading-7 text-white/60 lg:text-lg">Cybersecurity is not a spectator sport. Build the skills, sharpen your instincts, and find what others miss.</p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a href="/academy"><Button size="lg" className="bg-white px-7 text-sm font-bold tracking-[.12em] text-[#071007] hover:bg-[#FF4D5E]">EXPLORE THE ACADEMY <ArrowRight data-icon="inline-end" /></Button></a>
                <a href="/mission" className="flex items-center gap-2 px-3 py-3 text-xs font-semibold tracking-[.14em] text-white/70 hover:text-white"><CirclePlay className="size-4 text-[#FF4D5E]" /> HOW IT WORKS</a>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between pb-7 text-[10px] tracking-[.2em] text-white/40">
            <span>SCROLL TO DISCOVER <ChevronDown className="ml-2 inline size-4 animate-bounce" /></span>
            <span className="hidden font-mono sm:block">LAT 51.5072° N / LON 0.1276° W</span>
          </div>
        </div>
      </section>

      {/* ── Academy Section ───────────────────────────────────────── */}
      <section id="academy" data-reveal className="scroll-section mx-auto max-w-[1440px] px-6 py-20 lg:px-14 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:items-end">
          <div>
            <p className="mb-5 text-[10px] font-bold tracking-[.3em] text-[#FF4D5E]">01 / THE ACADEMY</p>
            <div className="tech-heading tech-heading-wide">
              <TechText text="TURN CURIOSITY" color="#f2f4ef" accentColor="#FF4D5E" fontSize={78} fontWeight={800} reveal="off" labels={false} draggable={false} sweep speed={0.8} />
            </div>
            <h2 className="mt-1 text-5xl font-bold uppercase leading-[.9] tracking-[-.06em] text-[#737873] sm:text-7xl">INTO CAPABILITY.</h2>
          </div>
          <div className="max-w-lg justify-self-end">
            <p className="text-lg leading-8 text-white/55">A practical path from zero knowledge to real-world confidence. Learn the fundamentals, break things safely, and prove what you know.</p>
            <div className="mt-8 flex gap-10 border-t border-white/10 pt-5 text-[10px] tracking-[.2em] text-white/40">
              <span><strong className="block text-2xl tracking-normal text-white">{settings.hunterCount >= 1000 ? `${(settings.hunterCount / 1000).toFixed(0)}K+` : settings.hunterCount}</strong> HUNTERS</span>
              <span><strong className="block text-2xl tracking-normal text-white">{settings.challengeCount}</strong> CHALLENGES</span>
              <span><strong className="block text-2xl tracking-normal text-white">{settings.badgeCount}</strong> BADGES</span>
            </div>
          </div>
        </div>
        <div className="mt-20 grid gap-3 md:grid-cols-3">
          {settings.academyMethods.map((method, i) => {
            const Icon = methodIcons[i] ?? Code2
            return (
              <div
                key={method.title}
                className="group rounded-2xl border border-white/10 bg-white/[.035] p-7 transition duration-300 hover:-translate-y-2 hover:border-[#FF4D5E]/40 hover:bg-[#FF4D5E]/[.06] cursor-pointer flex flex-col justify-between"
                onClick={() =>
                  setSelectedItem({
                    title: method.title,
                    copy: method.copy,
                    description: method.copy,
                    type: 'academy',
                    meta: `0${i + 1} / METHOD`,
                  })
                }
              >
                <div>
                  <div className="flex items-start justify-between">
                    <Icon className="size-7 text-[#FF4D5E]" strokeWidth={1.4} />
                    <span className="font-mono text-xs text-white/25">0{i + 1}</span>
                  </div>
                  <h3 className="mt-16 text-sm font-bold tracking-[.16em] group-hover:text-[#FF4D5E] transition-colors">
                    {method.title.toUpperCase()}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/45">{method.copy}</p>
                </div>
                <span className="mt-6 inline-flex items-center gap-1 font-mono text-[10px] text-[#FF4D5E] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  EXPLORE METHODOLOGY →
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Courses / Carousel ────────────────────────────────────── */}
      <section id="courses" data-reveal className="scroll-section border-y border-white/10 bg-transparent px-6 py-28 lg:px-14 lg:py-36">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-5 text-[10px] font-bold tracking-[.3em] text-[#FF4D5E]">02 / FEATURED PATHS</p>
              <div className="tech-heading tech-heading-wide">
                <TechText text="CHOOSE YOUR" color="#f2f4ef" accentColor="#FF4D5E" fontSize={78} fontWeight={800} reveal="off" labels={false} draggable={false} sweep speed={0.8} />
              </div>
              <h2 className="mt-1 text-5xl font-bold uppercase leading-[.9] tracking-[-.06em] text-[#737873] sm:text-7xl">ENTRY POINT.</h2>
            </div>
            <a href="/courses" className="group flex items-center gap-2 pb-2 text-xs font-bold tracking-[.16em] text-white/60 hover:text-white">
              VIEW ALL {courses.length > 0 ? `${courses.length} ` : ''}COURSES <ChevronRight className="size-4 text-[#FF4D5E] transition group-hover:translate-x-1" />
            </a>
          </div>

          {carouselItems.length > 0 ? (
            <div className="course-carousel-shell mt-16" aria-label="Featured course carousel">
              <CircularCarousel
                items={carouselItems}
                preset="orbit"
                intro="assemble"
                autoplay="drift"
                speed={0.18}
                interval={4200}
                cardWidth={310}
                aspectRatio={1.45}
                gap={28}
                tilt={-10}
                perspective={1500}
                draggable
                pauseOnHover={false}
                focusOnClick
                onItemClick={(_item, index) => {
                  if (courses[index]) {
                    const c = courses[index]
                    setSelectedItem({
                      ...c,
                      type: 'course',
                      description: c.description,
                      copy: c.description,
                      courseFile: (c as any).courseFile || `/docs/${(c as any).slug || 'cybersecurity-foundations'}.pdf`,
                    })
                  }
                }}
                captions
                className="course-carousel"
              />
            </div>
          ) : (
            /* Loading skeleton */
            <div className="course-carousel-shell mt-16 flex items-center justify-center">
              <p className="text-[11px] tracking-[.2em] text-white/30 animate-pulse">LOADING COURSES…</p>
            </div>
          )}

          {/* Stats row below carousel */}
          {courses.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-8 border-t border-white/10 pt-8 text-[10px] tracking-[.2em] text-white/40">
              <span><strong className="mr-2 text-base tracking-normal text-white">{courses.length}</strong>PATHS AVAILABLE</span>
              <span><strong className="mr-2 text-base tracking-normal text-white">{courses.reduce((t, c) => t + c.lessons, 0)}</strong>TOTAL LESSONS</span>
              <span><strong className="mr-2 text-base tracking-normal text-white">{totalXP.toLocaleString()}</strong>MAX XP TO EARN</span>
              <span><strong className="mr-2 text-base tracking-normal text-white">{courses.filter(c => !c.isPremium).length}</strong>FREE COURSES</span>
            </div>
          )}
        </div>
      </section>

      {/* ── Dashboard Preview ─────────────────────────────────────── */}
      <section id="dashboard" data-reveal className="scroll-section mx-auto max-w-[1440px] px-6 py-28 lg:px-14 lg:py-36">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.4fr] lg:items-center">
          <div>
            <p className="mb-5 text-[10px] font-bold tracking-[.3em] text-[#FF4D5E]">03 / YOUR HUNT</p>
            <h2 className="text-5xl font-bold uppercase leading-[.9] tracking-[-.06em] sm:text-7xl">Progress<br /><span className="text-[#FF4D5E]">looks good</span><br />on you.</h2>
            <p className="mt-8 max-w-sm text-base leading-7 text-white/50">Every lesson completed and quiz solved moves you closer to the top. Your dashboard keeps the next challenge in sight.</p>
            <Button className="mt-8 bg-[#FF4D5E] font-bold tracking-[.12em] text-[#071007] hover:bg-[#dcff72]">CREATE YOUR PROFILE <ArrowRight data-icon="inline-end" /></Button>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[.045] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-7">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-[10px] tracking-[.18em] text-white/40">GOOD EVENING, HUNTER</p>
                <h3 className="mt-2 text-2xl font-bold tracking-[-.04em]">Keep the streak alive.</h3>
              </div>
              <div className="grid size-11 place-items-center rounded-full border border-[#FF4D5E]/40 bg-[#FF4D5E]/10 text-[#FF4D5E]"><Zap className="size-5" /></div>
            </div>
            <div className="grid gap-3 py-6 sm:grid-cols-3">
              <div className="rounded-xl bg-white/[.06] p-4">
                <p className="text-[10px] tracking-[.16em] text-white/40">TOTAL XP</p>
                <p className="mt-2 text-3xl font-bold">2,840</p>
                <p className="mt-1 text-[10px] text-[#FF4D5E]">+420 THIS WEEK</p>
              </div>
              <div className="rounded-xl bg-white/[.06] p-4">
                <p className="text-[10px] tracking-[.16em] text-white/40">GLOBAL RANK</p>
                <p className="mt-2 text-3xl font-bold">#024</p>
                <p className="mt-1 text-[10px] text-white/40">TOP 4% OF HUNTERS</p>
              </div>
              <div className="rounded-xl bg-[#FF4D5E] p-4 text-[#071007]">
                <p className="text-[10px] font-bold tracking-[.16em] opacity-60">CURRENT STREAK</p>
                <p className="mt-2 text-3xl font-bold">07 DAYS</p>
                <p className="mt-1 text-[10px] font-bold opacity-60">DON&apos;T BREAK IT</p>
              </div>
            </div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-bold tracking-[.18em] text-white/40">RECENT ACTIVITY</p>
              <a href="#" className="text-[10px] tracking-[.15em] text-[#FF4D5E]">VIEW ALL</a>
            </div>
            <div className="flex flex-col gap-2">
              {activities.map(({ label, title, points, icon: Icon }) => (
                <div key={title} className="flex items-center gap-4 rounded-xl border border-white/8 bg-black/10 p-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-white/[.07] text-[#FF4D5E]"><Icon className="size-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] tracking-[.16em] text-white/35">{label}</p>
                    <p className="truncate text-sm font-medium">{title}</p>
                  </div>
                  <span className="font-mono text-[10px] text-[#FF4D5E]">{points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section id="mission" data-reveal className="scroll-section relative overflow-hidden border-t border-white/10 px-6 py-32 text-center lg:py-48">
        <div className="absolute left-1/2 top-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF4D5E]/10 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl">
          <p className="mb-8 text-[10px] font-bold tracking-[.3em] text-[#FF4D5E]">THE FIRST STEP IS YOURS</p>
          <div className="tech-heading tech-heading-centered">
            <TechText text="STAY CURIOUS." color="#f2f4ef" accentColor="#FF4D5E" fontSize={92} fontWeight={900} reveal="off" labels={false} draggable={false} sweep speed={0.8} />
          </div>
          <h2 className="mt-1 text-5xl font-bold uppercase leading-[.9] tracking-[-.06em] text-[#FF4D5E] sm:text-7xl">STAY DANGEROUS.</h2>
          <p className="mx-auto mt-10 max-w-md text-base leading-7 text-white/50">No experience required. Just a healthy suspicion that things could be more secure.</p>
          <Button size="lg" className="mt-10 bg-[#FF4D5E] px-8 font-bold tracking-[.13em] text-[#071007] hover:bg-[#dcff72]">ENTER ZERO HUNT <ArrowRight data-icon="inline-end" /></Button>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1440px] flex-col gap-5 border-t border-white/10 px-6 py-8 text-[10px] tracking-[.16em] text-white/35 sm:flex-row sm:items-center sm:justify-between lg:px-14">
        <span className="font-mono">© 2026 ZERO HUNT ACADEMY</span>
        <span>BUILT FOR THE NEXT GENERATION OF DEFENDERS</span>
        <span className="text-[#FF4D5E]">SYSTEM STATUS: ONLINE</span>
      </footer>

      {/* Universal Detail Side Panel */}
      <ItemDetailSidePanel
        item={selectedItem}
        itemType={selectedItem?.type || 'general'}
        onClose={() => setSelectedItem(null)}
      />
    </main>
  )
}
