import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Auto-reload when a new service worker takes control so deploys are instant
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
  // Force-check for a new SW on every app open — fixes stale PWA on iOS
  navigator.serviceWorker.ready.then((reg) => {
    reg.update()
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
