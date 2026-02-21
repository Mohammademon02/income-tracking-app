// Data import utilities for CSV and other formats

export interface ImportResult {
  success: boolean
  data?: any[]
  errors?: string[]
  warnings?: string[]
  summary?: {
    total: number
    imported: number
    skipped: number
    failed: number
  }
}

export interface ImportOptions {
  skipDuplicates?: boolean
  validateData?: boolean
  dryRun?: boolean
}

// CSV parsing utility
export function parseCSV(csvContent: string): string[][] {
  const lines = csvContent.split('\n').filter(line => line.trim())
  const result: string[][] = []
  
  for (const line of lines) {
    const row: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++ // Skip next quote
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    row.push(current.trim())
    result.push(row)
  }
  
  return result
}

// Account import
export function importAccounts(csvContent: string, options: ImportOptions = {}): ImportResult {
  try {
    const rows = parseCSV(csvContent)
    if (rows.length === 0) {
      return { success: false, errors: ['CSV file is empty'] }
    }
    
    const headers = rows[0].map(h => h.toLowerCase().trim())
    const dataRows = rows.slice(1)
    
    // Expected headers
    const requiredHeaders = ['name']
    const optionalHeaders = ['color', 'description']
    
    // Validate headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
      return {
        success: false,
        errors: [`Missing required columns: ${missingHeaders.join(', ')}`]
      }
    }
    
    const accounts: any[] = []
    const errors: string[] = []
    const warnings: string[] = []
    let skipped = 0
    
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      const rowNum = i + 2 // +2 because we start from row 1 and skip header
      
      try {
        const account: any = {}
        
        // Map CSV columns to account fields
        headers.forEach((header, index) => {
          const value = row[index]?.trim()
          
          switch (header) {
            case 'name':
              if (!value) {
                throw new Error('Account name is required')
              }
              account.name = value
              break
            case 'color':
              account.color = value || 'blue'
              break
            case 'description':
              account.description = value
              break
          }
        })
        
        // Validate account data
        if (options.validateData) {
          if (account.name.length < 1 || account.name.length > 50) {
            throw new Error('Account name must be between 1 and 50 characters')
          }
          
          const validColors = ['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'indigo', 'gray']
          if (account.color && !validColors.includes(account.color)) {
            warnings.push(`Row ${rowNum}: Invalid color '${account.color}', using 'blue' instead`)
            account.color = 'blue'
          }
        }
        
        accounts.push(account)
      } catch (error) {
        errors.push(`Row ${rowNum}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        skipped++
      }
    }
    
    return {
      success: errors.length === 0 || accounts.length > 0,
      data: accounts,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      summary: {
        total: dataRows.length,
        imported: accounts.length,
        skipped,
        failed: errors.length
      }
    }
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`]
    }
  }
}

// Entry import
export function importEntries(csvContent: string, accounts: any[], options: ImportOptions = {}): ImportResult {
  try {
    const rows = parseCSV(csvContent)
    if (rows.length === 0) {
      return { success: false, errors: ['CSV file is empty'] }
    }
    
    const headers = rows[0].map(h => h.toLowerCase().trim())
    const dataRows = rows.slice(1)
    
    // Expected headers
    const requiredHeaders = ['date', 'points', 'account']
    
    // Validate headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
      return {
        success: false,
        errors: [`Missing required columns: ${missingHeaders.join(', ')}`]
      }
    }
    
    const entries: any[] = []
    const errors: string[] = []
    const warnings: string[] = []
    let skipped = 0
    
    // Create account lookup map
    const accountMap = new Map(accounts.map(acc => [acc.name.toLowerCase(), acc.id]))
    
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      const rowNum = i + 2
      
      try {
        const entry: any = {}
        
        headers.forEach((header, index) => {
          const value = row[index]?.trim()
          
          switch (header) {
            case 'date':
              if (!value) {
                throw new Error('Date is required')
              }
              const date = new Date(value)
              if (isNaN(date.getTime())) {
                throw new Error('Invalid date format')
              }
              entry.date = date
              break
            case 'points':
              if (!value) {
                throw new Error('Points is required')
              }
              const points = parseInt(value)
              if (isNaN(points) || points < 0) {
                throw new Error('Points must be a positive number')
              }
              entry.points = points
              break
            case 'account':
              if (!value) {
                throw new Error('Account is required')
              }
              const accountId = accountMap.get(value.toLowerCase())
              if (!accountId) {
                throw new Error(`Account '${value}' not found`)
              }
              entry.accountId = accountId
              break
          }
        })
        
        // Additional validation
        if (options.validateData) {
          if (entry.points > 100000) {
            warnings.push(`Row ${rowNum}: Very high points value (${entry.points})`)
          }
          
          if (entry.date > new Date()) {
            warnings.push(`Row ${rowNum}: Future date detected`)
          }
        }
        
        entries.push(entry)
      } catch (error) {
        errors.push(`Row ${rowNum}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        skipped++
      }
    }
    
    return {
      success: errors.length === 0 || entries.length > 0,
      data: entries,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      summary: {
        total: dataRows.length,
        imported: entries.length,
        skipped,
        failed: errors.length
      }
    }
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`]
    }
  }
}

