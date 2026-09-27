import { useState } from 'react'

const ICONS = {
  back: 'M15 5 8 12l7 7',
  next: 'M9 5l7 7-7 7',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4',
  share: 'M7 17 17 7M9 7h8v8',
  check: 'M5 12.5 10 17 19 7',
  sort: 'M7 4v16M4 17l3 3 3-3M17 20V4M14 7l3-3 3 3',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z',
  sun: 'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  bell: 'M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16ZM10 21h4',
  home: 'M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-8.5Z',
  wallet: 'M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3M4 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 1 4 7.5ZM16 13.5h.01',
  offers: 'M4 12V5.5A1.5 1.5 0 0 1 5.5 4H12l8 8-8 8-8-8ZM8.5 8.5h.01M9.5 15.5l6-6',
  withdraw: 'M12 4v11M7.5 10.5 12 15l4.5-4.5M5 20h14',
  history: 'M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4M12 8v4l3 2',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12ZM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  eyeOff: 'M4 4l16 16M10 5.7c.6-.1 1.3-.2 2-.2 6 0 9.5 6.5 9.5 6.5s-.9 1.7-2.6 3.4M6.6 6.6C4 8.3 2.5 12 2.5 12S6 18.5 12 18.5c1.8 0 3.4-.6 4.7-1.4M9.9 9.9a3 3 0 0 0 4.2 4.2',
  userPlus: 'M10 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM3 20a7 7 0 0 1 12.5-4.3M19 14v6M16 17h6',
  gift: 'M4 11h16v9H4v-9ZM3 7h18v4H3V7ZM12 7v13M12 7C10.5 3.5 7 4 7 5.8 7 7 9 7 12 7Zm0 0c1.5-3.5 5-3 5-1.2C17 7 15 7 12 7Z',
  arrowIn: 'M17 7 7 17M7 9v8h8',
  arrowOut: 'M7 17 17 7M9 7h8v8',

  // Category icons
  cards: 'M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11ZM3 10h18M7 15h4',
  loans: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9 8h6M9 11h6M11 8c2.5 0 2.5 5 0 5H9.5l4.5 4',
  bank: 'M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18',
  demat: 'M4 19h16M5 15l4.5-4.5 3 3L19 7M15 7h4v4',
  insurance: 'M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3ZM9 12l2 2 4-4',
  invest: 'M12 20v-8M12 12c0-4 3-6.5 7-6.5 0 4-3 6.5-7 6.5ZM12 14.5C12 11.5 10 9 6 9c0 3 2 5.5 6 5.5Z',
  deals: 'M3 12V4h8l10 10-8 8-10-10ZM7.5 8h.01',
  crypto: 'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3ZM10 8v8M10 8h3a2 2 0 0 1 0 4h-3 3.5a2 2 0 0 1 0 4H10',
  games: 'M7 8h10a4 4 0 0 1 4 4v1a3 3 0 0 1-5.4 1.8L14.5 13h-5l-1.1 1.8A3 3 0 0 1 3 13v-1a4 4 0 0 1 4-4ZM7.5 10.5v3M6 12h3M16 11h.01M18 13h.01',
}

export function Icon({ name, size = 18, filled = false }) {
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

/* The payout figure: ₹2,400 / PER card issued. Used by full and mini cards. */
export function Earn({ p }) {
  const [lead, ...rest] = p.unit.split(' ')
  return (
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
        <span className="unit-lead">{lead}</span>
        <span className="unit-word">{rest.join(' ')}</span>
      </span>
    </p>
  )
}

/* Brand logo from public/logos/<id>.png; falls back to the letter tile if missing. */
export function Logo({ p, className }) {
  const [broken, setBroken] = useState(false)
  return (
    <span className={className} aria-hidden="true">
      {broken ? (
        p.mono
      ) : (
        <img
          src={`${import.meta.env.BASE_URL}logos/${p.id}.png`}
          alt=""
          loading="lazy"
          onError={() => setBroken(true)}
        />
      )}
    </span>
  )
}

const TABS = [
  { id: 'dashboard', label: 'Home', icon: 'home' },
  { id: 'home', label: 'Offers', icon: 'offers' },
  { id: 'wallet', label: 'Wallet', icon: 'wallet' },
]

/* Fixed bottom tab bar shared by the top-level screens. */
export function BottomNav({ active, onChange, balance }) {
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={active === t.id ? 'is-active' : ''}
          aria-current={active === t.id ? 'page' : undefined}
          onClick={() => onChange(t.id)}
        >
          <Icon name={t.icon} size={22} />
          <span>{t.id === 'wallet' && balance != null ? `₹${balance.toLocaleString('en-IN')}` : t.label}</span>
        </button>
      ))}
    </nav>
  )
}
