import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import { useStrainDb, displayName } from '../hooks/useStrainDb'
import { lookupStrainData } from '../services/gemini'
import BitBudCanvas from '../components/BitBudCanvas'

const FONT     = "'PokemonGb', 'Press Start 2P', monospace"
const GBC_BG   = '#050a04'
const GBC_TEXT = '#c8e890'
const GBC_MUTED = '#4a7a10'
const GBC_DARKEST = '#2a4a08'
const GBC_GREEN = '#84cc16'
const GBC_AMBER = '#f59e0b'
const GBC_VIOLET = '#a78bfa'
const RED      = '#e84040'
const RED_DIM  = '#3a0808'
const RED_BG   = '#0a0606'

interface WantedEntry {
  id: string
  name: string
  type?: 'sativa' | 'indica' | 'hybrid'
  thc?: number
  terpenes?: string
  effects?: string
  notes?: string
  addedAt: string
  acquired: boolean
  budArt?: string  // 'pixel:0'–'pixel:5' for built-in, 'custom:data:...' for uploaded
}

// ── Bud art images ────────────────────────────────────────────────────────────

const BUD_COUNT = 13

function budImageUrl(n: number): string {
  return n === 1 ? '/Smokemon/Bud1.png' : `/Smokemon/bud${n}.png`
}

function randomBudArt(): string {
  return `pixel:${Math.floor(Math.random() * BUD_COUNT) + 1}`
}

function PixelBud({ artId, size = 32 }: { artId: string; size?: number }) {
  if (artId.startsWith('custom:')) {
    return (
      <img
        src={artId.slice(7)}
        alt="bud"
        style={{ width: size, height: size, objectFit: 'contain', display: 'block', flexShrink: 0 }}
      />
    )
  }
  const raw = parseInt(artId.replace('pixel:', ''), 10) || 1
  // clamp to 1–13, handle legacy 0-based indices from old bitmask system
  const n = raw < 1 ? (raw % BUD_COUNT) + 1 : ((raw - 1) % BUD_COUNT) + 1
  return (
    <img
      src={budImageUrl(n)}
      alt="bud"
      style={{ width: size, height: size, objectFit: 'contain', display: 'block', flexShrink: 0 }}
    />
  )
}

const STORAGE_KEY = 'utilhub_wanted'

function loadWanted(): WantedEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    // Migrate legacy string[] format
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
      return (parsed as string[]).map((name) => ({
        id: Math.random().toString(36).slice(2),
        name,
        addedAt: new Date().toISOString(),
        acquired: false,
      }))
    }
    return parsed as WantedEntry[]
  } catch { return [] }
}

