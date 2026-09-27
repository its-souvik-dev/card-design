import { useState } from 'react'
import { PRODUCTS } from './products.js'
import { ACTIVITY, WALLET, inr } from './wallet.js'
import { Icon, Logo } from './ui.jsx'

const MIN_WITHDRAW = 100

/* Premium black balance card on the dashboard. */
export function WalletCard({ wallet = WALLET, onWithdraw }) {
  return (
    <section className="wcard" aria-label="Wallet">
      <div className="wcard-info">
        <span className="wcard-label">Wallet balance</span>
        <p className="wcard-amount">
          <span>₹</span>
          {wallet.balance.toLocaleString('en-IN')}
        </p>
        <p className="wcard-stats">
          <b className={wallet.today > 0 ? 'is-up' : ''}>+{inr(wallet.today)}</b> today
          <i aria-hidden="true">·</i>
          <b>{inr(wallet.lifetime)}</b> lifetime
        </p>
      </div>
      <button type="button" className="wcard-cta" onClick={onWithdraw}>
        Withdraw
        <Icon name="next" size={13} />
      </button>
    </section>
  )
}

function ActivityIcon({ t }) {
  const p = t.product && PRODUCTS.find((x) => x.id === t.product)
  if (p) return <Logo p={p} className="act-icon act-logo" />
  return (
    <span className={t.amount < 0 ? 'act-icon is-out' : 'act-icon is-in'} aria-hidden="true">
      <Icon name={t.amount < 0 ? 'arrowOut' : 'gift'} size={18} />
    </span>
  )
}

function WithdrawSheet({ balance, onClose }) {
  const [amount, setAmount] = useState(String(balance))
  const [upi, setUpi] = useState('')
  const [sent, setSent] = useState(false)
  const value = Number(amount) || 0
  const valid = value >= MIN_WITHDRAW && value <= balance && /^[\w.-]+@[\w.-]+$/.test(upi.trim())

  return (
    <div className="sheet-wrap" role="dialog" aria-modal="true" aria-label="Withdraw" onClick={onClose}>
      <form
        className="sheet"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault()
          if (valid) setSent(true)
        }}
      >
        <span className="sheet-grip" aria-hidden="true" />
        {sent ? (
          <div className="sheet-done">
            <span className="sheet-tick">
              <Icon name="check" size={28} />
            </span>
            <h2>Request received</h2>
            <p>
              {inr(value)} to {upi.trim()} — usually arrives within 24 hours.
            </p>
            <button type="button" className="btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <h2>Withdraw to UPI</h2>
            <p className="sheet-sub">
              Available {inr(balance)} · minimum {inr(MIN_WITHDRAW)}
            </p>

            <label className="field">
              <span>Amount</span>
              <div className="field-box">
                <b>₹</b>
                <input
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </label>
            <div className="quick">
              {[MIN_WITHDRAW, 500, balance]
                .filter((n, i, a) => n <= balance && a.indexOf(n) === i)
                .map((n) => (
                  <button key={n} type="button" className="chip" onClick={() => setAmount(String(n))}>
                    {n === balance ? 'All' : inr(n)}
                  </button>
                ))}
            </div>

            <label className="field">
              <span>UPI ID</span>
              <div className="field-box">
                <input
                  placeholder="name@bank"
                  autoCapitalize="none"
                  value={upi}
                  onChange={(e) => setUpi(e.target.value)}
                />
              </div>
            </label>

            <button type="submit" className="btn-primary" disabled={!valid}>
              Withdraw {value ? inr(value) : ''}
            </button>
          </>
        )}
      </form>
    </div>
  )
}

const STATS = [
  ['Pending', WALLET.pending, '#e39a00', 'history'],
  ['Lifetime', WALLET.lifetime, '#12a37a', 'demat'],
  ['Withdrawn', WALLET.withdrawn, '#2f7cf6', 'check'],
]

const SPLIT = [
  ['Available', WALLET.balance, 'var(--brand)'],
  ['Pending', WALLET.pending, '#e39a00'],
  ['Withdrawn', WALLET.withdrawn, '#2f7cf6'],
]
const SPLIT_TOTAL = SPLIT.reduce((n, [, v]) => n + v, 0) || 1

// Balance over time, replayed from the activity log (oldest first).
const SPARK = (() => {
  const points = [0]
  ;[...ACTIVITY].reverse().forEach((t) => points.push(points.at(-1) + t.amount))
  const max = Math.max(...points) || 1
  const step = 100 / (points.length - 1)
  return points
    .map((v, i) => `${i ? 'L' : 'M'}${(i * step).toFixed(1)} ${(28 - (v / max) * 24).toFixed(1)}`)
    .join(' ')
})()

