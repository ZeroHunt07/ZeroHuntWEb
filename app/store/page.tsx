'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  CreditCard,
  Lock,
  Menu,
  Shield,
  ShoppingBag,
  Sparkles,
  Zap,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import CursorGrid from '@/components/CursorGrid'
import TechText from '@/components/TechText'
import ItemDetailSidePanel, { type GenericItemData } from '@/components/ItemDetailSidePanel'

interface StoreItem {
  _id: string
  name: string
  description: string
  icon: string
  type: string
  creditCost: number
  active: boolean
}

interface UserSummary {
  _id: string
  username: string
  displayName: string
  xp: number
  credits: number
  ownedItems: string[]
}

export default function StorePage() {
  const [items, setItems] = useState<StoreItem[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserSummary | null>(null)
  const [buyingId, setBuyingId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [selectedDetailItem, setSelectedDetailItem] = useState<GenericItemData | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const loadData = () => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user)
        } else {
          const storedUsername = localStorage.getItem('zh_active_user')
          if (storedUsername) {
            fetch(`/api/users?username=${encodeURIComponent(storedUsername)}`)
              .then((r) => r.json())
              .then((u) => {
                if (u && !u.error) setUser(u)
              })
              .catch(() => {})
          }
        }
      })
      .catch(() => {})

    fetch('/api/store')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data.filter((i) => i.active))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleBuy = async (item: StoreItem) => {
    if (!user) return
    if (user.credits < item.creditCost) {
      showToast(`⚠️ Insufficient credits! Take more quizzes to earn ${item.creditCost - user.credits} more.`)
      return
    }

    setBuyingId(item._id)
    try {
      const res = await fetch('/api/store/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          itemId: item._id,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast(`🎉 Successfully unlocked: ${item.name}!`)
        setUser((prev) =>
          prev
            ? {
                ...prev,
                credits: data.newCredits,
                ownedItems: [...(prev.ownedItems || []), item._id],
              }
            : null
        )
      } else {
        showToast(`❌ ${data.error || 'Purchase failed'}`)
      }
    } catch {
      showToast('❌ Server error during purchase')
    } finally {
      setBuyingId(null)
    }
  }

  const categories = ['all', 'theme', 'badge_frame', 'xp_boost', 'cosmetic']
  const filteredItems = items.filter(
    (item) => activeCategory === 'all' || item.type === activeCategory
  )

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
            <Link href="/store" className="text-[#FF4D5E]">STORE</Link>
            <Link href="/leaderboard">RANKS</Link>
            <Link href="/profile">PROFILE</Link>
          </nav>
          <div className="inner-header-actions">
            {user && (
              <div className="flex items-center gap-2 text-xs font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                <span className="text-amber-400 font-bold">🪙 {user.credits}</span>
                <span className="text-white/50">CREDITS</span>
              </div>
            )}
            <Link href="/quizzes">
              <Button size="sm" className="bg-[#FF4D5E] text-xs font-bold tracking-[.12em] text-[#071007] hover:bg-[#dcff72]">
                EARN CREDITS
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

        {/* Hero */}
        <section className="inner-hero">
          <div className="inner-eyebrow">
            <span className="eyebrow-rule" />
            <TechText text="THE ARMORY / HUNTER STORE" />
          </div>
          <div className="inner-hero-body">
            <p className="inner-section-kicker">01 / REDEEM YOUR HUNT PROCEEDS</p>
            <h1 className="inner-title">
              THE HUNTER<br />
              <span className="accent-span">ARMORY.</span>
            </h1>
            <p className="inner-desc">
              Spend credits earned from quizzes, completed labs, and streak achievements on terminal themes, cosmetic profile frames, and XP boost multipliers.
            </p>
            <div className="inner-cta-row">
              <a href="#store-items">
                <Button className="bg-[#FF4D5E] px-7 font-bold tracking-[.12em] text-[#071007] hover:bg-[#dcff72]">
                  BROWSE INVENTORY <ArrowRight data-icon="inline-end" />
                </Button>
              </a>
              <Link href="/quizzes" className="inner-ghost-link">
                SOLVE QUIZZES FOR CREDITS <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <aside className="inner-stats liquid-glass">
            <div className="stat-slot">
              <div className="stat-val">{user?.credits ?? 0}</div>
              <div className="stat-lbl">YOUR CREDITS</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-slot">
              <div className="stat-val">{items.length}</div>
              <div className="stat-lbl">ITEMS IN STOCK</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-slot">
              <div className="stat-val">{user?.ownedItems?.length ?? 0}</div>
              <div className="stat-lbl">ITEMS OWNED</div>
            </div>
          </aside>
        </section>

        {/* Filter categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border ${
                activeCategory === cat
                  ? 'border-[#FF4D5E] bg-[#FF4D5E]/15 text-[#FF4D5E] font-bold'
                  : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Store Grid */}
        <section id="store-items" className="inner-list-section">
          {loading ? (
            <div className="text-center py-20 text-white/40 font-mono text-sm">
              QUERYING VAULT STORAGE...
            </div>
          ) : (
            <div className="inner-grid">
              {filteredItems.map((item) => {
                const isOwned = user?.ownedItems?.includes(item._id)
                const canAfford = (user?.credits ?? 0) >= item.creditCost

                return (
                  <article
                    key={item._id}
                    className="inner-card liquid-glass flex flex-col justify-between cursor-pointer hover:border-[#FF4D5E]/60 transition-all hover:-translate-y-1.5 group"
                    onClick={() => {
                      setSelectedDetailItem({
                        _id: item._id,
                        title: item.name,
                        description: item.description,
                        copy: item.description,
                        type: 'store',
                        creditCost: item.creditCost,
                        icon: item.icon,
                        meta: `${item.creditCost} CREDITS · ${item.type.replace('_', ' ').toUpperCase()}`,
                      })
                    }}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="text-4xl p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-105 transition-transform">
                          {item.icon}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 border border-white/10 px-2.5 py-1 rounded-full">
                          {item.type.replace('_', ' ')}
                        </span>
                      </div>

                      <h3 className="card-title text-lg font-bold mt-4 text-white group-hover:text-[#FF4D5E] transition-colors">{item.name}</h3>
                      <p className="card-copy mt-2 text-white/60 text-xs leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 font-mono text-sm">
                        <span className="text-amber-400 font-bold">🪙 {item.creditCost}</span>
                        <span className="text-white/40 text-xs">CREDITS</span>
                      </div>

                      {isOwned ? (
                        <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20">
                          <Check size={14} /> OWNED
                        </span>
                      ) : (
                        <Button
                          disabled={buyingId === item._id || !canAfford}
                          onClick={() => handleBuy(item)}
                          className={`text-xs font-bold ${
                            canAfford
                              ? 'bg-[#FF4D5E] text-[#071007] hover:bg-[#dcff72]'
                              : 'bg-white/10 text-white/40 cursor-not-allowed'
                          }`}
                        >
                          {buyingId === item._id
                            ? 'UNLOCKING...'
                            : canAfford
                            ? 'UNLOCK NOW'
                            : 'NEED CREDITS'}
                        </Button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="inner-footer">
          <p className="inner-footer-copy">© 2026 ZERO HUNT ACADEMY. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <Link href="/quizzes" className="inner-footer-link">EARN CREDITS IN QUIZZES</Link>
            <Link href="/profile" className="inner-footer-link">MY PROFILE</Link>
            <Link href="/admin" className="inner-footer-link opacity-50 hover:opacity-100">ADMIN</Link>
          </div>
        </footer>
      </div>

      {/* Armory Item Side Panel */}
      <ItemDetailSidePanel
        item={selectedDetailItem}
        itemType="store"
        onClose={() => setSelectedDetailItem(null)}
        onAction={(itm) => {
          const raw = items.find((x) => x._id === itm._id)
          if (raw) handleBuy(raw)
        }}
      />
    </main>
  )
}