function saveWanted(list: WantedEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function typeColor(type?: string) {
  if (type === 'sativa') return GBC_GREEN
  if (type === 'indica') return GBC_VIOLET
  if (type === 'hybrid') return GBC_AMBER
  return GBC_MUTED
}

export default function WantedList() {
  const { db } = useStrainDb()
  const [wanted, setWanted] = useState<WantedEntry[]>(loadWanted)

  // Search state
  const [query, setQuery]             = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError]   = useState('')

  // Pending entry being built before adding
  const [pending, setPending] = useState<Partial<WantedEntry> | null>(null)
  const [pendingNotes, setPendingNotes] = useState('')
  const [pendingBudArt, setPendingBudArt] = useState<string>(randomBudArt)
  const [showPhotoEditor, setShowPhotoEditor] = useState(false)

  const fuse = useMemo(() => new Fuse(db, {
    keys: [{ name: 'Strain', weight: 3 }, { name: 'Effects', weight: 1 }],
    threshold: 0.35,
    distance: 150,
    includeScore: true,
  }), [db])

  const dbResults = useMemo(() => {
    if (query.trim().length < 2) return []
    return fuse.search(query.trim()).slice(0, 6).map((r) => r.item)
  }, [fuse, query])

  const selectFromDb = (s: typeof db[0]) => {
    setPending({
      name:    displayName(s),
      type:    s.Type,
      thc:     s.thc,
      terpenes: s.terpenes,
      effects: s.Effects,
    })
    setQuery(displayName(s))
    setDropdownOpen(false)
  }

  const handleLookup = async () => {
    if (!query.trim()) return
    setLookupLoading(true)
    setLookupError('')
    try {
      const data = await lookupStrainData(query.trim())
      setPending({
        name:    query.trim(),
        type:    data.type,
        thc:     data.thc,
        terpenes: data.terpenes,
        effects: data.effects,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      setLookupError(msg === 'NO_KEY' ? 'SET API KEY IN SMOKÉ CENTER' : 'LOOKUP FAILED')
    } finally {
      setLookupLoading(false)
    }
  }

  const addToWanted = () => {
    const name = (pending?.name ?? query).trim()
    if (!name) return
    const entry: WantedEntry = {
      id:       Math.random().toString(36).slice(2),
      name,
      type:     pending?.type,
      thc:      pending?.thc,
      terpenes: pending?.terpenes,
      effects:  pending?.effects,
      notes:    pendingNotes.trim() || undefined,
      addedAt:  new Date().toISOString(),
      acquired: false,
      budArt:   pendingBudArt,
    }
    const next = [entry, ...wanted]
    setWanted(next)
    saveWanted(next)
    setQuery('')
    setPending(null)
    setPendingNotes('')
    setPendingBudArt(randomBudArt())
  }

  const markAcquired = (id: string) => {
    const next = wanted.map((w) => w.id === id ? { ...w, acquired: !w.acquired } : w)
    setWanted(next)
    saveWanted(next)
  }

  const remove = (id: string) => {
    const next = wanted.filter((w) => w.id !== id)
    setWanted(next)
    saveWanted(next)
  }

  const hunting  = wanted.filter((w) => !w.acquired)
  const acquired = wanted.filter((w) => w.acquired)

  return (
    <div style={{ minHeight: '100%', background: GBC_BG, padding: 10, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12 }}>

      <style>{`@keyframes wanted-flash { 0%,49%{border-color:#e84040}50%,100%{border-color:#3a0808} }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${RED_DIM}`, paddingBottom: 8 }}>
        <span style={{ fontFamily: FONT, fontSize: 13, color: RED }}>WANTED</span>
        <span style={{ fontFamily: FONT, fontSize: 7, color: RED, border: `1px solid ${RED_DIM}`, padding: '2px 5px' }}>
          {hunting.length} ACTIVE
        </span>
      </div>

      {/* Intro */}
      <div style={{ border: `3px solid ${RED_DIM}`, background: RED_BG, padding: 12 }}>
        <p style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT, lineHeight: 1.7, margin: 0 }}>
          Strains you are hunting. Search the Dex or use AI lookup to add a bounty. Mark as ACQUIRED when you get your hands on them.
        </p>
      </div>

      {/* Add section */}
      <div style={{ border: `3px solid ${RED}`, background: RED_BG, boxShadow: `inset 0 0 0 2px #0e0404, inset 0 0 0 4px ${RED_DIM}`, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontFamily: FONT, fontSize: 9, color: RED }}>ADD BOUNTY</span>

        {/* Search input + dropdown */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPending(null); setDropdownOpen(true) }}
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
              placeholder="OG Kush, Gelato..."
              style={{ flex: 1, background: GBC_BG, border: `2px solid ${RED_DIM}`, color: GBC_TEXT, fontFamily: 'monospace', fontSize: 13, padding: 8, outline: 'none', boxSizing: 'border-box' }}
            />
            <button
              onClick={handleLookup}
              disabled={lookupLoading || query.trim().length < 2}
              style={{ fontFamily: FONT, fontSize: 8, padding: '8px 10px', minHeight: 44, flexShrink: 0, border: `2px solid ${query.trim().length >= 2 ? RED : RED_DIM}`, background: 'transparent', color: query.trim().length >= 2 ? RED : '#4a2020', cursor: 'pointer' }}
            >
              {lookupLoading ? <span className="gbc-dots" /> : 'AI'}
            </button>
          </div>

          {/* Dropdown */}
          {dropdownOpen && dbResults.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#0a0606', border: `2px solid ${RED_DIM}`, boxSizing: 'border-box' }}>
              {dbResults.map((s) => {
                const col = typeColor(s.Type)
                return (
                  <div
                    key={s.Strain}
                    onPointerDown={() => selectFromDb(s)}
                    style={{ padding: '8px 10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT }}>{displayName(s)}</div>
                      {s.Effects && (
                        <div style={{ fontFamily: 'monospace', fontSize: 10, color: GBC_MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.Effects.split(',').slice(0, 3).map((e) => e.trim()).join(', ')}
                        </div>
                      )}
                    </div>
                    <span style={{ fontFamily: 'monospace', fontSize: 10, color: col, border: `1px solid ${col}`, padding: '1px 4px', flexShrink: 0 }}>{s.Type}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {lookupError && <span style={{ fontFamily: FONT, fontSize: 8, color: RED }}>{lookupError}</span>}

        {/* Preview of pending entry */}
        {pending && (
          <div style={{ border: `1px solid ${RED_DIM}`, background: '#060404', padding: '8px 10px', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <span style={{ fontFamily: FONT, fontSize: 9, color: RED, flex: '1 1 100%' }}>{pending.name}</span>
            {pending.type && <span style={{ fontFamily: FONT, fontSize: 7, color: typeColor(pending.type), border: `1px solid ${typeColor(pending.type)}`, padding: '2px 5px' }}>{pending.type.toUpperCase()}</span>}
            {pending.thc != null && <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED }}>THC {pending.thc}%</span>}
            {pending.terpenes && <span style={{ fontFamily: 'monospace', fontSize: 11, color: GBC_MUTED }}>{pending.terpenes}</span>}
          </div>
        )}

        {/* Bud art picker */}
        <div>
          <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, display: 'block', marginBottom: 6 }}>BUD ART</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {Array.from({ length: BUD_COUNT }, (_, i) => {
              const id = `pixel:${i + 1}`
              const active = pendingBudArt === id
              return (
                <button
                  key={id}
                  onPointerDown={() => setPendingBudArt(id)}
                  style={{ background: 'transparent', border: `2px solid ${active ? RED : RED_DIM}`, padding: 4, cursor: 'pointer', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <PixelBud artId={id} size={28} />
                </button>
              )
            })}
            <button
              onPointerDown={() => setPendingBudArt(randomBudArt())}
              style={{ fontFamily: FONT, fontSize: 7, background: 'transparent', border: `2px solid ${RED_DIM}`, color: GBC_MUTED, padding: '8px 10px', cursor: 'pointer', minHeight: 44 }}
            >
              ?RNG
            </button>
            <button
              onPointerDown={() => setShowPhotoEditor((v) => !v)}
              style={{ fontFamily: FONT, fontSize: 7, background: 'transparent', border: `2px solid ${showPhotoEditor || pendingBudArt.startsWith('custom:') ? RED : RED_DIM}`, color: showPhotoEditor || pendingBudArt.startsWith('custom:') ? RED : GBC_MUTED, padding: '8px 10px', cursor: 'pointer', minHeight: 44 }}
            >
              {pendingBudArt.startsWith('custom:') ? 'PHOTO [✓]' : 'PHOTO'}
            </button>
          </div>
        </div>

        {/* Photo editor — expands when PHOTO button toggled */}
        {showPhotoEditor && (
          <div style={{ border: `2px solid ${RED_DIM}`, background: '#060202', padding: 12 }}>
            <BitBudCanvas
              onCapture={(url) => {
                setPendingBudArt(`custom:${url}`)
                setShowPhotoEditor(false)
              }}
            />
          </div>
        )}

        {/* Notes */}
        <textarea
          rows={2}
          value={pendingNotes}
          onChange={(e) => setPendingNotes(e.target.value)}
          placeholder="Notes (optional)..."
          style={{ background: GBC_BG, border: `2px solid ${RED_DIM}`, color: GBC_TEXT, fontFamily: 'monospace', fontSize: 13, padding: 8, resize: 'none', outline: 'none', width: '100%', boxSizing: 'border-box' }}
        />

        <button
          onClick={addToWanted}
          disabled={!query.trim()}
          style={{ fontFamily: FONT, fontSize: 10, padding: '12px 0', width: '100%', cursor: query.trim() ? 'pointer' : 'not-allowed', border: `3px solid ${query.trim() ? RED : RED_DIM}`, background: query.trim() ? 'rgba(232,64,64,0.1)' : 'transparent', color: query.trim() ? RED : '#4a2020' }}
        >
          ► POST BOUNTY
        </button>
      </div>

      {/* Hunting list */}
      {hunting.length === 0 ? (
        <div style={{ border: `2px solid ${RED_DIM}`, background: RED_BG, padding: 20, textAlign: 'center' }}>
          <span style={{ fontFamily: FONT, fontSize: 9, color: '#4a2020' }}>NO ACTIVE WARRANTS</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {hunting.map((w) => (
            <WantedCard key={w.id} entry={w} onAcquire={markAcquired} onRemove={remove} />
          ))}
        </div>
      )}

      {/* Acquired */}
      {acquired.length > 0 && (
        <>
          <div style={{ borderTop: `2px solid ${GBC_DARKEST}`, paddingTop: 8 }}>
            <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_GREEN }}>ACQUIRED ({acquired.length})</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {acquired.map((w) => (
              <WantedCard key={w.id} entry={w} onAcquire={markAcquired} onRemove={remove} />
            ))}
          </div>
        </>
      )}

    </div>
  )
}

function WantedCard({ entry: w, onAcquire, onRemove }: { entry: WantedEntry; onAcquire: (id: string) => void; onRemove: (id: string) => void }) {
  const col = typeColor(w.type)
  const date = new Date(w.addedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })
  const borderCol = w.acquired ? GBC_DARKEST : RED

  return (
    <div style={{
      border: `4px solid ${borderCol}`,
      boxShadow: w.acquired ? 'none' : `inset 0 0 0 2px #0e0404, inset 0 0 0 4px ${RED_DIM}`,
      background: w.acquired ? GBC_BG : RED_BG,
      opacity: w.acquired ? 0.55 : 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '10px 10px 12px',
      gap: 0,
    }}>
      {/* Poster header */}
      <div style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: `2px solid ${borderCol}`, paddingBottom: 6, marginBottom: 10,
      }}>
        <span style={{ fontFamily: FONT, fontSize: 14, color: w.acquired ? GBC_MUTED : RED, letterSpacing: 2 }}>
          {w.acquired ? 'CAPTURED' : 'WANTED'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: GBC_MUTED }}>{date}</span>
          <button
            onClick={() => onRemove(w.id)}
            style={{ background: 'transparent', border: 'none', color: GBC_MUTED, fontFamily: FONT, fontSize: 9, cursor: 'pointer', padding: '4px 6px', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >[x]</button>
        </div>
      </div>

      {/* Big bud image */}
      {w.budArt && (
        <div style={{
          border: `3px solid ${borderCol}`,
          background: '#060202',
          padding: 8,
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80%',
        }}>
          <PixelBud artId={w.budArt} size={160} />
        </div>
      )}

      {/* Name */}
      <div style={{
        fontFamily: FONT, fontSize: 15, color: w.acquired ? GBC_MUTED : RED,
        textAlign: 'center', lineHeight: 1.6, wordBreak: 'break-word',
        letterSpacing: 1, marginBottom: 10, width: '100%',
      }}>
        {w.name.toUpperCase()}
      </div>

      {/* Badges row */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 8 }}>
        {w.type && <span style={{ fontFamily: FONT, fontSize: 8, color: col, border: `2px solid ${col}`, padding: '3px 7px' }}>{w.type.toUpperCase()}</span>}
        {w.thc != null && <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_AMBER, border: `1px solid #6a4a08`, padding: '3px 7px' }}>THC {w.thc}%</span>}
      </div>

      {/* Effects */}
      {w.effects && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 8 }}>
          {w.effects.split(',').slice(0, 4).map((e) => (
            <span key={e} style={{ fontFamily: FONT, fontSize: 7, color: '#7a3030', border: '1px solid #3a0808', padding: '2px 5px' }}>
              {e.trim().toUpperCase()}
            </span>
          ))}
        </div>
      )}

      {/* Terpenes */}
      {w.terpenes && (
        <div style={{ fontFamily: 'monospace', fontSize: 11, color: GBC_MUTED, textAlign: 'center', marginBottom: 8 }}>
          {w.terpenes}
        </div>
      )}

      {/* Notes */}
      {w.notes && (
        <div style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT, opacity: 0.7, textAlign: 'center', marginBottom: 10, borderTop: `1px solid ${RED_DIM}`, paddingTop: 8, width: '100%' }}>
          {w.notes}
        </div>
      )}

      {/* Acquire button */}
      <button
        onClick={() => onAcquire(w.id)}
        style={{
          fontFamily: FONT, fontSize: 9, padding: '12px 0', width: '100%', cursor: 'pointer',
          border: `3px solid ${w.acquired ? GBC_DARKEST : GBC_GREEN}`,
          background: w.acquired ? 'transparent' : 'rgba(132,204,22,0.08)',
          color: w.acquired ? GBC_MUTED : GBC_GREEN,
          marginTop: 4,
        }}
      >
        {w.acquired ? '► MARK STILL HUNTING' : '► ACQUIRED'}
      </button>
    </div>
  )
}
