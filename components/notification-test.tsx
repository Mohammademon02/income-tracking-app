"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function NotificationTest() {
  useEffect(() => {
    // Log current localStorage state
    console.log("=== Notification State Debug ===")
    console.log("Read states:", localStorage.getItem('notification-read-states'))
    console.log("Deleted notifications:", localStorage.getItem('notification-deleted'))
    console.log("================================")
  }, [])

  const testPersistence = () => {
    // Test localStorage directly
    const testData = {
      'test-notification-1': true,
      'test-notification-2': true
    }
    
    localStorage.setItem('notification-read-states', JSON.stringify(testData))
    localStorage.setItem('notification-deleted', JSON.stringify(['deleted-notification-1']))
    
    console.log("Test data saved to localStorage")
    console.log("Read states:", localStorage.getItem('notification-read-states'))
    console.log("Deleted:", localStorage.getItem('notification-deleted'))
  }

  const clearStorage = () => {
    localStorage.removeItem('notification-read-states')
    localStorage.removeItem('notification-deleted')
    console.log("localStorage cleared")
  }

  return (
    <Card className="m-4 max-w-md">
      <CardHeader>
        <CardTitle className="text-sm">Notification Persistence Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button onClick={testPersistence} size="sm" className="w-full">
          Test localStorage
        </Button>
        <Button onClick={clearStorage} size="sm" variant="outline" className="w-full">
          Clear localStorage
        </Button>
        <Button 
          onClick={() => window.location.reload()} 
          size="sm" 
          variant="secondary" 
          className="w-full"
        >
          Reload Page
        </Button>
        <div className="text-xs text-gray-600">
          Check browser console for localStorage state
        </div>
      </CardContent>
    </Card>
  )
}