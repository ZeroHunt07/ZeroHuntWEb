'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  BookOpen, ChevronDown, ChevronRight, Crown, Globe2, LayoutDashboard,
  LogOut, Menu, Pencil, Plus, Settings, Shield, ShoppingBag,
  Sparkles, Trash2, Trophy, Users, X, Zap, Star, Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

/* ─── Types ───────────────────────────────────────────────────────── */
type Course = { _id: string; title: string; level: string; lessons: number; featured: boolean; isPremium: boolean; enrolledCount: number; xpReward: number; creditReward: number; accent: string; description: string; order: number; courseFile?: string }
type User = { _id: string; username: string; email: string; displayName: string; xp: number; credits: number; streak: number; globalRank: number; badges: string[]; completedQuizzes: string[]; createdAt: string; bio?: string }
type Quiz = { _id: string; title: string; difficulty: string; xpReward: number; creditReward: number; active: boolean; attemptCount: number; questions: unknown[]; courseRef: string; passingScore: number }
type Badge = { _id: string; name: string; icon: string; tier: string; condition: string; conditionValue: number; description: string; creditBonus: number }
type StoreItem = { _id: string; name: string; icon: string; type: string; creditCost: number; active: boolean; description: string }
type LeaderboardEntry = { _id: string; rank: number; username: string; xp: number; streak: number; badge: string; specialty: string }
type Settings = { hunterCount: number; challengeCount: number; badgeCount: number; missionBeliefs: { title: string; copy: string }[]; academyMethods: { title: string; copy: string }[] }

type Tab = 'dashboard' | 'courses' | 'quizzes' | 'users' | 'leaderboard' | 'badges' | 'store' | 'settings'

/* ─── Helpers ─────────────────────────────────────────────────────── */
const TIER_COLOR: Record<string, string> = { bronze: '#cd7f32', silver: '#aaa', gold: '#f5c518', platinum: '#e5e4e2' }
const DIFF_COLOR: Record<string, string> = { easy: '#4ade80', medium: '#facc15', hard: '#f87171' }

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string | number; sub?: string }) {
  return (
    <div className="admin-stat-card liquid-glass">
      <div className="admin-stat-icon"><Icon size={18} /></div>
      <div>
        <p className="admin-stat-label">{label}</p>
        <p className="admin-stat-value">{value}</p>
        {sub && <p className="admin-stat-sub">{sub}</p>}
      </div>
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal liquid-glass" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{title}</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="admin-modal-body">{children}</div>
      </div>
    </div>
  )
}

