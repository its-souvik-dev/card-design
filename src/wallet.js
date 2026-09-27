// Sample account figures — wire these to the agent's real wallet.
export const USER = { name: 'Ankush' }

export const WALLET = {
  balance: 620,
  today: 0,
  lifetime: 720,
  withdrawn: 100,
  pending: 240,
}

export const REFERRAL_BONUS = 25

// Newest first. `amount` is positive for payouts in, negative for withdrawals.
export const ACTIVITY = [
  { id: 't6', title: 'Groww Demat', note: 'Account opened', when: 'Yesterday', amount: 400, product: 'groww-demat' },
  { id: 't5', title: 'Withdrawal to UPI', note: 'ankush@ybl', when: '24 Sep', amount: -100 },
  { id: 't4', title: 'Kotak 811', note: 'Account opened', when: '21 Sep', amount: 150, product: 'kotak-811' },
  { id: 't3', title: 'Referral bonus', note: 'Rahul joined', when: '18 Sep', amount: 25 },
  { id: 't2', title: 'Jar Gold', note: 'First investment', when: '12 Sep', amount: 120, product: 'jar-gold' },
  { id: 't1', title: 'Referral bonus', note: 'Priya joined', when: '9 Sep', amount: 25 },
]

export const inr = (n) => `₹${n.toLocaleString('en-IN')}`
