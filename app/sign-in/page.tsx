'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2, Lock, LogIn, Shield, User, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CursorGrid from '@/components/CursorGrid'

export default function SignInPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Current session check
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  // Form states
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')

  // Sign up form
  const [signupUsername, setSignupUsername] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupDisplayName, setSignupDisplayName] = useState('')

  useEffect(() => {
    // Check if user is already logged in
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user.username)
        }
      })
      .catch(() => {})
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!identifier.trim() || !password) {
      setError('Please provide your username/email and password.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please verify credentials.')
        setLoading(false)
        return
      }

      localStorage.setItem('zh_active_user', data.user.username)
      setSuccess(`Authenticated as @${data.user.username}. Redirecting to profile…`)
      setTimeout(() => {
        router.push('/profile')
      }, 1000)
    } catch {
      setError('Network connection error. Try again.')
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!signupUsername.trim() || !signupEmail.trim() || !signupPassword) {
      setError('All fields are required.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: signupUsername.trim(),
          email: signupEmail.trim(),
          password: signupPassword,
          displayName: signupDisplayName.trim() || signupUsername.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registration failed.')
        setLoading(false)
        return
      }

      localStorage.setItem('zh_active_user', data.user.username)
      setSuccess(`Hunter profile created! Welcome @${data.user.username}. Launching dossier…`)
      setTimeout(() => {
        router.push('/profile')
      }, 1200)
    } catch {
      setError('Network connection error. Try again.')
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('zh_active_user')
    setCurrentUser(null)
    setSuccess('Signed out successfully.')
  }

  return (
    <main className="inner-page min-h-screen flex flex-col justify-between">
      <div className="site-cursor-grid" aria-hidden="true">
        <CursorGrid
          cellSize={88}
          color="#FF4D5E"
          radius={220}
          falloff="smooth"
          fadeDuration={1200}
          maxOpacity={0.72}
          gridOpacity={0.045}
          fillOpacity={0.035}
          clickPulse
        />
      </div>

      <div className="inner-shell" style={{ maxWidth: '32rem', paddingTop: '2.5rem', paddingBottom: '3rem' }}>
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inner-brand" aria-label="Zero Hunt home">
            <span className="brand-mark">
              <Shield />
            </span>
            ZERO HUNT
          </Link>
          <Link href="/courses" className="text-xs font-mono text-white/50 hover:text-white transition-colors">
            COURSES →
          </Link>
        </div>

        {currentUser ? (
          <div className="auth-card p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0d1218]/90 backdrop-blur-xl shadow-2xl">
            <div className="size-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} />
            </div>
            <p className="inner-kicker text-center">SESSION ACTIVE</p>
            <h1 className="auth-title text-center text-2xl font-bold text-white mt-1">
              Signed in as <span className="text-[#FF4D5E]">@{currentUser}</span>
            </h1>
            <p className="text-xs text-white/50 text-center mt-2 font-mono">
              Your security terminal and hunter records are active.
            </p>

            <div className="flex flex-col gap-3 mt-6">
              <Link href="/profile" className="w-full">
                <Button className="w-full bg-[#FF4D5E] font-bold text-[#071007] hover:bg-[#dcff72] py-5">
                  OPEN MY PROFILE DOSSIER <ArrowRight size={16} />
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full border-white/10 text-white/70 hover:text-white hover:bg-white/5"
              >
                SIGN OUT
              </Button>
            </div>
          </div>
        ) : (
          <div className="auth-card p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0d1218]/90 backdrop-blur-xl shadow-2xl">
            {/* Tabs */}
            <div className="flex rounded-xl bg-black/40 p-1 border border-white/10 mb-6 font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  setTab('signin')
                  setError(null)
                  setSuccess(null)
                }}
                className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold transition-all ${
                  tab === 'signin'
                    ? 'bg-[#FF4D5E] text-[#071007] shadow-[0_0_15px_rgba(255,77,94,0.3)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <LogIn size={14} /> SIGN IN
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signup')
                  setError(null)
                  setSuccess(null)
                }}
                className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold transition-all ${
                  tab === 'signup'
                    ? 'bg-[#FF4D5E] text-[#071007] shadow-[0_0_15px_rgba(255,77,94,0.3)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <UserPlus size={14} /> JOIN THE HUNT
              </button>
            </div>

            <p className="inner-kicker">
              {tab === 'signin' ? 'AUTHENTICATION PROTOCOL' : 'NEW OPERATIVE DOSSIER'}
            </p>
            <h1 className="auth-title text-2xl font-bold text-white mt-1">
              {tab === 'signin' ? (
                <>
                  Enter Zero Hunt<br />
                  <span className="text-[#FF4D5E]">Access terminal.</span>
                </>
              ) : (
                <>
                  Register Hunter<br />
                  <span className="text-[#FF4D5E]">Claim identity.</span>
                </>
              )}
            </h1>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                ⚠ {error}
              </div>
            )}

            {success && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                ✓ {success}
              </div>
            )}

            {tab === 'signin' ? (
              <form onSubmit={handleSignIn} className="auth-form mt-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-mono tracking-widest text-white/50 mb-1.5 uppercase">
                    Username or Email
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="hunter_01 or hunter@example.com"
                      className="w-full bg-white/5 border border-white/15 focus:border-[#FF4D5E] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono tracking-widest text-white/50 mb-1.5 uppercase">
                    Security Key / Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-white/5 border border-white/15 focus:border-[#FF4D5E] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 outline-none font-mono"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FF4D5E] font-bold tracking-widest text-[#071007] hover:bg-[#dcff72] py-5 mt-2 transition-all"
                >
                  {loading ? 'AUTHENTICATING…' : 'ENTER ZERO HUNT'} <ArrowRight size={16} />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="auth-form mt-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-mono tracking-widest text-white/50 mb-1.5 uppercase">
                    Hunter Call-Sign (Username)
                  </label>
                  <input
                    type="text"
                    required
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    placeholder="e.g. shadow_recon"
                    className="w-full bg-white/5 border border-white/15 focus:border-[#FF4D5E] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono tracking-widest text-white/50 mb-1.5 uppercase">
                    Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={signupDisplayName}
                    onChange={(e) => setSignupDisplayName(e.target.value)}
                    placeholder="e.g. Shadow Recon"
                    className="w-full bg-white/5 border border-white/15 focus:border-[#FF4D5E] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono tracking-widest text-white/50 mb-1.5 uppercase">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="hunter@domain.com"
                    className="w-full bg-white/5 border border-white/15 focus:border-[#FF4D5E] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono tracking-widest text-white/50 mb-1.5 uppercase">
                    Create Security Password (Min 6 chars)
                  </label>
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white/5 border border-white/15 focus:border-[#FF4D5E] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none font-mono"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FF4D5E] font-bold tracking-widest text-[#071007] hover:bg-[#dcff72] py-5 mt-2 transition-all"
                >
                  {loading ? 'INITIALIZING DOSSIER…' : 'INITIALIZE DOSSIER (+500 XP)'} <ArrowRight size={16} />
                </Button>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <Link
                href="/leaderboard"
                className="text-xs font-mono text-white/40 hover:text-white transition-colors"
              >
                View Global Hunters Leaderboard →
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