// Withdrawal import
export function importWithdrawals(csvContent: string, accounts: any[], options: ImportOptions = {}): ImportResult {
  try {
    const rows = parseCSV(csvContent)
    if (rows.length === 0) {
      return { success: false, errors: ['CSV file is empty'] }
    }
    
    const headers = rows[0].map(h => h.toLowerCase().trim())
    const dataRows = rows.slice(1)
    
    // Expected headers
    const requiredHeaders = ['date', 'amount', 'account']
    const optionalHeaders = ['status', 'completed_date']
    
    // Validate headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
      return {
        success: false,
        errors: [`Missing required columns: ${missingHeaders.join(', ')}`]
      }
    }
    
    const withdrawals: any[] = []
    const errors: string[] = []
    const warnings: string[] = []
    let skipped = 0
    
    // Create account lookup map
    const accountMap = new Map(accounts.map(acc => [acc.name.toLowerCase(), acc.id]))
    
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      const rowNum = i + 2
      
      try {
        const withdrawal: any = {}
        
        headers.forEach((header, index) => {
          const value = row[index]?.trim()
          
          switch (header) {
            case 'date':
              if (!value) {
                throw new Error('Date is required')
              }
              const date = new Date(value)
              if (isNaN(date.getTime())) {
                throw new Error('Invalid date format')
              }
              withdrawal.date = date
              break
            case 'amount':
              if (!value) {
                throw new Error('Amount is required')
              }
              const amount = parseFloat(value)
              if (isNaN(amount) || amount <= 0) {
                throw new Error('Amount must be a positive number')
              }
              withdrawal.amount = amount
              break
            case 'account':
              if (!value) {
                throw new Error('Account is required')
              }
              const accountId = accountMap.get(value.toLowerCase())
              if (!accountId) {
                throw new Error(`Account '${value}' not found`)
              }
              withdrawal.accountId = accountId
              break
            case 'status':
              const status = value?.toUpperCase()
              if (status && !['PENDING', 'COMPLETED'].includes(status)) {
                throw new Error('Status must be PENDING or COMPLETED')
              }
              withdrawal.status = status || 'PENDING'
              break
            case 'completed_date':
              if (value) {
                const completedDate = new Date(value)
                if (isNaN(completedDate.getTime())) {
                  throw new Error('Invalid completed date format')
                }
                withdrawal.completedAt = completedDate
              }
              break
          }
        })
        
        // Additional validation
        if (options.validateData) {
          if (withdrawal.amount > 1000) {
            warnings.push(`Row ${rowNum}: Very high withdrawal amount ($${withdrawal.amount})`)
          }
          
          if (withdrawal.completedAt && withdrawal.completedAt < withdrawal.date) {
            throw new Error('Completed date cannot be before request date')
          }
          
          if (withdrawal.status === 'COMPLETED' && !withdrawal.completedAt) {
            warnings.push(`Row ${rowNum}: Completed withdrawal without completion date`)
          }
        }
        
        withdrawals.push(withdrawal)
      } catch (error) {
        errors.push(`Row ${rowNum}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        skipped++
      }
    }
    
    return {
      success: errors.length === 0 || withdrawals.length > 0,
      data: withdrawals,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      summary: {
        total: dataRows.length,
        imported: withdrawals.length,
        skipped,
        failed: errors.length
      }
    }
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`]
    }
  }
}

// Generate sample CSV templates
export const CSV_TEMPLATES = {
  accounts: `name,color,description
Swagbucks,blue,Popular survey platform
Survey Junkie,green,Quick surveys and polls
InboxDollars,purple,Surveys and cashback`,

  entries: `date,account,points
2024-01-01,Swagbucks,150
2024-01-01,Survey Junkie,75
2024-01-02,Swagbucks,200`,

  withdrawals: `date,account,amount,status,completed_date
2024-01-15,Swagbucks,25.00,COMPLETED,2024-01-20
2024-01-20,Survey Junkie,10.00,PENDING,`
}

// File validation
export function validateCSVFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected' }
  }
  
  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    return { valid: false, error: 'File must be a CSV file' }
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    return { valid: false, error: 'File size must be less than 5MB' }
  }
  
  return { valid: true }
}

// Read file content
export function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}