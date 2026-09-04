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
  pointsValue: (points: number) =>
    `${points.toLocaleString()} points, equivalent to $${(points / 100).toFixed(2)}`,
  currency: (amount: number) => `$${amount.toFixed(2)}`,
}

/**
 * Shortcuts the app actually implements.
 *
 * Ctrl+N and Ctrl+Shift+N used to be listed here and handled below. They
 * targeted `[data-new-entry]` and `[data-new-account]`, which no component ever
 * set — so they did nothing while still calling preventDefault(), permanently
 * hijacking the browser's own Ctrl+N. Alt+1-4 was announced to screen readers
 * and never implemented at all.
 */
export const KEYBOARD_SHORTCUTS = {
  SEARCH: 'Ctrl+K',
}

/** Marks the input that Ctrl+K focuses. */
export const SEARCH_INPUT_ATTRIBUTE = 'data-search-input'

// Screen reader announcements
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    // The node may already be gone if the document was torn down.
    announcement.remove()
  }, 1000)
}

/**
 * Wire up global keyboard shortcuts.
 *
 * Returns a cleanup that genuinely removes the listener. The previous version
 * registered an anonymous handler and returned an empty function, so every
 * remount of the provider leaked another listener onto the document — and each
 * one called preventDefault() on the same keystroke.
 */
export const initializeAccessibility = () => {
  const handleKeydown = (event: KeyboardEvent) => {
    if (!event.ctrlKey && !event.metaKey) return
    if (event.key.toLowerCase() !== 'k') return

    const searchInput = document.querySelector<HTMLElement>(`[${SEARCH_INPUT_ATTRIBUTE}]`)

    // Only claim the keystroke when there is somewhere to send it. Otherwise
    // the browser's own binding still works.
    if (!searchInput) return

    event.preventDefault()
    searchInput.focus()
  }

  document.addEventListener('keydown', handleKeydown)

  return () => {
    document.removeEventListener('keydown', handleKeydown)
  }
}
