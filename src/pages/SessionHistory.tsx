import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import { useStash } from '../context/StashContext'
import { useStrainDb, displayName } from '../hooks/useStrainDb'
import {
  schedulePendingCheckIn,
  requestNotificationPermission,
} from '../hooks/useNotificationScheduler'

const FONT        = "'PokemonGb', 'Press Start 2P', monospace"
const GBC_BG      = '#050a04'
const GBC_TEXT    = '#c8e890'
const GBC_MUTED   = '#4a7a10'
const GBC_DARKEST = '#2a4a08'
const GBC_GREEN   = '#84cc16'
const GBC_BOX     = '#0a1408'
const GBC_AMBER   = '#f59e0b'
const GBC_VIOLET  = '#a78bfa'
const GBC_RED     = '#e84040'

interface SessionEntry {
  id:            string
  strainName:    string
  strainType?:   string
  date:          string   // ISO
  notes:         string
  rating?:       'good' | 'ok' | 'bad'  // legacy — kept for backward compat
  symptoms?:     string[]
  preSeverity?:  number
  postSeverity?: number
  postNotes?:    string
  temp?:         number   // vape temperature in °C
}

const VAPE_TEMPS = [160, 170, 180, 190, 200, 210, 220]

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

function severityColor(n: number): string {
  if (n <= 3) return GBC_GREEN
  if (n <= 6) return GBC_AMBER
  return GBC_RED
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) +
    '  ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

// Legacy badge for old sessions that have a rating but no severity
const RATING_OPTS: { value: SessionEntry['rating']; label: string; color: string }[] = [
  { value: 'good', label: 'GOOD', color: GBC_GREEN },
  { value: 'ok',   label: 'OK',   color: GBC_AMBER },
  { value: 'bad',  label: 'BAD',  color: GBC_RED   },
]

const SYMPTOM_OPTS = [
  { id: 'pain',       label: 'PAIN' },
  { id: 'anxiety',    label: 'ANXIETY' },
  { id: 'nausea',     label: 'NAUSEA' },
  { id: 'tics',       label: 'TICS' },
  { id: 'depression', label: 'DEPRESSION' },
  { id: 'fatigue',    label: 'FATIGUE' },
  { id: 'insomnia',   label: 'INSOMNIA' },
  { id: 'mood',       label: 'LOW MOOD' },
  { id: 'stress',     label: 'STRESS' },
  { id: 'focus',      label: 'POOR FOCUS' },
]

