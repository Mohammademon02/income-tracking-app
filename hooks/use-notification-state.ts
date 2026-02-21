"use client"

import { useState, useEffect, useCallback } from 'react'

interface NotificationState {
  readStates: Record<string, boolean>
  deletedNotifications: string[]
}

export function useNotificationState() {
  const [state, setState] = useState<NotificationState>({
    readStates: {},
    deletedNotifications: []
  })
  const [isLoaded, setIsLoaded] = useState(false)

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const readStatesData = localStorage.getItem('notification-read-states')
      const deletedData = localStorage.getItem('notification-deleted')
      
      setState({
        readStates: readStatesData ? JSON.parse(readStatesData) : {},
        deletedNotifications: deletedData ? JSON.parse(deletedData) : []
      })
    } catch (error) {
      console.error('Error loading notification state:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  const markAsRead = useCallback((id: string) => {
    setState(prevState => {
      const newReadStates = { ...prevState.readStates, [id]: true }
      const newState = { ...prevState, readStates: newReadStates }
      
      try {
        localStorage.setItem('notification-read-states', JSON.stringify(newReadStates))
      } catch (error) {
        console.error('Error saving to localStorage:', error)
      }
      
      return newState
    })
  }, [])

  const markAllAsRead = useCallback((ids: string[]) => {
    setState(prevState => {
      const newReadStates = { ...prevState.readStates }
      ids.forEach(id => {
        newReadStates[id] = true
      })
      const newState = { ...prevState, readStates: newReadStates }
      
      try {
        localStorage.setItem('notification-read-states', JSON.stringify(newReadStates))
      } catch (error) {
        console.error('Error saving to localStorage:', error)
      }
      
      return newState
    })
  }, [])

  const deleteNotification = useCallback((id: string) => {
    setState(prevState => {
      const newDeleted = [...prevState.deletedNotifications, id]
      const newReadStates = { ...prevState.readStates }
      delete newReadStates[id]
      
      const newState = {
        readStates: newReadStates,
        deletedNotifications: newDeleted
      }
      
      try {
        localStorage.setItem('notification-deleted', JSON.stringify(newDeleted))
        localStorage.setItem('notification-read-states', JSON.stringify(newReadStates))
      } catch (error) {
        console.error('Error saving to localStorage:', error)
      }
      
      return newState
    })
  }, [])

  const isRead = useCallback((id: string): boolean => {
    return state.readStates[id] || false
  }, [state.readStates])

  const isDeleted = useCallback((id: string): boolean => {
    return state.deletedNotifications.includes(id)
  }, [state.deletedNotifications])

  const clearAll = useCallback(() => {
    const newState = {
      readStates: {},
      deletedNotifications: []
    }
    setState(newState)
    
    try {
      localStorage.removeItem('notification-read-states')
      localStorage.removeItem('notification-deleted')
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }, [])

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isRead,
    isDeleted,
    clearAll,
    state,
    isLoaded
  }
}