// Campaign details for the product page. Products can override any field;
// otherwise these category defaults fill it in.

// Payout events per category: [event, share of the max payout, icon].
const EVENTS = {
  cards: [['Application submitted', 0.1, 'check'], ['Card approved', 0.6, 'cards'], ['First transaction', 0.3, 'arrowOut']],
  loans: [['Application submitted', 0.1, 'check'], ['Loan disbursed', 0.9, 'loans']],
  bank: [['App installed', 0.05, 'withdraw'], ['Account opened', 0.8, 'bank'], ['First deposit', 0.15, 'arrowIn']],
  demat: [['App installed', 0.05, 'withdraw'], ['Account opened', 0.75, 'demat'], ['First trade', 0.2, 'arrowOut']],
  insurance: [['Quote generated', 0.1, 'check'], ['Policy purchased', 0.9, 'insurance']],
  invest: [['Account opened', 0.4, 'check'], ['First investment', 0.6, 'invest']],
  deals: [['Order placed', 1, 'deals']],
  crypto: [['Account verified', 0.4, 'check'], ['First trade', 0.6, 'crypto']],
  games: [['App installed', 0.3, 'withdraw'], ['First game played', 0.7, 'games']],
}

const AUDIENCE = {
  cards: 'Salaried or self-employed people aged 21–60 with a steady income and a decent credit history. Works best for friends who shop online often or already use a card and want better rewards.',
  loans: 'Salaried people aged 21–58 who need quick funds for a wedding, travel, medical bills or a big purchase. A credit score above 700 improves approval chances.',
  bank: 'Anyone aged 18+ with an Aadhaar and PAN who wants a zero-balance or high-interest account. Great for students, first-time earners and people moving away from a traditional bank.',
  demat: 'People aged 18+ who want to start investing in stocks, IPOs or mutual funds. Ideal for beginners who have never opened a demat account.',
  insurance: 'Families and working people who want to protect their health, life or vehicle. Especially useful for anyone whose current policy is about to expire.',
  invest: 'Savers who want to put small amounts into gold, mutual funds or SIPs every month without paperwork.',
  deals: 'Anyone who shops online. Share with friends and family before a sale or a festival for the best conversion.',
  crypto: 'People aged 18+ who are curious about crypto and want a regulated Indian exchange with rupee deposits.',
  games: 'Gamers aged 18+ who enjoy skill games, fantasy sports or quizzes on their phone.',
}

const BENEFITS = [
  ['Trusted brand', 'a name people already know.'],
  ['Quick sign-up', 'Fully online, done in minutes.'],
  ['Live tracking', 'Every step shows in your wallet.'],
  ['Paid to UPI', 'Withdraw from ₹100.'],
]

export const STEPS = [
  ['Copy your link', 'Tap Share to copy your personal referral link.'],
  ['Share it', 'Send it to friends and family who fit the profile.'],
  ['They sign up', 'Your friend opens the link and completes the process.'],
  ['Brand verifies', 'The advertiser checks the sign-up is genuine.'],
  ['You get paid', 'Your reward lands in your wallet, ready to withdraw.'],
]

export const TERMS = [
  'Rewards are credited only for valid and approved referrals.',
  'Self-referrals, duplicate accounts or fake sign-ups are not eligible.',
  'The referred user must complete every campaign requirement.',
  'Incomplete or invalid sign-ups will not earn a reward.',
  'Reward approval is subject to advertiser verification.',
  'Fraudulent activity can lead to disqualification and account action.',
  'The advertiser can change or end the campaign without notice.',
]

export const FAQS = [
  ['How do I earn from this campaign?', 'Share your link. When someone signs up through it and completes each payout event, that event’s reward is added to your wallet.'],
  ['When will I receive my reward?', 'Most rewards appear as pending within 24 hours and move to your balance once the brand approves them — usually within the payout time shown above.'],
  ['Why is my referral still pending?', 'The brand has not verified it yet. This can take a few days, especially for loans and cards that need a credit check.'],
  ['Why was my referral rejected?', 'Common reasons are an existing account with the brand, incomplete KYC, or the sign-up not using your link.'],
  ['How can I track my referrals?', 'Open Wallet → Activity. Every step your friend completes shows up there.'],
  ['Is there a limit to how many people I can refer?', 'No. You earn for every valid sign-up, as long as each person is genuine and new to the brand.'],
]

const roundTo10 = (n) => Math.max(10, Math.round(n / 10) * 10)

export function detailsFor(p) {
  const template = EVENTS[p.category] || [['Sign-up completed', 1, 'check']]
  const events =
    p.events ||
    (p.percent
      ? [[template.at(-1)[0], `${p.earn}%`, template.at(-1)[2]]]
      : template.map(([name, share, icon], i, all) => {
          // Last step absorbs rounding so the ladder adds up to the max payout.
          const before = all.slice(0, i).reduce((n, [, s]) => n + roundTo10(p.earn * s), 0)
          const amount = i === all.length - 1 ? p.earn - before : roundTo10(p.earn * share)
          return [name, amount, icon]
        }))

  const payoutFact = p.facts.find(([k]) => /payout/i.test(k))

  return {
    events,
    approval: p.approval || payoutFact?.[1] || 'Instant',
    audience: p.audience || AUDIENCE[p.category] || '',
    benefits: p.benefits || [
      ...p.points.map((pt) => [pt, '']),
      [BENEFITS[0][0], `${p.bank} is ${BENEFITS[0][1]}`],
      ...BENEFITS.slice(1),
    ],
    steps: p.steps || STEPS,
    terms: p.terms || TERMS,
    faqs: p.faqs || FAQS,
  }
}
