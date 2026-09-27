import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import './App.css'
import './Dashboard.css'
import './Details.css'
import Dashboard from './Dashboard.jsx'
import Details from './Details.jsx'
import Home from './Home.jsx'
import Wallet from './Wallet.jsx'
import { WALLET } from './wallet.js'
import { CATEGORIES, PRODUCTS } from './products.js'
import { BottomNav, Earn, Icon, Logo } from './ui.jsx'

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

function ProductCard({ p, index, isFav, copied, onFav, onShare, onOpen }) {
  return (
    <article
      id={`p-${p.id}`}
      className="card"
      style={{ '--accent': p.color, '--i': index }}
    >
      <header className="card-head">
        <Logo p={p} className="logo" />
        <div className="card-title">
          <h3>
            <button type="button" className="card-open" onClick={() => onOpen(p)}>
              {p.name}
            </button>
          </h3>
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

// Bottom-nav tab id → URL.
const TAB_PATHS = { dashboard: '/', home: '/offers', wallet: '/wallet' }

/* Start each new page at the top, like a native screen change. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/* Go back in history; if the page was opened directly, fall back to Home. */
function useBack() {
  const navigate = useNavigate()
  const location = useLocation()
  return () => (location.key !== 'default' ? navigate(-1) : navigate('/', { replace: true }))
}

/* The top-level screens that share the bottom tab bar. */
function TabScreen({ tab, children }) {
  const navigate = useNavigate()
  return (
    <>
      {children}
      <BottomNav active={tab} onChange={(id) => navigate(TAB_PATHS[id])} balance={WALLET.balance} />
    </>
  )
}

function DetailsPage({ favs, copied, onFav, onShare }) {
  const { id } = useParams()
  const back = useBack()
  const p = PRODUCTS.find((x) => x.id === id)
  if (!p) return <Navigate to="/" replace />
  return (
    <Details
      key={p.id}
      p={p}
      isFav={favs.includes(p.id)}
      copied={copied}
      onBack={back}
      onFav={onFav}
      onShare={onShare}
    />
  )
}

function ProductsPage({ theme, onTheme, favs, copied, onFav, onShare }) {
  const { category = CATEGORIES[0].id } = useParams()
  const navigate = useNavigate()
  const back = useBack()
  const tabsRef = useRef()
  const [bank, setBank] = useState('All')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState(SORTS[0])
  const [favOnly, setFavOnly] = useState(false)

  // Keep the active category tab in view.
  useEffect(() => {
    tabsRef.current
      ?.querySelector('.is-active')
      ?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [category])

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

  if (!CATEGORIES.some((c) => c.id === category)) return <Navigate to="/" replace />

  function switchCategory(id) {
    setBank('All')
    // Replace, so Back leaves the product list instead of stepping through tabs.
    navigate(`/products/${id}`, { replace: true })
  }

  function resetFilters() {
    setQuery('')
    setBank('All')
    setFavOnly(false)
  }

  return (
    <div className="app">
      <header className="topbar">
        <button type="button" className="icon-btn ghost" aria-label="Back" onClick={back}>
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
          onClick={onTheme}
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
              onClick={() => switchCategory(c.id)}
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
                onFav={onFav}
                onShare={onShare}
                onOpen={(x) => navigate(`/product/${x.id}`)}
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

function AppRoutes() {
  const navigate = useNavigate()
  const [theme, setTheme] = useState(initialTheme)
  const [favs, setFavs] = useState(() => load('favs', []))
  const [copied, setCopied] = useState(null)
  const timer = useRef()

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    save('theme', theme)
  }, [theme])

  useEffect(() => {
    save('favs', favs)
  }, [favs])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

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

  const shared = {
    theme,
    onTheme: toggleTheme,
    copied,
    onOpenCategory: (id) => navigate(`/products/${id}`),
    onOpenProduct: (p) => navigate(`/product/${p.id}`),
    onShare: handleShare,
  }
  const productProps = { theme, onTheme: toggleTheme, favs, copied, onFav: toggleFav, onShare: handleShare }

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <TabScreen tab="dashboard">
              <Dashboard {...shared} onWithdraw={() => navigate('/wallet')} />
            </TabScreen>
          }
        />
        <Route
          path="/offers"
          element={
            <TabScreen tab="home">
              <Home {...shared} favs={favs} />
            </TabScreen>
          }
        />
        <Route
          path="/wallet"
          element={
            <TabScreen tab="wallet">
              <Wallet theme={theme} onTheme={toggleTheme} />
            </TabScreen>
          }
        />
        <Route path="/products/:category" element={<ProductsPage {...productProps} />} />
        <Route path="/product/:id" element={<DetailsPage {...productProps} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
