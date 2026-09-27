import { useEffect, useRef, useState } from 'react'
import { detailsFor } from './details.js'
import { Icon, Logo } from './ui.jsx'

const SECTIONS = [
  ['payouts', 'Payouts'],
  ['audience', 'Who to share'],
  ['benefits', 'Benefits'],
  ['steps', 'How it works'],
  ['terms', 'Terms'],
  ['faq', 'FAQ'],
]

const BENEFITS_FOLDED = 3

const money = (v) => (typeof v === 'number' ? `₹${v.toLocaleString('en-IN')}` : v)

export default function Details({ p, isFav, copied, onBack, onFav, onShare }) {
  const d = detailsFor(p)
  const [active, setActive] = useState(SECTIONS[0][0])
  const [readMore, setReadMore] = useState(false)
  const [allBenefits, setAllBenefits] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const navRef = useRef()
  const copyTimer = useRef()

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

  const flat = d.events.filter(([, v]) => typeof v === 'number')
  const peak = Math.max(1, ...flat.map(([, v]) => v))
  const benefits = allBenefits ? d.benefits : d.benefits.slice(0, BENEFITS_FOLDED)
  const maxPayout = p.percent ? `${p.earn}%` : money(p.earn)

  // Highlight the section pill for whatever is in view.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (hit) setActive(hit.target.id.replace('d-', ''))
      },
      { rootMargin: '-110px 0px -60% 0px' },
    )
    SECTIONS.forEach(([id]) => {
      const el = document.getElementById(`d-${id}`)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    navRef.current
      ?.querySelector('.is-on')
      ?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [active])

  function jump(id) {
    const el = document.getElementById(`d-${id}`)
    if (!el) return
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 104, behavior: 'smooth' })
  }

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

      <nav className="dt-nav" aria-label="Sections" ref={navRef}>
        {SECTIONS.map(([id, label]) => (
          <button key={id} type="button" className={active === id ? 'is-on' : ''} onClick={() => jump(id)}>
            {label}
          </button>
        ))}
      </nav>

      <main className="dt-body">
        {/* Signature: payout ladder — bar length = share of the payout */}
        <section id="d-payouts" className="dt-card">
          <h2 className="dt-h">
            Payout events
            <span>{d.events.length} steps</span>
          </h2>
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
          {!p.percent && d.events.length > 1 && (
            <p className="ladder-total">
              Total when all steps complete <b>{maxPayout}</b>
            </p>
          )}
        </section>

        <section id="d-audience" className="dt-card">
          <h2 className="dt-h">Who to share with</h2>
          <p className={readMore ? 'dt-text' : 'dt-text is-clamped'}>{d.audience}</p>
          <button type="button" className="dt-more" onClick={() => setReadMore((v) => !v)}>
            {readMore ? 'Show less' : 'Read more'}
          </button>
        </section>

        <section id="d-benefits" className="dt-card">
          <h2 className="dt-h">Benefits for your friend</h2>
          <ul className="dt-benefits">
            {benefits.map(([lead, rest]) => (
              <li key={lead}>
                <span className="dt-tick">
                  <Icon name="check" size={12} />
                </span>
                <p>
                  <b>{lead}</b>
                  {rest && ` — ${rest}`}
                </p>
              </li>
            ))}
          </ul>
          {d.benefits.length > BENEFITS_FOLDED && (
            <button type="button" className="dt-more" onClick={() => setAllBenefits((v) => !v)}>
              {allBenefits ? 'Show less' : `Show all ${d.benefits.length}`}
            </button>
          )}
        </section>

        <section id="d-steps" className="dt-card">
          <h2 className="dt-h">How it works</h2>
          <ol className="dt-steps">
            {d.steps.map(([title, text], i) => (
              <li key={title}>
                <span className="dt-step-no">{i + 1}</span>
                <div>
                  <b>{title}</b>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="d-terms" className="dt-card">
          <details className="dt-fold">
            <summary className="dt-h">
              Terms &amp; conditions
              <span>
                {d.terms.length} rules
                <Icon name="next" size={14} />
              </span>
            </summary>
            <ul className="dt-terms">
              {d.terms.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </details>
        </section>

        <section id="d-faq" className="dt-card dt-faq">
          <h2 className="dt-h">Questions</h2>
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

      <div className="dt-dock">
        <button
          type="button"
          className={linkCopied ? 'dt-copy is-done' : 'dt-copy'}
          aria-label={linkCopied ? 'Link copied' : 'Copy link'}
          onClick={copyLink}
        >
          <Icon name={linkCopied ? 'check' : 'link'} size={18} />
        </button>
        <button type="button" className="dt-cta" onClick={() => onShare(p)}>
          {copied === p.id ? (
            <>
              <Icon name="check" size={18} /> Link copied
            </>
          ) : (
            <>
              Share &amp; earn <b>{maxPayout}</b>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
