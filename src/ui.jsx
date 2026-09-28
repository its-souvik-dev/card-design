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
  bolt: 'M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z',
  layers: 'M12 4 3 8.5l9 4.5 9-4.5L12 4ZM3 13l9 4.5 9-4.5',
  whatsapp: 'M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5ZM9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 1c-1-.5-2.5-2-3-3l1-1-1-2L9 8.5Z',
  telegram: 'M21 4 3 11l6 2 2 6 3-4 5 4 2-15ZM9 13l8-6',
  facebook: 'M14.5 21v-7.5H17l.5-3h-3V8.5c0-.9.4-1.5 1.6-1.5h1.5V4.3c-.3 0-1.2-.1-2.2-.1-2.3 0-3.9 1.4-3.9 4v2.3H9v3h2.5V21',
  xlogo: 'M4 4l16 16M20 4 4 20',
  sms: 'M4 5.5h16v11H9.5L5 20v-3.5H4v-11ZM8 11h.01M12 11h.01M16 11h.01',
  mail: 'M3.5 6h17v12h-17V6ZM4 6.5l8 6 8-6',
  more: 'M6 12h.01M12 12h.01M18 12h.01',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',

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

// Solid category glyphs (holes via even-odd fill).
const CAT_ICONS = {
  cards: 'M2 7a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v1H2V7Zm0 4h20v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-6Zm4 4v1.5h4V15H6Z',
  loans: 'M2 6h20v12H2V6Zm10 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM5 9v1.5h1.5V9H5Zm12.5 4.5V15H19v-1.5h-1.5Z',
  bank: 'M12 2 2 7v2h20V7L12 2ZM4 11h3v7H4v-7Zm6.5 0h3v7h-3v-7ZM17 11h3v7h-3v-7ZM2 20h20v2H2v-2Z',
  demat: 'M4 14h4v7H4v-7Zm6-5h4v12h-4V9Zm6-6h4v18h-4V3Z',
  insurance: 'M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm-1.4 13.2L7.4 12l1.4-1.4 1.8 1.8 4.6-4.6 1.4 1.4-6 6Z',
  invest: 'M11 3a9 9 0 1 0 10 10H11V3Zm2-1v9h9a9 9 0 0 0-9-9Z',
  deals: 'M2 2h9.5L22 12.5 12.5 22 2 11.5V2Zm5 3.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z',
  crypto: 'M12 2l8.7 5v10L12 22l-8.7-5V7L12 2Zm0 5-5 5 5 5 5-5-5-5Z',
  all: 'M3 5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Zm10 0a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V5ZM3 15a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4Zm10 0a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4Z',
  games: 'M7 6h10a5 5 0 0 1 5 5v2.5a3.5 3.5 0 0 1-6.3 2.1L14.5 14h-5l-1.2 1.6A3.5 3.5 0 0 1 2 13.5V11a5 5 0 0 1 5-5Zm-1 3.5V11H4.5v2H6v1.5h2V13h1.5v-2H8V9.5H6ZM16 10a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm2 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z',
}

export function CatIcon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d={CAT_ICONS[name]} fill="currentColor" fillRule="evenodd" />
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
