import { useRef, useState } from 'react'
import { detailsFor } from './details.js'
import { Icon, Logo } from './ui.jsx'

// Share targets for the pull-up sheet. `href` builds the app's share link.
const APPS = [
  ['WhatsApp', 'whatsapp', '#25d366', (t) => `https://wa.me/?text=${encodeURIComponent(t)}`],
  ['Telegram', 'telegram', '#229ed9', (t, u) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`],
  ['Facebook', 'facebook', '#1877f2', (t, u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`],
  ['X', 'xlogo', '#111111', (t, u) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(u)}`],
  ['SMS', 'sms', '#34a853', (t) => `sms:?&body=${encodeURIComponent(t)}`],
  ['Email', 'mail', '#ea4335', (t, u, subject) => `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(t)}`],
]

const money = (v) => (typeof v === 'number' ? `₹${v.toLocaleString('en-IN')}` : v)

function Head({ icon, title, children }) {
  return (
    <h2 className="dt-h">
      <span className="dt-h-icon" aria-hidden="true">
        <Icon name={icon} size={14} />
      </span>
      <span className="dt-h-title">{title}</span>
      {children}
    </h2>
  )
}

export default function Details({ p, isFav, copied, onBack, onFav, onShare }) {
  const d = detailsFor(p)
  const [readMore, setReadMore] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [sheet, setSheet] = useState(false)
  const [drag, setDrag] = useState(0)
  const [linkCopied, setLinkCopied] = useState(false)
  const startY = useRef(null)
  const moved = useRef(false)
  const copyTimer = useRef()
  const shareText = `Apply for the ${p.name} here: ${p.link}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(p.link)
      setLinkCopied(true)
      clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setLinkCopied(false), 1600)
    } catch {
      /* clipboard blocked */
    }
  }

  // Drag the bar up to open the share sheet, down to close it.
  function dragStart(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    startY.current = e.clientY
    moved.current = false
  }
  function dragMove(e) {
    if (startY.current == null) return
    const dy = e.clientY - startY.current
    if (!moved.current && Math.abs(dy) > 6) {
      moved.current = true
      e.currentTarget.setPointerCapture?.(e.pointerId)
    }
    // Follow the finger a little, with resistance.
    setDrag(Math.max(-40, Math.min(40, dy * 0.4)))
  }
  function dragEnd(e) {
    if (startY.current == null) return
    const dy = e.clientY - startY.current
    startY.current = null
    setDrag(0)
    if (dy < -30) setSheet(true)
    else if (dy > 30) setSheet(false)
  }

  const flat = d.events.filter(([, v]) => typeof v === 'number')
  const peak = Math.max(1, ...flat.map(([, v]) => v))
  const maxPayout = p.percent ? `${p.earn}%` : money(p.earn)

  return (
    <div className="app dt" style={{ '--accent': p.color }}>
      <header className="dt-hero">
        {/* Brand initials as a giant outlined watermark */}
        <span className="dt-mono" aria-hidden="true">
          {p.mono}
        </span>

        <div className="dt-bar">
          <button type="button" className="dt-glass" aria-label="Back" onClick={onBack}>
            <Icon name="back" size={20} />
          </button>
          <button
            type="button"
            className={isFav ? 'dt-glass is-on' : 'dt-glass'}
            aria-pressed={isFav}
            aria-label={isFav ? 'Remove from saved' : 'Save offer'}
            onClick={() => onFav(p.id)}
          >
            <Icon name="heart" size={18} filled={isFav} />
          </button>
        </div>

        <div className="dt-id">
          <Logo p={p} className="dt-logo" />
          <p className="dt-bank">
            {p.bank}
            {p.status === 'top' && <span className="dt-flag">★ Top selling</span>}
          </p>
          <h1>{p.name}</h1>
        </div>

        {/* Payout ticket: amount on the left, approval stub on the right */}
        <div className="dt-ticket-wrap">
        {p.campaign && <span className="dt-sticker">{p.campaign}</span>}
        <div className="dt-ticket">
          <div className="dt-ticket-main">
            <span>Earn up to</span>
            <b>{maxPayout}</b>
            <small>{p.unit}</small>
          </div>
          <div className="dt-ticket-stub">
            <Icon name="bolt" size={18} />
            <b>{d.approval}</b>
            <small>approval</small>
          </div>
        </div>
        </div>

        <ul className="dt-chips">
          <li>
            <Icon name="layers" size={14} />
            {d.events.length} payout events
          </li>
          {p.facts.slice(0, 1).map(([k, v]) => (
            <li key={k}>
              {k} <b>{v}</b>
            </li>
          ))}
        </ul>
      </header>

      <main className="dt-body">
        {/* Payout ladder — bar length = share of the payout */}
        <section id="d-payouts" className="dt-card">
          <Head icon="wallet" title="Payout events">
            {!p.percent && d.events.length > 1 ? (
              <span className="dt-total">Total {maxPayout}</span>
            ) : (
              <span>{d.events.length} step</span>
            )}
          </Head>
          <ol className="ladder">
            {d.events.map(([name, v, icon], i) => (
              <li key={name} style={{ '--w': typeof v === 'number' ? v / peak : 1, '--i': i }}>
                <span className="ladder-icon">
                  <Icon name={icon} size={15} />
                </span>
                <span className="ladder-main">
                  <span className="ladder-name">{name}</span>
                  <span className="ladder-track">
                    <span />
                  </span>
                </span>
                <b>{money(v)}</b>
              </li>
            ))}
          </ol>
        </section>

        <section id="d-audience" className="dt-card dt-audience">
          <Head icon="userPlus" title="Who to share with" />
          <p className={readMore ? 'dt-text' : 'dt-text is-clamped'}>{d.audience}</p>
          <button type="button" className="dt-more" onClick={() => setReadMore((v) => !v)}>
            {readMore ? 'Show less' : 'Read more'}
            <Icon name="next" size={12} />
          </button>
        </section>

        <section id="d-benefits" className="dt-card">
          <Head icon="gift" title="Benefits">
            <span>{d.benefits.length} perks</span>
          </Head>
          <ul className="dt-perks">
            {d.benefits.map(([lead, rest]) => (
              <li key={lead}>
                <span className="dt-tick">
                  <Icon name="check" size={11} />
                </span>
                <b>{lead}</b>
                {rest && <p>{rest}</p>}
              </li>
            ))}
          </ul>
        </section>

        <section id="d-steps" className="dt-card dt-card-bleed">
          <Head icon="history" title="How it works">
            <span>Swipe →</span>
          </Head>
          <ol className="dt-steps">
            {d.steps.map(([title, text], i) => (
              <li key={title}>
                <span className="dt-step-no" aria-hidden="true">
                  {i + 1}
                </span>
                <b>{title}</b>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="d-terms" className="dt-card">
          <details className="dt-fold">
            <summary>
              <Head icon="insurance" title="Terms & conditions">
                <span>
                  {d.terms.length} rules
                  <Icon name="next" size={14} />
                </span>
              </Head>
            </summary>
            <ul className="dt-terms">
              {d.terms.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </details>
        </section>

        <section id="d-faq" className="dt-card dt-faq">
          <Head icon="search" title="Questions" />
          {d.faqs.map(([q, a], i) => {
            const open = openFaq === i
            return (
              <div key={q} className={open ? 'faq is-open' : 'faq'}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenFaq(open ? null : i)}
                >
                  {q}
                  <span className="faq-plus" aria-hidden="true" />
                </button>
                <div className="faq-a">
                  <p>{a}</p>
                </div>
              </div>
            )
          })}
        </section>
      </main>

      {sheet && <div className="dt-scrim" onClick={() => setSheet(false)} />}

      <div
        className={sheet ? 'dt-dock is-open' : 'dt-dock'}
        style={{ '--drag': `${drag}px` }}
        onPointerDown={dragStart}
        onPointerMove={dragMove}
        onPointerUp={dragEnd}
        onPointerCancel={dragEnd}
        onClickCapture={(e) => {
          // A drag should not also count as a tap on whatever it started on.
          if (moved.current) {
            e.stopPropagation()
            e.preventDefault()
            moved.current = false
          }
        }}
      >
        <button
          type="button"
          className="dt-grip"
          aria-label={sheet ? 'Hide share options' : 'Show share options'}
          aria-expanded={sheet}
          onClick={() => setSheet((v) => !v)}
        >
          <span />
        </button>

        <div className="dt-sheet" aria-hidden={!sheet}>
          <div className="dt-sheet-in">
            <p className="dt-sheet-title">Share via</p>
            <div className="dt-apps">
              {APPS.map(([name, icon, color, href]) => (
                <a
                  key={name}
                  className="dt-app"
                  href={href(shareText, p.link, p.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={sheet ? 0 : -1}
                  style={{ '--c': color }}
                >
                  <i>
                    <Icon name={icon} size={20} />
                  </i>
                  {name}
                </a>
              ))}
              <button type="button" className="dt-app" tabIndex={sheet ? 0 : -1} onClick={copyLink} style={{ '--c': '#5e6b78' }}>
                <i>
                  <Icon name={linkCopied ? 'check' : 'link'} size={20} />
                </i>
                {linkCopied ? 'Copied' : 'Copy link'}
              </button>
              <button type="button" className="dt-app" tabIndex={sheet ? 0 : -1} onClick={() => onShare(p)} style={{ '--c': '#0e1b2c' }}>
                <i>
                  <Icon name="more" size={20} />
                </i>
                More
              </button>
            </div>

            <div className="dt-msg">
              <small>Message your friends will get</small>
              <p>{shareText}</p>
            </div>
          </div>
        </div>

        <div className="dt-dock-row">
          <div className="dt-dock-earn">
            <small>{copied === p.id ? 'Link copied — paste it anywhere' : sheet ? 'Pick an app to share' : 'Swipe up to share'}</small>
            <p>
              Earn <b>{maxPayout}</b> {p.unit}
            </p>
          </div>
          <button
            type="button"
            className="dt-cta"
            aria-label={`Share ${p.name}`}
            onClick={() => onShare(p)}
          >
            <Icon name={copied === p.id ? 'check' : 'share'} size={19} />
          </button>
        </div>
      </div>
    </div>
  )
}
