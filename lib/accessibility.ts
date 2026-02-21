// Essential accessibility utilities

export const ARIA_LABELS = {
  // Navigation
  mainNavigation: 'Main navigation',
  userMenu: 'User account menu',
  
  // Tables
  sortColumn: (column: string, direction: 'asc' | 'desc') => 
    `Sort ${column} in ${direction === 'asc' ? 'ascending' : 'descending'} order`,
  selectRow: (itemName: string) => `Select ${itemName}`,
  selectAllRows: 'Select all rows',
  
  // Forms
  required: 'Required field',
  fieldError: (field: string) => `Error in ${field} field`,
  
  // Buttons
  loading: 'Loading, please wait',
  close: 'Close dialog',
  
  // Data
  pointsValue: (points: number) => `${points.toLocaleString()} points, equivalent to $${(points / 100).toFixed(2)}`,
  currency: (amount: number) => `$${amount.toFixed(2)}`,
}

export const KEYBOARD_SHORTCUTS = {
  SEARCH: 'Ctrl+K',
  NEW_ENTRY: 'Ctrl+N',
  NEW_ACCOUNT: 'Ctrl+Shift+N',
  EXPORT: 'Ctrl+E',
}

// Screen reader announcements
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Initialize accessibility features
export const initializeAccessibility = () => {
  // Add keyboard shortcuts listener
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'k':
          event.preventDefault()
          const searchInput = document.querySelector('[data-search-input]') as HTMLElement
          searchInput?.focus()
          break
        case 'n':
          event.preventDefault()
          if (event.shiftKey) {
            const newAccountBtn = document.querySelector('[data-new-account]') as HTMLElement
            newAccountBtn?.click()
          } else {
            const newEntryBtn = document.querySelector('[data-new-entry]') as HTMLElement
            newEntryBtn?.click()
          }
          break
      }
    }
  })
  
  return () => {
    // Cleanup if needed
  }
}