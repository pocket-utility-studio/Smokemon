import { useMemo } from 'react'
import { useStrainDb } from '../hooks/useStrainDb'
import type { StrainRecord } from '../hooks/useStrainDb'
import { BudSprite } from '../components/BudSprite'

// ── Constants ─────────────────────────────────────────────────────────────────

const FONT        = "'PokemonGb', 'Press Start 2P', monospace"
const GBC_BG      = '#050a04'
const GBC_MUTED   = '#4a7a10'
const GBC_DARKEST = '#2a4a08'
const GBC_GREEN   = '#84cc16'
const GBC_BOX     = '#0a1408'
const GBC_AMBER   = '#f59e0b'
const GBC_VIOLET  = '#a78bfa'

const pokeBox = {
  border: '3px solid #84cc16',
  boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
  background: GBC_BOX,
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface SessionEntry {
  id:            string
  strainName:    string
  strainType?:   string
  notes:         string
  rating?:       'good' | 'ok' | 'bad'
  symptoms?:     string[]
  preSeverity?:  number
  postSeverity?: number
  temp?:         number
}

// ── Data loading ──────────────────────────────────────────────────────────────

function loadSessions(): SessionEntry[] {
  try { return JSON.parse(localStorage.getItem('utilhub_sessions') ?? '[]') } catch { return [] }
}

// ── Scoring helpers ───────────────────────────────────────────────────────────

/**
 * Score a single session for efficacy.
 * Efficacy sessions (pre+post severity) give direct delta.
 * Legacy ratings map to nominal scores.
 * Unrated sessions with no severity data are excluded.
 */
function scoreSession(s: SessionEntry): number | undefined {
  if (s.preSeverity !== undefined && s.postSeverity !== undefined) {
    return s.preSeverity - s.postSeverity   // +9 = maximum relief, negative = worsened
  }
  if (s.rating === 'good') return 4
  if (s.rating === 'ok')   return 1
  if (s.rating === 'bad')  return -3
  return undefined
}

// ── Data processing ───────────────────────────────────────────────────────────

interface RankedStrain {
  name:      string
  type?:     string
  avgRelief: number
}

/**
 * Compute the Elite Four: top 4 strains by average efficacy/rating score.
 * Only strains with at least one rated or efficacy session qualify.
 */
function computeEliteFour(sessions: SessionEntry[]): RankedStrain[] {
  const map = new Map<string, { sum: number; count: number; name: string; type?: string }>()

  for (const s of sessions) {
    const score = scoreSession(s)
    if (score === undefined) continue
    const key = s.strainName.toLowerCase()
    const entry = map.get(key)
    if (entry) {
      entry.sum += score
      entry.count += 1
    } else {
      map.set(key, { sum: score, count: 1, name: s.strainName, type: s.strainType })
    }
  }

  return Array.from(map.values())
    .map((d) => ({ name: d.name, type: d.type, avgRelief: d.sum / d.count }))
    .sort((a, b) => b.avgRelief - a.avgRelief)
    .slice(0, 4)
}

/**
 * Cross-reference session strain names with the strain DB to find the most
 * frequently encountered terpene across all logged sessions.
 */
function computeTopTerpene(sessions: SessionEntry[], db: StrainRecord[]): string | null {
  const norm = (s: string) => s.toLowerCase().replace(/[-_\s]+/g, '')
  const counts = new Map<string, number>()

  for (const session of sessions) {
    const key   = norm(session.strainName)
    const match = db.find((r) => norm(String(r.Strain)) === key)
    if (!match?.terpenes) continue
    for (const t of match.terpenes.split(',').map((t) => t.trim()).filter(Boolean)) {
      counts.set(t, (counts.get(t) ?? 0) + 1)
    }
  }

  if (!counts.size) return null
  let top = '', max = 0
  for (const [t, c] of counts) {
    if (c > max) { top = t; max = c }
  }
  return top || null
}

/**
 * Find the most frequently logged vape temperature (mode).
 */
function computeGoToTemp(sessions: SessionEntry[]): number | null {
  const temps = sessions.flatMap((s) => s.temp != null ? [s.temp] : [])
  if (!temps.length) return null
  const counts = new Map<number, number>()
  for (const t of temps) counts.set(t, (counts.get(t) ?? 0) + 1)
  let mode = temps[0], modeCount = 0
  for (const [t, c] of counts) {
    if (c > modeCount) { mode = t; modeCount = c }
  }
  return mode
}

/**
 * Find the most common symptom tracked across all sessions.
 * (qualitative — what the user is primarily treating)
 */
function computeTopSymptom(sessions: SessionEntry[]): string | null {
  const LABELS: Record<string, string> = {
    pain: 'PAIN', anxiety: 'ANXIETY', nausea: 'NAUSEA', tics: 'TICS',
    depression: 'DEPRESSION', fatigue: 'FATIGUE', insomnia: 'INSOMNIA',
    mood: 'LOW MOOD', stress: 'STRESS', focus: 'POOR FOCUS',
  }
  const counts = new Map<string, number>()
  for (const s of sessions) {
    for (const sym of s.symptoms ?? []) {
      counts.set(sym, (counts.get(sym) ?? 0) + 1)
    }
  }
  if (!counts.size) return null
  let top = '', max = 0
  for (const [sym, c] of counts) {
    if (c > max) { top = sym; max = c }
  }
  return LABELS[top] ?? top.toUpperCase()
}

// ── Sub-components ────────────────────────────────────────────────────────────

function typeColor(type?: string): string {
  if (type === 'sativa') return GBC_GREEN
  if (type === 'indica') return GBC_VIOLET
  if (type === 'hybrid') return GBC_AMBER
  return GBC_MUTED
}

/**
 * 5-square efficacy bar. Filled proportional to the top scorer in the Elite Four.
 * Always shows at least 1 filled square for any positive-scoring strain.
 */
function EfficacyBar({ relief, maxRelief }: { relief: number; maxRelief: number }) {
  const filled = maxRelief > 0 ? Math.max(1, Math.round((relief / maxRelief) * 5)) : 0
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          style={{
            width: 8, height: 6,
            background: i < filled ? GBC_GREEN : GBC_DARKEST,
          }}
        />
      ))}
    </div>
  )
}

