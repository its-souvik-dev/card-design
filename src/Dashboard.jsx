import { useRef, useState } from 'react'
import { CATEGORIES, PRODUCTS } from './products.js'
import { REFERRAL_BONUS, USER, inr } from './wallet.js'
import { WalletCard } from './Wallet.jsx'
import { CatIcon, Earn, Icon, Logo } from './ui.jsx'

const INVITE_LINK = 'https://example.com/invite/ankush'

// Accent colour per category.
const HUES = {
  cards: '#3b6cff',
  loans: '#e8930c',
  bank: '#10a37f',
  demat: '#7b5cff',
  insurance: '#e8425f',
  invest: '#16a34a',
  deals: '#f06424',
  crypto: '#c98a00',
  games: '#b33fd6',
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// Best payout per category, preferring flat rupee payouts over percentages.
const TILES = CATEGORIES.map((c) => {
  const items = PRODUCTS.filter((p) => p.category === c.id)
  const flat = items.filter((p) => !p.percent).sort((a, b) => b.earn - a.earn)[0]
  const pct = items.filter((p) => p.percent).sort((a, b) => b.earn - a.earn)[0]
  return { ...c, count: items.length, top: flat ? inr(flat.earn) : pct ? `${pct.earn}%` : null }
})

const FEATURED = PRODUCTS.filter((p) => p.status === 'top' && !p.percent)
  .sort((a, b) => b.earn - a.earn)
  .slice(0, 4)

export default function Dashboard({ theme, onTheme, copied, onOpenCategory, onOpenProduct, onShare, onWithdraw }) {
  const [slide, setSlide] = useState(0)
  const [invited, setInvited] = useState(false)
  const [allCats, setAllCats] = useState(false)
  const railRef = useRef()
  const inviteTimer = useRef()

  function onRailScroll(e) {
    const el = e.currentTarget
    const w = el.firstElementChild?.offsetWidth || 1
    setSlide(Math.round(el.scrollLeft / (w + 12)))
  }

  function goToSlide(i) {
    const el = railRef.current
    el?.children[i]?.scrollIntoView({ inline: 'start', block: 'nearest', behavior: 'smooth' })
  }

  async function invite() {
    const text = `Join me and earn by sharing offers. Sign up here:`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Join me', text, url: INVITE_LINK })
        return
      }
      await navigator.clipboard.writeText(`${text} ${INVITE_LINK}`)
      setInvited(true)
      clearTimeout(inviteTimer.current)
      inviteTimer.current = setTimeout(() => setInvited(false), 1800)
    } catch {
      /* share sheet dismissed */
    }
  }

  return (
    <div className="app">
      <header className="dash-top">
        <span className="avatar" aria-hidden="true">
          {USER.name[0]}
        </span>
        <div className="dash-hello">
          <p className="hello">{greeting()}</p>
          <h1>{USER.name}</h1>
        </div>
        <button
          type="button"
          className="icon-btn"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={onTheme}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
        <button type="button" className="icon-btn" aria-label="Notifications">
          <Icon name="bell" />
          <span className="dot" />
        </button>
      </header>

      <main className="page has-nav dash">
        <WalletCard onWithdraw={onWithdraw} />

        <section aria-label="Featured offers">
          <div className="rail" ref={railRef} onScroll={onRailScroll}>
            {FEATURED.map((p) => (
              <article key={p.id} className="promo" style={{ '--accent': p.color }}>
                <button type="button" className="promo-face" onClick={() => onOpenProduct(p)}>
                  <span className="promo-tag">{p.campaign || 'Top selling'}</span>
                  <h3>{p.name}</h3>
                  <p>{p.points[0]}</p>
                  <Logo p={p} className="promo-logo" />
                </button>
                <div className="promo-foot">
                  <div>
                    <p className="note-label">Earn upto</p>
                    <Earn p={p} />
                  </div>
                  <button type="button" className="promo-share" onClick={() => onShare(p)}>
                    <Icon name={copied === p.id ? 'check' : 'share'} size={16} />
                    {copied === p.id ? 'Copied' : 'Share'}
                  </button>
                </div>
              </article>
            ))}
          </div>
          <div className="dots">
            {FEATURED.map((p, i) => (
              <button
                key={p.id}
                type="button"
                className={i === slide ? 'is-on' : ''}
                aria-label={`Show ${p.name}`}
                aria-current={i === slide}
                onClick={() => goToSlide(i)}
              />
            ))}
          </div>
        </section>

        <section>
          <header className="dash-head">
            <div>
              <h2>Browse categories</h2>
              <p className="dash-sub">{PRODUCTS.length} offers across {CATEGORIES.length} categories</p>
            </div>
          </header>
          <nav className={allCats ? 'cats is-open' : 'cats'} aria-label="Categories">
            {TILES.map((c, i) => (
              <button
                key={c.id}
                type="button"
                className={i < 7 ? 'cat' : 'cat is-extra'}
                style={{ '--hue': HUES[c.id], '--i': i }}
                onClick={() => onOpenCategory(c.id)}
              >
                <span className="cat-icon">
                  <CatIcon name={c.id} size={15} />
                </span>
                <span className="cat-text">
                  <b>{c.short}</b>
                  {c.top && <em>{c.top}</em>}
                </span>
              </button>
            ))}
            <button
              type="button"
              className="cat is-more"
              style={{ '--hue': 'var(--brand)', '--i': allCats ? TILES.length : 7 }}
              aria-expanded={allCats}
              onClick={() => setAllCats((v) => !v)}
            >
              <span className="cat-icon">
                <CatIcon name="all" size={14} />
              </span>
              <span className="cat-text">
                <b>{allCats ? 'Less' : 'More'}</b>
                <em>{allCats ? 'Hide' : `+${TILES.length - 7}`}</em>
              </span>
            </button>
          </nav>
        </section>

        <section className="invite">
          <span className="invite-art" aria-hidden="true">
            <Icon name="gift" size={96} />
          </span>
          <h2>Earn {inr(REFERRAL_BONUS)} for every friend who joins</h2>
          <p>Share your invite link. You get paid once they start earning from offers.</p>
          <button type="button" className="btn-primary" onClick={invite}>
            <Icon name={invited ? 'check' : 'userPlus'} size={18} />
            {invited ? 'Link copied' : 'Invite friends'}
          </button>
        </section>
      </main>
    </div>
  )
}
