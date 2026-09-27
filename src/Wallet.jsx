import { useState } from 'react'
import { PRODUCTS } from './products.js'
import { ACTIVITY, WALLET, inr } from './wallet.js'
import { Icon, Logo } from './ui.jsx'

const MIN_WITHDRAW = 100

/* Premium black balance card on the dashboard. */
export function WalletCard({ wallet = WALLET, onWithdraw }) {
  const [hidden, setHidden] = useState(false)
  const mask = (n) => (hidden ? '•••' : n.toLocaleString('en-IN'))

  return (
    <section className="wcard" aria-label="Wallet">
      <div className="wcard-top">
        <span className="wcard-label">Wallet balance</span>
        <button
          type="button"
          className="wcard-eye"
          aria-label={hidden ? 'Show balance' : 'Hide balance'}
          aria-pressed={hidden}
          onClick={() => setHidden((h) => !h)}
        >
          <Icon name={hidden ? 'eyeOff' : 'eye'} size={16} />
        </button>
      </div>

      <p className="wcard-amount">
        <span>₹</span>
        {mask(wallet.balance)}
      </p>

      <dl className="wcard-stats">
        <div>
          <dt>Today</dt>
          <dd className={wallet.today > 0 ? 'is-up' : ''}>+₹{mask(wallet.today)}</dd>
        </div>
        <div>
          <dt>Pending</dt>
          <dd>₹{mask(wallet.pending)}</dd>
        </div>
        <div>
          <dt>Lifetime</dt>
          <dd>₹{mask(wallet.lifetime)}</dd>
        </div>
      </dl>

      <button type="button" className="wcard-cta" onClick={onWithdraw}>
        Withdraw
        <Icon name="next" size={14} />
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
              <span className="wv-label">Available balance</span>
              <button
                type="button"
                className="wv-eye"
                aria-label={hidden ? 'Show balance' : 'Hide balance'}
                aria-pressed={hidden}
                onClick={() => setHidden((h) => !h)}
              >
                <Icon name={hidden ? 'eyeOff' : 'eye'} size={16} />
              </button>
            </div>
            <p className="wv-amount">
              <span>₹</span>
              {mask(WALLET.balance)}
            </p>
            <span className="wb-today">
              <Icon name="arrowIn" size={12} />
              ₹{mask(WALLET.today)} today
            </span>
          </div>

          <div className="wb-tile" style={{ '--hue': '#e39a00' }}>
            <span className="bento-icon">
              <Icon name="history" size={15} />
            </span>
            <span>
              <small>Pending</small>
              <b>₹{mask(WALLET.pending)}</b>
            </span>
          </div>

          <div className="wb-tile" style={{ '--hue': '#12a37a' }}>
            <span className="bento-icon">
              <Icon name="demat" size={15} />
            </span>
            <span>
              <small>Lifetime</small>
              <b>₹{mask(WALLET.lifetime)}</b>
            </span>
          </div>

          <div className="wb-tile" style={{ '--hue': '#2f7cf6' }}>
            <span className="bento-icon">
              <Icon name="check" size={15} />
            </span>
            <span>
              <small>Withdrawn</small>
              <b>₹{mask(WALLET.withdrawn)}</b>
            </span>
          </div>

          <button
            type="button"
            className="wb-cta"
            disabled={!canWithdraw}
            onClick={() => setSheet(true)}
          >
            <span className="wb-cta-icon">
              <Icon name="withdraw" size={18} />
            </span>
            <span>
              <b>Withdraw</b>
              <small>
                {canWithdraw ? `Min ${inr(MIN_WITHDRAW)} · to UPI` : `Earn ${inr(MIN_WITHDRAW - WALLET.balance)} more`}
              </small>
            </span>
            <Icon name="next" size={16} />
          </button>
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
