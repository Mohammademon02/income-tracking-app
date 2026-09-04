/**
 * Turning what is on screen into a file the user can keep.
 *
 * Two things went wrong here for as long as this file existed, and both
 * produced output that looked right:
 *
 * 1. **Dates were read in local time.** Every stored date is a UTC-midnight
 *    calendar marker (see `lib/date-utils`), so `toLocaleDateString()` on a
 *    machine west of UTC renders the *previous* day. An entry logged on
 *    1 September exported as 31 August — and the month summary, which bucketed
 *    with local `getMonth()`, dropped it out of September entirely.
 * 2. **CSV escaping only covered commas and quotes.** An account name with a
 *    line break in it split one row into two, silently shifting every column
 *    after it. Newlines are the escape case that actually corrupts a file.
 *
 * Numbers are written as bare numbers rather than `toLocaleString()` strings.
 * A spreadsheet can sum `1234.5`; it cannot sum `"1,234.5"`.
 */

import { APP_TIMEZONE, processingDays, toDateKey, todayKey } from "@/lib/date-utils"
import { dollarsToPoints, pointsToDollars } from "@/lib/money"

/** What every exporter accepts: a flat row of primitives. */
export type ExportValue = string | number | boolean | null | undefined
export type ExportRow = Record<string, ExportValue>

/* -------------------------------------------------------------------------- */
/* Source shapes                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Only the fields the exporters read, so these stay assignable from the server
 * action return types without importing them (the actions are server-only).
 */
export type ExportableAccount = {
  name: string
  color: string
  totalPoints: number
  completedWithdrawals: number
  pendingWithdrawals: number
  currentBalance: number
  createdAt: Date
}

export type ExportableEntry = {
  date: Date
  points: number
  accountName: string
}

export type ExportableWithdrawal = {
  date: Date
  amount: number
  status: string
  completedAt: Date | null
  accountName: string
}

/* -------------------------------------------------------------------------- */
/* CSV                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * A field needs quoting if it contains a delimiter, a quote, a line break, or
 * padding whitespace that a reader would otherwise trim.
 */
const NEEDS_QUOTING = /[",\r\n]|^\s|\s$/

function escapeCsvField(value: ExportValue): string {
  if (value === null || value === undefined) return ""

  const text = String(value)
  if (!NEEDS_QUOTING.test(text)) return text

  return `"${text.replace(/"/g, '""')}"`
}

/**
 * Every key across every row, in first-seen order.
 *
 * Reading the header off `data[0]` alone dropped any column that only appeared
 * on later rows — and wrote the remaining values under the wrong headings.
 */
function collectHeaders(data: ExportRow[]): string[] {
  const headers: string[] = []
  const seen = new Set<string>()

  for (const row of data) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key)
        headers.push(key)
      }
    }
  }

  return headers
}

/**
 * CSV, per RFC 4180: CRLF line endings, and a UTF-8 BOM so Excel on Windows
 * recognises the encoding instead of mangling every non-ASCII character.
 */
export function exportToCSV(data: ExportRow[], filename: string) {
  if (data.length === 0) return

  const headers = collectHeaders(data)
  const lines = [
    headers.map(escapeCsvField).join(","),
    ...data.map((row) => headers.map((header) => escapeCsvField(row[header])).join(",")),
  ]

  downloadFile(`﻿${lines.join("\r\n")}\r\n`, `${filename}.csv`, "text/csv;charset=utf-8")
}

