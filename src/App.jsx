import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import Home from './Home.jsx'
import { CATEGORIES, PRODUCTS } from './products.js'
import { Earn, Icon } from './ui.jsx'

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

function ProductCard({ p, index, isFav, isFocus, copied, onFav, onShare }) {
  return (
    <article
      id={`p-${p.id}`}
      className={isFocus ? 'card is-focus' : 'card'}
      style={{ '--accent': p.color, '--i': index }}
    >
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
      </dl>

      <div className="note">
        <div className="note-top">
          <p className="note-label">Earn upto</p>
          {p.campaign && <span className="campaign">{p.campaign}</span>}
        </div>
        <Earn p={p} />
        <div className="note-foot">
          <button type="button" className="share" onClick={() => onShare(p)}>
            {copied === p.id ? 'Link copied' : 'Share'}
            <Icon name={copied === p.id ? 'check' : 'share'} size={16} />
          </button>
        </div>
      </div>
    </article>
  )
}

function App() {
  const [theme, setTheme] = useState(initialTheme)
  const [screen, setScreen] = useState('home')
  const [focusId, setFocusId] = useState(null)
  const tabsRef = useRef()
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

  // Arriving on Products: centre the active tab, then bring a tapped product into view.
  useEffect(() => {
    if (screen !== 'products') return
    tabsRef.current
      ?.querySelector('.is-active')
      ?.scrollIntoView({ inline: 'center', block: 'nearest' })
    if (!focusId) return
    document.getElementById(`p-${focusId}`)?.scrollIntoView({ block: 'center' })
    const t = setTimeout(() => setFocusId(null), 1600)
    return () => clearTimeout(t)
  }, [screen, category, focusId])

  function openProducts(categoryId, productId = null) {
    setCategory(categoryId)
    setBank('All')
    setQuery('')
    setFavOnly(false)
    setFocusId(productId)
    setScreen('products')
    window.scrollTo(0, 0)
  }

  function goHome() {
    setScreen('home')
    window.scrollTo(0, 0)
  }

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

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

  if (screen === 'home') {
    return (
      <Home
        theme={theme}
        onTheme={toggleTheme}
        favs={favs}
        copied={copied}
        onOpenCategory={(id) => openProducts(id)}
        onOpenProduct={(p) => openProducts(p.category, p.id)}
        onShare={handleShare}
      />
    )
  }

  return (
    <div className="app">
      <header className="topbar">
        <button type="button" className="icon-btn ghost" aria-label="Back to home" onClick={goHome}>
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
          onClick={toggleTheme}
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

        <div className="tabs" role="tablist" aria-label="Product type" ref={tabsRef}>
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
                isFocus={focusId === p.id}
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
