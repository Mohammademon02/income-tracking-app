// Temporary storage for notification read states
// This combines server-side memory with client-side localStorage for persistence

class NotificationStore {
  private readStates = new Map<string, boolean>();
  private deletedNotifications = new Set<string>();
  private isClient = typeof window !== 'undefined';

  constructor() {
    // Load from localStorage on initialization (client-side only)
    if (this.isClient) {
      this.loadFromLocalStorage();
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const readStatesData = localStorage.getItem('notification-read-states');
      const deletedData = localStorage.getItem('notification-deleted');
      
      if (readStatesData) {
        const parsed = JSON.parse(readStatesData);
        this.readStates = new Map(Object.entries(parsed));
      }
      
      if (deletedData) {
        const parsed = JSON.parse(deletedData);
        this.deletedNotifications = new Set(parsed);
      }
    } catch (error) {
      console.error('Error loading notification state from localStorage:', error);
    }
  }

  private saveToLocalStorage(): void {
    if (!this.isClient) return;
    
    try {
      // Convert Map to Object for JSON serialization
      const readStatesObj = Object.fromEntries(this.readStates);
      localStorage.setItem('notification-read-states', JSON.stringify(readStatesObj));
      
      // Convert Set to Array for JSON serialization
      const deletedArray = Array.from(this.deletedNotifications);
      localStorage.setItem('notification-deleted', JSON.stringify(deletedArray));
    } catch (error) {
      console.error('Error saving notification state to localStorage:', error);
    }
  }

  markAsRead(id: string): void {
    this.readStates.set(id, true);
    this.saveToLocalStorage();
    console.log(`Marked notification ${id} as read`);
  }

  markAllAsRead(notificationIds: string[]): void {
    notificationIds.forEach(id => {
      this.readStates.set(id, true);
    });
    this.saveToLocalStorage();
    console.log(`Marked ${notificationIds.length} notifications as read`);
  }

  isRead(id: string): boolean {
    return this.readStates.get(id) || false;
  }

  deleteNotification(id: string): void {
    this.deletedNotifications.add(id);
    this.readStates.delete(id);
    this.saveToLocalStorage();
    console.log(`Deleted notification ${id}`);
  }

  isDeleted(id: string): boolean {
    return this.deletedNotifications.has(id);
  }

  // Get all current notification IDs for bulk operations
  getAllNotificationIds(): string[] {
    return Array.from(this.readStates.keys());
  }

  // Clear all data (for testing)
  clear(): void {
    this.readStates.clear();
    this.deletedNotifications.clear();
    this.saveToLocalStorage();
  }

  // Sync with client-side state (for server-side calls)
  syncWithClientState(clientReadStates: Record<string, boolean>, clientDeleted: string[]): void {
    // Merge client state with server state
    Object.entries(clientReadStates).forEach(([id, isRead]) => {
      if (isRead) {
        this.readStates.set(id, true);
      }
    });
    
    clientDeleted.forEach(id => {
      this.deletedNotifications.add(id);
    });
  }
}

// Export a singleton instance
export const notificationStore = new NotificationStore();