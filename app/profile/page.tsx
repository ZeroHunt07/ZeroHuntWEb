'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Award,
  ChevronRight,
  ExternalLink,
  Flame,
  Globe2,
  Lock,
  LogIn,
  Menu,
  Save,
  Search,
  Shield,
  Trophy,
  User,
  UserCheck,
  UserPlus,
  X,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import CursorGrid from '@/components/CursorGrid'
import TechText from '@/components/TechText'
import ItemDetailSidePanel, { type GenericItemData } from '@/components/ItemDetailSidePanel'
import GlobalSearchModal from '@/components/GlobalSearchModal'
import { CertificateModal, type CertificateData } from '@/components/CertificateModal'

interface Badge {
  _id: string
  name: string
  slug: string
  description: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  condition: string
  conditionValue: number
  creditBonus: number
}

interface UserProfile {
  _id: string
  username: string
  email?: string
  displayName: string
  bio: string
  avatarColor: string
  xp: number
  credits: number
  globalRank: number
  streak: number
  badges: string[]
  completedCourses: string[]
  completedQuizzes: string[]
  ownedItems: string[]
  settings?: {
    emailNotifications: boolean
    publicProfile: boolean
    theme: string
  }
}

const TIER_COLORS = {
  bronze: '#d97706',
  silver: '#94a3b8',
  gold: '#fbbf24',
  platinum: '#38bdf8',
}

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const viewUsername = searchParams.get('u')

  const [sessionUser, setSessionUser] = useState<UserProfile | null>(null)
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null)
  const [allBadges, setAllBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedBadgeDetail, setSelectedBadgeDetail] = useState<GenericItemData | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'certificates' | 'badges' | 'settings'>('overview')
  const [userCertificates, setUserCertificates] = useState<CertificateData[]>([])
  const [viewingCertificate, setViewingCertificate] = useState<CertificateData | null>(null)

  // Edit form state (only for own profile)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [publicProfile, setPublicProfile] = useState(true)

  // Auth gate state (for unauthenticated visitors)
  const [authMode, setAuthMode] = useState<'gate' | 'signin' | 'signup'>('gate')
  const [signupData, setSignupData] = useState({ username: '', email: '', password: '', displayName: '' })
  const [signinIdentifier, setSigninIdentifier] = useState('')
  const [signinPassword, setSigninPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authWorking, setAuthWorking] = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Load session & profile data
  const loadProfile = async () => {
    setLoading(true)
    try {
      // 1. Fetch current session from /api/auth/me
      let authedUser: UserProfile | null = null
      try {
        const meRes = await fetch('/api/auth/me')
        if (meRes.ok) {
          const meData = await meRes.json()
          if (meData.authenticated && meData.user) {
            authedUser = meData.user
            setSessionUser(authedUser)
          }
        }
      } catch {
        // ignore
      }

      // If no session from cookie, check localStorage backup
      if (!authedUser) {
        const savedUsername = localStorage.getItem('zh_active_user')
        if (savedUsername) {
          try {
            const userRes = await fetch(`/api/users?username=${encodeURIComponent(savedUsername)}`)
            if (userRes.ok) {
              const u = await userRes.json()
              authedUser = u
              setSessionUser(u)
            }
          } catch {
            // ignore
          }
        }
      }

      // 2. Fetch badges dictionary
      const badgesRes = await fetch('/api/badges').then((r) => r.json()).catch(() => [])
      if (Array.isArray(badgesRes)) setAllBadges(badgesRes)

      // 3. Determine which user's profile to display
      let displayedUser: UserProfile | null = null
      if (viewUsername) {
        // Viewing someone else's public dossier
        const targetRes = await fetch(`/api/users?username=${encodeURIComponent(viewUsername)}`)
        if (targetRes.ok) {
          const target = await targetRes.json()
          displayedUser = target
          setProfileUser(target)
          setActiveTab('overview')
        } else {
          showToast(`Hunter @${viewUsername} not found.`)
          displayedUser = authedUser
          setProfileUser(authedUser)
        }
      } else {
        // Viewing own profile
        displayedUser = authedUser
        setProfileUser(authedUser)
        if (authedUser) {
          setDisplayName(authedUser.displayName || authedUser.username)
          setBio(authedUser.bio || '')
          setNotifications(authedUser.settings?.emailNotifications ?? true)
          setPublicProfile(authedUser.settings?.publicProfile ?? true)
        }
      }

      // 4. Fetch user's verified certificates
      if (displayedUser?._id) {
        try {
          const certRes = await fetch(`/api/certificates?userId=${displayedUser._id}`)
          if (certRes.ok) {
            const certs = await certRes.json()
            if (Array.isArray(certs)) setUserCertificates(certs)
          }
        } catch {
          // ignore
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [viewUsername]) // eslint-disable-line

  // Sign up handler with secure bcrypt hashing
  const handleSignup = async () => {
    if (!signupData.username || !signupData.email || !signupData.password) {
      setAuthError('Username, email and password are required.')
      return
    }
    setAuthWorking(true)
    setAuthError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: signupData.username.toLowerCase().replace(/\s+/g, '_'),
          email: signupData.email,
          password: signupData.password,
          displayName: signupData.displayName || signupData.username,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        localStorage.setItem('zh_active_user', data.user.username)
        setSessionUser(data.user)
        setProfileUser(data.user)
        setDisplayName(data.user.displayName || data.user.username)
        setBio(data.user.bio || '')
        setSignupData({ username: '', email: '', password: '', displayName: '' })
        showToast('✅ Welcome to Zero Hunt! Your dossier is live.')
      } else {
        const err = await res.json()
        setAuthError(err.error || 'Registration failed.')
      }
    } catch {
      setAuthError('Network error. Please try again.')
    } finally {
      setAuthWorking(false)
    }
  }

  // Sign in handler with real credentials verification
  const handleSignin = async () => {
    setAuthError('')
    const identifier = signinIdentifier.trim()
    if (!identifier || !signinPassword) {
      setAuthError('Enter your username/email and password.')
      return
    }
    setAuthWorking(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password: signinPassword }),
      })
      if (res.ok) {
        const data = await res.json()
        localStorage.setItem('zh_active_user', data.user.username)
        setSessionUser(data.user)
        setProfileUser(data.user)
        setDisplayName(data.user.displayName || data.user.username)
        setBio(data.user.bio || '')
        setNotifications(data.user.settings?.emailNotifications ?? true)
        setPublicProfile(data.user.settings?.publicProfile ?? true)
        setSigninIdentifier('')
        setSigninPassword('')
        showToast(`✅ Welcome back, @${data.user.username}!`)
      } else {
        const err = await res.json()
        setAuthError(err.error || 'Invalid username or password.')
      }
    } catch {
      setAuthError('Network error during authentication.')
    } finally {
      setAuthWorking(false)
    }
  }

  // Sign out handler
  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    localStorage.removeItem('zh_active_user')
    setSessionUser(null)
    setProfileUser(null)
    setAuthMode('gate')
    showToast('Signed out successfully.')
    router.push('/profile')
  }

  // Save settings handler (only allowed for own profile)
  const saveSettings = async () => {
    if (!sessionUser || !isOwnProfile) return
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${sessionUser._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          bio,
          settings: {
            emailNotifications: notifications,
            publicProfile,
            theme: sessionUser.settings?.theme || 'dark',
          },
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setSessionUser(updated)
        setProfileUser(updated)
        showToast('✅ Profile dossier updated successfully!')
      } else {
        const err = await res.json()
        showToast(`❌ Failed to update: ${err.error || 'Forbidden'}`)
      }
    } catch {
      showToast('❌ Network error updating profile')
    } finally {
      setSaving(false)
    }
  }

  const isOwnProfile = !!(
    sessionUser &&
    profileUser &&
    sessionUser.username === profileUser.username
  )

  const isViewingOther = !!(
    profileUser &&
    (!sessionUser || sessionUser.username !== profileUser.username)
  )

  const currentLevel = profileUser ? Math.floor(profileUser.xp / 1000) + 1 : 1
  const levelProgress = profileUser ? ((profileUser.xp % 1000) / 1000) * 100 : 0

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

      {toast && <div className="admin-toast">{toast}</div>}

      <div className="inner-shell">
        {/* ── Navigation ─────────────────────────────────────────── */}
        <header className="inner-header">
          <Link href="/" className="inner-brand" aria-label="Zero Hunt home">
            <span className="brand-mark"><Shield /></span>ZERO HUNT
          </Link>
          <nav className="inner-nav" aria-label="Secondary navigation">
            <Link href="/academy">ACADEMY</Link>
            <Link href="/courses">COURSES</Link>
            <Link href="/quizzes">QUIZZES</Link>
            <Link href="/store">STORE</Link>
            <Link href="/leaderboard">RANKS</Link>
            <Link href="/profile" className="text-[#FF4D5E]">PROFILE</Link>
          </nav>
          <div className="inner-header-actions">
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

            {sessionUser && (
              <button
                onClick={signOut}
                className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-white/50 hover:text-white border border-white/10 hover:border-white/25 rounded-lg px-3 py-1.5 transition-all tracking-widest"
              >
                SIGN OUT
              </button>
            )}

            {!sessionUser && (
              <Link href="/sign-in">
                <Button className="hidden sm:inline-flex bg-[#FF4D5E] text-[#071007] font-bold text-xs hover:bg-[#dcff72]">
                  SIGN IN
                </Button>
              </Link>
            )}

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
            <button
              onClick={() => {
                setMenuOpen(false)
                setSearchModalOpen(true)
              }}
              className="text-left text-xs font-mono text-[#FF4D5E] py-2"
            >
              🔍 SEARCH EVERYTHING
            </button>
          </nav>
        )}

        {/* ── LOADING ────────────────────────────────────────────── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="size-10 border-2 border-[#FF4D5E]/30 border-t-[#FF4D5E] rounded-full animate-spin" />
            <p className="text-[10px] font-mono text-white/40 tracking-widest">DECRYPTING HUNTER DOSSIER...</p>
          </div>
        )}

        {/* ── AUTH GATE (Not signed in & not viewing someone else) ── */}
        {!loading && !profileUser && !sessionUser && (
          <section className="flex flex-col items-center justify-center py-16 px-4" aria-label="Authentication required">
            <div className="inner-eyebrow mb-8">
              <span className="eyebrow-rule" />
              <TechText text="HUNTER IDENTIFICATION REQUIRED" />
            </div>

            <div className="auth-card w-full max-w-md p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0d1218]/90 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-12 rounded-xl bg-[#FF4D5E]/10 border border-[#FF4D5E]/30 flex items-center justify-center">
                  <Shield className="text-[#FF4D5E]" size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-white/40 tracking-widest">ZERO HUNT / OPERATOR</p>
                  <h1 className="text-xl font-black text-white">
                    {authMode === 'signup'
                      ? 'Create Hunter Account'
                      : authMode === 'signin'
                      ? 'Hunter Authentication'
                      : 'Restricted Terminal'}
                  </h1>
                </div>
              </div>

              {/* Mode: GATE */}
              {authMode === 'gate' && (
                <div className="space-y-3">
                  <p className="text-sm text-white/55 mb-6 leading-relaxed font-mono">
                    Your hunter dossier is locked. Authenticate to track your XP, badges, unlock premium lessons, and climb the leaderboard.
                  </p>
                  <button
                    onClick={() => { setAuthMode('signup'); setAuthError('') }}
                    className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-[#FF4D5E]/10 border border-[#FF4D5E]/40 hover:bg-[#FF4D5E]/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <UserPlus size={18} className="text-[#FF4D5E]" />
                      <div className="text-left">
                        <div className="text-sm font-bold text-white">Create Account (+500 XP)</div>
                        <div className="text-xs text-white/45">New to Zero Hunt? Claim your operative call-sign.</div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-white/30 group-hover:text-[#FF4D5E] transition-all" />
                  </button>
                  <button
                    onClick={() => { setAuthMode('signin'); setAuthError('') }}
                    className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <LogIn size={18} className="text-white/50" />
                      <div className="text-left">
                        <div className="text-sm font-bold text-white">Sign In</div>
                        <div className="text-xs text-white/45">Already registered? Access your terminal.</div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-white/30 group-hover:text-white transition-all" />
                  </button>
                </div>
              )}

              {/* Mode: SIGN UP */}
              {authMode === 'signup' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-white/40 mb-1.5 uppercase tracking-widest">
                        Call-sign *
                      </label>
                      <input
                        type="text"
                        placeholder="shadow_01"
                        value={signupData.username}
                        onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF4D5E] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-white/40 mb-1.5 uppercase tracking-widest">
                        Display Name
                      </label>
                      <input
                        type="text"
                        placeholder="Agent Shadow"
                        value={signupData.displayName}
                        onChange={(e) => setSignupData({ ...signupData, displayName: e.target.value })}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF4D5E] font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 mb-1.5 uppercase tracking-widest">
                      Email *
                    </label>
                    <input
                      type="email"
                      placeholder="you@domain.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF4D5E] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 mb-1.5 uppercase tracking-widest">
                      Password *
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF4D5E] font-mono"
                    />
                  </div>
                  {authError && (
                    <p className="text-xs text-red-400 font-mono bg-red-400/10 border border-red-400/20 px-3 py-2 rounded-lg">
                      ⚠ {authError}
                    </p>
                  )}
                  <Button
                    disabled={authWorking}
                    onClick={handleSignup}
                    className="w-full bg-[#FF4D5E] text-[#071007] font-bold text-sm hover:bg-[#dcff72] py-5 mt-2"
                  >
                    <UserPlus size={15} className="mr-2" />
                    {authWorking ? 'INITIALIZING DOSSIER...' : 'JOIN ZERO HUNT'}
                  </Button>
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      onClick={() => { setAuthMode('gate'); setAuthError('') }}
                      className="text-white/40 hover:text-white font-mono"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => { setAuthMode('signin'); setAuthError('') }}
                      className="text-[#FF4D5E] hover:underline font-mono"
                    >
                      Already registered? Sign in →
                    </button>
                  </div>
                </div>
              )}

              {/* Mode: SIGN IN */}
              {authMode === 'signin' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 mb-1.5 uppercase tracking-widest">
                      Username or Email
                    </label>
                    <input
                      type="text"
                      placeholder="call_sign or hunter@example.com"
                      value={signinIdentifier}
                      onChange={(e) => setSigninIdentifier(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF4D5E] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 mb-1.5 uppercase tracking-widest">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={signinPassword}
                      onChange={(e) => setSigninPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSignin()}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF4D5E] font-mono"
                    />
                  </div>
                  {authError && (
                    <p className="text-xs text-red-400 font-mono bg-red-400/10 border border-red-400/20 px-3 py-2 rounded-lg">
                      ⚠ {authError}
                    </p>
                  )}
                  <Button
                    disabled={authWorking}
                    onClick={handleSignin}
                    className="w-full bg-[#FF4D5E] text-[#071007] font-bold text-sm hover:bg-[#dcff72] py-5 mt-2"
                  >
                    <LogIn size={15} className="mr-2" />
                    {authWorking ? 'AUTHENTICATING...' : 'ENTER ZERO HUNT'}
                  </Button>
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      onClick={() => { setAuthMode('gate'); setAuthError('') }}
                      className="text-white/40 hover:text-white font-mono"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => { setAuthMode('signup'); setAuthError('') }}
                      className="text-[#FF4D5E] hover:underline font-mono"
                    >
                      Need an account? Join →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── PROFILE VIEW (Own Profile OR Public Social Dossier) ── */}
        {!loading && profileUser && (
          <>
            {/* Banner if viewing someone else's public profile */}
            {isViewingOther && (
              <div className="mb-6 p-4 rounded-xl border border-white/10 bg-white/[0.03] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Globe2 size={16} className="text-[#FF4D5E]" />
                  <div>
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      PUBLIC HUNTER DOSSIER · VIEW-ONLY MODE
                    </span>
                    <p className="text-[11px] font-mono text-white/50">
                      You are inspecting operative @{profileUser.username}. Profile modifications are restricted to verified owner.
                    </p>
                  </div>
                </div>
                {sessionUser ? (
                  <Link href="/profile">
                    <Button size="sm" variant="outline" className="text-xs font-mono border-white/20 hover:bg-white/10 text-white">
                      ← RETURN TO MY PROFILE
                    </Button>
                  </Link>
                ) : (
                  <Link href="/sign-in">
                    <Button size="sm" className="text-xs font-mono bg-[#FF4D5E] text-black font-bold">
                      SIGN IN AS HUNTER
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Profile Header Hero */}
            <section className="inner-hero">
              <div className="inner-eyebrow">
                <span className="eyebrow-rule" />
                <TechText text={isViewingOther ? `OPERATIVE DOSSIER / @${profileUser.username}` : 'HUNTER DOSSIER / OPERATOR PROFILE'} />
              </div>

              <div className="inner-hero-body">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
                  <div
                    className="size-20 rounded-2xl flex items-center justify-center font-mono text-3xl font-black shadow-lg uppercase"
                    style={{
                      backgroundColor: `${profileUser.avatarColor || '#FF4D5E'}25`,
                      border: `2px solid ${profileUser.avatarColor || '#FF4D5E'}`,
                      color: profileUser.avatarColor || '#FF4D5E',
                    }}
                  >
                    {profileUser.username.substring(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-3xl font-black text-white">
                        {profileUser.displayName || profileUser.username}
                      </h1>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/15">
                        LEVEL {currentLevel}
                      </span>
                      {isOwnProfile && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <UserCheck size={10} /> VERIFIED OWNER
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-white/50 mt-1">
                      @{profileUser.username}
                      {isOwnProfile && profileUser.email ? ` · ${profileUser.email}` : ''}
                    </p>
                    <p className="text-sm text-white/70 mt-2 max-w-xl">
                      {profileUser.bio || 'Operator in active cybersecurity readiness training.'}
                    </p>
                  </div>
                </div>

                {/* Level progress bar */}
                <div className="max-w-xl">
                  <div className="flex justify-between text-xs font-mono text-white/50 mb-1.5">
                    <span>TIER PROGRESS</span>
                    <span>
                      {profileUser.xp % 1000} / 1000 XP TO LEVEL {currentLevel + 1}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF4D5E] to-[#dcff72] transition-all duration-500"
                      style={{ width: `${levelProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats Bar with Visible Points */}
              <aside className="inner-stats liquid-glass">
                <div className="stat-slot">
                  <div className="stat-val text-[#FF4D5E]">{profileUser.xp?.toLocaleString() ?? 0}</div>
                  <div className="stat-lbl">TOTAL XP (POINTS)</div>
                </div>
                <div className="stat-divider" />
                <div className="stat-slot">
                  <div className="stat-val text-amber-400">🪙 {profileUser.credits ?? 0}</div>
                  <div className="stat-lbl">CREDITS</div>
                </div>
                <div className="stat-divider" />
                <div className="stat-slot">
                  <div className="stat-val text-orange-400">🔥 {profileUser.streak ?? 1}d</div>
                  <div className="stat-lbl">ACTIVE STREAK</div>
                </div>
              </aside>
            </section>

            {/* Tab Controls */}
            <div className="flex gap-4 border-b border-white/10 mb-8 pb-3 overflow-x-auto no-scrollbar">
              {(isOwnProfile
                ? (['overview', 'certificates', 'badges', 'settings'] as const)
                : (['overview', 'certificates', 'badges'] as const)
              ).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs font-mono uppercase tracking-widest pb-1 transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? 'text-[#FF4D5E] border-b-2 border-[#FF4D5E] font-bold'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {tab === 'certificates'
                    ? `CERTIFICATES (${userCertificates.length})`
                    : tab === 'badges'
                    ? `BADGES & AWARDS (${profileUser.badges?.length ?? 0}/${allBadges.length || 0})`
                    : tab === 'overview'
                    ? 'OVERVIEW & ACTIVITY'
                    : 'PROFILE SETTINGS'}
                </button>
              ))}
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Completed summary */}
                  <div className="liquid-glass p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[#FF4D5E] mb-3">
                        <Trophy size={18} />
                        <span className="text-xs font-mono tracking-widest font-bold">OPERATIVE RECORD</span>
                      </div>
                      <h3 className="text-2xl font-black text-white">
                        {(profileUser.completedCourses?.length || 0) + (profileUser.completedQuizzes?.length || 0)}
                      </h3>
                      <p className="text-xs text-white/50 mt-1 font-mono">Total Completed Missions</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 text-xs text-white/40 space-y-1">
                      <div>Paths finished: {profileUser.completedCourses?.length || 0}</div>
                      <div>Quizzes solved: {profileUser.completedQuizzes?.length || 0}</div>
                    </div>
                  </div>

                  {/* Badges preview */}
                  <div className="liquid-glass p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-amber-400 mb-3">
                        <Award size={18} />
                        <span className="text-xs font-mono tracking-widest font-bold">ACHIEVEMENTS</span>
                      </div>
                      <h3 className="text-2xl font-black text-white">
                        {profileUser.badges?.length || 0}
                      </h3>
                      <p className="text-xs text-white/50 mt-1 font-mono">Badges Collected</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex gap-1.5 flex-wrap">
                      {(profileUser.badges || []).slice(0, 5).map((slug) => {
                        const b = allBadges.find((x) => x.slug === slug)
                        return (
                          <span
                            key={slug}
                            className="size-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm"
                            title={b?.name || slug}
                          >
                            {b?.icon || '🏆'}
                          </span>
                        )
                      })}
                    </div>
                  </div>

                  {/* Security Tier */}
                  <div className="liquid-glass p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-400 mb-3">
                        <Shield size={18} />
                        <span className="text-xs font-mono tracking-widest font-bold">STATUS</span>
                      </div>
                      <h3 className="text-2xl font-black text-white">OPERATIONAL</h3>
                      <p className="text-xs text-white/50 mt-1 font-mono">
                        Global Ranking: #{profileUser.globalRank > 0 ? profileUser.globalRank : '001'}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 text-xs text-white/40">
                      Streak record: {profileUser.streak || 1} consecutive days
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CERTIFICATES */}
            {activeTab === 'certificates' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    VERIFIED ACADEMY ACCREDITATIONS
                  </h3>
                  <p className="text-xs text-white/50 font-mono mt-1">
                    Official Certificates of Completion issued by Zero Hunt Directorate upon passing course examinations.
                  </p>
                </div>

                {userCertificates.length === 0 ? (
                  <div className="p-12 rounded-2xl border border-white/10 bg-white/[0.02] text-center max-w-lg mx-auto">
                    <div className="size-16 rounded-2xl bg-[#FF4D5E]/10 border border-[#FF4D5E]/30 text-[#FF4D5E] flex items-center justify-center mx-auto mb-4">
                      <Award size={32} />
                    </div>
                    <h4 className="text-base font-bold text-white uppercase font-mono">
                      NO CERTIFICATES EARNED YET
                    </h4>
                    <p className="text-xs text-white/50 mt-2 font-mono leading-relaxed">
                      Complete academy courses and pass each certification exam with a score of 70% or higher to unlock cryptographically verified credentials.
                    </p>
                    <Link href="/quizzes" className="inline-block mt-6">
                      <Button size="sm" className="bg-[#FF4D5E] text-[#071007] hover:bg-[#dcff72] font-mono font-bold text-xs gap-1.5">
                        <Award size={14} /> EXPLORE CERTIFICATION QUIZZES
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userCertificates.map((cert) => (
                      <div
                        key={cert.certificateId}
                        className="p-6 rounded-2xl border border-[#FF4D5E]/30 bg-gradient-to-br from-[#FF4D5E]/10 via-black/40 to-black/60 relative overflow-hidden group hover:border-[#FF4D5E] transition-all"
                      >
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="size-11 rounded-xl bg-[#FF4D5E]/20 border border-[#FF4D5E]/40 text-[#FF4D5E] flex items-center justify-center">
                              <Award size={22} />
                            </div>
                            <div>
                              <span className="text-[10px] font-mono tracking-widest text-[#FF4D5E] uppercase block font-bold">
                                VERIFIED CREDENTIAL
                              </span>
                              <h4 className="text-base font-bold text-white group-hover:text-[#FF4D5E] transition-colors">
                                {cert.courseTitle}
                              </h4>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold shrink-0">
                            SCORE {cert.score}%
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10 text-center text-xs font-mono mb-4">
                          <div>
                            <span className="text-[10px] text-white/40 block">GRADE</span>
                            <span className="text-white font-bold">{cert.grade}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-white/40 block">ISSUED</span>
                            <span className="text-white">
                              {new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-white/40 block">REGISTRY ID</span>
                            <span className="text-[#FF4D5E] font-bold text-[11px] truncate block">{cert.certificateId}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <Button
                            size="sm"
                            onClick={() => setViewingCertificate(cert)}
                            className="bg-[#FF4D5E] text-[#071007] hover:bg-[#dcff72] text-xs font-mono font-bold flex-1 gap-1.5"
                          >
                            <Award size={13} /> VIEW CREDENTIAL
                          </Button>
                          <Link href={`/certificates/${cert.certificateId}`} target="_blank">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/10 text-white hover:bg-white/10 text-xs font-mono gap-1"
                            >
                              <ExternalLink size={13} /> VERIFY
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: BADGES & AWARDS */}
            {activeTab === 'badges' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white">HUNTER MEDALS & ACCOLADES</h3>
                    <p className="text-xs text-white/50 font-mono">
                      Badges unlocked through completing courses, scoring high on quizzes, and maintaining daily streaks.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allBadges.map((badge) => {
                    const isUnlocked = profileUser.badges?.includes(badge.slug)
                    const tierColor = TIER_COLORS[badge.tier] || '#FF4D5E'

                    return (
                      <div
                        key={badge._id}
                        onClick={() =>
                          setSelectedBadgeDetail({
                            title: badge.name,
                            description: badge.description,
                            type: 'general',
                            meta: `${badge.tier.toUpperCase()} · ${badge.creditBonus} CREDITS`,
                          })
                        }
                        className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                          isUnlocked
                            ? 'bg-white/[0.03] hover:bg-white/[0.07]'
                            : 'bg-white/[0.01] opacity-40 hover:opacity-60'
                        }`}
                        style={{
                          borderColor: isUnlocked ? `${tierColor}50` : 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-3xl">{badge.icon || '🏆'}</span>
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase"
                            style={{
                              borderColor: `${tierColor}60`,
                              color: tierColor,
                              backgroundColor: `${tierColor}15`,
                            }}
                          >
                            {badge.tier}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">{badge.name}</h4>
                        <p className="text-xs text-white/50 line-clamp-2">{badge.description}</p>
                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                          <span className={isUnlocked ? 'text-emerald-400 font-bold' : 'text-white/30'}>
                            {isUnlocked ? '✓ UNLOCKED' : 'LOCKED'}
                          </span>
                          <span className="text-amber-400">+{badge.creditBonus} CR</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: SETTINGS (Own profile only) */}
            {activeTab === 'settings' && isOwnProfile && (
              <div className="max-w-xl space-y-6">
                <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    IDENTITY & DOSSIER CONFIGURATION
                  </h3>
                  <div>
                    <label className="block text-[11px] font-mono text-white/50 uppercase mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 focus:border-[#FF4D5E] rounded-xl px-3.5 py-2 text-sm text-white outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-white/50 uppercase mb-1">
                      Operative Bio
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 focus:border-[#FF4D5E] rounded-xl px-3.5 py-2 text-sm text-white outline-none font-mono"
                      placeholder="Share your focus, e.g. Web App Pentesting & Cloud Security..."
                    />
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={publicProfile}
                        onChange={(e) => setPublicProfile(e.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-[#FF4D5E] focus:ring-0"
                      />
                      <span className="text-xs text-white/70 font-mono">
                        Public Profile (visible in global searches and leaderboards)
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications}
                        onChange={(e) => setNotifications(e.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-[#FF4D5E] focus:ring-0"
                      />
                      <span className="text-xs text-white/70 font-mono">
                        Email Notifications for rank updates and new challenges
                      </span>
                    </label>
                  </div>

                  <Button
                    disabled={saving}
                    onClick={saveSettings}
                    className="w-full bg-[#FF4D5E] text-[#071007] font-bold text-xs tracking-widest hover:bg-[#dcff72] py-4 mt-2"
                  >
                    <Save size={14} className="mr-2" />
                    {saving ? 'SAVING DOSSIER...' : 'SAVE DOSSIER SETTINGS'}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />

      {/* Side panel */}
      {selectedBadgeDetail && (
        <ItemDetailSidePanel
          item={selectedBadgeDetail}
          onClose={() => setSelectedBadgeDetail(null)}
        />
      )}

      {/* Official Certificate Modal */}
      <CertificateModal
        certificate={viewingCertificate}
        isOpen={!!viewingCertificate}
        onClose={() => setViewingCertificate(null)}
      />
    </main>
  )
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#070b0e] text-white/50 font-mono text-xs">
          LOADING ZERO HUNT DOSSIER...
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  )
}
