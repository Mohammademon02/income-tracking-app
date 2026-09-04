import webpush from "web-push"

import { prisma } from "@/lib/prisma"

import type { NotificationEvent } from "./events"

/**
 * Web push delivery.
 *
 * Before this existed the app advertised push notifications it could not send:
 * `/api/notifications/subscribe` answered "Subscription saved successfully"
 * while discarding the subscription, no VAPID keys were configured anywhere,
 * nothing ever called `pushManager.subscribe()`, and `public/sw-push.js` was
 * never registered. Notifications only appeared while a tab was open.
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@example.com"

/** Push is optional: without keys the app still works, it just cannot push. */
export const isPushConfigured = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY)

let configured = false

function ensureConfigured() {
  if (configured || !isPushConfigured) return
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY!, VAPID_PRIVATE_KEY!)
  configured = true
}

export type PushSubscriptionInput = {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

export async function saveSubscription(
  subscription: PushSubscriptionInput,
  userAgent?: string | null
) {
  // Upsert on endpoint: browsers hand back the same endpoint for the same
  // installation, so re-subscribing must refresh the row rather than pile up
  // duplicates that all deliver to one device.
  return prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    create: {
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: userAgent ?? null,
    },
    update: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: userAgent ?? null,
    },
  })
}

export async function removeSubscription(endpoint: string) {
  return prisma.pushSubscription.deleteMany({ where: { endpoint } })
}

export type PushPayload = {
  title: string
  body: string
  url?: string
  tag?: string
}

export function toPushPayload(event: NotificationEvent): PushPayload {
  return {
    title: event.title,
    body: event.message,
    url: event.actionUrl,
    tag: event.id,
  }
}

export type PushResult = {
  sent: number
  failed: number
  removed: number
}

/**
 * Deliver a payload to every registered subscription.
 *
 * Endpoints that the push service reports as gone (404/410) are deleted — a
 * subscription dies when the user clears site data or uninstalls the PWA, and
 * retrying it forever would be pure noise.
 */
export async function sendToAll(payload: PushPayload): Promise<PushResult> {
  if (!isPushConfigured) return { sent: 0, failed: 0, removed: 0 }
  ensureConfigured()

  const subscriptions = await prisma.pushSubscription.findMany()
  if (subscriptions.length === 0) return { sent: 0, failed: 0, removed: 0 }

  const body = JSON.stringify(payload)
  const staleEndpoints: string[] = []
  let sent = 0
  let failed = 0

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          body
        )
        sent += 1
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          staleEndpoints.push(subscription.endpoint)
        } else {
          failed += 1
          console.error("[push] delivery failed:", statusCode ?? error)
        }
      }
    })
  )

  if (staleEndpoints.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: staleEndpoints } },
    })
  }

  if (sent > 0) {
    await prisma.pushSubscription.updateMany({
      where: { endpoint: { notIn: staleEndpoints } },
      data: { lastUsedAt: new Date() },
    })
  }

  return { sent, failed, removed: staleEndpoints.length }
}
