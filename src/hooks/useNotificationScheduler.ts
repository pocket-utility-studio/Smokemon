import { useEffect } from 'react'

// ── Storage keys ──────────────────────────────────────────────────────────────

export const CHECKIN_KEY       = 'smokedex_checkins'
export const CLEAN_INTERVAL_KEY = 'smokedex_clean_interval'
export const LAST_CLEANED_KEY   = 'smokedex_last_cleaned'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PendingCheckIn {
  sessionId:     string
  strainName:    string
  scheduledFor:  number   // ms timestamp
  notified?:     boolean
}

// ── Cleaning helpers ──────────────────────────────────────────────────────────

export function getCleaningInterval(): number {
  return parseInt(localStorage.getItem(CLEAN_INTERVAL_KEY) ?? '0', 10)
}

export function setCleaningInterval(days: number) {
  localStorage.setItem(CLEAN_INTERVAL_KEY, String(days))
}

export function markCleaned() {
  localStorage.setItem(LAST_CLEANED_KEY, new Date().toISOString())
}

export function getLastCleaned(): string | null {
  return localStorage.getItem(LAST_CLEANED_KEY)
}

export function isCleaningOverdue(): boolean {
  const interval = getCleaningInterval()
  if (interval === 0) return false
  const last = getLastCleaned()
  if (!last) return true  // never cleaned → overdue immediately
  return Date.now() > new Date(last).getTime() + interval * 24 * 60 * 60 * 1000
}

export function daysUntilCleaningDue(): number | null {
  const interval = getCleaningInterval()
  if (interval === 0) return null
  const last = getLastCleaned()
  if (!last) return 0
  const dueAt  = new Date(last).getTime() + interval * 24 * 60 * 60 * 1000
  const msLeft = dueAt - Date.now()
  return Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)))
}

// ── Check-in helpers ──────────────────────────────────────────────────────────

export function schedulePendingCheckIn(sessionId: string, strainName: string) {
  const pending: PendingCheckIn[] = JSON.parse(
    localStorage.getItem(CHECKIN_KEY) ?? '[]',
  )
  const entry: PendingCheckIn = {
    sessionId,
    strainName,
    scheduledFor: Date.now() + 45 * 60 * 1000,
  }
  localStorage.setItem(
    CHECKIN_KEY,
    JSON.stringify([
      ...pending.filter((p) => p.sessionId !== sessionId),
      entry,
    ]),
  )
}

export function removePendingCheckIn(sessionId: string) {
  const pending: PendingCheckIn[] = JSON.parse(
    localStorage.getItem(CHECKIN_KEY) ?? '[]',
  )
  localStorage.setItem(
    CHECKIN_KEY,
    JSON.stringify(pending.filter((p) => p.sessionId !== sessionId)),
  )
}

// ── Permission helpers ────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

// ── Low-level notification fire ───────────────────────────────────────────────

async function fireNotification(
  title: string,
  body: string,
  url: string,
  tag: string,
) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  if (!('serviceWorker' in navigator)) return
  try {
    const reg = await navigator.serviceWorker.ready
    await reg.showNotification(title, {
      body,
      icon:     '/Smokemon/icon-192.png',
      badge:    '/Smokemon/icon-192.png',
      data:     { url },
      tag,
    })
  } catch {
    // Silently fail — notification not critical
  }
}

// ── Hook — called once on app mount ──────────────────────────────────────────

export function useNotificationScheduler() {
  useEffect(() => {
    if (Notification.permission !== 'granted') return

    // Cleaning reminder
    if (isCleaningOverdue()) {
      const interval = getCleaningInterval()
      fireNotification(
        'Nurse Joy reminds you!',
        `It's been over ${interval} days — time to clean your vape.`,
        '/Smokemon/poke-center',
        'cleaning-reminder',
      )
    }

    // Pending check-ins
    const pending: PendingCheckIn[] = JSON.parse(
      localStorage.getItem(CHECKIN_KEY) ?? '[]',
    )
    const now = Date.now()
    const due = pending.filter((p) => !p.notified && now >= p.scheduledFor)

    due.forEach((checkin) => {
      fireNotification(
        'How are you feeling?',
        `It's been 45 mins since your ${checkin.strainName} session. Log your post-session symptoms.`,
        `/Smokemon/check-in?session=${checkin.sessionId}`,
        `checkin-${checkin.sessionId}`,
      )
    })

    if (due.length > 0) {
      // Mark all fired as notified so we don't repeat on next open
      const updated = pending.map((p) =>
        due.some((d) => d.sessionId === p.sessionId)
          ? { ...p, notified: true }
          : p,
      )
      localStorage.setItem(CHECKIN_KEY, JSON.stringify(updated))
    }
  }, [])
}
