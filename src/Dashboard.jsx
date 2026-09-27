import { useRef, useState } from 'react'
import { CATEGORIES, PRODUCTS } from './products.js'
import { REFERRAL_BONUS, USER, inr } from './wallet.js'
import { WalletCard } from './Wallet.jsx'
import { Earn, Icon, Logo } from './ui.jsx'

const INVITE_LINK = 'https://example.com/invite/ankush'

// Tile tint per category.
const HUES = {
  cards: '#2f7cf6',
  loans: '#e39a00',
  bank: '#12a37a',
  demat: '#7b5cff',
  insurance: '#e0365c',
  invest: '#16a36b',
  deals: '#ff6a2b',
  crypto: '#d98a00',
  games: '#b640dc',
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
            <h2>Browse categories</h2>
          </header>
          <nav className="bento" aria-label="Categories">
            {TILES.map((c, i) => (
              <button
                key={c.id}
                type="button"
                className={i === 0 ? 'bento-tile is-hero' : 'bento-tile'}
                style={{ '--hue': HUES[c.id], '--i': i }}
                onClick={() => onOpenCategory(c.id)}
              >
                <span className="bento-icon">
                  <Icon name={c.id} size={i === 0 ? 20 : 15} />
                </span>
                <span className="bento-text">
                  <b>{c.short}</b>
                  {i > 0 && c.top && <em>{c.top}</em>}
                </span>
                {i === 0 && c.top && (
                  <span className="bento-pay">
                    <small>Earn upto</small>
                    {c.top}
                  </span>
                )}
                {i === 0 && <span className="bento-count">{c.count} offers</span>}
              </button>
            ))}
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
