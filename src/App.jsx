import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

import { CATEGORIES, PRODUCTS } from './products.js'

const APPROVAL = { 1: 'Fair', 2: 'Good', 3: 'Excellent' }
const SORTS = ['Highest earning', 'Top selling']

function load(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key))
    return v ?? fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage blocked */
  }
}

function initialTheme() {
  const saved = load('theme', null)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const ICONS = {
  back: 'M15 5 8 12l7 7',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4',
  share: 'M7 17 17 7M9 7h8v8',
  check: 'M5 12.5 10 17 19 7',
  sort: 'M7 4v16M4 17l3 3 3-3M17 20V4M14 7l3-3 3 3',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z',
  sun: 'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
}

function Icon({ name, size = 18, filled = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={ICONS[name]}
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ApprovalMeter({ level }) {
  return (
    <span className={`meter meter-${level}`}>
      <span className="meter-bars" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <i key={n} className={n <= level ? 'on' : ''} />
        ))}
      </span>
      {APPROVAL[level]}
    </span>
  )
}

function ProductCard({ p, index, isFav, copied, onFav, onShare }) {
  return (
    <article className="card" style={{ '--accent': p.color, '--i': index }}>
      <header className="card-head">
        <div className="logo" aria-hidden="true">{p.mono}</div>
        <div className="card-title">
          <h3>{p.name}</h3>
          <p>
            {p.bank}
            <span className={`status status-${p.status}`}>
              <span className="status-dot" />
              {p.status === 'top' ? 'Top selling' : 'Active'}
            </span>
          </p>
        </div>
        <button
          type="button"
          className={isFav ? 'fav is-on' : 'fav'}
          aria-pressed={isFav}
          aria-label={isFav ? `Remove ${p.name} from favourites` : `Add ${p.name} to favourites`}
          onClick={() => onFav(p.id)}
        >
          <Icon name="heart" filled={isFav} />
        </button>
      </header>

      <ul className="points">
        {p.points.map((pt) => (
          <li key={pt}>
            <Icon name="check" size={14} />
            {pt}
          </li>
        ))}
      </ul>

      <dl className="facts">
        {p.facts.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
        {p.approval && (
          <div>
            <dt>Approval</dt>
            <dd>
              <ApprovalMeter level={p.approval} />
            </dd>
          </div>
        )}
      </dl>

      <div className="note">
        <div className="note-top">
          <p className="note-label">Earn upto</p>
          {p.campaign && <span className="campaign">{p.campaign}</span>}
        </div>
        <p className="amount">
          {p.percent ? (
            <>
              {p.earn}
              <span className="amount-sym">%</span>
            </>
          ) : (
            <>
              <span className="amount-sym">₹</span>
              {p.earn.toLocaleString('en-IN')}
            </>
          )}
          <span className="amount-unit">
            <span className="unit-lead">{p.unit.split(' ')[0]}</span>
            <span className="unit-word">{p.unit.split(' ').slice(1).join(' ')}</span>
          </span>
        </p>
        <div className="note-foot">
          <button type="button" className="share" onClick={() => onShare(p)}>
            {copied === p.id ? 'Link copied' : 'Share to customer'}
            <Icon name={copied === p.id ? 'check' : 'share'} size={16} />
          </button>
        </div>
      </div>
    </article>
  )
}

function App() {
  const [theme, setTheme] = useState(initialTheme)
  const [category, setCategory] = useState('cards')
  const [bank, setBank] = useState('All')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState(SORTS[0])
  const [favs, setFavs] = useState(() => load('favs', []))
  const [favOnly, setFavOnly] = useState(false)
  const [copied, setCopied] = useState(null)
  const timer = useRef()

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    save('theme', theme)
  }, [theme])

  useEffect(() => save('favs', favs), [favs])

  const banks = useMemo(
    () => ['All', ...new Set(PRODUCTS.filter((p) => p.category === category).map((p) => p.bank))],
    [category],
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = PRODUCTS.filter(
      (p) =>
        p.category === category &&
        (bank === 'All' || p.bank === bank) &&
        (!favOnly || favs.includes(p.id)) &&
        (!q || `${p.name} ${p.bank}`.toLowerCase().includes(q)),
    )
    return sort === 'Top selling'
      ? list.sort((a, b) => (b.status === 'top') - (a.status === 'top') || b.earn - a.earn)
      : list.sort((a, b) => b.earn - a.earn)
  }, [category, bank, query, sort, favOnly, favs])

  function switchCategory(id, tab) {
    setCategory(id)
    setBank('All')
    tab.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }

  function toggleFav(id) {
    setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))
  }

  async function handleShare(p) {
    const text = `Apply for the ${p.name} here:`
    try {
      if (navigator.share) {
        await navigator.share({ title: p.name, text, url: p.link })
        return
      }
      await navigator.clipboard.writeText(`${text} ${p.link}`)
      setCopied(p.id)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(null), 1800)
    } catch {
      /* share sheet dismissed */
    }
  }

  function resetFilters() {
    setQuery('')
    setBank('All')
    setFavOnly(false)
  }

  return (
    <div className="app">
      <header className="topbar">
        <button type="button" className="icon-btn ghost" aria-label="Back">
          <Icon name="back" size={22} />
        </button>
        <h1>Products</h1>
        <button
          type="button"
          className={favOnly ? 'icon-btn is-on' : 'icon-btn'}
          aria-pressed={favOnly}
          aria-label="Show favourites only"
          onClick={() => setFavOnly((v) => !v)}
        >
          <Icon name="heart" filled={favOnly} />
          {favs.length > 0 && <span className="badge">{favs.length}</span>}
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
      </header>

      <main className="page">
        <label className="search">
          <Icon name="search" />
          <input
            type="search"
            placeholder="Search products or pincode"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <div className="tabs" role="tablist" aria-label="Product type">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={category === c.id}
              className={category === c.id ? 'is-active' : ''}
              onClick={(e) => switchCategory(c.id, e.currentTarget)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <nav className="chips" aria-label="Filter by brand">
          {banks.map((b) => (
            <button
              key={b}
              type="button"
              className={b === bank ? 'chip is-active' : 'chip'}
              aria-pressed={b === bank}
              onClick={() => setBank(b)}
            >
              {b}
            </button>
          ))}
        </nav>

        <div className="list-head">
          <p>
            <strong>{visible.length}</strong> {visible.length === 1 ? 'product' : 'products'}
            {favOnly && ' in favourites'}
          </p>
          <button
            type="button"
            className="sort"
            onClick={() => setSort(SORTS[(SORTS.indexOf(sort) + 1) % SORTS.length])}
          >
            <Icon name="sort" size={15} />
            {sort}
          </button>
        </div>

        {visible.length ? (
          <section className="grid">
            {visible.map((p, i) => (
              <ProductCard
                key={p.id}
                p={p}
                index={i}
                isFav={favs.includes(p.id)}
                copied={copied}
                onFav={toggleFav}
                onShare={handleShare}
              />
            ))}
          </section>
        ) : (
          <div className="empty">
            <p>No products match these filters.</p>
            <button type="button" className="chip is-active" onClick={resetFilters}>
              Clear filters
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
