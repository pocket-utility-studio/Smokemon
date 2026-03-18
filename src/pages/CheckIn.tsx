import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { removePendingCheckIn } from '../hooks/useNotificationScheduler'

const FONT      = "'PokemonGb', 'Press Start 2P', monospace"
const GBC_GREEN = '#84cc16'
const GBC_TEXT  = '#c8e890'
const GBC_MUTED = '#4a7a10'
const GBC_DARK  = '#2a4a08'
const GBC_BG    = '#050a04'
const GBC_BOX   = '#0a1408'
const GBC_AMBER = '#f59e0b'
const GBC_RED   = '#e84040'

const pokeBox = {
  border: '3px solid #84cc16',
  boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
  background: GBC_BOX,
}

const STORAGE_KEY = 'utilhub_sessions'

interface SessionEntry {
  id:            string
  strainName:    string
  strainType?:   string
  date:          string
  notes:         string
  rating?:       'good' | 'ok' | 'bad'
  symptoms?:     string[]
  preSeverity?:  number
  postSeverity?: number
  postNotes?:    string
  temp?:         number
}

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

function severityColor(n: number): string {
  if (n <= 3) return GBC_GREEN
  if (n <= 6) return GBC_AMBER
  return GBC_RED
}

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
              padding: '10px 0',
              minHeight: 44,
              border: `2px solid ${active ? col : GBC_DARK}`,
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

