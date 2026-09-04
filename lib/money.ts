/**
 * Points and dollars.
 *
 * Entries are recorded in points; withdrawals are stored in dollars as a
 * `Float`. Every conversion goes through here so the exchange rate lives in
 * one place and the rounding is consistent.
 *
 * ## Why rounding matters
 *
 * `Withdrawal.amount` is a float holding a value like `12.92`, which has no
 * exact binary representation. Summing many of them and multiplying by 100
 * accumulates error — 32 small withdrawals add up to `1292.0000000000002`
 * points rather than `1292`, and that lands in the UI as a balance with a long
 * decimal tail. Points are conceptually integers, so every conversion into
 * points rounds.
 */

export const POINTS_PER_DOLLAR = 100

/**
 * The balance at which an account can actually be withdrawn from — the payout
 * minimum on the survey platforms this tracks.
 *
 * The redesign set this to 2,500 points ($25) in two separate files, guessing
 * at a figure rather than taking the one the app already used: the pre-redesign
 * dashboard marked an account "Withdrawal Ready" at 1,000 and flagged 500 as
 * worth watching. 500 is the real minimum, and at 2,500 the marker simply never
 * appeared — every account sat below it.
 */
export const WITHDRAWAL_READY_POINTS = 500

/** Convert a dollar amount to whole points. */
export function dollarsToPoints(dollars: number): number {
  return Math.round(dollars * POINTS_PER_DOLLAR)
}

/** Convert points to dollars. */
export function pointsToDollars(points: number): number {
  return points / POINTS_PER_DOLLAR
}

/**
 * Sum dollar amounts and convert to points in one step.
 *
 * Rounds once at the end rather than per item, which is both more accurate and
 * the reason this exists as a helper instead of a `reduce` at each call site.
 */
export function sumDollarsAsPoints(amounts: number[]): number {
  return Math.round(amounts.reduce((sum, amount) => sum + amount, 0) * POINTS_PER_DOLLAR)
}

/**
 * The one definition of what an account is worth.
 *
 * Previously three screens computed this three different ways — the accounts
 * page subtracted both completed and pending withdrawals, insights subtracted
 * only pending (against a 30-day point total), and the performance card
 * subtracted nothing — so the same account showed three different numbers.
 *
 * `available` is the number a user acts on: points earned, minus what has
 * already been paid out, minus what is spoken for by a pending request.
 */
export type AccountBalance = {
  /** Every point ever earned on this account. */
  lifetimePoints: number
  /** Points already paid out (COMPLETED withdrawals). */
  withdrawnPoints: number
  /** Points spoken for by requests that haven't landed yet (PENDING). */
  committedPoints: number
  /** What is actually free to withdraw. */
  availablePoints: number
}

export function computeBalance({
  lifetimePoints,
  completedDollars,
  pendingDollars,
}: {
  lifetimePoints: number
  completedDollars: number
  pendingDollars: number
}): AccountBalance {
  const withdrawnPoints = dollarsToPoints(completedDollars)
  const committedPoints = dollarsToPoints(pendingDollars)

  return {
    lifetimePoints,
    withdrawnPoints,
    committedPoints,
    availablePoints: lifetimePoints - withdrawnPoints - committedPoints,
  }
}

export function formatDollars(dollars: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars)
}

export function formatPoints(points: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(points)
}
