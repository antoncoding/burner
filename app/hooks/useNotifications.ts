import { useEffect, useCallback } from 'react'
import { Address } from 'viem'

export function useNotifications(address: Address) {
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }, [])

  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        return registration
      } catch (error) {
        console.error('Service worker registration failed:', error)
        return null
      }
    }
    return null
  }, [])

  const subscribeToNotifications = useCallback(async (registration: ServiceWorkerRegistration) => {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // You'll need to get this from your push service
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })

      // Send the subscription to your backend
      // await fetch('/api/notifications/subscribe', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     subscription,
      //     address
      //   })
      // })

      return subscription
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return null
    }
  }, [address])

  useEffect(() => {
    const init = async () => {
      const hasPermission = await requestNotificationPermission()
      if (!hasPermission) return

      const registration = await registerServiceWorker()
      if (!registration) return

      await subscribeToNotifications(registration)
    }

    init()
  }, [requestNotificationPermission, registerServiceWorker, subscribeToNotifications])

  return { requestNotificationPermission }
} 