// Simple test script to verify notification system
console.log('Testing notification system...')

// Test the API endpoint
fetch('/api/notifications/test')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Test notifications:', data)
  })
  .catch(error => {
    console.error('❌ Test failed:', error)
  })

// Test the main notifications endpoint
fetch('/api/notifications/recent')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Recent notifications:', data)
  })
  .catch(error => {
    console.error('❌ Recent notifications failed:', error)
  })

console.log('Test completed. Check the browser console for results.')