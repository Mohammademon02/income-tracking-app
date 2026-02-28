// Simple Service Worker for Push Notifications
// Standalone service worker for push notification support

// Install event
self.addEventListener('install', function(event) {
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim())
})

// Push notification event handler
self.addEventListener('push', function(event) {
  
  let notificationData = {
    title: 'Income Tracker',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'default',
    data: {}
  }

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = {
        ...notificationData,
        ...data
      }
    } catch (error) {
      console.error('Error parsing push data:', error)
      notificationData.body = event.data.text() || notificationData.body
    }
  }

  // Show notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: true
    })
  )
})

// Notification click handler
self.addEventListener('notificationclick', function(event) {
  
  event.notification.close()

  // Default action - open dashboard
  const urlToOpen = event.notification.data?.url || '/dashboard'
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus()
        }
      }
      
      // If no existing window/tab, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})