import { z } from "zod"

// Account validation schemas
export const createAccountSchema = z.object({
  name: z.string()
    .min(1, "Account name is required")
    .max(50, "Account name must be less than 50 characters")
    .trim(),
  color: z.string()
    .min(1, "Color is required")
    .regex(/^[a-z]+$/, "Invalid color format")
})

export const updateAccountSchema = createAccountSchema

// Entry validation schemas
export const createEntrySchema = z.object({
  accountId: z.string()
    .min(1, "Account is required"),
  date: z.string()
    .min(1, "Date is required")
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format"),
  points: z.coerce.number()
    .min(0, "Points must be positive")
    .max(1000000, "Points cannot exceed 1,000,000")
    .int("Points must be a whole number")
})

export const updateEntrySchema = createEntrySchema

// Withdrawal validation schemas
export const createWithdrawalSchema = z.object({
  accountId: z.string()
    .min(1, "Account is required"),
  date: z.string()
    .min(1, "Date is required")
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format"),
  amount: z.coerce.number()
    .min(0.01, "Amount must be at least $0.01")
    .max(10000, "Amount cannot exceed $10,000")
})

export const updateWithdrawalSchema = createWithdrawalSchema.extend({
  status: z.enum(["PENDING", "COMPLETED"], {
    errorMap: () => ({ message: "Status must be either PENDING or COMPLETED" })
  })
})

// Authentication validation schemas
export const loginSchema = z.object({
  username: z.string()
    .min(1, "Username is required")
    .max(50, "Username too long"),
  password: z.string()
    .min(1, "Password is required")
    .max(100, "Password too long")
})

// Sanitization helpers
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, "")
}

export function sanitizeNumber(input: number): number {
  return Math.round(input * 100) / 100 // Round to 2 decimal places
}

// Rate limiting helper
export function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests = new Map<string, number[]>()
  
  return function isRateLimited(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - windowMs
    
    if (!requests.has(identifier)) {
      requests.set(identifier, [])
    }
    
    const userRequests = requests.get(identifier)!
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart)
    
    if (validRequests.length >= maxRequests) {
      return true // Rate limited
    }
    
    validRequests.push(now)
    requests.set(identifier, validRequests)
    
    return false // Not rate limited
  }
}

// Input sanitization for database queries
export function sanitizeForDatabase(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else if (typeof value === 'number') {
      sanitized[key] = sanitizeNumber(value)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}