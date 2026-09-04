/**
 * Reading a CSV back in.
 *
 * The mirror of `lib/export-utils`, and it had the mirror bugs:
 *
 * - The parser split the file on `\n` before looking at quotes, so a quoted
 *   field containing a line break — exactly what the exporter now writes
 *   correctly — was torn into two malformed rows.
 * - A UTF-8 BOM at the start of the file became part of the first header name,
 *   so `name` did not match `﻿name` and every file this app exported was
 *   rejected as "missing required columns".
 * - Dates went through `new Date(value)`, which reads `01/15/2024` as *local*
 *   midnight. Taking the UTC parts of that instant moves the day backwards
 *   anywhere east of UTC.
 *
 * Rows come out of here as plain calendar-date strings rather than `Date`
 * objects: they cross a server-action boundary next, where a `Date` would be
 * serialized anyway, and `YYYY-MM-DD` cannot pick up an offset in transit.
 */

import { ACCOUNT_COLOR_VALUES, DEFAULT_ACCOUNT_COLOR } from "@/lib/avatar-utils"
import { isDateKey, todayKey, type DateKey } from "@/lib/date-utils"

export interface ImportResult<T = unknown> {
  success: boolean
  data?: T[]
  errors?: string[]
  warnings?: string[]
  summary?: {
    total: number
    imported: number
    /** Rows that could not be read; each one has a message in `errors`. */
    failed: number
  }
}

export interface ImportOptions {
  validateData?: boolean
  dryRun?: boolean
}

/** An account that already exists, used to resolve the `account` column. */
export type ImportAccountRef = { id: string; name: string }

export type ImportedAccount = { name: string; color: string }
export type ImportedEntry = { accountId: string; date: DateKey; points: number }
export type ImportedWithdrawal = {
  accountId: string
  date: DateKey
  amount: number
  status: "PENDING" | "COMPLETED"
  completedAt?: DateKey
}

/* -------------------------------------------------------------------------- */
/* Parsing                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * RFC 4180 CSV, parsed as one character stream rather than line by line.
 *
 * Quoted fields may contain commas, escaped quotes (`""`) and line breaks.
 * Everything outside quotes is trimmed; inside quotes the text is kept exactly
 * as written, because the quotes are what say the whitespace was deliberate.
 */
export function parseCSV(csvContent: string): string[][] {
  // A byte-order mark belongs to the file, not to the first column name.
  const text = csvContent.replace(/^﻿/, "")

  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false
  let inQuotes = false

  const endField = () => {
    row.push(quoted ? field : field.trim())
    field = ""
    quoted = false
  }

  const endRow = () => {
    endField()
    // A trailing newline, or a blank line between records, is not a record.
    if (row.length > 1 || row[0] !== "") rows.push(row)
    row = []
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
      quoted = true
    } else if (char === ",") {
      endField()
    } else if (char === "\n") {
      endRow()
    } else if (char !== "\r") {
      field += char
    }
  }

  if (field !== "" || row.length > 0) endRow()

  return rows
}

/**
 * A calendar date from whatever the user's spreadsheet wrote.
 *
 * `YYYY-MM-DD` is taken as-is. Anything else is parsed by the platform, which
 * treats a bare date as local midnight — so the calendar date is read off the
 * *local* parts. Reading UTC parts instead is what shifted imported dates back
 * a day for anyone east of UTC.
 */
