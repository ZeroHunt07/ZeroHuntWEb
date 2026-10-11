'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Crown,
  Globe2,
  LockKeyhole,
  Menu,
  Shield,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import CursorGrid from '@/components/CursorGrid'
import TechText from '@/components/TechText'
import ItemDetailSidePanel, { type GenericItemData } from '@/components/ItemDetailSidePanel'

/* ─── Types ───────────────────────────────────────────────────────── */

type PageItem = {
  _id?: string
  title: string
  copy: string
  meta: string
  icon?: React.ElementType
  raw?: GenericItemData
}

type PageConfig = {
  eyebrow: string
  section: string
  title: string
  titleAccent: string
  description: string
  ctaLabel: string
  ctaHref: string
  stat1?: { value: string; label: string }
  stat2?: { value: string; label: string }
  stat3?: { value: string; label: string }
  fetchUrl?: string
  mapData?: (data: unknown[]) => PageItem[]
  iconFn?: (i: number) => React.ElementType
}

/* ─── Static page config (layout / copy) ─────────────────────────── */

const PAGE_CONFIG: Record<string, PageConfig> = {
  courses: {
    eyebrow: 'THE ACADEMY / COURSES',
    section: '01 / CHOOSE YOUR PATH',
    title: 'CHOOSE YOUR',
    titleAccent: 'ENTRY POINT.',
    description: 'Build practical security skills through focused lessons, real tools, and hands-on challenges. Each path takes you from zero to capable.',
    ctaLabel: 'START A COURSE',
    ctaHref: '/profile',
    fetchUrl: '/api/courses',
    iconFn: () => LockKeyhole,
    mapData: (data) =>
      (data as (GenericItemData & { _id: string; title: string; description: string; lessons: number; level: string; courseFile?: string; slug?: string })[]).map((c) => ({
        _id: c._id,
        title: c.title,
        copy: c.description,
        meta: `${String(c.lessons || 12).padStart(2, '0')} LESSONS · ${(c.level || 'BEGINNER').toUpperCase()}`,
        raw: {
          ...c,
          type: 'course',
          description: c.description,
          copy: c.description,
          slug: c.slug,
          courseFile: c.courseFile || `/docs/${c.slug || 'cybersecurity-foundations'}.pdf`,
        },
      })),
  },
  academy: {
    eyebrow: 'ZERO HUNT / ACADEMY',
    section: '01 / THE METHOD',
    title: 'TURN CURIOSITY',
    titleAccent: 'INTO CAPABILITY.',
    description: 'A practical path from zero knowledge to real-world confidence. Learn the fundamentals, break things safely, and prove what you know.',
    ctaLabel: 'EXPLORE COURSES',
    ctaHref: '/courses',
    fetchUrl: '/api/settings',
    iconFn: (i) => [BookOpen, Globe2, Sparkles][i] ?? BookOpen,
    mapData: (data) => {
      const s = data[0] as { academyMethods?: { title: string; copy: string }[] }
      return (s?.academyMethods ?? []).map((m, i) => ({
        title: m.title,
        copy: m.copy,
        meta: `0${i + 1} / METHOD`,
        raw: {
          title: m.title,
          copy: m.copy,
          description: m.copy,
          type: 'academy',
          meta: `0${i + 1} / METHOD`,
        },
      }))
    },
  },
  mission: {
    eyebrow: 'ZERO HUNT / MISSION',
    section: '01 / WHY WE EXIST',
    title: 'STAY CURIOUS.',
    titleAccent: 'STAY DANGEROUS.',
    description: 'We make cybersecurity education practical, approachable, and built for the next generation of defenders.',
    ctaLabel: 'JOIN THE HUNT',
    ctaHref: '/profile',
    fetchUrl: '/api/settings',
    iconFn: (i) => [Shield, Target, Globe2][i] ?? Shield,
    mapData: (data) => {
      const s = data[0] as { missionBeliefs?: { title: string; copy: string }[] }
      return (s?.missionBeliefs ?? []).map((b, i) => ({
        title: b.title,
        copy: b.copy,
        meta: `0${i + 1} / BELIEF`,
        raw: {
          title: b.title,
          copy: b.copy,
          description: b.copy,
          type: 'mission',
          meta: `0${i + 1} / BELIEF`,
        },
      }))
    },
  },
  team: {
    eyebrow: 'ZERO HUNT / TEAM',
    section: '01 / THE CREW',
    title: 'THE HUNTERS',
    titleAccent: 'BEHIND THE HUNT.',
    description: 'A small crew of educators, researchers, and builders making security education feel different.',
    ctaLabel: 'JOIN US',
    ctaHref: '/profile',
    fetchUrl: '/api/team',
    iconFn: (i) => [BookOpen, Sparkles, Globe2][i] ?? BookOpen,
    mapData: (data) =>
      (data as { _id: string; name: string; bio: string; role: string }[]).map((m) => ({
        _id: m._id,
        title: m.name,
        copy: m.bio,
        meta: m.role.toUpperCase(),
        raw: {
          _id: m._id,
          title: m.name,
          bio: m.bio,
          description: m.bio,
          copy: m.bio,
          role: m.role,
          type: 'team',
          meta: m.role.toUpperCase(),
        },
      })),
  },
  leaderboard: {
    eyebrow: 'YOUR HUNT / LEADERBOARD',
    section: '01 / TOP HUNTERS',
    title: 'RISE THROUGH',
    titleAccent: 'THE RANKS.',
    description: 'Every lesson, quiz, and challenge moves you closer to the top. The leaderboard updates in real time.',
    ctaLabel: 'CREATE YOUR PROFILE',
    ctaHref: '/profile',
    fetchUrl: '/api/leaderboard?limit=10',
    iconFn: (i) => [Crown, Trophy, Zap][i % 3] ?? Trophy,
    mapData: (data) =>
      (data as { _id: string; username: string; specialty: string; xp: number; rank: number }[]).map((e) => ({
        _id: e._id,
        title: `${String(e.rank).padStart(2, '0')} / ${e.username}`,
        copy: e.specialty,
        meta: `${e.xp.toLocaleString()} XP`,
        raw: {
          _id: e._id,
          title: e.username,
          username: e.username,
          rank: e.rank,
          xp: e.xp,
          specialty: e.specialty,
          copy: e.specialty,
          description: e.specialty,
          type: 'leaderboard',
          meta: `${e.xp.toLocaleString()} XP`,
        },
      })),
    stat1: { value: '#001', label: 'TOP RANK' },
    stat2: { value: '12,840', label: 'MAX XP' },
    stat3: { value: '24K+', label: 'COMPETING' },
  },
  profile: {
    eyebrow: 'YOUR HUNT / PROFILE',
    section: '01 / YOUR STATS',
    title: 'KEEP THE',
    titleAccent: 'STREAK ALIVE.',
    description: 'Track your progress, collect badges, and keep your next challenge in sight.',
    ctaLabel: 'CONTINUE LEARNING',
    ctaHref: '/courses',
    stat1: { value: '2,840', label: 'TOTAL XP' },
    stat2: { value: '#024', label: 'GLOBAL RANK' },
    stat3: { value: '07 DAYS', label: 'STREAK' },
    mapData: () => [
      { title: '2,840 XP Total', copy: "You're in the top 4% of all hunters globally.", meta: '+420 THIS WEEK', icon: Zap },
      { title: '#024 Global Rank', copy: 'Keep your streak alive to move higher.', meta: '↑ 8 PLACES', icon: Trophy },
      { title: '7 Day Streak', copy: 'Next milestone: Recon Runner at 14 days.', meta: 'NEXT: RECON RUNNER', icon: Crown },
    ],
  },
}

