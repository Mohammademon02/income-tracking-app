# API Endpoints Testing Guide

## Performance Metrics API
**Endpoint:** `GET /api/performance/metrics`

**Expected Response:**
```json
{
  "dailyAverage": 1250,
  "weeklyTrend": 8.5,
  "monthlyGoalProgress": 45,
  "streakDays": 3,
  "topPerformingAccount": "Survey Junkie",
  "efficiency": 72
}
```

## Smart Insights API
**Endpoint:** `GET /api/insights/generate`

**Expected Response:**
```json
[
  {
    "id": "account-diversification",
    "type": "tip",
    "title": "Account Diversification",
    "description": "You have 2 accounts. Users with 3+ accounts typically earn 40-60% more.",
    "action": {
      "label": "Add Account",
      "url": "/accounts"
    },
    "priority": "medium",
    "impact": "+40-60% earning potential"
  }
]
```

## Notifications API
**Endpoint:** `GET /api/notifications/recent`

**Expected Response:**
```json
[
  {
    "id": "daily-goal-2026-02-21",
    "type": "goal",
    "title": "Daily Goal Achieved! 🌟",
    "message": "2150 / 2000 points earned today ($21.50)",
    "timestamp": "2026-02-21T15:30:00.000Z",
    "read": false,
    "priority": "medium"
  }
]
```

## Testing Steps

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test the endpoints directly:**
   - Open browser dev tools
   - Navigate to your dashboard
   - Check Network tab for API calls
   - Verify responses match expected format

3. **Check component behavior:**
   - Performance Monitor should show real data from your database
   - Smart Insights should display relevant recommendations
   - Notification Center should show actual notifications

## Troubleshooting

If you see static/mock data:
1. Check browser console for API errors
2. Verify database connection is working
3. Ensure you have some test data in your database
4. Check that the API routes are accessible

If APIs return empty data:
1. Add some test entries and accounts to your database
2. Create a test withdrawal to see withdrawal-related insights
3. The system needs some historical data to generate meaningful insights