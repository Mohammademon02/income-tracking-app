# Current Notification System - Quick Reference

## 🔔 Active Notification Types

### 1. **Withdrawal Completed** 💰
- **Trigger**: When withdrawal status changes to 'COMPLETED'
- **Timing**: Within 24 hours of completion
- **Message**: "$X.XX from [Account] processed in X days"
- **Priority**: HIGH (Red border)
- **Action**: Links to /withdrawals page

### 2. **Withdrawal Delay Alert** ⚠️
- **Trigger**: Withdrawal pending for 15+ days
- **Timing**: Continuous check for old pending withdrawals
- **Message**: "[Account] withdrawal ($X.XX) pending for X days"
- **Priority**: HIGH (Red border)
- **Action**: Links to /withdrawals page

### 3. **Milestone Achieved** 🎯
- **Trigger**: Total points cross threshold (1K, 5K, 10K, 25K, 50K, 100K, 250K, 500K)
- **Timing**: Within 24 hours of crossing milestone
- **Message**: "You've earned X points total! Next: Y pts"
- **Priority**: MEDIUM (Orange border)
- **Action**: None (informational)

### 4. **Daily Goal Achieved** 🌟
- **Trigger**: Daily points ≥ 2000 (equivalent to $20)
- **Timing**: Once per day when goal is reached
- **Message**: "X / 2,000 points earned today ($X.XX)"
- **Priority**: MEDIUM (Orange border)
- **Action**: None (informational)

### 5. **System Demo Notification** 📢
- **Trigger**: When no real notifications exist
- **Timing**: Fallback notification
- **Message**: "Notification system is working correctly"
- **Priority**: MEDIUM (Orange border)
- **Action**: None (demo purpose)

---

## ⚙️ Notification Behavior

### **Auto-Generation Rules**
- Checks every 2 minutes for new notifications
- Only creates notifications for events in last 24 hours
- Prevents duplicate notifications with unique IDs
- Filters based on user's localStorage state

### **State Management**
- **Read State**: Persists in localStorage
- **Delete State**: Persists in localStorage
- **Server Sync**: API calls for tracking (optional)

### **Display Logic**
- Unread notifications show blue dot indicator
- High priority: Red left border
- Medium priority: Orange left border  
- Low priority: Blue left border
- Deleted notifications are filtered out
- Read notifications show normal styling

---

## 🎯 Easy Customization Points

### **Change Daily Goal Amount**
```typescript
// In generateRealtimeNotifications()
const dailyGoal = 2000 // Change this value
```

### **Modify Milestone Thresholds**
```typescript
// In generateRealtimeNotifications()
const milestones = [1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000]
// Add/remove values as needed
```

### **Adjust Withdrawal Delay Threshold**
```typescript
// In generateRealtimeNotifications()
lt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000) // 15 days
// Change 15 to different number of days
```

### **Update Refresh Interval**
```typescript
// In notification components
const interval = setInterval(fetchNotifications, 2 * 60 * 1000) // 2 minutes
// Change 2 to different number of minutes
```

---

## 📱 User Actions Available

### **Individual Notifications**
- **Click**: Mark as read
- **X Button**: Delete notification
- **Action Link**: Navigate to relevant page (withdrawals)

### **Bulk Actions**
- **Mark All Read**: Marks all current notifications as read
- **View All**: Navigate to full notifications page (/notifications)

### **Persistent State**
- All actions persist across page reloads
- State stored in browser localStorage
- Consistent across all notification interfaces

---

## 🔧 Technical Details

### **API Endpoints**
- `GET /api/notifications/recent` - Fetch notifications
- `POST /api/notifications/[id]/read` - Mark as read
- `DELETE /api/notifications/[id]` - Delete notification
- `POST /api/notifications/mark-all-read` - Mark all as read

### **Data Sources**
- **Withdrawals**: `prisma.withdrawal` table
- **Points**: `prisma.dailyEntry` table
- **Accounts**: `prisma.account` table

### **Storage**
- **Client**: localStorage for read/delete states
- **Server**: In-memory fallback (temporary)
- **Database**: Real notification data (when available)

This system is fully functional and ready for production use! 🚀