/* ─── Main Admin Page ──────────────────────────────────────────────── */
export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [tab, setTab] = useState<Tab>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [courses, setCourses] = useState<Course[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [store, setStore] = useState<StoreItem[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)

  const [modal, setModal] = useState<null | 'addCourse' | 'editCourse' | 'addQuiz' | 'editQuiz' | 'addBadge' | 'addStore' | 'editUser' | 'editLeaderboard' | 'addLeaderboard'>(null)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [form, setForm] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  /* ── auth ─────────────────────────────────────────────────────── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    const r = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    })
    if (r.ok) { setAuthed(true) } else {
      const d = await r.json()
      setLoginError(d.error || 'Invalid credentials')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    setAuthed(false)
  }

  /* ── fetch data ───────────────────────────────────────────────── */
  const load = useCallback(async () => {
    if (!authed) return
    const [c, u, q, b, s, l, st] = await Promise.all([
      fetch('/api/courses').then(r => r.json()),
      fetch('/api/users').then(r => r.json()),
      fetch('/api/quiz?admin=true').then(r => r.json()),
      fetch('/api/badges').then(r => r.json()),
      fetch('/api/store').then(r => r.json()),
      fetch('/api/leaderboard?limit=20').then(r => r.json()),
      fetch('/api/settings').then(r => r.json()),
    ])
    setCourses(Array.isArray(c) ? c : [])
    setUsers(Array.isArray(u) ? u : [])
    setQuizzes(Array.isArray(q) ? q : [])
    setBadges(Array.isArray(b) ? b : [])
    setStore(Array.isArray(s) ? s : [])
    setLeaderboard(Array.isArray(l) ? l : [])
    setSettings(st)
  }, [authed])

  useEffect(() => { load() }, [load])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }
  const closeModal = () => { setModal(null); setEditing(null); setForm({}) }
  const fv = (k: string) => (form[k] as string) ?? ''

  /* ── generic save ─────────────────────────────────────────────── */
  const save = async (url: string, method: string, body: unknown) => {
    setSaving(true)
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setSaving(false)
    if (r.ok) { showToast('Saved ✓'); closeModal(); load() }
    else showToast('Error saving')
  }

  const del = async (url: string) => {
    if (!confirm('Delete?')) return
    await fetch(url, { method: 'DELETE' })
    showToast('Deleted ✓'); load()
  }

  /* ── Save settings ────────────────────────────────────────────── */
  const saveSettings = async () => {
    setSaving(true)
    await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) })
    setSaving(false); showToast('Settings saved ✓')
  }

  /* ── Login screen ─────────────────────────────────────────────── */
  if (!authed) return (
    <div className="admin-login-page">
      <div className="admin-login-card liquid-glass">
        <div className="admin-login-brand">
          <span className="brand-mark"><Shield size={18} /></span>
          <span>ZERO HUNT ADMIN</span>
        </div>
        <h1 className="admin-login-title">Command<br /><span>Centre.</span></h1>
        <form onSubmit={handleLogin} className="admin-login-form">
          <label>EMAIL<input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="admin@zerohunt.io" required /></label>
          <label>PASSWORD<input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" required /></label>
          {loginError && <p className="admin-error">{loginError}</p>}
          <Button type="submit" className="bg-[#FF4D5E] w-full font-bold tracking-[.12em] text-[#071007] hover:bg-[#dcff72]">ACCESS ADMIN</Button>
        </form>
        <p className="admin-login-hint">🔒 This area is restricted to authorised administrators only.</p>
      </div>
    </div>
  )

  /* ── Dashboard ────────────────────────────────────────────────── */
  const totalXP = users.reduce((t, u) => t + u.xp, 0)
  const totalCredits = users.reduce((t, u) => t + u.credits, 0)
  const navItems: { tab: Tab; icon: React.ElementType; label: string }[] = [
    { tab: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { tab: 'courses', icon: BookOpen, label: 'Courses' },
    { tab: 'quizzes', icon: Sparkles, label: 'Quizzes' },
    { tab: 'users', icon: Users, label: 'Users' },
    { tab: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
    { tab: 'badges', icon: Award, label: 'Badges' },
    { tab: 'store', icon: ShoppingBag, label: 'Store' },
    { tab: 'settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="admin-layout">
      {/* sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="admin-sidebar-brand">
          <span className="brand-mark"><Shield size={16} /></span>
          {sidebarOpen && <span>ZERO HUNT</span>}
        </div>
        <nav className="admin-sidebar-nav">
          {navItems.map(({ tab: t, icon: Icon, label }) => (
            <button key={t} onClick={() => setTab(t)} className={`admin-nav-item${tab === t ? ' active' : ''}`}>
              <Icon size={16} />
              {sidebarOpen && <span>{label}</span>}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="admin-nav-item admin-logout">
          <LogOut size={16} />{sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      {/* main */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="admin-sidebar-toggle">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <h2 className="admin-page-title">{navItems.find(n => n.tab === tab)?.label}</h2>
          <div className="admin-topbar-right">
            <span className="admin-online-badge">● LIVE</span>
          </div>
        </header>

        <div className="admin-content">

          {/* ══ DASHBOARD ══════════════════════════════════════════ */}
          {tab === 'dashboard' && (
            <div>
              <div className="admin-stats-grid">
                <StatCard icon={Users} label="Total Users" value={users.length} sub={`${users.filter(u => u.streak > 0).length} active streaks`} />
                <StatCard icon={BookOpen} label="Courses" value={courses.length} sub={`${courses.filter(c => c.featured).length} featured`} />
                <StatCard icon={Sparkles} label="Quizzes" value={quizzes.length} sub={`${quizzes.reduce((t, q) => t + q.attemptCount, 0)} attempts`} />
                <StatCard icon={Zap} label="Total XP Earned" value={totalXP.toLocaleString()} />
                <StatCard icon={Crown} label="Credits in Circulation" value={totalCredits.toLocaleString()} />
                <StatCard icon={Award} label="Badges" value={badges.length} sub={`${store.length} store items`} />
              </div>
              <div className="admin-dash-grid">
                <div className="admin-panel liquid-glass">
                  <h3 className="admin-panel-title">Top Hunters</h3>
                  {users.sort((a, b) => b.xp - a.xp).slice(0, 5).map((u, i) => (
                    <div key={u._id} className="admin-list-row">
                      <span className="admin-rank">#{i + 1}</span>
                      <span className="admin-username">{u.username}</span>
                      <span className="admin-xp">{u.xp.toLocaleString()} XP</span>
                    </div>
                  ))}
                </div>
                <div className="admin-panel liquid-glass">
                  <h3 className="admin-panel-title">Recent Users</h3>
                  {users.slice(0, 5).map((u) => (
                    <div key={u._id} className="admin-list-row">
                      <span className="admin-username">{u.username}</span>
                      <span className="admin-badge-pill">{u.badges.length} badges</span>
                      <span className="admin-xp">{u.credits} cr</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ COURSES ════════════════════════════════════════════ */}
          {tab === 'courses' && (
            <div>
              <div className="admin-toolbar">
                <h3 className="admin-section-title">{courses.length} Courses</h3>
                <Button size="sm" onClick={() => { setModal('addCourse'); setForm({ accent: 'lime', level: 'Beginner', lessons: 10, xpReward: 100, creditReward: 15, order: courses.length + 1 }) }} className="bg-[#FF4D5E] text-[#071007] font-bold text-xs hover:bg-[#dcff72]">
                  <Plus size={14} /> Add Course
                </Button>
              </div>
              <div className="admin-table-wrap liquid-glass">
                <table className="admin-table">
                  <thead><tr><th>#</th><th>Title</th><th>Level</th><th>Lessons</th><th>XP</th><th>Credits</th><th>Featured</th><th>Actions</th></tr></thead>
                  <tbody>
                    {courses.map((c) => (
                      <tr key={c._id}>
                        <td className="text-[#FF4D5E] font-mono">{c.order}</td>
                        <td className="font-semibold">{c.title}</td>
                        <td><span className="admin-badge-pill">{c.level}</span></td>
                        <td>{c.lessons}</td>
                        <td className="text-[#FF4D5E]">{c.xpReward}</td>
                        <td className="text-yellow-400">{c.creditReward}</td>
                        <td>{c.featured ? '✓' : '—'}</td>
                        <td className="admin-actions">
                          <button onClick={() => { setEditing(c); setForm(c as unknown as Record<string, unknown>); setModal('editCourse') }}><Pencil size={14} /></button>
                          <button onClick={() => del(`/api/courses/${c._id}`)} className="text-red-400"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ QUIZZES ════════════════════════════════════════════ */}
          {tab === 'quizzes' && (
            <div>
              <div className="admin-toolbar">
                <h3 className="admin-section-title">{quizzes.length} Quizzes</h3>
                <Button size="sm" onClick={() => { setModal('addQuiz'); setForm({ difficulty: 'medium', xpReward: 80, creditReward: 12, passingScore: 70, timeLimit: 600, active: true, questions: [] }) }} className="bg-[#FF4D5E] text-[#071007] font-bold text-xs hover:bg-[#dcff72]">
                  <Plus size={14} /> Add Quiz
                </Button>
              </div>
              <div className="admin-table-wrap liquid-glass">
                <table className="admin-table">
                  <thead><tr><th>Title</th><th>Difficulty</th><th>Questions</th><th>XP</th><th>Credits</th><th>Pass %</th><th>Attempts</th><th>Active</th><th>Actions</th></tr></thead>
                  <tbody>
                    {quizzes.map((q) => (
                      <tr key={q._id}>
                        <td className="font-semibold">{q.title}</td>
                        <td><span style={{ color: DIFF_COLOR[q.difficulty] }}>{q.difficulty}</span></td>
                        <td>{(q.questions as unknown[]).length}</td>
                        <td className="text-[#FF4D5E]">{q.xpReward}</td>
                        <td className="text-yellow-400">{q.creditReward}</td>
                        <td>{q.passingScore}%</td>
                        <td>{q.attemptCount}</td>
                        <td>{q.active ? '✓' : '—'}</td>
                        <td className="admin-actions">
                          <button onClick={() => { setEditing(q); setForm(q as unknown as Record<string, unknown>); setModal('editQuiz') }}><Pencil size={14} /></button>
                          <button onClick={() => del(`/api/quiz/${q._id}`)} className="text-red-400"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ USERS ══════════════════════════════════════════════ */}
          {tab === 'users' && (
            <div>
              <div className="admin-toolbar">
                <h3 className="admin-section-title">{users.length} Registered Hunters</h3>
              </div>
              <div className="admin-table-wrap liquid-glass">
                <table className="admin-table">
                  <thead><tr><th>Username</th><th>Email</th><th>XP</th><th>Credits</th><th>Streak</th><th>Badges</th><th>Quizzes</th><th>Actions</th></tr></thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td className="font-semibold text-[#FF4D5E]">{u.username}</td>
                        <td className="text-white/50 text-xs">{u.email}</td>
                        <td>{u.xp.toLocaleString()}</td>
                        <td className="text-yellow-400">{u.credits}</td>
                        <td>{u.streak}d</td>
                        <td>{u.badges.length}</td>
                        <td>{u.completedQuizzes.length}</td>
                        <td className="admin-actions">
                          <button onClick={() => { setEditing(u); setForm({ xp: u.xp, credits: u.credits, displayName: u.displayName, bio: u.bio }); setModal('editUser') }}><Pencil size={14} /></button>
                          <button onClick={() => del(`/api/users/${u._id}`)} className="text-red-400"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ LEADERBOARD ════════════════════════════════════════ */}
          {tab === 'leaderboard' && (
            <div>
              <div className="admin-toolbar">
                <h3 className="admin-section-title">Leaderboard ({leaderboard.length} entries)</h3>
                <Button size="sm" onClick={() => { setModal('addLeaderboard'); setForm({ rank: leaderboard.length + 1, xp: 0, streak: 0, badge: '🏆' }) }} className="bg-[#FF4D5E] text-[#071007] font-bold text-xs hover:bg-[#dcff72]">
                  <Plus size={14} /> Add Entry
                </Button>
              </div>
              <div className="admin-table-wrap liquid-glass">
                <table className="admin-table">
                  <thead><tr><th>Rank</th><th>Username</th><th>XP</th><th>Streak</th><th>Badge</th><th>Specialty</th><th>Actions</th></tr></thead>
                  <tbody>
                    {leaderboard.sort((a, b) => a.rank - b.rank).map((e) => (
                      <tr key={e._id}>
                        <td className="font-mono text-[#FF4D5E]">#{e.rank}</td>
                        <td className="font-semibold">{e.username}</td>
                        <td>{e.xp.toLocaleString()}</td>
                        <td>{e.streak}d</td>
                        <td>{e.badge}</td>
                        <td className="text-white/50 text-xs max-w-[200px] truncate">{e.specialty}</td>
                        <td className="admin-actions">
                          <button onClick={() => { setEditing(e); setForm(e as unknown as Record<string, unknown>); setModal('editLeaderboard') }}><Pencil size={14} /></button>
                          <button onClick={() => del(`/api/leaderboard/${e._id}`)} className="text-red-400"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ BADGES ═════════════════════════════════════════════ */}
          {tab === 'badges' && (
            <div>
              <div className="admin-toolbar">
                <h3 className="admin-section-title">{badges.length} Badges</h3>
                <Button size="sm" onClick={() => { setModal('addBadge'); setForm({ tier: 'bronze', condition: 'quiz_count', conditionValue: 1, creditBonus: 0 }) }} className="bg-[#FF4D5E] text-[#071007] font-bold text-xs hover:bg-[#dcff72]">
                  <Plus size={14} /> Add Badge
                </Button>
              </div>
              <div className="admin-badge-grid">
                {badges.map((b) => (
                  <div key={b._id} className="admin-badge-card liquid-glass" style={{ borderColor: TIER_COLOR[b.tier] + '55' }}>
                    <div className="admin-badge-icon">{b.icon}</div>
                    <div>
                      <p className="font-bold text-sm">{b.name}</p>
                      <p className="text-xs text-white/45">{b.description}</p>
                      <p className="text-[10px] mt-1" style={{ color: TIER_COLOR[b.tier] }}>{b.tier.toUpperCase()} · {b.condition} ≥ {b.conditionValue}</p>
                      {b.creditBonus > 0 && <p className="text-[10px] text-yellow-400">+{b.creditBonus} credits on award</p>}
                    </div>
                    <div className="admin-actions ml-auto">
                      <button onClick={() => del(`/api/badges/${b._id}`)} className="text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ STORE ══════════════════════════════════════════════ */}
          {tab === 'store' && (
            <div>
              <div className="admin-toolbar">
                <h3 className="admin-section-title">{store.length} Store Items</h3>
                <Button size="sm" onClick={() => { setModal('addStore'); setForm({ type: 'cosmetic', active: true, creditCost: 50 }) }} className="bg-[#FF4D5E] text-[#071007] font-bold text-xs hover:bg-[#dcff72]">
                  <Plus size={14} /> Add Item
                </Button>
              </div>
              <div className="admin-badge-grid">
                {store.map((s) => (
                  <div key={s._id} className="admin-badge-card liquid-glass">
                    <div className="admin-badge-icon">{s.icon}</div>
                    <div>
                      <p className="font-bold text-sm">{s.name}</p>
                      <p className="text-xs text-white/45">{s.description}</p>
                      <p className="text-yellow-400 text-sm font-bold mt-1">{s.creditCost} credits</p>
                      <span className="admin-badge-pill">{s.type}</span>
                    </div>
                    <div className="admin-actions ml-auto">
                      <button onClick={() => fetch(`/api/store/${s._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !s.active }) }).then(load)} className="text-blue-400">{s.active ? '✓' : '○'}</button>
                      <button onClick={() => del(`/api/store/${s._id}`)} className="text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ SETTINGS ═══════════════════════════════════════════ */}
          {tab === 'settings' && settings && (
            <div className="admin-settings-grid">
              <div className="admin-panel liquid-glass">
                <h3 className="admin-panel-title">Site Stats</h3>
                <div className="admin-form-group">
                  <label>Hunter Count<input type="number" value={settings.hunterCount} onChange={e => setSettings({ ...settings, hunterCount: +e.target.value })} /></label>
                  <label>Challenge Count<input type="number" value={settings.challengeCount} onChange={e => setSettings({ ...settings, challengeCount: +e.target.value })} /></label>
                  <label>Badge Count<input type="number" value={settings.badgeCount} onChange={e => setSettings({ ...settings, badgeCount: +e.target.value })} /></label>
                </div>
              </div>
              <div className="admin-panel liquid-glass">
                <h3 className="admin-panel-title">Mission Beliefs</h3>
                {settings.missionBeliefs.map((b, i) => (
                  <div key={i} className="admin-form-group">
                    <label>Title <input value={b.title} onChange={e => { const n = [...settings.missionBeliefs]; n[i] = { ...n[i], title: e.target.value }; setSettings({ ...settings, missionBeliefs: n }) }} /></label>
                    <label>Copy <input value={b.copy} onChange={e => { const n = [...settings.missionBeliefs]; n[i] = { ...n[i], copy: e.target.value }; setSettings({ ...settings, missionBeliefs: n }) }} /></label>
                  </div>
                ))}
              </div>
              <div className="admin-panel liquid-glass">
                <h3 className="admin-panel-title">Academy Methods</h3>
                {settings.academyMethods.map((m, i) => (
                  <div key={i} className="admin-form-group">
                    <label>Title <input value={m.title} onChange={e => { const n = [...settings.academyMethods]; n[i] = { ...n[i], title: e.target.value }; setSettings({ ...settings, academyMethods: n }) }} /></label>
                    <label>Copy <input value={m.copy} onChange={e => { const n = [...settings.academyMethods]; n[i] = { ...n[i], copy: e.target.value }; setSettings({ ...settings, academyMethods: n }) }} /></label>
                  </div>
                ))}
              </div>
              <Button onClick={saveSettings} disabled={saving} className="bg-[#FF4D5E] font-bold tracking-[.12em] text-[#071007] hover:bg-[#dcff72] col-span-full">
                {saving ? 'Saving…' : 'SAVE ALL SETTINGS'}
              </Button>
            </div>
          )}

        </div>
      </div>

      {/* ══ MODALS ══════════════════════════════════════════════════ */}

      {/* Add / Edit Course */}
      {(modal === 'addCourse' || modal === 'editCourse') && (
        <Modal title={modal === 'addCourse' ? 'Add Course' : 'Edit Course'} onClose={closeModal}>
          <div className="admin-form-group">
            <label>Title<input value={fv('title')} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
            <label>Slug<input value={fv('slug')} onChange={e => setForm({ ...form, slug: e.target.value })} /></label>
            <label>Description<textarea value={fv('description') as string} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
            <label>Level
              <select value={fv('level')} onChange={e => setForm({ ...form, level: e.target.value })}>
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
            </label>
            <label>Accent
              <select value={fv('accent')} onChange={e => setForm({ ...form, accent: e.target.value })}>
                <option value="lime">Red/Lime</option><option value="blue">Blue</option><option value="violet">Violet</option>
              </select>
            </label>
            <label>Lessons<input type="number" value={fv('lessons')} onChange={e => setForm({ ...form, lessons: +e.target.value })} /></label>
            <label>XP Reward<input type="number" value={fv('xpReward')} onChange={e => setForm({ ...form, xpReward: +e.target.value })} /></label>
            <label>Credit Reward<input type="number" value={fv('creditReward')} onChange={e => setForm({ ...form, creditReward: +e.target.value })} /></label>
            <label>Order<input type="number" value={fv('order')} onChange={e => setForm({ ...form, order: +e.target.value })} /></label>
            <label>Course File / Syllabus URL (Opened when student starts course)
              <input value={fv('courseFile')} onChange={e => setForm({ ...form, courseFile: e.target.value })} placeholder="e.g. /docs/cybersecurity-foundations.pdf or https://..." />
            </label>
            <label className="admin-checkbox"><input type="checkbox" checked={!!form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
            <label className="admin-checkbox"><input type="checkbox" checked={!!form.isPremium} onChange={e => setForm({ ...form, isPremium: e.target.checked })} /> Premium</label>
          </div>
          <Button disabled={saving} onClick={() => modal === 'addCourse' ? save('/api/courses', 'POST', form) : save(`/api/courses/${(editing as Course)._id}`, 'PATCH', form)} className="bg-[#FF4D5E] w-full font-bold text-[#071007] hover:bg-[#dcff72] mt-4">
            {saving ? 'Saving…' : 'Save Course'}
          </Button>
        </Modal>
      )}

      {/* Add / Edit Quiz */}
      {(modal === 'addQuiz' || modal === 'editQuiz') && (() => {
        type QuestionItem = {
          question: string
          options: string[]
          correctIndex: number
          explanation?: string
        }
        const currentQuestions = (Array.isArray(form.questions) ? form.questions : []) as QuestionItem[]

        const updateQuestions = (newQ: QuestionItem[]) => {
          setForm({ ...form, questions: newQ })
        }

        const addQuestion = () => {
          updateQuestions([
            ...currentQuestions,
            {
              question: '',
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctIndex: 0,
              explanation: '',
            },
          ])
        }

        const removeQuestion = (qIdx: number) => {
          updateQuestions(currentQuestions.filter((_, i) => i !== qIdx))
        }

        const updateQuestionField = (qIdx: number, field: keyof QuestionItem, val: unknown) => {
          const updated = [...currentQuestions]
          updated[qIdx] = { ...updated[qIdx], [field]: val }
          updateQuestions(updated)
        }

        const addOption = (qIdx: number) => {
          const updated = [...currentQuestions]
          const opts = [...(updated[qIdx].options || []), `Option ${String.fromCharCode(65 + (updated[qIdx].options?.length || 0))}`]
          updated[qIdx] = { ...updated[qIdx], options: opts }
          updateQuestions(updated)
        }

        const updateOption = (qIdx: number, oIdx: number, val: string) => {
          const updated = [...currentQuestions]
          const opts = [...(updated[qIdx].options || [])]
          opts[oIdx] = val
          updated[qIdx] = { ...updated[qIdx], options: opts }
          updateQuestions(updated)
        }

        const removeOption = (qIdx: number, oIdx: number) => {
          const updated = [...currentQuestions]
          const opts = (updated[qIdx].options || []).filter((_, i) => i !== oIdx)
          let correct = updated[qIdx].correctIndex || 0
          if (correct >= opts.length) correct = Math.max(0, opts.length - 1)
          updated[qIdx] = { ...updated[qIdx], options: opts, correctIndex: correct }
          updateQuestions(updated)
        }

        const setCorrectOption = (qIdx: number, oIdx: number) => {
          const updated = [...currentQuestions]
          updated[qIdx] = { ...updated[qIdx], correctIndex: oIdx }
          updateQuestions(updated)
        }

        return (
          <Modal title={modal === 'addQuiz' ? 'Add Quiz' : 'Edit Quiz'} onClose={closeModal}>
            <div className="admin-form-group">
              <label>Title<input value={fv('title')} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Network Penetration Basics" /></label>
              <label>Slug<input value={fv('slug')} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="e.g. network-penetration-basics" /></label>
              <label>Description<textarea value={fv('description') as string} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Quiz summary..." /></label>
              <label>Difficulty
                <select value={fv('difficulty')} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                  <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label>XP Reward<input type="number" value={fv('xpReward')} onChange={e => setForm({ ...form, xpReward: +e.target.value })} /></label>
                <label>Credit Reward<input type="number" value={fv('creditReward')} onChange={e => setForm({ ...form, creditReward: +e.target.value })} /></label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label>Passing Score (%)<input type="number" value={fv('passingScore')} onChange={e => setForm({ ...form, passingScore: +e.target.value })} /></label>
                <label>Time Limit (seconds)<input type="number" value={fv('timeLimit')} onChange={e => setForm({ ...form, timeLimit: +e.target.value })} /></label>
              </div>
              <label className="admin-checkbox"><input type="checkbox" checked={!!form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Active</label>

              {/* ── Questions and Option Answers Section ── */}
              <div className="mt-5 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF4D5E]">
                      Questions & Options ({currentQuestions.length})
                    </h4>
                    <p className="text-[10px] text-white/40 font-mono">Create questions, options, and choose the correct answer</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addQuestion}
                    className="bg-[#FF4D5E]/20 hover:bg-[#FF4D5E]/30 text-[#FF4D5E] border border-[#FF4D5E]/40 text-xs font-mono font-bold h-7 px-2.5"
                  >
                    <Plus size={13} className="mr-1" /> Add Question
                  </Button>
                </div>

                {currentQuestions.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-white/15 text-center text-xs text-white/40 font-mono bg-white/[0.01]">
                    No questions created yet. Click &quot;Add Question&quot; above to create quiz questions.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                    {currentQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="p-3.5 rounded-xl border border-white/10 bg-black/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                            <span className="size-5 rounded bg-[#FF4D5E]/20 text-[#FF4D5E] flex items-center justify-center text-[10px]">
                              {qIdx + 1}
                            </span>
                            Question Prompt
                          </span>
                          <button
                            type="button"
                            onClick={() => removeQuestion(qIdx)}
                            className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 font-mono transition-colors"
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>

                        <input
                          type="text"
                          placeholder="e.g. What is the standard port for HTTPS?"
                          value={q.question}
                          onChange={(e) => updateQuestionField(qIdx, 'question', e.target.value)}
                          className="w-full bg-white/5 border border-white/15 focus:border-[#FF4D5E] rounded-lg px-3 py-1.5 text-xs text-white outline-none font-mono"
                        />

                        {/* Options */}
                        <div className="space-y-2 pl-3 border-l-2 border-white/10">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
                              Option Answers (click circle to set correct):
                            </span>
                            <button
                              type="button"
                              onClick={() => addOption(qIdx)}
                              className="text-[10px] font-mono text-[#FF4D5E] hover:underline"
                            >
                              + Add Option
                            </button>
                          </div>

                          {(q.options || []).map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setCorrectOption(qIdx, oIdx)}
                                className={`size-6 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${
                                  q.correctIndex === oIdx
                                    ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                    : 'border-white/20 text-white/40 hover:border-white/50'
                                }`}
                                title={q.correctIndex === oIdx ? 'Correct Answer' : 'Click to select as correct answer'}
                              >
                                {q.correctIndex === oIdx ? '✓' : String.fromCharCode(65 + oIdx)}
                              </button>
                              <input
                                type="text"
                                placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                value={opt}
                                onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                className={`flex-1 bg-white/5 border rounded-lg px-2.5 py-1 text-xs text-white outline-none font-mono transition-colors ${
                                  q.correctIndex === oIdx
                                    ? 'border-emerald-500/60 bg-emerald-500/[0.06]'
                                    : 'border-white/10 focus:border-white/30'
                                }`}
                              />
                              {(q.options || []).length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(qIdx, oIdx)}
                                  className="text-white/30 hover:text-red-400 p-1"
                                  title="Delete option"
                                >
                                  <X size={13} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Explanation */}
                        <div>
                          <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">
                            Explanation (shown to learners upon scoring)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. HTTPS default port is 443; HTTP uses port 80."
                            value={q.explanation || ''}
                            onChange={(e) => updateQuestionField(qIdx, 'explanation', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white/80 outline-none focus:border-white/30 font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Button disabled={saving} onClick={() => modal === 'addQuiz' ? save('/api/quiz', 'POST', form) : save(`/api/quiz/${(editing as Quiz)._id}`, 'PATCH', form)} className="bg-[#FF4D5E] w-full font-bold text-[#071007] hover:bg-[#dcff72] mt-4">
              {saving ? 'Saving…' : 'Save Quiz'}
            </Button>
          </Modal>
        )
      })()}

      {/* Edit User */}
      {modal === 'editUser' && editing && (
        <Modal title={`Edit: ${(editing as User).username}`} onClose={closeModal}>
          <div className="admin-form-group">
            <label>Display Name<input value={fv('displayName')} onChange={e => setForm({ ...form, displayName: e.target.value })} /></label>
            <label>Bio<textarea value={fv('bio') as string} onChange={e => setForm({ ...form, bio: e.target.value })} /></label>
            <label>XP (admin override)<input type="number" value={fv('xp')} onChange={e => setForm({ ...form, xp: +e.target.value })} /></label>
            <label>Credits (admin override)<input type="number" value={fv('credits')} onChange={e => setForm({ ...form, credits: +e.target.value })} /></label>
          </div>
          <Button disabled={saving} onClick={() => save(`/api/users/${(editing as User)._id}`, 'PATCH', form)} className="bg-[#FF4D5E] w-full font-bold text-[#071007] hover:bg-[#dcff72] mt-4">
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </Modal>
      )}

      {/* Add Badge */}
      {modal === 'addBadge' && (
        <Modal title="Add Badge" onClose={closeModal}>
          <div className="admin-form-group">
            <label>Name<input value={fv('name')} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
            <label>Slug<input value={fv('slug')} onChange={e => setForm({ ...form, slug: e.target.value })} /></label>
            <label>Icon (emoji)<input value={fv('icon')} onChange={e => setForm({ ...form, icon: e.target.value })} /></label>
            <label>Description<input value={fv('description')} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
            <label>Tier
              <select value={fv('tier')} onChange={e => setForm({ ...form, tier: e.target.value })}>
                <option value="bronze">Bronze</option><option value="silver">Silver</option><option value="gold">Gold</option><option value="platinum">Platinum</option>
              </select>
            </label>
            <label>Condition
              <select value={fv('condition')} onChange={e => setForm({ ...form, condition: e.target.value })}>
                <option value="quiz_count">Quiz Count</option><option value="xp_threshold">XP Threshold</option><option value="streak">Streak</option><option value="course_complete">Course Complete</option><option value="manual">Manual</option>
              </select>
            </label>
            <label>Condition Value<input type="number" value={fv('conditionValue')} onChange={e => setForm({ ...form, conditionValue: +e.target.value })} /></label>
            <label>Credit Bonus on Award<input type="number" value={fv('creditBonus')} onChange={e => setForm({ ...form, creditBonus: +e.target.value })} /></label>
          </div>
          <Button disabled={saving} onClick={() => save('/api/badges', 'POST', form)} className="bg-[#FF4D5E] w-full font-bold text-[#071007] hover:bg-[#dcff72] mt-4">
            {saving ? 'Saving…' : 'Create Badge'}
          </Button>
        </Modal>
      )}

      {/* Add Store Item */}
      {modal === 'addStore' && (
        <Modal title="Add Store Item" onClose={closeModal}>
          <div className="admin-form-group">
            <label>Name<input value={fv('name')} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
            <label>Icon (emoji)<input value={fv('icon')} onChange={e => setForm({ ...form, icon: e.target.value })} /></label>
            <label>Description<textarea value={fv('description') as string} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
            <label>Type
              <select value={fv('type')} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="cosmetic">Cosmetic</option><option value="theme">Theme</option><option value="badge_frame">Badge Frame</option><option value="xp_boost">XP Boost</option><option value="course_unlock">Course Unlock</option>
              </select>
            </label>
            <label>Credit Cost<input type="number" value={fv('creditCost')} onChange={e => setForm({ ...form, creditCost: +e.target.value })} /></label>
          </div>
          <Button disabled={saving} onClick={() => save('/api/store', 'POST', form)} className="bg-[#FF4D5E] w-full font-bold text-[#071007] hover:bg-[#dcff72] mt-4">
            {saving ? 'Saving…' : 'Add to Store'}
          </Button>
        </Modal>
      )}

      {/* Add / Edit Leaderboard */}
      {(modal === 'addLeaderboard' || modal === 'editLeaderboard') && (
        <Modal title={modal === 'addLeaderboard' ? 'Add Entry' : 'Edit Entry'} onClose={closeModal}>
          <div className="admin-form-group">
            <label>Rank<input type="number" value={fv('rank')} onChange={e => setForm({ ...form, rank: +e.target.value })} /></label>
            <label>Username<input value={fv('username')} onChange={e => setForm({ ...form, username: e.target.value })} /></label>
            <label>XP<input type="number" value={fv('xp')} onChange={e => setForm({ ...form, xp: +e.target.value })} /></label>
            <label>Streak (days)<input type="number" value={fv('streak')} onChange={e => setForm({ ...form, streak: +e.target.value })} /></label>
            <label>Badge (emoji)<input value={fv('badge')} onChange={e => setForm({ ...form, badge: e.target.value })} /></label>
            <label>Specialty<input value={fv('specialty')} onChange={e => setForm({ ...form, specialty: e.target.value })} /></label>
          </div>
          <Button disabled={saving} onClick={() => modal === 'addLeaderboard' ? save('/api/leaderboard', 'POST', form) : save(`/api/leaderboard/${(editing as LeaderboardEntry)._id}`, 'PATCH', form)} className="bg-[#FF4D5E] w-full font-bold text-[#071007] hover:bg-[#dcff72] mt-4">
            {saving ? 'Saving…' : 'Save Entry'}
          </Button>
        </Modal>
      )}

      {/* Toast */}
      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  )
}
