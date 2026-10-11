'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Award,
  Check,
  ChevronRight,
  Flame,
  Globe2,
  Lock,
  Menu,
  Save,
  Shield,
  Sparkles,
  Trophy,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import CursorGrid from '@/components/CursorGrid'
import TechText from '@/components/TechText'
import ItemDetailSidePanel, { type GenericItemData } from '@/components/ItemDetailSidePanel'

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
  email: string
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

export default function ProfilePage() {
  const [allUsers, setAllUsers] = useState<UserProfile[]>([])
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [allBadges, setAllBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedBadgeDetail, setSelectedBadgeDetail] = useState<GenericItemData | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'settings'>('overview')

  // Edit form state
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [publicProfile, setPublicProfile] = useState(true)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = async () => {
    try {
      const [usersRes, badgesRes] = await Promise.all([
        fetch('/api/users').then((r) => r.json()),
        fetch('/api/badges').then((r) => r.json()),
      ])

      if (Array.isArray(usersRes) && usersRes.length > 0) {
        setAllUsers(usersRes)
        const savedUsername = localStorage.getItem('zh_active_user')
        const active = usersRes.find((u) => u.username === savedUsername) || usersRes[0]
        setCurrentUser(active)
        setDisplayName(active.displayName || active.username)
        setBio(active.bio || '')
        setNotifications(active.settings?.emailNotifications ?? true)
        setPublicProfile(active.settings?.publicProfile ?? true)
      }

      if (Array.isArray(badgesRes)) {
        setAllBadges(badgesRes)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const switchUser = (selectedUser: UserProfile) => {
    setCurrentUser(selectedUser)
    localStorage.setItem('zh_active_user', selectedUser.username)
    setDisplayName(selectedUser.displayName || selectedUser.username)
    setBio(selectedUser.bio || '')
    setNotifications(selectedUser.settings?.emailNotifications ?? true)
    setPublicProfile(selectedUser.settings?.publicProfile ?? true)
    showToast(`Switched active hunter to: ${selectedUser.username}`)
  }

  const saveSettings = async () => {
    if (!currentUser) return
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${currentUser._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          bio,
          settings: {
            emailNotifications: notifications,
            publicProfile,
            theme: currentUser.settings?.theme || 'dark',
          },
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setCurrentUser(updated)
        showToast('✅ Profile settings updated successfully!')
      } else {
        showToast('❌ Failed to update profile')
      }
    } catch {
      showToast('❌ Network error updating profile')
    } finally {
      setSaving(false)
    }
  }

  const currentLevel = currentUser ? Math.floor(currentUser.xp / 1000) + 1 : 1
  const levelProgress = currentUser ? ((currentUser.xp % 1000) / 1000) * 100 : 0

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
        {/* Navigation */}
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
            {allUsers.length > 1 && (
              <div className="flex items-center gap-2">
                <Users size={14} className="text-white/40" />
                <select
                  value={currentUser?.username || ''}
                  onChange={(e) => {
                    const u = allUsers.find((x) => x.username === e.target.value)
                    if (u) switchUser(u)
                  }}
                  className="bg-white/5 border border-white/10 text-xs text-white rounded-lg px-2 py-1 outline-none font-mono"
                >
                  {allUsers.map((u) => (
                    <option key={u._id} value={u.username} className="bg-[#121212]">
                      {u.displayName || u.username} ({u.xp} XP)
                    </option>
                  ))}
                </select>
              </div>
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
          </nav>
        )}

        {/* Profile Header Hero */}
        <section className="inner-hero">
          <div className="inner-eyebrow">
            <span className="eyebrow-rule" />
            <TechText text="HUNTER DOSSIER / OPERATOR PROFILE" />
          </div>

          <div className="inner-hero-body">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
              <div
                className="size-20 rounded-2xl flex items-center justify-center font-mono text-3xl font-black shadow-lg"
                style={{
                  backgroundColor: `${currentUser?.avatarColor || '#FF4D5E'}25`,
                  border: `2px solid ${currentUser?.avatarColor || '#FF4D5E'}`,
                  color: currentUser?.avatarColor || '#FF4D5E',
                }}
              >
                {currentUser?.username?.substring(0, 2).toUpperCase() || 'ZH'}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black text-white">
                    {currentUser?.displayName || currentUser?.username}
                  </h1>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/15">
                    LEVEL {currentLevel}
                  </span>
                </div>
                <p className="text-xs font-mono text-white/50 mt-1">
                  @{currentUser?.username} · {currentUser?.email}
                </p>
                <p className="text-sm text-white/70 mt-2 max-w-xl">
                  {currentUser?.bio || 'Operator in active cybersecurity readiness training.'}
                </p>
              </div>
            </div>

            {/* Level progress bar */}
            <div className="max-w-xl">
              <div className="flex justify-between text-xs font-mono text-white/50 mb-1.5">
                <span>TIER PROGRESS</span>
                <span>{currentUser?.xp ? (currentUser.xp % 1000) : 0} / 1000 XP TO LEVEL {currentLevel + 1}</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF4D5E] to-[#dcff72] transition-all duration-500"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>
          </div>

          <aside className="inner-stats liquid-glass">
            <div className="stat-slot">
              <div className="stat-val text-[#FF4D5E]">{currentUser?.xp?.toLocaleString() ?? 0}</div>
              <div className="stat-lbl">TOTAL XP</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-slot">
              <div className="stat-val text-amber-400">🪙 {currentUser?.credits ?? 0}</div>
              <div className="stat-lbl">CREDITS BALANCE</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-slot">
              <div className="stat-val text-orange-400">🔥 {currentUser?.streak ?? 0}d</div>
              <div className="stat-lbl">ACTIVE STREAK</div>
            </div>
          </aside>
        </section>

        {/* Tab Controls */}
        <div className="flex gap-4 border-b border-white/10 mb-8 pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`text-xs font-mono uppercase tracking-widest pb-1 transition-all ${
              activeTab === 'overview'
                ? 'text-[#FF4D5E] border-b-2 border-[#FF4D5E] font-bold'
                : 'text-white/50 hover:text-white'
            }`}
          >
            OVERVIEW & ACTIVITY
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`text-xs font-mono uppercase tracking-widest pb-1 transition-all ${
              activeTab === 'badges'
                ? 'text-[#FF4D5E] border-b-2 border-[#FF4D5E] font-bold'
                : 'text-white/50 hover:text-white'
            }`}
          >
            BADGES & AWARDS ({currentUser?.badges?.length ?? 0}/{allBadges.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`text-xs font-mono uppercase tracking-widest pb-1 transition-all ${
              activeTab === 'settings'
                ? 'text-[#FF4D5E] border-b-2 border-[#FF4D5E] font-bold'
                : 'text-white/50 hover:text-white'
            }`}
          >
            PROFILE SETTINGS
          </button>
        </div>

        {/* Tab Content: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="inner-card liquid-glass p-6">
              <div className="flex items-center gap-3 text-[#FF4D5E] mb-4">
                <Trophy size={20} />
                <h3 className="font-bold text-sm tracking-wider">GLOBAL RANKING</h3>
              </div>
              <div className="text-4xl font-black text-white">
                #{String(currentUser?.globalRank ?? 24).padStart(3, '0')}
              </div>
              <p className="text-xs text-white/50 mt-2">
                Out of 24,000+ registered active defenders in the Zero Hunt arena.
              </p>
              <Link href="/leaderboard">
                <Button variant="outline" className="w-full mt-6 text-xs border-white/20 text-white hover:bg-white/10">
                  VIEW FULL LEADERBOARD
                </Button>
              </Link>
            </div>

            <div className="inner-card liquid-glass p-6">
              <div className="flex items-center gap-3 text-amber-400 mb-4">
                <Award size={20} />
                <h3 className="font-bold text-sm tracking-wider">ARMORY ASSETS</h3>
              </div>
              <div className="text-4xl font-black text-white">
                {currentUser?.ownedItems?.length ?? 0}
              </div>
              <p className="text-xs text-white/50 mt-2">
                Unlocked badges frames, custom cyber themes, and active XP multipliers.
              </p>
              <Link href="/store">
                <Button className="w-full mt-6 bg-[#FF4D5E] text-[#071007] text-xs font-bold hover:bg-[#dcff72]">
                  VISIT ARMORY STORE
                </Button>
              </Link>
            </div>

            <div className="inner-card liquid-glass p-6">
              <div className="flex items-center gap-3 text-emerald-400 mb-4">
                <Zap size={20} />
                <h3 className="font-bold text-sm tracking-wider">NEXT CHALLENGE</h3>
              </div>
              <div className="text-lg font-bold text-white leading-snug">
                Web Hacking & Pentesting
              </div>
              <p className="text-xs text-white/50 mt-2">
                Earn +120 XP & +18 Credits by scoring 70%+ on OWASP vulnerabilities.
              </p>
              <Link href="/quizzes">
                <Button className="w-full mt-6 bg-white/10 text-white text-xs font-bold hover:bg-white/20">
                  LAUNCH QUIZ
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Tab Content: BADGES */}
        {activeTab === 'badges' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {allBadges.map((badge) => {
              const isEarned = currentUser?.badges?.includes(badge.slug)
              const tierColor = TIER_COLORS[badge.tier] || '#FF4D5E'

              return (
                <div
                  key={badge._id}
                  className={`inner-card liquid-glass p-5 border transition-all cursor-pointer hover:scale-[1.02] ${
                    isEarned ? 'opacity-100 hover:border-[#FF4D5E]' : 'opacity-40 grayscale hover:opacity-75'
                  }`}
                  style={{
                    borderColor: isEarned ? `${tierColor}66` : 'rgba(255,255,255,0.08)',
                  }}
                  onClick={() => {
                    setSelectedBadgeDetail({
                      _id: badge._id,
                      title: badge.name,
                      description: badge.description,
                      copy: badge.description,
                      icon: badge.icon,
                      type: 'general',
                      creditCost: badge.creditBonus,
                      meta: `${badge.tier.toUpperCase()} TIER · +${badge.creditBonus} CREDITS · ${
                        isEarned ? 'UNLOCKED' : 'LOCKED'
                      }`,
                    })
                  }}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{badge.icon}</span>
                    <span
                      className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full font-bold"
                      style={{
                        backgroundColor: `${tierColor}20`,
                        color: tierColor,
                        border: `1px solid ${tierColor}40`,
                      }}
                    >
                      {badge.tier}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mt-3">{badge.name}</h4>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">{badge.description}</p>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-white/40">
                      {isEarned ? 'UNLOCKED' : `REQ: ${badge.condition.replace('_', ' ')} >= ${badge.conditionValue}`}
                    </span>
                    <span className="text-amber-400 font-bold">+{badge.creditBonus} 🪙</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Tab Content: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="inner-card liquid-glass p-8 max-w-2xl mx-auto mb-12">
            <h3 className="text-lg font-bold text-white mb-6">OPERATOR SETTINGS</h3>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-mono text-white/50 mb-2 uppercase tracking-wider">
                  DISPLAY NAME
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF4D5E]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/50 mb-2 uppercase tracking-wider">
                  BIO / DOSSIER SUMMARY
                </label>
                <textarea
                  value={bio}
                  rows={3}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF4D5E]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-white block">Email Intelligence Alerts</span>
                  <span className="text-xs text-white/50">Receive notifications for new challenge releases.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="size-4 accent-[#FF4D5E]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-white block">Public Leaderboard Profile</span>
                  <span className="text-xs text-white/50">Display stats on global ranks and challenge chains.</span>
                </div>
                <input
                  type="checkbox"
                  checked={publicProfile}
                  onChange={(e) => setPublicProfile(e.target.checked)}
                  className="size-4 accent-[#FF4D5E]"
                />
              </div>

              <Button
                disabled={saving}
                onClick={saveSettings}
                className="w-full mt-6 bg-[#FF4D5E] text-[#071007] font-bold text-sm hover:bg-[#dcff72]"
              >
                <Save size={16} className="mr-2" />
                {saving ? 'SAVING...' : 'SAVE DOSSIER CHANGES'}
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="inner-footer">
          <p className="inner-footer-copy">© 2026 ZERO HUNT ACADEMY. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <Link href="/quizzes" className="inner-footer-link">CHALLENGE QUIZZES</Link>
            <Link href="/store" className="inner-footer-link">ARMORY STORE</Link>
            <Link href="/admin" className="inner-footer-link opacity-50 hover:opacity-100">ADMIN</Link>
          </div>
        </footer>
      </div>

      {/* Badge / Asset Detail Side Panel */}
      <ItemDetailSidePanel
        item={selectedBadgeDetail}
        itemType="general"
        onClose={() => setSelectedBadgeDetail(null)}
      />
    </main>
  )
}
