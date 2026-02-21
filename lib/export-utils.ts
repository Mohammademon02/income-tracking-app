// Export utilities for CSV, Excel, and PDF generation

interface ExportData {
  [key: string]: any
}

// CSV Export
export function exportToCSV(data: ExportData[], filename: string) {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  downloadFile(csvContent, `${filename}.csv`, 'text/csv')
}

// JSON Export
export function exportToJSON(data: ExportData[], filename: string) {
  const jsonContent = JSON.stringify(data, null, 2)
  downloadFile(jsonContent, `${filename}.json`, 'application/json')
}

// Helper function to trigger download
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

// Format data for export
export function formatAccountsForExport(accounts: any[]) {
  return accounts.map(account => ({
    'Account Name': account.name,
    'Total Points': account.totalPoints,
    'Total Earnings ($)': (account.totalPoints / 100).toFixed(2),
    'Completed Withdrawals ($)': account.completedWithdrawals.toFixed(2),
    'Pending Withdrawals ($)': account.pendingWithdrawals.toFixed(2),
    'Current Balance (pts)': account.currentBalance,
    'Current Balance ($)': (account.currentBalance / 100).toFixed(2),
    'Created Date': new Date(account.createdAt).toLocaleDateString(),
    'Color': account.color
  }))
}

export function formatEntriesForExport(entries: any[]) {
  return entries.map(entry => ({
    'Date': new Date(entry.date).toLocaleDateString(),
    'Account': entry.accountName,
    'Points': entry.points,
    'Earnings ($)': (entry.points / 100).toFixed(2),
    'Created At': new Date(entry.createdAt).toLocaleDateString()
  }))
}

export function formatWithdrawalsForExport(withdrawals: any[]) {
  return withdrawals.map(withdrawal => ({
    'Request Date': new Date(withdrawal.date).toLocaleDateString(),
    'Account': withdrawal.accountName,
    'Amount ($)': withdrawal.amount.toFixed(2),
    'Points': (withdrawal.amount * 100).toLocaleString(),
    'Status': withdrawal.status,
    'Completed Date': withdrawal.completedAt ? new Date(withdrawal.completedAt).toLocaleDateString() : 'N/A',
    'Processing Days': withdrawal.completedAt ? 
      Math.ceil((new Date(withdrawal.completedAt).getTime() - new Date(withdrawal.date).getTime()) / (1000 * 60 * 60 * 24)) : 
      'N/A'
  }))
}

// Generate summary report
export function generateSummaryReport(accounts: any[], entries: any[], withdrawals: any[]) {
  const totalPoints = accounts.reduce((sum, acc) => sum + acc.totalPoints, 0)
  const totalWithdrawn = accounts.reduce((sum, acc) => sum + acc.completedWithdrawals, 0)
  const totalPending = accounts.reduce((sum, acc) => sum + acc.pendingWithdrawals, 0)
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0)
  
  const thisMonth = new Date()
  const thisMonthEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date)
    return entryDate.getMonth() === thisMonth.getMonth() && 
           entryDate.getFullYear() === thisMonth.getFullYear()
  })
  
  const thisMonthPoints = thisMonthEntries.reduce((sum, entry) => sum + entry.points, 0)
  
  return {
    'Report Generated': new Date().toLocaleString(),
    'Total Accounts': accounts.length,
    'Active Accounts': accounts.filter(acc => acc.currentBalance > 0).length,
    'Total Points Earned': totalPoints.toLocaleString(),
    'Total Earnings ($)': (totalPoints / 100).toFixed(2),
    'Total Withdrawn ($)': totalWithdrawn.toFixed(2),
    'Pending Withdrawals ($)': totalPending.toFixed(2),
    'Available Balance (pts)': totalBalance.toLocaleString(),
    'Available Balance ($)': (totalBalance / 100).toFixed(2),
    'This Month Points': thisMonthPoints.toLocaleString(),
    'This Month Earnings ($)': (thisMonthPoints / 100).toFixed(2),
    'Total Entries': entries.length,
    'This Month Entries': thisMonthEntries.length,
    'Total Withdrawals': withdrawals.length,
    'Completed Withdrawals': withdrawals.filter(w => w.status === 'COMPLETED').length,
    'Pending Withdrawals': withdrawals.filter(w => w.status === 'PENDING').length
  }
}

// Export all data as a comprehensive report
export function exportComprehensiveReport(accounts: any[], entries: any[], withdrawals: any[]) {
  const summary = generateSummaryReport(accounts, entries, withdrawals)
  const timestamp = new Date().toISOString().split('T')[0]
  
  // Create a comprehensive JSON report
  const report = {
    summary,
    accounts: formatAccountsForExport(accounts),
    entries: formatEntriesForExport(entries),
    withdrawals: formatWithdrawalsForExport(withdrawals),
    metadata: {
      exportDate: new Date().toISOString(),
      totalRecords: accounts.length + entries.length + withdrawals.length,
      version: '1.0'
    }
  }
  
  exportToJSON([report], `survey-tracker-report-${timestamp}`)
}