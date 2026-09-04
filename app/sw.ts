/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker"
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist"
import { NetworkFirst, NetworkOnly, Serwist } from "serwist"

/**
 * The app's one and only service worker.
 *
 * Serwist compiles this file to public/sw.js at build time. Everything the
 * worker does lives here — caching strategy and push handling both — because
 * only one worker can control scope "/". The previous setup shipped a second
 * standalone push worker that nothing registered, so its push listener never
 * ran and notifications only appeared while a tab was open.
 */

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Financial data must never come from a cache. A stale balance or a stale
    // withdrawal status is worse than an offline error, and these responses are
    // account data that should not sit in the browser's cache storage.
    {
      matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/api/"),
      handler: new NetworkOnly(),
    },
    // Pages: always try the network so the user sees live numbers; the cached
    // copy is a short-lived offline fallback only.
    {
      matcher: ({ request, sameOrigin }) => sameOrigin && request.mode === "navigate",
      handler: new NetworkFirst({
        cacheName: "pages",
        networkTimeoutSeconds: 10,
      }),
    },
    // Serwist's defaults handle static assets, fonts and images sensibly.
    ...defaultCache,
  ],
})

// --- Push --------------------------------------------------------------------

type PushPayload = {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  url?: string
}

self.addEventListener("push", (event) => {
  const notification: Required<PushPayload> = {
    title: "SurvTrack",
    body: "You have a new notification",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    tag: "survtrack",
    url: "/dashboard",
  }

  if (event.data) {
    try {
      Object.assign(notification, event.data.json() as PushPayload)
    } catch {
      notification.body = event.data.text() || notification.body
    }
  }

  event.waitUntil(
    self.registration.showNotification(notification.title, {
      body: notification.body,
      icon: notification.icon,
      badge: notification.badge,
      tag: notification.tag,
      // The click target travels in `data` so notificationclick can read it.
      data: { url: notification.url },
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const targetUrl: string = event.notification.data?.url ?? "/dashboard"

  event.waitUntil(
    (async () => {
      // `type: "window"` guarantees WindowClient, which is what carries
      // focus() and navigate() — Client alone does not.
      const clientList = (await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      })) as readonly WindowClient[]

      // Prefer focusing a tab that is already open, and navigating it, rather
      // than opening a second copy of the app.
      const existing = clientList[0]
      if (existing) {
        const navigated = await existing.navigate(targetUrl).catch(() => null)
        await (navigated ?? existing).focus()
        return
      }

      await self.clients.openWindow(targetUrl)
    })()
  )
})

serwist.addEventListeners()
