import { useState, useMemo } from 'react'
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

interface SessionEntry {
  id: string
  strainName: string
  strainType?: string
  date: string   // ISO
  notes: string
  rating?: 'good' | 'ok' | 'bad'
}

const STORAGE_KEY = 'utilhub_sessions'

function loadSessions(): SessionEntry[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}
function saveSessions(list: SessionEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function typeColor(type?: string) {
  if (type === 'sativa') return GBC_GREEN
  if (type === 'indica') return GBC_VIOLET
  if (type === 'hybrid') return GBC_AMBER
  return GBC_MUTED
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) +
    '  ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

const RATING_OPTS: { value: SessionEntry['rating']; label: string; color: string }[] = [
  { value: 'good', label: 'GOOD',    color: GBC_GREEN  },
  { value: 'ok',   label: 'OK',      color: GBC_AMBER  },
  { value: 'bad',  label: 'BAD',     color: '#e84040'  },
]

export default function SessionHistory() {
  const { strains } = useStash()
  const { db } = useStrainDb()
  const [sessions, setSessions] = useState<SessionEntry[]>(loadSessions)

  // Form state
  const [query, setQuery]             = useState('')
  const [selectedType, setSelectedType] = useState<string | undefined>()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notes, setNotes]             = useState('')
  const [rating, setRating]           = useState<SessionEntry['rating']>('good')
  const [justSaved, setJustSaved]     = useState(false)

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

  const logSession = () => {
    if (!query.trim()) return
    const entry: SessionEntry = {
      id:         Math.random().toString(36).slice(2),
      strainName: query.trim(),
      strainType: selectedType,
      date:       new Date().toISOString(),
      notes:      notes.trim(),
      rating,
    }
    const next = [entry, ...sessions]
    setSessions(next)
    saveSessions(next)
    setQuery('')
    setSelectedType(undefined)
    setNotes('')
    setRating('good')
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1500)
  }

  const deleteSession = (id: string) => {
    const next = sessions.filter((s) => s.id !== id)
    setSessions(next)
    saveSessions(next)
  }

  return (
    <div style={{ minHeight: '100%', background: GBC_BG, padding: 10, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${GBC_DARKEST}`, paddingBottom: 8 }}>
        <span style={{ fontFamily: FONT, fontSize: 11, color: GBC_GREEN }}>SESSION LOG</span>
        <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, border: `1px solid ${GBC_DARKEST}`, padding: '2px 5px' }}>
          {sessions.length} ENTRIES
        </span>
      </div>

      {/* Log form */}
      <div style={{ border: `3px solid ${GBC_GREEN}`, boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010', background: GBC_BOX, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontFamily: FONT, fontSize: 9, color: GBC_GREEN }}>LOG SESSION</span>

        {/* Strain search */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedType(undefined); setDropdownOpen(true) }}
            onFocus={() => setDropdownOpen(true)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
            placeholder="What did you vape?"
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
                      {item.type && <span style={{ fontFamily: 'monospace', fontSize: 10, color: col, border: `1px solid ${col}`, padding: '1px 4px' }}>{item.type}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Rating */}
        <div>
          <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, display: 'block', marginBottom: 6 }}>RATING</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {RATING_OPTS.map((r) => (
              <button
                key={r.value}
                onClick={() => setRating(r.value)}
                style={{ flex: 1, fontFamily: FONT, fontSize: 9, padding: '8px 0', minHeight: 44, cursor: 'pointer', border: `2px solid ${rating === r.value ? r.color : GBC_DARKEST}`, background: rating === r.value ? `${r.color}18` : 'transparent', color: rating === r.value ? r.color : GBC_MUTED }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How was it? Effects, taste, mood..."
          style={{ background: GBC_BG, border: `2px solid ${GBC_DARKEST}`, color: GBC_TEXT, fontFamily: 'monospace', fontSize: 13, padding: 8, resize: 'none', outline: 'none', width: '100%', boxSizing: 'border-box', lineHeight: 1.6 }}
        />

        <button
          onClick={logSession}
          disabled={!query.trim()}
          style={{ fontFamily: FONT, fontSize: 10, padding: '12px 0', width: '100%', cursor: query.trim() ? 'pointer' : 'not-allowed', border: `3px solid ${query.trim() ? GBC_GREEN : GBC_DARKEST}`, background: query.trim() ? GBC_GREEN : 'transparent', color: query.trim() ? GBC_BG : GBC_MUTED, boxShadow: query.trim() ? 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010' : 'none' }}
        >
          {justSaved ? '✓ SAVED!' : '► LOG SESSION'}
        </button>
      </div>

      {/* History */}
      {sessions.length === 0 ? (
        <div style={{ border: `2px solid ${GBC_DARKEST}`, background: GBC_BOX, padding: 24, textAlign: 'center' }}>
          <span style={{ fontFamily: FONT, fontSize: 9, color: GBC_DARKEST }}>NO SESSIONS LOGGED</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sessions.map((s) => {
            const col = typeColor(s.strainType)
            const ratingOpt = RATING_OPTS.find((r) => r.value === s.rating)
            return (
              <div key={s.id} style={{ border: `2px solid ${GBC_DARKEST}`, background: GBC_BOX, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: FONT, fontSize: 11, color: col, lineHeight: 1.5, wordBreak: 'break-word' }}>
                      {s.strainName.toUpperCase()}
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: GBC_MUTED, marginTop: 2 }}>
                      {formatDate(s.date)}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteSession(s.id)}
                    style={{ background: 'transparent', border: 'none', color: GBC_MUTED, fontFamily: FONT, fontSize: 9, cursor: 'pointer', padding: '4px 6px', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >[x]</button>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: s.notes ? 8 : 0 }}>
                  {s.strainType && <span style={{ fontFamily: FONT, fontSize: 7, color: col, border: `1px solid ${col}`, padding: '2px 5px' }}>{s.strainType.toUpperCase()}</span>}
                  {ratingOpt && <span style={{ fontFamily: FONT, fontSize: 7, color: ratingOpt.color, border: `1px solid ${ratingOpt.color}`, padding: '2px 5px' }}>{ratingOpt.label}</span>}
                </div>
                {s.notes && (
                  <p style={{ fontFamily: 'monospace', fontSize: 13, color: GBC_TEXT, lineHeight: 1.6, margin: 0, opacity: 0.8 }}>
                    {s.notes}
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
