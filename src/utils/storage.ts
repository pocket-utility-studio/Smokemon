import type { StrainEntry } from '../context/StashContext'

const STASH_KEY = 'utilhub_stash'

/** Reads all stash data from localStorage */
export function getStoredStrains(): StrainEntry[] {
  try {
    const raw = localStorage.getItem(STASH_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as StrainEntry[]
    return []
  } catch {
    return []
  }
}

/** Export all app data as a downloaded .json file */
export function exportSaveData(): void {
  const strains = getStoredStrains()
  const payload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    strains,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const dateStr = new Date().toISOString().slice(0, 10)
  const a = document.createElement('a')
  a.href = url
  a.download = `utilhub-save-${dateStr}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Import save data from a parsed JSON object. Returns true on success. */
export function importSaveData(data: unknown): boolean {
  if (
    typeof data !== 'object' ||
    data === null ||
    !('strains' in data) ||
    !Array.isArray((data as Record<string, unknown>).strains)
  ) {
    return false
  }
  try {
    const strains = (data as { strains: StrainEntry[] }).strains
    localStorage.setItem(STASH_KEY, JSON.stringify(strains))
    return true
  } catch {
    return false
  }
}