const FILTERS = [
  ['all', 'All'],
  ['in', 'Earned'],
  ['out', 'Withdrawn'],
]

export default function Wallet({ theme, onTheme }) {
  const [sheet, setSheet] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [filter, setFilter] = useState('all')
  const canWithdraw = WALLET.balance >= MIN_WITHDRAW
  const mask = (n) => (hidden ? '•••' : n.toLocaleString('en-IN'))

  const rows = ACTIVITY.filter(
    (t) => filter === 'all' || (filter === 'in' ? t.amount > 0 : t.amount < 0),
  )

  return (
    <div className="app">
      <header className="dash-top">
        <div className="dash-hello">
          <p className="hello">Earnings &amp; payouts</p>
          <h1>Wallet</h1>
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

      <main className="page has-nav dash">
        <section className="wb" aria-label="Balance">
          <div className="wb-hero">
            <div className="wv-top">
              <span className="wv-label">Balance</span>
              <button
                type="button"
                className="wv-eye"
                aria-label={hidden ? 'Show balance' : 'Hide balance'}
                aria-pressed={hidden}
                onClick={() => setHidden((h) => !h)}
              >
                <Icon name={hidden ? 'eyeOff' : 'eye'} size={14} />
              </button>
            </div>
            <p className="wv-amount">
              <span>₹</span>
              {mask(WALLET.balance)}
            </p>
            <span className="wb-today">+₹{mask(WALLET.today)} today</span>
            <svg className="wb-spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="wb-spark-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="currentColor" stopOpacity="0.35" />
                  <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${SPARK} L100 30 L0 30 Z`} fill="url(#wb-spark-fill)" />
              <path d={SPARK} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>

          {STATS.slice(0, 2).map(([label, value, hue, icon]) => (
            <div key={label} className="wb-tile" style={{ '--hue': hue }}>
              <span className="wb-tile-icon">
                <Icon name={icon} size={11} />
              </span>
              <small>{label}</small>
              <b>₹{mask(value)}</b>
            </div>
          ))}

          <button type="button" className="wb-cta" disabled={!canWithdraw} onClick={() => setSheet(true)}>
            <span className="wb-cta-icon">
              <Icon name="withdraw" size={16} />
            </span>
            <span className="wb-cta-text">
              <b>Withdraw</b>
              <small>
                {canWithdraw ? `Min ${inr(MIN_WITHDRAW)} · UPI` : `${inr(MIN_WITHDRAW - WALLET.balance)} more`}
              </small>
            </span>
            <Icon name="next" size={14} />
          </button>

          {STATS.slice(2).map(([label, value, hue, icon]) => (
            <div key={label} className="wb-tile" style={{ '--hue': hue }}>
              <span className="wb-tile-icon">
                <Icon name={icon} size={11} />
              </span>
              <small>{label}</small>
              <b>₹{mask(value)}</b>
            </div>
          ))}

          <div className="wb-split">
            <small>
              Where your <b>₹{mask(SPLIT_TOTAL)}</b> is
            </small>
            <div className="wb-split-bar" aria-hidden="true">
              {SPLIT.map(([k, v, c]) => (
                <span key={k} style={{ '--w': v / SPLIT_TOTAL, '--c': c }} />
              ))}
            </div>
            <ul>
              {SPLIT.map(([k, v, c]) => (
                <li key={k} style={{ '--c': c }}>
                  <span>{k}</span> {Math.round((v / SPLIT_TOTAL) * 100)}%
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="wv-activity">
          <header className="dash-head">
            <h2>Activity</h2>
          </header>
          <div className="wv-seg" role="tablist" aria-label="Filter activity">
            {FILTERS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={filter === id}
                className={filter === id ? 'is-on' : ''}
                onClick={() => setFilter(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {rows.length ? (
            <ul>
              {rows.map((t, i) => (
                <li key={t.id} style={{ '--i': i }}>
                  <ActivityIcon t={t} />
                  <div className="act-text">
                    <p>{t.title}</p>
                    <span>
                      {t.note} · {t.when}
                    </span>
                  </div>
                  <b className={t.amount < 0 ? 'act-amt' : 'act-amt is-in'}>
                    {t.amount < 0 ? '−' : '+'}
                    {inr(Math.abs(t.amount))}
                  </b>
                </li>
              ))}
            </ul>
          ) : (
            <p className="wv-empty">Nothing here yet.</p>
          )}
        </section>
      </main>

      {sheet && canWithdraw && <WithdrawSheet balance={WALLET.balance} onClose={() => setSheet(false)} />}
    </div>
  )
}