function loadSessions(): SessionEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveSessions(list: SessionEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export default function CheckIn() {
  const [params]   = useSearchParams()
  const navigate   = useNavigate()
  const sessionId  = params.get('session')

  const [session,      setSession]      = useState<SessionEntry | null>(null)
  const [postSeverity, setPostSeverity] = useState<number | undefined>()
  const [postNotes,    setPostNotes]    = useState('')
  const [saved,        setSaved]        = useState(false)

  useEffect(() => {
    if (!sessionId) return
    const found = loadSessions().find((s) => s.id === sessionId)
    setSession(found ?? null)
  }, [sessionId])

  const handleSave = () => {
    if (!session || postSeverity === undefined) return
    const updated = loadSessions().map((s) =>
      s.id === session.id
        ? { ...s, postSeverity, postNotes: postNotes.trim() }
        : s,
    )
    saveSessions(updated)
    removePendingCheckIn(session.id)
    setSaved(true)
  }

  // ── Saved confirmation ─────────────────────────────────────────────────────

  if (saved && session) {
    const pre  = session.preSeverity
    const post = postSeverity!
    const diff = pre !== undefined ? pre - post : null

    return (
      <div style={{ minHeight: '100%', background: GBC_BG, padding: 12, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ ...pokeBox, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontFamily: FONT, fontSize: 10, color: GBC_GREEN }}>CHECK-IN SAVED</span>
          {diff !== null && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_MUTED }}>EFFICACY RESULT</span>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, marginBottom: 4 }}>BEFORE</div>
                  <div style={{ fontFamily: FONT, fontSize: 18, color: severityColor(pre!) }}>{pre}</div>
                </div>
                <div style={{ fontFamily: FONT, fontSize: 14, color: GBC_DARK }}>→</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, marginBottom: 4 }}>AFTER</div>
                  <div style={{ fontFamily: FONT, fontSize: 18, color: severityColor(post) }}>{post}</div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
                  <div style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, marginBottom: 4 }}>CHANGE</div>
                  <div style={{ fontFamily: FONT, fontSize: 18, color: diff > 0 ? GBC_GREEN : diff < 0 ? GBC_RED : GBC_AMBER }}>
                    {diff > 0 ? `-${diff}` : diff < 0 ? `+${Math.abs(diff)}` : '0'}
                  </div>
                </div>
              </div>
              <p style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT, margin: 0, lineHeight: 1.6 }}>
                {diff > 2  ? 'Strong relief recorded.' :
                 diff > 0  ? 'Some relief recorded.' :
                 diff === 0 ? 'No change recorded.' :
                              'Symptoms increased — worth noting for future sessions.'}
              </p>
            </div>
          )}
          <button
            onClick={() => navigate('/sessions')}
            style={{
              fontFamily: FONT, fontSize: 9, padding: '12px 0', cursor: 'pointer',
              border: `3px solid ${GBC_GREEN}`, background: GBC_GREEN,
              color: GBC_BG, width: '100%',
              boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
            }}
          >► VIEW SESSION LOG</button>
        </div>
      </div>
    )
  }

  // ── Not found ──────────────────────────────────────────────────────────────

  if (!sessionId || session === null) {
    return (
      <div style={{ minHeight: '100%', background: GBC_BG, padding: 12, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: FONT, fontSize: 10, color: GBC_MUTED, textAlign: 'center' }}>
          SESSION NOT FOUND
        </span>
        <button
          onClick={() => navigate('/sessions')}
          style={{ fontFamily: FONT, fontSize: 9, padding: '10px 16px', cursor: 'pointer', border: `2px solid ${GBC_DARK}`, color: GBC_MUTED, background: 'transparent' }}
        >← BACK</button>
      </div>
    )
  }

  // ── Main check-in form ─────────────────────────────────────────────────────

  const trackedSymptoms = (session.symptoms ?? [])
    .map((id) => SYMPTOM_OPTS.find((s) => s.id === id)?.label)
    .filter(Boolean)

  return (
    <div style={{ minHeight: '100%', background: GBC_BG, padding: 12, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Header */}
      <div style={{ borderBottom: `2px solid ${GBC_DARK}`, paddingBottom: 8 }}>
        <span style={{ fontFamily: FONT, fontSize: 11, color: GBC_GREEN }}>45-MIN CHECK-IN</span>
      </div>

      {/* Session info */}
      <div style={{ ...pokeBox, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_MUTED }}>SESSION</span>
        <span style={{ fontFamily: FONT, fontSize: 11, color: GBC_TEXT }}>{session.strainName.toUpperCase()}</span>
        {trackedSymptoms.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
            {trackedSymptoms.map((label) => (
              <span key={label} style={{ fontFamily: FONT, fontSize: 7, color: GBC_AMBER, border: `1px solid ${GBC_AMBER}`, padding: '2px 5px' }}>
                {label}
              </span>
            ))}
          </div>
        )}
        {session.preSeverity !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED }}>PRE-SESSION:</span>
            <span style={{ fontFamily: FONT, fontSize: 11, color: severityColor(session.preSeverity) }}>
              {session.preSeverity}/10
            </span>
          </div>
        )}
      </div>

      {/* Post-session severity */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_MUTED }}>
          HOW ARE YOUR SYMPTOMS NOW?
        </span>
        <SeverityPicker value={postSeverity} onChange={setPostSeverity} />
        {postSeverity !== undefined && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span style={{ fontFamily: FONT, fontSize: 9, color: severityColor(postSeverity) }}>
              {postSeverity}/10 — {
                postSeverity <= 2 ? 'NONE / MINIMAL' :
                postSeverity <= 4 ? 'MILD' :
                postSeverity <= 6 ? 'MODERATE' :
                postSeverity <= 8 ? 'STRONG' :
                                    'SEVERE'
              }
            </span>
          </div>
        )}
      </div>

      {/* Notes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_MUTED }}>NOTES (OPTIONAL)</span>
        <textarea
          rows={3}
          value={postNotes}
          onChange={(e) => setPostNotes(e.target.value)}
          placeholder="How do you feel? Side effects, relief, mood..."
          style={{
            background: GBC_BG, border: `2px solid ${GBC_DARK}`,
            color: GBC_TEXT, fontFamily: 'monospace', fontSize: 13,
            padding: 8, resize: 'none', outline: 'none',
            width: '100%', boxSizing: 'border-box', lineHeight: 1.6,
          }}
        />
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={postSeverity === undefined}
        style={{
          fontFamily: FONT, fontSize: 10, padding: '13px 0', width: '100%',
          cursor: postSeverity !== undefined ? 'pointer' : 'not-allowed',
          border: `3px solid ${postSeverity !== undefined ? GBC_GREEN : GBC_DARK}`,
          background: postSeverity !== undefined ? GBC_GREEN : 'transparent',
          color: postSeverity !== undefined ? GBC_BG : GBC_MUTED,
          boxShadow: postSeverity !== undefined ? 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010' : 'none',
          boxSizing: 'border-box',
        }}
      >► SAVE CHECK-IN</button>

    </div>
  )
}
