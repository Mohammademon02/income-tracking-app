# Notification System

## Overview
The notification system provides real-time alerts for important events in the application, including withdrawal completions, milestone achievements, daily goals, and system alerts.

## Features

### ✅ Fixed Issues
- **Persistent Storage**: Notifications are now stored in the database
- **Read/Unread State**: Properly tracks and persists notification status
- **API Endpoints**: Complete CRUD operations for notifications
- **Error Handling**: Robust error handling with user feedback
- **Real-time Updates**: Automatic refresh every 2 minutes
- **Priority System**: High, Medium, Low priority notifications
- **Type Safety**: Proper TypeScript interfaces and enums

### 🔧 Components
- `NotificationCenter`: Main notification UI component
- `lib/notifications.ts`: Utility functions for creating notifications
- API endpoints in `app/api/notifications/`

### 📊 Database Schema
```prisma
model Notification {
  id        String             @id @default(auto()) @map("_id") @db.ObjectId
  type      NotificationType
  title     String
  message   String
  timestamp DateTime           @default(now())
  read      Boolean            @default(false)
  actionUrl String?
  priority  NotificationPriority @default(MEDIUM)
  createdAt DateTime           @default(now())
  updatedAt DateTime           @updatedAt
}
```

### 🚀 Setup Instructions

1. **Update Database Schema**:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

2. **Restart Development Server**:
   ```bash
   npm run dev
   ```

### 📡 API Endpoints

- `GET /api/notifications/recent` - Fetch recent notifications
- `POST /api/notifications/[id]/read` - Mark notification as read
- `DELETE /api/notifications/[id]` - Delete notification
- `POST /api/notifications/mark-all-read` - Mark all as read
- `POST /api/notifications/cleanup` - Clean up old notifications

### 🎯 Notification Types

1. **WITHDRAWAL** - Withdrawal status updates
2. **MILESTONE** - Point milestone achievements
3. **GOAL** - Daily goal completions
4. **SYSTEM** - System alerts and warnings

### 🔄 Auto-Generated Notifications

The system automatically creates notifications for:
- Withdrawal completions
- Point milestones (1K, 5K, 10K, 25K, 50K, 100K, 250K, 500K)
- Daily goal achievements (2000+ points)
- Delayed withdrawals (15+ days pending)

### 🧹 Maintenance

- Old read notifications are automatically cleaned up after 30 days
- Use the cleanup endpoint to manually trigger cleanup
- Notifications are deduplicated to prevent spam

### 🎨 UI Features

- Loading states with spinner
- Error states with retry button
- Priority-based color coding
- Hover effects and animations
- Mobile-responsive design
- Accessibility compliant

## Usage Example

```typescript
import { createNotification } from '@/lib/notifications'

// Create a custom notification
await createNotification({
  id: 'custom-notification-123',
  type: 'SYSTEM',
  title: 'Custom Alert',
  message: 'This is a custom notification',
  priority: 'HIGH',
  actionUrl: '/dashboard'
})
```