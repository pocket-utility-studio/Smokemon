import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Version check — fetch version.json (never SW-cached) and hard-reset if stale.
// This is the only reliable way to force updates on Android/iOS PWAs where
// the service worker itself may be served from CDN cache.
async function checkVersion() {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}version.json`, { cache: 'no-store' })
    if (!res.ok) return
    const { version } = await res.json()
    if (version === __APP_VERSION__) return
    // Stale — nuke all caches and unregister SW, then reload fresh
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    }
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map((r) => r.unregister()))
    }
    window.location.reload()
  } catch {
    // Offline — skip
  }
}

checkVersion()

// Reload when a new SW takes control (covers the normal update path too)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
