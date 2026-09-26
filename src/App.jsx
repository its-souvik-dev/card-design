import { useMemo, useRef, useState } from 'react'
import './App.css'

const REF = 'AK27'

const APPS = [
  {
    id: 'paylo',
    code: 'PAYLO',
    name: 'Paylo',
    category: 'Finance',
    glyph: '₹',
    color: '#4c4ddc',
    rating: 4.7,
    reviews: '2.1M',
    payout: 150,
    unit: 'per signup',
    boost: '2× payout till Sunday',
    points: ['Paid in 24 hrs', 'No KYC needed', 'Unlimited referrals'],
    link: 'https://example.com/r/paylo',
  },
  {
    id: 'quizzo',
    code: 'QUIZ',
    name: 'Quizzo',
    category: 'Games',
    glyph: 'Q',
    color: '#e4572e',
    rating: 4.5,
    reviews: '860K',
    payout: 60,
    unit: 'per install',
    boost: null,
    points: ['Install & open is enough', 'Instant credit'],
    link: 'https://example.com/r/quizzo',
  },
  {
    id: 'cartly',
    code: 'CART',
    name: 'Cartly',
    category: 'Shopping',
    glyph: 'C',
    color: '#0e9f6e',
    rating: 4.4,
    reviews: '1.3M',
    payout: 8,
    percent: true,
    unit: 'of every order',
    boost: 'Lifetime commission',
    points: ['Earn on every order', 'Weekly payouts'],
    link: 'https://example.com/r/cartly',
  },
  {
    id: 'coinnest',
    code: 'COIN',
    name: 'CoinNest',
    category: 'Finance',
    glyph: 'N',
    color: '#c98a00',
    rating: 4.6,
    reviews: '540K',
    payout: 250,
    unit: 'per first trade',
    boost: null,
    points: ['Min. trade ₹100', 'Paid in 48 hrs'],
    link: 'https://example.com/r/coinnest',
  },
  {
    id: 'fitstreak',
    code: 'FIT',
    name: 'FitStreak',
    category: 'Health',
    glyph: 'F',
    color: '#d6336c',
    rating: 4.8,
    reviews: '320K',
    payout: 90,
    unit: 'per trial start',
    boost: null,
    points: ['Free trial counts', 'Highest-rated app here'],
    link: 'https://example.com/r/fitstreak',
  },
]

const FILTERS = ['All', 'Highest payout', 'Finance', 'Games', 'Shopping', 'Health']

const byPayout = (list) =>
  list.filter((a) => !a.percent).sort((a, b) => b.payout - a.payout)

function Icon({ name }) {
  const p = {
    share: 'M7 17 17 7M9 7h8v8',
    check: 'M5 12.5 10 17 19 7',
    copy: 'M9 9h10v10H9zM5 15V5h10',
  }[name]
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={p} stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function OfferCard({ app, index, isTop, copied, onShare, onCopyCode }) {
  const code = `${REF}-${app.code}`
  const label = app.boost ?? (isTop ? 'Highest payout' : 'You earn')

  return (
    <article className="card" style={{ '--accent': app.color, '--i': index }}>
      <header className="card-head">
        <div className="app-icon" aria-hidden="true">{app.glyph}</div>
        <div className="app-meta">
          <h3>{app.name}</h3>
          <p>{app.category} · {app.reviews} reviews</p>
        </div>
        <div className="rating" aria-label={`Rated ${app.rating} out of 5`}>
          <span className="star" aria-hidden="true">★</span>
          {app.rating}
        </div>
      </header>

      <ul className="points">
        {app.points.map((p) => (
          <li key={p}>
            <Icon name="check" />
            {p}
          </li>
        ))}
      </ul>

      <div className="note">
        <p className={app.boost || isTop ? 'note-label is-hot' : 'note-label'}>{label}</p>
        <p className="amount">
          {app.percent ? (
            <>
              {app.payout}
              <span className="amount-sym">%</span>
            </>
          ) : (
            <>
              <span className="amount-sym">₹</span>
              {app.payout}
            </>
          )}
          <span className="amount-unit">{app.unit}</span>
        </p>
        <div className="note-foot">
          <button
            type="button"
            className="code"
            onClick={() => onCopyCode(app, code)}
            aria-label={`Copy referral code ${code}`}
          >
            {copied === `code-${app.id}` ? 'Code copied' : code}
            <Icon name={copied === `code-${app.id}` ? 'check' : 'copy'} />
          </button>
          <button type="button" className="share" onClick={() => onShare(app)}>
            {copied === `link-${app.id}` ? 'Link copied' : 'Share'}
            <Icon name={copied === `link-${app.id}` ? 'check' : 'share'} />
          </button>
        </div>
      </div>
    </article>
  )
}

function App() {
  const [filter, setFilter] = useState('All')
  const [copied, setCopied] = useState(null)
  const timer = useRef()

  const topId = useMemo(() => byPayout(APPS)[0].id, [])

  const visible = useMemo(() => {
    if (filter === 'All') return APPS
    if (filter === 'Highest payout') return byPayout(APPS)
    return APPS.filter((a) => a.category === filter)
  }, [filter])

  function flash(key) {
    setCopied(key)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(null), 1800)
  }

  async function handleShare(app) {
    const text = `Join ${app.name} with my link — ${app.points[0].toLowerCase()}.`
    try {
      if (navigator.share) {
        await navigator.share({ title: app.name, text, url: app.link })
        return
      }
      await navigator.clipboard.writeText(`${text} ${app.link}`)
      flash(`link-${app.id}`)
    } catch {
      /* share sheet dismissed */
    }
  }

  async function handleCopyCode(app, code) {
    try {
      await navigator.clipboard.writeText(code)
      flash(`code-${app.id}`)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <main className="page">
      <header className="top">
        <span className="brand">Share &amp; Earn</span>
        <span className="wallet">
          <span className="wallet-dot" />
          ₹2,480 earned
        </span>
      </header>

      <h1 className="headline">
        Share an app.
        <span>Get paid when they join.</span>
      </h1>

      <nav className="filters" aria-label="Filter offers">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={f === filter ? 'chip is-active' : 'chip'}
            aria-pressed={f === filter}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </nav>

      <section className="grid" aria-label={`${visible.length} offers`}>
        {visible.map((app, i) => (
          <OfferCard
            key={app.id}
            app={app}
            index={i}
            isTop={app.id === topId}
            copied={copied}
            onShare={handleShare}
            onCopyCode={handleCopyCode}
          />
        ))}
      </section>
    </main>
  )
}

export default App
