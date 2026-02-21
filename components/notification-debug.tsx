"use client"

import { useNotificationState } from "@/hooks/use-notification-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function NotificationDebug() {
  const notificationState = useNotificationState()

  const testNotifications = [
    'demo-notification',
    'withdrawal-delayed-1',
    'milestone-1000',
    'daily-goal-2026-02-21'
  ]

  return (
    <Card className="m-4 max-w-md">
      <CardHeader>
        <CardTitle className="text-sm">Notification State Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs">
          <p><strong>Read States:</strong></p>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(notificationState.state.readStates, null, 2)}
          </pre>
        </div>
        
        <div className="text-xs">
          <p><strong>Deleted:</strong></p>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(notificationState.state.deletedNotifications, null, 2)}
          </pre>
        </div>

        <div className="flex flex-wrap gap-1">
          {testNotifications.map(id => (
            <Button
              key={id}
              size="sm"
              variant={notificationState.isRead(id) ? "default" : "outline"}
              onClick={() => notificationState.markAsRead(id)}
              className="text-xs"
            >
              {id.split('-')[0]}
            </Button>
          ))}
        </div>

        <div className="flex gap-1">
          <Button
            size="sm"
            onClick={() => notificationState.markAllAsRead(testNotifications)}
            className="text-xs"
          >
            Mark All Read
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => notificationState.clearAll()}
            className="text-xs"
          >
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}