export function exportToJSON(data: unknown, filename: string) {
  downloadFile(JSON.stringify(data, null, 2), `${filename}.json`, "application/json")
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/* -------------------------------------------------------------------------- */
/* Row shaping                                                                */
/* -------------------------------------------------------------------------- */

/** Dollars, rounded for display but still a number a spreadsheet can sum. */
function dollars(amount: number): number {
  return Math.round(amount * 100) / 100
}

export function formatAccountsForExport(accounts: ExportableAccount[]): ExportRow[] {
  return accounts.map((account) => ({
    "Account Name": account.name,
    "Total Points": account.totalPoints,
    "Total Earnings ($)": dollars(pointsToDollars(account.totalPoints)),
    "Completed Withdrawals ($)": dollars(account.completedWithdrawals),
    "Pending Withdrawals ($)": dollars(account.pendingWithdrawals),
    "Current Balance (pts)": account.currentBalance,
    "Current Balance ($)": dollars(pointsToDollars(account.currentBalance)),
    // `createdAt` is a real instant, not a date marker, so the calendar date it
    // falls on is resolved in the app's timezone rather than read off UTC.
    "Created Date": todayKey(APP_TIMEZONE, new Date(account.createdAt)),
    Color: account.color,
  }))
}

export function formatEntriesForExport(entries: ExportableEntry[]): ExportRow[] {
  return entries.map((entry) => ({
    Date: toDateKey(new Date(entry.date)),
    Account: entry.accountName,
    Points: entry.points,
    "Earnings ($)": dollars(pointsToDollars(entry.points)),
  }))
}

export function formatWithdrawalsForExport(withdrawals: ExportableWithdrawal[]): ExportRow[] {
  return withdrawals.map((withdrawal) => {
    const completedAt = withdrawal.completedAt ? new Date(withdrawal.completedAt) : null

    return {
      "Request Date": toDateKey(new Date(withdrawal.date)),
      Account: withdrawal.accountName,
      "Amount ($)": dollars(withdrawal.amount),
      Points: dollarsToPoints(withdrawal.amount),
      Status: withdrawal.status,
      "Completed Date": completedAt ? toDateKey(completedAt) : "",
      // One shared definition, so the export and the table can never disagree
      // about how long the same withdrawal took.
      "Processing Days": processingDays(new Date(withdrawal.date), completedAt),
    }
  })
}

/* -------------------------------------------------------------------------- */
/* Summary report                                                             */
/* -------------------------------------------------------------------------- */

export function generateSummaryReport(
  accounts: ExportableAccount[],
  entries: ExportableEntry[],
  withdrawals: ExportableWithdrawal[]
) {
  const totalPoints = accounts.reduce((sum, account) => sum + account.totalPoints, 0)
  const totalWithdrawn = accounts.reduce((sum, account) => sum + account.completedWithdrawals, 0)
  const totalPending = accounts.reduce((sum, account) => sum + account.pendingWithdrawals, 0)
  const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0)

  // Compare `YYYY-MM` prefixes: both sides are calendar dates, so the 1st of
  // the month can no longer fall into the previous one.
  const thisMonth = todayKey().slice(0, 7)
  const thisMonthEntries = entries.filter(
    (entry) => toDateKey(new Date(entry.date)).slice(0, 7) === thisMonth
  )
  const thisMonthPoints = thisMonthEntries.reduce((sum, entry) => sum + entry.points, 0)

  return {
    "Report Generated": new Date().toISOString(),
    "Report Month": thisMonth,
    "Total Accounts": accounts.length,
    "Active Accounts": accounts.filter((account) => account.currentBalance > 0).length,
    "Total Points Earned": totalPoints,
    "Total Earnings ($)": dollars(pointsToDollars(totalPoints)),
    "Total Withdrawn ($)": dollars(totalWithdrawn),
    "Pending Withdrawals ($)": dollars(totalPending),
    "Available Balance (pts)": totalBalance,
    "Available Balance ($)": dollars(pointsToDollars(totalBalance)),
    "This Month Points": thisMonthPoints,
    "This Month Earnings ($)": dollars(pointsToDollars(thisMonthPoints)),
    "Total Entries": entries.length,
    "This Month Entries": thisMonthEntries.length,
    "Total Withdrawals": withdrawals.length,
    "Completed Withdrawals": withdrawals.filter((w) => w.status === "COMPLETED").length,
    "Pending Withdrawals": withdrawals.filter((w) => w.status === "PENDING").length,
  }
}

export function exportComprehensiveReport(
  accounts: ExportableAccount[],
  entries: ExportableEntry[],
  withdrawals: ExportableWithdrawal[]
) {
  const report = {
    summary: generateSummaryReport(accounts, entries, withdrawals),
    accounts: formatAccountsForExport(accounts),
    entries: formatEntriesForExport(entries),
    withdrawals: formatWithdrawalsForExport(withdrawals),
    metadata: {
      exportDate: new Date().toISOString(),
      totalRecords: accounts.length + entries.length + withdrawals.length,
      version: "1.0",
    },
  }

  // The report is one object. It used to be wrapped in an array, so every
  // consumer had to unwrap a single-element list to reach it.
  exportToJSON(report, `survey-tracker-report-${todayKey()}`)
}