function SeverityPicker({
  value,
  onChange,
}: {
  value: number | undefined
  onChange: (v: number) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: 10 }, (_, i) => {
        const n = i + 1
        const col = severityColor(n)
        const active = value === n
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            style={{
              flex: 1,
              fontFamily: FONT,
              fontSize: 8,
              padding: '9px 0',
              minHeight: 44,
              border: `2px solid ${active ? col : GBC_DARKEST}`,
              background: active ? `${col}22` : 'transparent',
              color: active ? col : GBC_MUTED,
              cursor: 'pointer',
            }}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}

export default function SessionHistory() {
  const { strains } = useStash()
  const { db }      = useStrainDb()
  const [sessions, setSessions] = useState<SessionEntry[]>(loadSessions)

  // Form state
  const [query,        setQuery]        = useState('')
  const [selectedType, setSelectedType] = useState<string | undefined>()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notes,        setNotes]        = useState('')
  const [symptoms,     setSymptoms]     = useState<string[]>([])
  const [preSeverity,  setPreSeverity]  = useState<number | undefined>()
  const [temp,         setTemp]         = useState<number | undefined>()
  const [justSaved,    setJustSaved]    = useState(false)
  const [confirmId,    setConfirmId]    = useState<string | null>(null)
  const [notifStatus,  setNotifStatus]  = useState<'idle' | 'requesting' | 'denied'>('idle')

  // Build combined search list: stash first, then full DB
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

  const toggleSymptom = (id: string) => {
    setSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  const selectStrain = (item: { name: string; type?: string }) => {
    setQuery(item.name)
    setSelectedType(item.type)
    setDropdownOpen(false)
  }

  const logSession = async () => {
    if (!query.trim()) return
    const entry: SessionEntry = {
      id:          Math.random().toString(36).slice(2),
      strainName:  query.trim(),
      strainType:  selectedType,
      date:        new Date().toISOString(),
      notes:       notes.trim(),
      symptoms:    symptoms.length > 0 ? [...symptoms] : undefined,
      preSeverity: preSeverity,
      temp,
    }
    const next = [entry, ...sessions]
    setSessions(next)
    saveSessions(next)

    // Schedule 45-min check-in if user tracked symptoms/severity
    if (symptoms.length > 0 || preSeverity !== undefined) {
      if (Notification.permission === 'granted') {
        schedulePendingCheckIn(entry.id, entry.strainName)
      } else if (Notification.permission !== 'denied') {
        setNotifStatus('requesting')
        const granted = await requestNotificationPermission()
        setNotifStatus(granted ? 'idle' : 'denied')
        if (granted) schedulePendingCheckIn(entry.id, entry.strainName)
      } else {
        setNotifStatus('denied')
      }
    }

    // Reset form
    setQuery('')
    setSelectedType(undefined)
    setNotes('')
    setSymptoms([])
    setPreSeverity(undefined)
    setTemp(undefined)
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

        {/* Symptom tags */}
        <div>
          <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, display: 'block', marginBottom: 6 }}>
            SYMPTOMS YOU ARE TRACKING
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {SYMPTOM_OPTS.map((s) => {
              const active = symptoms.includes(s.id)
              return (
                <button
                  key={s.id}
                  onClick={() => toggleSymptom(s.id)}
                  style={{
                    fontFamily: FONT, fontSize: 7, padding: '6px 8px', minHeight: 36,
                    cursor: 'pointer',
                    border: `2px solid ${active ? GBC_AMBER : GBC_DARKEST}`,
                    background: active ? `${GBC_AMBER}18` : 'transparent',
                    color: active ? GBC_AMBER : GBC_MUTED,
                  }}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Pre-session severity */}
        <div>
          <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, display: 'block', marginBottom: 6 }}>
            SYMPTOM SEVERITY RIGHT NOW (1 = NONE · 10 = SEVERE)
          </span>
          <SeverityPicker value={preSeverity} onChange={setPreSeverity} />
          {preSeverity !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
              <span style={{ fontFamily: FONT, fontSize: 8, color: severityColor(preSeverity) }}>
                {preSeverity}/10
              </span>
            </div>
          )}
        </div>

        {/* 45-min check-in notice */}
        {(symptoms.length > 0 || preSeverity !== undefined) && (
          <div style={{ background: `${GBC_VIOLET}12`, border: `1px solid ${GBC_VIOLET}`, padding: '6px 10px' }}>
            <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_VIOLET, lineHeight: 1.8 }}>
              45-MIN CHECK-IN WILL BE SCHEDULED
            </span>
            {notifStatus === 'denied' && (
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: GBC_RED, display: 'block', marginTop: 4 }}>
                Notifications blocked — enable in browser settings to receive the reminder.
              </span>
            )}
          </div>
        )}

        {/* Vape temp */}
        <div>
          <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, display: 'block', marginBottom: 6 }}>
            VAPE TEMP (OPTIONAL)
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {VAPE_TEMPS.map((t) => {
              const active = temp === t
              return (
                <button
                  key={t}
                  onClick={() => setTemp(active ? undefined : t)}
                  style={{
                    flex: 1, fontFamily: FONT, fontSize: 7, padding: '7px 0', minHeight: 36,
                    cursor: 'pointer',
                    border: `2px solid ${active ? GBC_AMBER : GBC_DARKEST}`,
                    background: active ? `${GBC_AMBER}18` : 'transparent',
                    color: active ? GBC_AMBER : GBC_MUTED,
                  }}
                >
                  {t}
                </button>
              )
            })}
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
            const col        = typeColor(s.strainType)
            const ratingOpt  = RATING_OPTS.find((r) => r.value === s.rating)
            const hasEfficacy = s.preSeverity !== undefined
            const hasBoth     = hasEfficacy && s.postSeverity !== undefined
            const diff        = hasBoth ? s.preSeverity! - s.postSeverity! : null

            return (
              <div key={s.id} style={{ border: `2px solid ${GBC_DARKEST}`, background: GBC_BOX, padding: 12 }}>

                {/* Strain name + date + delete */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: FONT, fontSize: 11, color: col, lineHeight: 1.5, wordBreak: 'break-word' }}>
                      {s.strainName.toUpperCase()}
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: GBC_MUTED, marginTop: 2 }}>
                      {formatDate(s.date)}
                    </div>
                  </div>
                  {confirmId === s.id ? (
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_RED }}>DELETE?</span>
                      <button
                        onClick={() => { deleteSession(s.id); setConfirmId(null) }}
                        style={{ background: 'transparent', border: `1px solid ${GBC_RED}`, color: GBC_RED, fontFamily: FONT, fontSize: 8, cursor: 'pointer', minWidth: 44, minHeight: 44, padding: '0 6px' }}
                      >YES</button>
                      <button
                        onClick={() => setConfirmId(null)}
                        style={{ background: 'transparent', border: `1px solid ${GBC_DARKEST}`, color: GBC_MUTED, fontFamily: FONT, fontSize: 8, cursor: 'pointer', minWidth: 44, minHeight: 44, padding: '0 6px' }}
                      >NO</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(s.id)}
                      style={{ background: 'transparent', border: 'none', color: GBC_MUTED, fontFamily: FONT, fontSize: 9, cursor: 'pointer', padding: '4px 6px', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >[x]</button>
                  )}
                </div>

                {/* Badges row: type + legacy rating or symptom tags */}
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 6 }}>
                  {s.strainType && (
                    <span style={{ fontFamily: FONT, fontSize: 7, color: col, border: `1px solid ${col}`, padding: '2px 5px' }}>
                      {s.strainType.toUpperCase()}
                    </span>
                  )}
                  {/* Legacy rating badge */}
                  {ratingOpt && !hasEfficacy && (
                    <span style={{ fontFamily: FONT, fontSize: 7, color: ratingOpt.color, border: `1px solid ${ratingOpt.color}`, padding: '2px 5px' }}>
                      {ratingOpt.label}
                    </span>
                  )}
                  {/* New: symptom tags */}
                  {(s.symptoms ?? []).map((id) => {
                    const opt = SYMPTOM_OPTS.find((o) => o.id === id)
                    return opt ? (
                      <span key={id} style={{ fontFamily: FONT, fontSize: 7, color: GBC_AMBER, border: `1px solid ${GBC_AMBER}`, padding: '2px 5px' }}>
                        {opt.label}
                      </span>
                    ) : null
                  })}
                </div>

                {/* Efficacy: pre → post severity */}
                {hasEfficacy && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED }}>SEVERITY</span>
                    <span style={{ fontFamily: FONT, fontSize: 10, color: severityColor(s.preSeverity!) }}>
                      {s.preSeverity}
                    </span>
                    {s.postSeverity !== undefined && (
                      <>
                        <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_DARKEST }}>→</span>
                        <span style={{ fontFamily: FONT, fontSize: 10, color: severityColor(s.postSeverity) }}>
                          {s.postSeverity}
                        </span>
                        {diff !== null && (
                          <span style={{ fontFamily: FONT, fontSize: 8, color: diff > 0 ? GBC_GREEN : diff < 0 ? GBC_RED : GBC_MUTED, marginLeft: 2 }}>
                            ({diff > 0 ? `-${diff}` : `+${Math.abs(diff)}`})
                          </span>
                        )}
                      </>
                    )}
                    {s.postSeverity === undefined && (
                      <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_VIOLET }}>PENDING CHECK-IN</span>
                    )}
                  </div>
                )}

                {/* Notes */}
                {s.notes && (
                  <p style={{ fontFamily: 'monospace', fontSize: 13, color: GBC_TEXT, lineHeight: 1.6, margin: 0, opacity: 0.8 }}>
                    {s.notes}
                  </p>
                )}
                {/* Post-session notes */}
                {s.postNotes && (
                  <p style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_VIOLET, lineHeight: 1.6, margin: '6px 0 0', opacity: 0.85 }}>
                    45-min: {s.postNotes}
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
