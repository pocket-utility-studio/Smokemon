/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>
}

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

self.skipWaiting()

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Navigate to the URL embedded in notification.data when the user taps it
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url: string =
    ((event.notification.data ?? {}) as { url?: string }).url ?? '/Smokemon/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        if (clients.length) {
          const client = clients[0] as WindowClient
          client.focus()
          return client.navigate(url)
        }
        return self.clients.openWindow(url)
      }),
  )
})
