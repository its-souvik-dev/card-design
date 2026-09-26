import { useMemo, useState } from 'react'
import { CATEGORIES, PRODUCTS } from './products.js'
import { Earn, Icon, Logo } from './ui.jsx'

// Sample figures — wire these to the agent's real earnings.
const EARNED = 2480
const GOAL = 5000
const PENDING = 640
const SALES = 38
const TICKS = 24

const inr = (n) => `₹${n.toLocaleString('en-IN')}`
const best = (p) => (p.percent ? `${p.earn}%` : inr(p.earn))

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function MiniCard({ p, copied, onOpen, onShare }) {
  return (
    <article className="mini" style={{ '--accent': p.color }}>
      <button type="button" className="mini-face" onClick={() => onOpen(p)}>
        <span className="mini-head">
          <Logo p={p} className="mini-logo" />
          {p.status === 'top' && <span className="mini-badge">Top</span>}
        </span>
        <h3>{p.name}</h3>
        <span className="mini-mark" aria-hidden="true">{p.mono}</span>
      </button>
      <button
        type="button"
        className="mini-share"
        aria-label={`Share ${p.name}`}
        onClick={() => onShare(p)}
      >
        <Icon name={copied === p.id ? 'check' : 'share'} size={16} />
      </button>
      <div className="mini-earn">
        <p className="note-label">Earn upto</p>
        <Earn p={p} />
      </div>
    </article>
  )
}

function Row({ title, count, items, copied, onSeeAll, onOpen, onShare }) {
  return (
    <section className="row">
      <header className="row-head">
        <h2>
          {title} <span>{count}</span>
        </h2>
        {onSeeAll && (
          <button type="button" className="see-all" onClick={onSeeAll}>
            See all
            <Icon name="next" size={14} />
          </button>
        )}
      </header>
      <div className="row-scroll">
        {items.map((p) => (
          <MiniCard key={p.id} p={p} copied={copied} onOpen={onOpen} onShare={onShare} />
        ))}
      </div>
    </section>
  )
}

export default function Home({ theme, onTheme, favs, copied, onOpenCategory, onOpenProduct, onShare }) {
  const [query, setQuery] = useState('')

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CATEGORIES.map((c) => ({
      ...c,
      items: PRODUCTS.filter(
        (p) => p.category === c.id && (!q || `${p.name} ${p.bank}`.toLowerCase().includes(q)),
      ).sort((a, b) => b.earn - a.earn),
    })).filter((c) => c.items.length)
  }, [query])

  const board = CATEGORIES.map((c) => {
    const top = PRODUCTS.filter((p) => p.category === c.id).sort((a, b) => b.earn - a.earn)[0]
    return { ...c, top: best(top) }
  })

  const saved = PRODUCTS.filter((p) => favs.includes(p.id))
  const searching = query.trim() !== ''

  return (
    <div className="app">
      <header className="home-top">
        <div>
          <p className="hello">{greeting()}</p>
          <h1>Share &amp; earn</h1>
        </div>
        <button
          type="button"
          className="icon-btn"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={onTheme}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
      </header>

      <main className="page home">
        <section className="hero" aria-label="Your earnings this month">
          <p className="hero-label">Earned this month</p>
          <p className="hero-amount">{inr(EARNED)}</p>
          <div
            className="goal"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={GOAL}
            aria-valuenow={EARNED}
            aria-label="Monthly goal"
          >
            {Array.from({ length: TICKS }, (_, i) => (
              <i key={i} className={i < Math.round((EARNED / GOAL) * TICKS) ? 'on' : ''} />
            ))}
          </div>
          <p className="goal-text">
            <strong>{inr(GOAL - EARNED)}</strong> more to hit your {inr(GOAL)} goal
          </p>
          <dl className="hero-stats">
            <div>
              <dt>Pending</dt>
              <dd>{inr(PENDING)}</dd>
            </div>
            <div>
              <dt>Sales</dt>
              <dd>{SALES}</dd>
            </div>
          </dl>
        </section>

        <label className="search">
          <Icon name="search" />
          <input
            type="search"
            placeholder="Search all products"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        {!searching && (
          <nav className="board" aria-label="Categories by best payout">
            {board.map((c) => (
              <button key={c.id} type="button" onClick={() => onOpenCategory(c.id)}>
                <span className="board-top">
                  <Icon name={c.id} size={16} />
                  {c.short}
                </span>
                <span className="board-lead">up to</span>
                <span className="board-num">{c.top}</span>
              </button>
            ))}
          </nav>
        )}

        {!searching && saved.length > 0 && (
          <Row
            title="Saved"
            count={saved.length}
            items={saved}
            copied={copied}
            onOpen={onOpenProduct}
            onShare={onShare}
          />
        )}

        {sections.map((c) => (
          <Row
            key={c.id}
            title={c.label}
            count={c.items.length}
            items={c.items}
            copied={copied}
            onSeeAll={() => onOpenCategory(c.id)}
            onOpen={onOpenProduct}
            onShare={onShare}
          />
        ))}

        {searching && !sections.length && (
          <div className="empty">
            <p>No products match “{query.trim()}”.</p>
            <button type="button" className="chip is-active" onClick={() => setQuery('')}>
              Clear search
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