function EliteFourCard({
  rank, strain, maxRelief, dbMatch,
}: {
  rank: number
  strain: RankedStrain
  maxRelief: number
  dbMatch?: StrainRecord
}) {
  const col = typeColor(strain.type)
  const isFirst = rank === 1
  return (
    <div style={{
      flex: '1 1 calc(50% - 4px)',
      border: `2px solid ${isFirst ? GBC_AMBER : GBC_DARKEST}`,
      background: isFirst ? `${GBC_AMBER}08` : GBC_BOX,
      padding: '12px 8px',
      display: 'flex', flexDirection: 'column', gap: 6,
      alignItems: 'center', minWidth: 0,
    }}>
      <span style={{
        fontFamily: FONT, fontSize: 7,
        color: isFirst ? GBC_AMBER : GBC_MUTED,
      }}>
        #{rank}
      </span>
      <BudSprite
        name={strain.name}
        type={strain.type}
        size={40}
        context={dbMatch ? {
          description: dbMatch.Description,
          effects:     dbMatch.Effects,
          terpenes:    dbMatch.terpenes,
          flavor:      dbMatch.Flavor,
        } : undefined}
      />
      <div style={{
        fontFamily: FONT, fontSize: 8, color: col,
        textAlign: 'center', lineHeight: 1.6,
        wordBreak: 'break-word', width: '100%',
      }}>
        {strain.name.toUpperCase()}
      </div>
      {strain.type && (
        <span style={{
          fontFamily: FONT, fontSize: 6,
          color: col, border: `1px solid ${col}`,
          padding: '1px 4px',
        }}>
          {strain.type.toUpperCase()}
        </span>
      )}
      <EfficacyBar relief={strain.avgRelief} maxRelief={maxRelief} />
    </div>
  )
}

function PlaceholderCard({ rank }: { rank: number }) {
  return (
    <div style={{
      flex: '1 1 calc(50% - 4px)',
      border: `2px dashed ${GBC_DARKEST}`,
      background: 'transparent',
      padding: '12px 8px',
      display: 'flex', flexDirection: 'column', gap: 6,
      alignItems: 'center', justifyContent: 'center',
      minHeight: 130, minWidth: 0,
    }}>
      <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_DARKEST }}>#{rank}</span>
      <span style={{ fontFamily: FONT, fontSize: 22, color: GBC_DARKEST }}>?</span>
      <span style={{ fontFamily: FONT, fontSize: 6, color: GBC_DARKEST, textAlign: 'center', lineHeight: 1.8 }}>
        LOG MORE{'\n'}SESSIONS
      </span>
    </div>
  )
}

