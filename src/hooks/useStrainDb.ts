import { useState, useEffect } from 'react'
import { openDB } from 'idb'

interface StrainRecord {
  Strain: string
  Type: 'sativa' | 'indica' | 'hybrid'
  Rating: number
  Effects: string
  Flavor: string
  Description: string
  terpenes?: string   // "Myrcene, Limonene, Caryophyllene"
  thc?: number
  cbd?: number
  medical?: string    // "Pain, Insomnia, Anxiety"
}

let cache: StrainRecord[] | null = null

export function useStrainDb() {
  const [db, setDb] = useState<StrainRecord[]>(cache ?? [])
  const [loading, setLoading] = useState(cache === null)

  useEffect(() => {
    if (cache !== null) {
      setDb(cache)
      setLoading(false)
      return
    }
    let cancelled = false
    fetch('/strains.json')
      .then((res) => res.json())
      .then((data: StrainRecord[]) => {
        if (!cancelled) {
          cache = data
          setDb(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { db, loading }
}

export function displayName(s: StrainRecord): string {
  return String(s.Strain).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// IndexedDB cache for live-fetched strains
async function getLiveCache() {
  return openDB('strain-live-cache', 1, {
    upgrade(db) {
      db.createObjectStore('strains')
    },
  })
}

export async function fetchLiveStrain(name: string): Promise<Partial<StrainRecord> | null> {
  if (!navigator.onLine) return null

  const cacheKey = name.toLowerCase()

  try {
    const idb = await getLiveCache()
    const cached = await idb.get('strains', cacheKey)
    if (cached) return cached as Partial<StrainRecord>

    const encoded = encodeURIComponent(name)
    const res = await fetch(
      `https://cannlytics.com/api/data/strains?strain_name=${encoded}`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return null

    const json = await res.json()
    const data = json?.data?.[0]
    if (!data) return null

    // Map Cannlytics fields → StrainRecord shape
    const terpeneNames = [
      'myrcene', 'caryophyllene', 'limonene', 'linalool', 'pinene',
      'terpinolene', 'humulene', 'ocimene', 'bisabolol', 'valencene',
    ]
    const terpenes = terpeneNames
      .filter((t) => data[t] != null && data[t] > 0)
      .sort((a, b) => (data[b] ?? 0) - (data[a] ?? 0))
      .slice(0, 5)
      .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
      .join(', ')

    const enriched: Partial<StrainRecord> = {
      thc: data.thc != null ? parseFloat(data.thc) : undefined,
      cbd: data.cbd != null ? parseFloat(data.cbd) : undefined,
      terpenes: terpenes || undefined,
    }

    await idb.put('strains', enriched, cacheKey)
    return enriched
  } catch {
    return null
  }
}

export type { StrainRecord }