function parseDateKey(value: string): DateKey | null {
  if (isDateKey(value)) return value

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, "0")
  const day = String(parsed.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/** Strict number parsing: `parseInt("12abc")` returning 12 imported silent garbage. */
function parseNumber(value: string): number | null {
  const cleaned = value.replace(/[$,\s]/g, "")
  if (!/^-?\d*\.?\d+$/.test(cleaned)) return null

  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

/* -------------------------------------------------------------------------- */
/* Shared row machinery                                                       */
/* -------------------------------------------------------------------------- */

type RowContext = {
  /** Column value by header name, already trimmed. Empty string when absent. */
  get: (header: string) => string
  warn: (message: string) => void
}

/**
 * The header check, the per-row try/catch, the error prefixing and the summary
 * were written out three times with small differences. One place now.
 */
function importRows<T>(
  csvContent: string,
  requiredHeaders: string[],
  aliases: Record<string, string>,
  readRow: (ctx: RowContext) => T
): ImportResult<T> {
  let rows: string[][]
  try {
    rows = parseCSV(csvContent)
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse CSV: ${error instanceof Error ? error.message : "Unknown error"}`],
    }
  }

  if (rows.length === 0) {
    return { success: false, errors: ["CSV file is empty"] }
  }

  const headers = rows[0].map((header) => {
    const normalized = header.toLowerCase().trim()
    return aliases[normalized] ?? normalized
  })
  const dataRows = rows.slice(1)

  const missing = requiredHeaders.filter((header) => !headers.includes(header))
  if (missing.length > 0) {
    return { success: false, errors: [`Missing required columns: ${missing.join(", ")}`] }
  }

  const imported: T[] = []
  const errors: string[] = []
  const warnings: string[] = []

  dataRows.forEach((row, index) => {
    // +2: the header is row 1, and spreadsheet rows are 1-based.
    const rowNumber = index + 2

    const ctx: RowContext = {
      get: (header) => row[headers.indexOf(header)]?.trim() ?? "",
      warn: (message) => warnings.push(`Row ${rowNumber}: ${message}`),
    }

    try {
      imported.push(readRow(ctx))
    } catch (error) {
      errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  })

  return {
    // A file is worth importing if anything in it parsed. A file where nothing
    // did is a failure, even though the old check called it a success whenever
    // there were no errors at all — including for a header-only file.
    success: imported.length > 0,
    data: imported,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    summary: {
      total: dataRows.length,
      imported: imported.length,
      failed: errors.length,
    },
  }
}

/**
 * The column names this app's own exports write, mapped onto the ones the
 * importer looks for. Without these, a file exported from the accounts table
 * came straight back as "Missing required columns: name".
 */
const EXPORT_HEADER_ALIASES: Record<string, string> = {
  "account name": "name",
  "request date": "date",
  "completed date": "completed_date",
  "amount ($)": "amount",
}

function required(value: string, label: string): string {
  if (!value) throw new Error(`${label} is required`)
  return value
}

function resolveAccountId(value: string, accountIds: Map<string, string>): string {
  const id = accountIds.get(required(value, "Account").toLowerCase())
  if (!id) throw new Error(`Account '${value}' not found`)
  return id
}

function accountLookup(accounts: ImportAccountRef[]): Map<string, string> {
  return new Map(accounts.map((account) => [account.name.toLowerCase(), account.id]))
}

function requiredDate(value: string, label: string): DateKey {
  const key = parseDateKey(required(value, label))
  if (!key) throw new Error(`Invalid ${label.toLowerCase()} format`)
  return key
}

/* -------------------------------------------------------------------------- */
/* Importers                                                                  */
/* -------------------------------------------------------------------------- */

export function importAccounts(
  csvContent: string,
  options: ImportOptions = {}
): ImportResult<ImportedAccount> {
  return importRows(csvContent, ["name"], EXPORT_HEADER_ALIASES, ({ get, warn }) => {
    const name = required(get("name"), "Account name")

    if (options.validateData && name.length > 50) {
      throw new Error("Account name must be between 1 and 50 characters")
    }

    // Checked against the palette the colour picker offers, which is where
    // these values come from. The importer used to carry a shorter, different
    // list and rewrote half the real colours to blue.
    let color = get("color").toLowerCase() || DEFAULT_ACCOUNT_COLOR
    if (!ACCOUNT_COLOR_VALUES.includes(color)) {
      warn(`Invalid color '${color}', using '${DEFAULT_ACCOUNT_COLOR}' instead`)
      color = DEFAULT_ACCOUNT_COLOR
    }

    return { name, color }
  })
}

export function importEntries(
  csvContent: string,
  accounts: ImportAccountRef[],
  options: ImportOptions = {}
): ImportResult<ImportedEntry> {
  const accountIds = accountLookup(accounts)
  const today = todayKey()

  return importRows(csvContent, ["date", "points", "account"], EXPORT_HEADER_ALIASES, ({ get, warn }) => {
    const date = requiredDate(get("date"), "Date")
    const points = parseNumber(required(get("points"), "Points"))

    if (points === null || points < 0 || !Number.isInteger(points)) {
      throw new Error("Points must be a whole positive number")
    }

    const accountId = resolveAccountId(get("account"), accountIds)

    if (options.validateData) {
      if (points > 100_000) warn(`Very high points value (${points})`)
      // Compared as calendar dates. The old check compared a UTC-midnight
      // marker against `new Date()`, so today's own entries never tripped it
      // but a tomorrow-dated row in an eastern timezone did.
      if (date > today) warn("Future date detected")
    }

    return { accountId, date, points }
  })
}

export function importWithdrawals(
  csvContent: string,
  accounts: ImportAccountRef[],
  options: ImportOptions = {}
): ImportResult<ImportedWithdrawal> {
  const accountIds = accountLookup(accounts)

  return importRows(csvContent, ["date", "amount", "account"], EXPORT_HEADER_ALIASES, ({ get, warn }) => {
    const date = requiredDate(get("date"), "Date")
    const amount = parseNumber(required(get("amount"), "Amount"))

    if (amount === null || amount <= 0) {
      throw new Error("Amount must be a positive number")
    }

    const accountId = resolveAccountId(get("account"), accountIds)

    const rawStatus = get("status").toUpperCase()
    if (rawStatus && rawStatus !== "PENDING" && rawStatus !== "COMPLETED") {
      throw new Error("Status must be PENDING or COMPLETED")
    }
    const status = rawStatus === "COMPLETED" ? "COMPLETED" : "PENDING"

    const rawCompleted = get("completed_date")
    let completedAt: DateKey | undefined
    if (rawCompleted) {
      const key = parseDateKey(rawCompleted)
      if (!key) throw new Error("Invalid completed date format")
      completedAt = key
    }

    if (options.validateData) {
      if (amount > 1000) warn(`Very high withdrawal amount ($${amount})`)
      if (completedAt && completedAt < date) {
        throw new Error("Completed date cannot be before request date")
      }
      if (status === "COMPLETED" && !completedAt) {
        warn("Completed withdrawal without completion date")
      }
    }

    return { accountId, date, amount, status, completedAt }
  })
}

/* -------------------------------------------------------------------------- */
/* Templates and file handling                                                */
/* -------------------------------------------------------------------------- */

export const CSV_TEMPLATES = {
  accounts: `name,color
Swagbucks,blue
Survey Junkie,green
InboxDollars,purple`,

  entries: `date,account,points
2024-01-01,Swagbucks,150
2024-01-01,Survey Junkie,75
2024-01-02,Swagbucks,200`,

  withdrawals: `date,account,amount,status,completed_date
2024-01-15,Swagbucks,25.00,COMPLETED,2024-01-20
2024-01-20,Survey Junkie,10.00,PENDING,`,
}

export function validateCSVFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No file selected" }
  }

  if (file.type !== "text/csv" && !file.name.toLowerCase().endsWith(".csv")) {
    return { valid: false, error: "File must be a CSV file" }
  }

  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: "File size must be less than 5MB" }
  }

  return { valid: true }
}

export function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => resolve(String(event.target?.result ?? ""))
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}