/* ─── Scroll reveal ───────────────────────────────────────────────── */

function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target) }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

/* ─── Stats derived from data ─────────────────────────────────────── */

function deriveStats(slug: string, data: PageItem[], config: PageConfig) {
  if (slug === 'courses') {
    return {
      stat1: { value: String(data.length), label: 'PATHS' },
      stat2: { value: String(data.reduce((t, _) => t + 1, 0) * 14), label: 'AVG LESSONS' },
      stat3: { value: '24K+', label: 'HUNTERS' },
    }
  }
  return { stat1: config.stat1, stat2: config.stat2, stat3: config.stat3 }
}

/* ─── Page ─────────────────────────────────────────────────────────── */

export default function HubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [menuOpen, setMenuOpen] = useState(false)
  const [items, setItems] = useState<PageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<GenericItemData | null>(null)
  const [pressedId, setPressedId] = useState<string | null>(null)
  useScrollReveal()

  const config = PAGE_CONFIG[slug]

  /* fetch real data */
  useEffect(() => {
    if (!config?.fetchUrl) { setLoading(false); return }
    fetch(config.fetchUrl)
      .then((r) => r.json())
      .then((data: unknown) => {
        const arr = Array.isArray(data) ? data : [data]
        if (config.mapData) setItems(config.mapData(arr))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug]) // eslint-disable-line

  /* sign-in page */
  if (slug === 'sign-in') {
    return (
      <main className="inner-page">
        <div className="site-cursor-grid" aria-hidden="true">
          <CursorGrid cellSize={88} color="#FF4D5E" radius={220} falloff="smooth" fadeDuration={1200} maxOpacity={0.72} gridOpacity={0.045} fillOpacity={0.035} clickPulse />
        </div>
        <div className="inner-shell" style={{ maxWidth: '28rem', paddingTop: '3rem' }}>
          <Link href="/" className="inner-brand" aria-label="Zero Hunt home">
            <span className="brand-mark"><Shield /></span>ZERO HUNT
          </Link>
          <div className="auth-card" style={{ marginTop: '8vh' }}>
            <p className="inner-kicker">WELCOME BACK, HUNTER</p>
            <h1 className="auth-title">Sign in<br /><span>to continue.</span></h1>
            <form className="auth-form">
              <label>EMAIL<input type="email" placeholder="you@example.com" /></label>
              <label>PASSWORD<input type="password" placeholder="••••••••" /></label>
              <Button type="button" className="bg-[#FF4D5E] font-bold tracking-[.13em] text-[#071007] hover:bg-[#dcff72] w-full mt-2">ENTER ZERO HUNT <ArrowRight data-icon="inline-end" /></Button>
            </form>
            <p className="auth-note">New here? <Link href="/profile">Create your profile</Link></p>
          </div>
        </div>
      </main>
    )
  }

  if (!config) return null

  const displayItems = items.length > 0 ? items : (config.mapData ? [] : [])
  const stats = deriveStats(slug, displayItems, config)

  return (
    <main className="inner-page">
      <div className="site-cursor-grid" aria-hidden="true">
        <CursorGrid cellSize={88} color="#FF4D5E" radius={220} falloff="smooth" fadeDuration={1200} maxOpacity={0.72} gridOpacity={0.045} fillOpacity={0.035} clickPulse />
      </div>
      <div className="inner-ambient" aria-hidden="true">
        <div className="inner-blob inner-blob-a" />
        <div className="inner-blob inner-blob-b" />
      </div>

      <div className="inner-shell">
        {/* header */}
        <header className="inner-header">
          <Link href="/" className="inner-brand" aria-label="Zero Hunt home">
            <span className="brand-mark"><Shield /></span>ZERO HUNT
          </Link>
          <nav className="inner-nav" aria-label="Primary">
            {['academy', 'courses', 'quizzes', 'store', 'leaderboard', 'profile'].map((s) => (
              <Link key={s} href={`/${s}`} className={`inner-nav-link${slug === s ? ' active' : ''}`}>
                {s === 'leaderboard' ? 'RANKS' : s.toUpperCase()}
              </Link>
            ))}
          </nav>
          <div className="inner-header-actions">
            <Link href="/sign-in"><Button variant="ghost" className="hidden text-xs tracking-[.16em] text-white/70 hover:bg-white/10 hover:text-white sm:inline-flex">SIGN IN</Button></Link>
            <Link href="/profile"><Button className="bg-[#FF4D5E] px-5 text-xs font-bold tracking-[.12em] text-[#071007] hover:bg-[#dcff72]">START HUNT <ArrowRight data-icon="inline-end" /></Button></Link>
            <button id={`menu-${slug}`} className="grid size-10 place-items-center rounded-full border border-white/15 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X /> : <Menu />}</button>
          </div>
        </header>

        {menuOpen && (
          <nav className="inner-mobile-menu">
            <Link href="/academy">ACADEMY</Link><Link href="/courses">COURSES</Link><Link href="/quizzes">QUIZZES</Link><Link href="/store">STORE</Link>
            <Link href="/leaderboard">RANKS</Link><Link href="/profile">PROFILE</Link><Link href="/admin" className="opacity-50">ADMIN</Link>
          </nav>
        )}

        {/* hero */}
        <section className="inner-hero">
          <Link href="/" className="inner-back"><ArrowLeft /> BACK HOME</Link>
          <p className="inner-kicker">{config.eyebrow}</p>
          <div className="inner-title-wrap">
            <TechText text={config.title} color="#f2f4ef" accentColor="#FF4D5E" fontSize={92} fontWeight={900} reveal="off" labels={false} draggable={false} sweep speed={0.8} />
          </div>
          <h1 className="inner-title-accent">{config.titleAccent}</h1>
          <div className="inner-hero-bottom">
            <p className="inner-description">{config.description}</p>
            <Link href={config.ctaHref}>
              <Button size="lg" className="bg-[#FF4D5E] px-7 text-sm font-bold tracking-[.12em] text-[#071007] hover:bg-[#dcff72]">{config.ctaLabel} <ArrowRight data-icon="inline-end" /></Button>
            </Link>
          </div>
        </section>

        {/* stats bar */}
        {(stats.stat1 || stats.stat2 || stats.stat3) && (
          <div className="inner-stats scroll-section" data-reveal>
            {[stats.stat1, stats.stat2, stats.stat3].filter(Boolean).map((s) => (
              <div key={s!.label} className="inner-stat">
                <strong>{s!.value}</strong><span>{s!.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* cards */}
        <section className="inner-cards-section scroll-section" data-reveal aria-label={`${config.eyebrow} content`}>
          <p className="inner-section-label">{config.section}</p>
          {loading ? (
            <div className="inner-grid">
              {[1, 2, 3].map((n) => (
                <div key={n} className="inner-card" style={{ opacity: 0.4 }}>
                  <div className="inner-card-top"><div className="inner-card-icon" /><span className="inner-card-num">0{n}</span></div>
                  <div className="inner-card-title" style={{ background: 'rgba(255,255,255,.06)', borderRadius: '4px', height: '2rem', marginTop: '4rem' }} />
                  <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: '4px', height: '4rem', marginTop: '1rem' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="inner-grid">
              {displayItems.map((item, i) => {
                const Icon = item.icon ?? (config.iconFn ? config.iconFn(i) : BookOpen)
                const itemId = item._id ?? item.title
                const isPressed = pressedId === itemId
                return (
                  <article
                    key={itemId}
                    className={`inner-card card-intro cursor-pointer group transition-all duration-300 ${
                      isPressed ? 'is-pressed' : ''
                    }`}
                    onClick={() => {
                      setPressedId(itemId)
                      setTimeout(() => setPressedId(null), 250)
                      setSelectedItem(
                        item.raw || {
                          _id: item._id,
                          title: item.title,
                          copy: item.copy,
                          description: item.copy,
                          type: slug as any,
                          meta: item.meta,
                          courseFile: (item.raw as any)?.courseFile || (slug === 'courses' ? `/docs/${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf` : undefined),
                        }
                      )
                    }}
                  >
                    <div className="inner-card-orb" aria-hidden="true" />
                    <div className="inner-card-top flex items-center justify-between w-full">
                      <div className="flex items-center gap-2.5">
                        <Icon className="inner-card-icon" strokeWidth={1.4} />
                        {/* Apple Liquid Glass Status Pill & Dot */}
                        <div className="liquid-glass-pill flex items-center gap-1.5 px-2.5 py-1 rounded-full">
                          <span className="liquid-glass-dot" />
                          <span className="text-[10px] font-mono tracking-widest text-white/70 uppercase">
                            {item.raw?.level || (slug === 'courses' ? 'ACTIVE' : `PATH 0${i + 1}`)}
                          </span>
                        </div>
                      </div>
                      <span className="inner-card-num">0{i + 1}</span>
                    </div>
                    <h2 className="inner-card-title">{item.title}</h2>
                    <p className="inner-card-copy">{item.copy}</p>
                    <footer className="inner-card-foot flex items-center justify-between">
                      <span>{item.meta}</span>
                      <span className="text-[10px] font-mono text-[#FF4D5E] font-bold opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex items-center gap-1">
                        EXPLORE DETAILS →
                      </span>
                    </footer>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* CTA banner */}
        <section className="inner-cta-banner scroll-section" data-reveal>
          <div className="inner-cta-glow" aria-hidden="true" />
          <div className="inner-cta-content">
            <p className="inner-kicker" style={{ marginBottom: '1rem' }}>THE FIRST STEP IS YOURS</p>
            <h2 className="inner-cta-heading">Stay curious.<br /><span>Stay dangerous.</span></h2>
            <p className="inner-cta-copy">No experience required. Just a healthy suspicion that things could be more secure.</p>
            <Link href="/profile">
              <Button size="lg" className="bg-[#FF4D5E] px-8 font-bold tracking-[.13em] text-[#071007] hover:bg-[#dcff72]">ENTER ZERO HUNT <ArrowRight data-icon="inline-end" /></Button>
            </Link>
          </div>
        </section>

        {/* footer */}
        <footer className="inner-footer">
          <span className="font-mono">© 2026 ZERO HUNT ACADEMY</span>
          <span>BUILT FOR THE NEXT GENERATION OF DEFENDERS</span>
          <span className="text-[#FF4D5E]">SYSTEM STATUS: ONLINE</span>
        </footer>
      </div>

      {/* Universal Detail Side Panel */}
      <ItemDetailSidePanel
        item={selectedItem}
        itemType={slug as any}
        onClose={() => setSelectedItem(null)}
      />
    </main>
  )
}
