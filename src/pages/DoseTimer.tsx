import { useState, useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'
import { useStash } from '../context/StashContext'
import { useStrainDb, displayName } from '../hooks/useStrainDb'

const FONT      = "'PokemonGb', 'Press Start 2P', monospace"
const GBC_BG    = '#050a04'
const GBC_TEXT  = '#c8e890'
const GBC_MUTED = '#4a7a10'
const GBC_DARKEST = '#2a4a08'
const GBC_GREEN = '#84cc16'
const GBC_BOX   = '#0a1408'
const GBC_AMBER = '#f59e0b'
const GBC_VIOLET = '#a78bfa'

interface DoseTimer {
  id: string
  strainName: string
  strainType?: string
  method: 'vape' | 'edible' | 'smoke'
  startedAt: string // ISO
  notes?: string
}

const STORAGE_KEY = 'utilhub_dose_timers'

function loadTimers(): DoseTimer[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}
function saveTimers(list: DoseTimer[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function getPhase(method: DoseTimer['method'], elapsedMin: number): { label: string; color: string } {
  if (method === 'edible') {
    if (elapsedMin < 90)  return { label: 'ONSET',        color: GBC_AMBER }
    if (elapsedMin < 240) return { label: 'PEAK',         color: GBC_GREEN }
    if (elapsedMin < 480) return { label: 'COMING DOWN',  color: GBC_MUTED }
    return                       { label: 'BASELINE',     color: GBC_DARKEST }
  }
  // vape / smoke
  if (elapsedMin < 10)  return { label: 'ONSET',       color: GBC_AMBER }
  if (elapsedMin < 45)  return { label: 'PEAK',        color: GBC_GREEN }
  if (elapsedMin < 120) return { label: 'COMING DOWN', color: GBC_MUTED }
  return                       { label: 'BASELINE',    color: GBC_DARKEST }
}

function formatElapsed(ms: number): string {
  const totalMin = Math.floor(ms / 60000)
  if (totalMin < 60) return `${totalMin}m`
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function typeColor(type?: string): string {
  if (type === 'sativa') return GBC_GREEN
  if (type === 'indica') return GBC_VIOLET
  if (type === 'hybrid') return GBC_AMBER
  return GBC_MUTED
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

const METHOD_OPTS: { value: DoseTimer['method']; label: string; color: string }[] = [
  { value: 'vape',   label: 'VAPE',   color: GBC_GREEN  },
  { value: 'smoke',  label: 'SMOKE',  color: GBC_AMBER  },
  { value: 'edible', label: 'EDIBLE', color: GBC_VIOLET },
]

export default function DoseTimer() {
  const { strains } = useStash()
  const { db } = useStrainDb()
  const [timers, setTimers]       = useState<DoseTimer[]>(loadTimers)
  const [now, setNow]             = useState(Date.now())

  // Form state
  const [query, setQuery]               = useState('')
  const [selectedType, setSelectedType] = useState<string | undefined>()
  const [method, setMethod]             = useState<DoseTimer['method']>('vape')
  const [notes, setNotes]               = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [justStarted, setJustStarted]   = useState(false)

  // Tick every 30s
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(id)
  }, [])

  // Build combined search list: stash strains first, then full DB
  const searchPool = useMemo(() => {
    const stashNames = new Set(strains.map((s) => s.name.toLowerCase()))
    const stashItems = strains.map((s) => ({ name: s.name, type: s.type, fromStash: true }))
    const dbItems = db
      .filter((d) => !stashNames.has(displayName(d).toLowerCase()))
      .map((d) => ({ name: displayName(d), type: d.Type as string, fromStash: false }))
    return [...stashItems, ...dbItems]
  }, [strains, db])

  const fuse = useMemo(() => new Fuse(searchPool, {
    keys: ['name'],
    threshold: 0.3,
    distance: 100,
  }), [searchPool])

  const results = useMemo(() => {
    if (query.trim().length < 1) return []
    return fuse.search(query.trim()).slice(0, 6).map((r) => r.item)
  }, [fuse, query])

  const selectStrain = (item: { name: string; type?: string }) => {
    setQuery(item.name)
    setSelectedType(item.type)
    setDropdownOpen(false)
  }

  const startTimer = () => {
    if (!query.trim()) return
    const entry: DoseTimer = {
      id:          Math.random().toString(36).slice(2),
      strainName:  query.trim(),
      strainType:  selectedType,
      method,
      startedAt:   new Date().toISOString(),
      notes:       notes.trim() || undefined,
    }
    const next = [entry, ...timers]
    setTimers(next)
    saveTimers(next)
    setQuery('')
    setSelectedType(undefined)
    setMethod('vape')
    setNotes('')
    setJustStarted(true)
    setTimeout(() => setJustStarted(false), 1500)
  }

  const deleteTimer = (id: string) => {
    const next = timers.filter((t) => t.id !== id)
    setTimers(next)
    saveTimers(next)
  }

  const activeCount = timers.length

  return (
    <div style={{ minHeight: '100%', background: GBC_BG, padding: 10, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${GBC_DARKEST}`, paddingBottom: 8 }}>
        <span style={{ fontFamily: FONT, fontSize: 11, color: GBC_GREEN }}>DOSE TIMER</span>
        <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, border: `1px solid ${GBC_DARKEST}`, padding: '2px 5px' }}>
          {activeCount} ACTIVE
        </span>
      </div>

      {/* Log dose form */}
      <div style={{ border: `3px solid ${GBC_GREEN}`, boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010', background: GBC_BOX, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontFamily: FONT, fontSize: 9, color: GBC_GREEN }}>LOG DOSE</span>

        {/* Strain search */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedType(undefined); setDropdownOpen(true) }}
            onFocus={() => setDropdownOpen(true)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
            placeholder="Strain name..."
            style={{ width: '100%', background: GBC_BG, border: `2px solid ${GBC_DARKEST}`, color: GBC_TEXT, fontFamily: 'monospace', fontSize: 13, padding: 8, outline: 'none', boxSizing: 'border-box' }}
          />
          {dropdownOpen && results.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: GBC_BOX, border: `2px solid ${GBC_DARKEST}`, boxSizing: 'border-box' }}>
              {results.map((item) => {
                const col = typeColor(item.type)
                return (
                  <div
                    key={item.name}
                    onPointerDown={() => selectStrain(item)}
                    style={{ padding: '8px 10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}
                  >
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT }}>{item.name}</span>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
                      {(item as { fromStash?: boolean }).fromStash && (
                        <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_GREEN }}>STASH</span>
                      )}
                      {item.type && (
                        <span style={{ fontFamily: 'monospace', fontSize: 10, color: col, border: `1px solid ${col}`, padding: '1px 4px' }}>{item.type}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Method selector */}
        <div>
          <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, display: 'block', marginBottom: 6 }}>METHOD</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {METHOD_OPTS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMethod(m.value)}
                style={{ flex: 1, fontFamily: FONT, fontSize: 8, padding: '8px 0', minHeight: 44, cursor: 'pointer', border: `2px solid ${method === m.value ? m.color : GBC_DARKEST}`, background: method === m.value ? `${m.color}18` : 'transparent', color: method === m.value ? m.color : GBC_MUTED }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)..."
          style={{ background: GBC_BG, border: `2px solid ${GBC_DARKEST}`, color: GBC_TEXT, fontFamily: 'monospace', fontSize: 13, padding: 8, resize: 'none', outline: 'none', width: '100%', boxSizing: 'border-box', lineHeight: 1.6 }}
        />

        <button
          onClick={startTimer}
          disabled={!query.trim()}
          style={{ fontFamily: FONT, fontSize: 10, padding: '12px 0', width: '100%', cursor: query.trim() ? 'pointer' : 'not-allowed', border: `3px solid ${query.trim() ? GBC_GREEN : GBC_DARKEST}`, background: query.trim() ? GBC_GREEN : 'transparent', color: query.trim() ? GBC_BG : GBC_MUTED, boxShadow: query.trim() ? 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010' : 'none' }}
        >
          {justStarted ? '+ STARTED!' : '► START TIMER'}
        </button>
      </div>

      {/* Timeline reference */}
      <div style={{ border: `2px solid ${GBC_DARKEST}`, background: GBC_BOX, padding: 12 }}>
        <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_MUTED, display: 'block', marginBottom: 8 }}>TYPICAL TIMELINES</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* VAPE/SMOKE row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, minWidth: 52, flexShrink: 0 }}>VAPE/SMOKE</span>
            <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_AMBER, border: `1px solid ${GBC_AMBER}`, padding: '2px 5px' }}>ONSET 0-10m</span>
            <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_GREEN, border: `1px solid ${GBC_GREEN}`, padding: '2px 5px' }}>PEAK 10-45m</span>
            <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, border: `1px solid ${GBC_MUTED}`, padding: '2px 5px' }}>DOWN 45-2h</span>
          </div>
          {/* EDIBLE row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, minWidth: 52, flexShrink: 0 }}>EDIBLE</span>
            <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_AMBER, border: `1px solid ${GBC_AMBER}`, padding: '2px 5px' }}>ONSET 0-90m</span>
            <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_GREEN, border: `1px solid ${GBC_GREEN}`, padding: '2px 5px' }}>PEAK 90m-4h</span>
            <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, border: `1px solid ${GBC_MUTED}`, padding: '2px 5px' }}>DOWN 4h-8h</span>
          </div>
        </div>
      </div>

      {/* Active timers */}
      {timers.length === 0 ? (
        <div style={{ border: `2px solid ${GBC_DARKEST}`, background: GBC_BOX, padding: 24, textAlign: 'center' }}>
          <span style={{ fontFamily: FONT, fontSize: 9, color: GBC_DARKEST }}>NO ACTIVE TIMERS</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {timers.map((t) => {
            const elapsedMs  = now - new Date(t.startedAt).getTime()
            const elapsedMin = Math.floor(elapsedMs / 60000)
            const phase      = getPhase(t.method, elapsedMin)
            const tCol       = typeColor(t.strainType)
            const methodOpt  = METHOD_OPTS.find((m) => m.value === t.method)
            return (
              <div key={t.id} style={{ border: `2px solid ${phase.color}`, background: GBC_BOX, padding: 12 }}>
                {/* Top row: strain name + time + delete */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: FONT, fontSize: 10, color: tCol, lineHeight: 1.5, wordBreak: 'break-word' }}>
                      {t.strainName.toUpperCase()}
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: GBC_MUTED, marginTop: 2 }}>
                      {formatTime(t.startedAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTimer(t.id)}
                    style={{ background: 'transparent', border: 'none', color: GBC_MUTED, fontFamily: FONT, fontSize: 9, cursor: 'pointer', padding: '4px 6px', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >[x]</button>
                </div>

                {/* Phase badge + elapsed + method + type */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: t.notes ? 8 : 0 }}>
                  <span style={{ fontFamily: FONT, fontSize: 9, color: phase.color, border: `2px solid ${phase.color}`, padding: '4px 7px' }}>
                    {phase.label}
                  </span>
                  <span style={{ fontFamily: FONT, fontSize: 9, color: phase.color, padding: '4px 0' }}>
                    {formatElapsed(elapsedMs)}
                  </span>
                  {methodOpt && (
                    <span style={{ fontFamily: FONT, fontSize: 7, color: methodOpt.color, border: `1px solid ${methodOpt.color}`, padding: '2px 5px' }}>
                      {methodOpt.label}
                    </span>
                  )}
                  {t.strainType && (
                    <span style={{ fontFamily: FONT, fontSize: 7, color: tCol, border: `1px solid ${tCol}`, padding: '2px 5px' }}>
                      {t.strainType.toUpperCase()}
                    </span>
                  )}
                </div>

                {t.notes && (
                  <p style={{ fontFamily: 'monospace', fontSize: 13, color: GBC_TEXT, lineHeight: 1.6, margin: 0, opacity: 0.8 }}>
                    {t.notes}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