function StatCard({
  label, children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div style={{ ...pokeBox, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED }}>{label}</span>
      {children}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TrainerRecord() {
  const { db } = useStrainDb()

  const sessions    = useMemo(loadSessions, [])
  const eliteFour   = useMemo(() => computeEliteFour(sessions), [sessions])
  const topTerpene  = useMemo(() => computeTopTerpene(sessions, db), [sessions, db])
  const goToTemp    = useMemo(() => computeGoToTemp(sessions), [sessions])
  const topSymptom  = useMemo(() => computeTopSymptom(sessions), [sessions])

  const norm       = (s: string) => s.toLowerCase().replace(/[-_\s]+/g, '')
  const findDbMatch = (name: string) => db.find((r) => norm(String(r.Strain)) === norm(name))

  const maxRelief   = eliteFour[0]?.avgRelief ?? 1
  const hasData     = sessions.some((s) => scoreSession(s) !== undefined)

  return (
    <div style={{
      minHeight: '100%', background: GBC_BG, padding: 10,
      boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 14,
    }}>

      {/* Header */}
      <div style={{ textAlign: 'center', paddingBottom: 10, borderBottom: `2px solid ${GBC_DARKEST}` }}>
        <div style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, marginBottom: 6, letterSpacing: 1 }}>
          YOUR
        </div>
        <div style={{ fontFamily: FONT, fontSize: 13, color: GBC_GREEN, lineHeight: 1.6 }}>
          TRAINER RECORD
        </div>
      </div>

      {!hasData ? (

        /* ── Empty state ── */
        <div style={{ ...pokeBox, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', textAlign: 'center' }}>
          <span style={{ fontFamily: FONT, fontSize: 9, color: GBC_DARKEST, lineHeight: 2 }}>
            NO RECORD YET
          </span>
          <p style={{ fontFamily: 'monospace', fontSize: 13, color: GBC_MUTED, margin: 0, lineHeight: 1.7 }}>
            Log sessions with a rating or pre/post severity to unlock your Trainer Record.
          </p>
        </div>

      ) : (
        <>

          {/* ── The Elite Four ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: FONT, fontSize: 9, color: GBC_AMBER }}>THE ELITE FOUR</span>
              <div style={{ flex: 1, height: 1, background: GBC_DARKEST }} />
            </div>
            <p style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_MUTED, margin: 0, lineHeight: 1.6 }}>
              Your highest-performing strains, ranked by average efficacy.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {Array.from({ length: 4 }, (_, i) => {
                const strain = eliteFour[i]
                return strain ? (
                  <EliteFourCard
                    key={strain.name}
                    rank={i + 1}
                    strain={strain}
                    maxRelief={maxRelief}
                    dbMatch={findDbMatch(strain.name)}
                  />
                ) : (
                  <PlaceholderCard key={i} rank={i + 1} />
                )
              })}
            </div>
          </div>

          {/* ── Terpene stat ── */}
          <StatCard label="YOUR MOST-USED TERPENE">
            {topTerpene ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{
                  fontFamily: FONT, fontSize: 16, color: GBC_VIOLET,
                  letterSpacing: 1, lineHeight: 1.4,
                }}>
                  {topTerpene.toUpperCase()}
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_MUTED, lineHeight: 1.6 }}>
                  The dominant terpene across your most-logged strains.
                </span>
              </div>
            ) : (
              <span style={{ fontFamily: FONT, fontSize: 9, color: GBC_DARKEST }}>
                NOT ENOUGH DATA
              </span>
            )}
          </StatCard>

          {/* ── Go-to temp stat ── */}
          <StatCard label="YOUR GO-TO VAPE TEMP">
            {goToTemp !== null ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span style={{ fontFamily: FONT, fontSize: 28, color: GBC_AMBER, lineHeight: 1 }}>
                    {goToTemp}
                  </span>
                  <span style={{ fontFamily: FONT, fontSize: 11, color: GBC_AMBER }}>°C</span>
                </div>
                <span style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_MUTED, lineHeight: 1.6 }}>
                  Your most frequently logged vape temperature.
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontFamily: FONT, fontSize: 9, color: GBC_DARKEST }}>
                  NOT YET LOGGED
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_MUTED, lineHeight: 1.6 }}>
                  Select a vape temp when logging sessions to unlock this stat.
                </span>
              </div>
            )}
          </StatCard>

          {/* ── Top symptom ── */}
          {topSymptom && (
            <StatCard label="PRIMARY SYMPTOM TRACKED">
              <span style={{ fontFamily: FONT, fontSize: 14, color: GBC_AMBER, letterSpacing: 1 }}>
                {topSymptom}
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_MUTED, lineHeight: 1.6 }}>
                The symptom you track most across your sessions.
              </span>
            </StatCard>
          )}

        </>
      )}
    </div>
  )
}
