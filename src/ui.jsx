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
