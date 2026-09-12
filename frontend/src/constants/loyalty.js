// Loyalty scheme — a proposal, not a decided rule.
//
// Everything the scheme does is defined here so it can be argued about and
// changed in one place. user3.newCustomer.loyaltyPoints is a plain INT with
// CHECK (loyaltyPoints >= 0), so the database imposes no rules of its own.
//
// Two decisions worth raising with the team:
//
//  1. Points are earned when a booking reaches 'Completed', not when it is
//     made. Awarding at booking time would let someone book and cancel
//     repeatedly to farm points.
//  2. Redeeming is a fixed ladder rather than a flat rate, and the bigger
//     tiers are worth more per point, which rewards saving them up.

export const CURRENCY = 'S$'

// 1 point per S$1 spent, rounded down.
export const POINTS_PER_CURRENCY_UNIT = 1

export function pointsEarnedFor(amountSpent) {
  return Math.floor(amountSpent * POINTS_PER_CURRENCY_UNIT)
}

export const REDEMPTION_TIERS = Object.freeze([
  { id: 'tier-100', points: 100, discount: 5, label: `${CURRENCY}5 off your next service` },
  { id: 'tier-250', points: 250, discount: 15, label: `${CURRENCY}15 off your next service` },
  { id: 'tier-500', points: 500, discount: 35, label: `${CURRENCY}35 off your next service` },
  { id: 'tier-1000', points: 1000, discount: 80, label: `${CURRENCY}80 off your next service` },
])

export function formatMoney(amount) {
  return `${CURRENCY}${Number(amount).toFixed(2)}`
}
