import { useState, useMemo } from 'react'
import { useStrainDb, displayName, fetchLiveStrain } from '../hooks/useStrainDb'
import type { StrainRecord } from '../hooks/useStrainDb'
import { lookupStrainData } from '../services/gemini'
import type { StrainLookupResult } from '../services/gemini'
import { useTransitionNav } from '../context/NavigationContext'

const FONT = "'PokemonGb', 'Press Start 2P', monospace"
const GBC_GREEN = '#84cc16'
const GBC_TEXT = '#c8e890'
const GBC_MUTED = '#4a7a10'
const GBC_DARKEST = '#2a4a08'
const GBC_BG = '#050a04'
const GBC_BOX = '#0a1408'
const GBC_AMBER = '#f59e0b'
const GBC_RED = '#e84040'
const GBC_VIOLET = '#a78bfa'

const pokeBox = {
  border: '3px solid #84cc16',
  boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
  background: GBC_BOX,
}

function delta(local?: number, live?: number): string {
  if (local == null || live == null) return ''
  const d = live - local
  return (d > 0 ? '+' : '') + d.toFixed(1) + '%'
}

function deltaColor(local?: number, live?: number): string {
  if (local == null || live == null) return GBC_MUTED
  const d = Math.abs(live - local)
  if (d > 5) return GBC_RED
  if (d > 2) return GBC_AMBER
  return GBC_GREEN
}

function barColor(pct: number): string {
  if (pct > 50) return GBC_GREEN
  if (pct > 20) return GBC_AMBER
  return GBC_RED
}

function typeColor(type: string): string {
  if (type === 'sativa') return GBC_GREEN
  if (type === 'indica') return GBC_VIOLET
  return GBC_AMBER
}

// Pixel-art Porygon — 32×32 grid, each cell 3px, GBC palette
function PorygonSprite() {
  const C = '#0a1408'  // outline
  const W = '#d8efc0'  // cream body
  const P = '#c060a0'  // pink
  const B = '#5080c8'  // blue
  const R = '#84cc16'  // kiwi (replaces red for GBC mono)
  type Row = string[]
  // 16×16 pixel grid (scaled 3× = 48px)
  const grid: Row[] = [
    [...'................'],
    [...'....CCCCCC......'],
    [...'...CWWWWWWC.....'],
    [...'..CWWWWWWWWC....'],
    [...'..CPPWWWWWWCC...'],
    [...'..CPPWWWWWWWC...'],
    [...'..CBBBBBBBBBCC..'],
    [...'...CBBBBBBC.CC..'],
    [...'...CBRRRRBC.....'],
    [...'...CBRRRRBC.....'],
    [...'..CCBC..CBC.....'],
    [...'..CBC....CBC....'],
    [...'................'],
    [...'................'],
    [...'................'],
    [...'................'],
  ]
  const colorMap: Record<string, string> = { C, W, P, B, R }
  const s = 3
  return (
    <svg
      width={16 * s} height={16 * s}
      style={{ imageRendering: 'pixelated', display: 'block' }}
    >
      {grid.map((row, ry) =>
        row.map((cell, cx) => {
          const fill = colorMap[cell]
          if (!fill) return null
          return <rect key={`${ry}-${cx}`} x={cx * s} y={ry * s} width={s} height={s} fill={fill} />
        })
      )}
    </svg>
  )
}

export default function DataAudit() {
  const { db, loading } = useStrainDb()
  const { transitionTo } = useTransitionNav()

  const [sample, setSample] = useState<StrainRecord[]>([])
  const [liveData, setLiveData] = useState<Record<string, { thc?: number; cbd?: number; terpenes?: string } | null>>({})
  const [fetching, setFetching] = useState(false)
  const [fetchDone, setFetchDone] = useState(false)
  const [geminiData, setGeminiData] = useState<Record<string, StrainLookupResult | 'loading' | 'error'>>({})

  async function fetchGemini(s: StrainRecord) {
    const key = s.Strain
    if (geminiData[key]) return
    setGeminiData((prev) => ({ ...prev, [key]: 'loading' }))
    try {
      const result = await lookupStrainData(displayName(s))
      setGeminiData((prev) => ({ ...prev, [key]: result }))
    } catch {
      setGeminiData((prev) => ({ ...prev, [key]: 'error' }))
    }
  }

  const stats = useMemo(() => {
    const total = db.length
    if (total === 0) return null
    const withThc = db.filter((s) => s.thc != null).length
    const withCbd = db.filter((s) => s.cbd != null).length
    const withTerpenes = db.filter((s) => s.terpenes).length
    return { total, withThc, withCbd, withTerpenes }
  }, [db])

  const outliers = useMemo(() => {
    return db
      .filter((s) => s.thc != null && (s.thc as number) > 35)
      .sort((a, b) => (b.thc as number) - (a.thc as number))
  }, [db])

  function loadSample() {
    const picked = [...db].sort(() => Math.random() - 0.5).slice(0, 20)
    setSample(picked)
    setLiveData({})
    setFetchDone(false)
    setGeminiData({})
  }

  async function fetchLive() {
    if (sample.length === 0 || fetching) return
    setFetching(true)
    const batchSize = 5
    const results: Record<string, { thc?: number; cbd?: number; terpenes?: string } | null> = {}

    for (let i = 0; i < sample.length; i += batchSize) {
      const batch = sample.slice(i, i + batchSize)
      const settled = await Promise.all(
        batch.map((s) => fetchLiveStrain(displayName(s)))
      )
      batch.forEach((s, idx) => {
        const res = settled[idx]
        if (res === null) {
          results[s.Strain] = null
        } else {
          results[s.Strain] = {
            thc: res.thc,
            cbd: res.cbd,
            terpenes: res.terpenes,
          }
        }
      })
    }

    setLiveData(results)
    setFetching(false)
    setFetchDone(true)
  }

  if (loading) {
    return (
      <div style={{
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: GBC_BG,
      }}>
        <span style={{ fontFamily: FONT, fontSize: 11, color: GBC_GREEN }}>LOADING...</span>
      </div>
    )
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      gap: 8, padding: '6px 4px', background: GBC_BG, boxSizing: 'border-box',
      overflowY: 'auto',
    }}>

      {/* Header */}
      <div style={{
        ...pokeBox, padding: '10px 12px', flexShrink: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: FONT, fontSize: 13, color: GBC_GREEN }}>DATA AUDIT</span>
          <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED }}>PORYGON DATA SYSTEMS</span>
        </div>
        <PorygonSprite />
      </div>

      {/* Section 1: DB Coverage */}
      {stats && (
        <div style={{ ...pokeBox, padding: '10px 12px', flexShrink: 0 }}>
          <div style={{ fontFamily: FONT, fontSize: 9, color: GBC_MUTED, marginBottom: 10 }}>
            DB COVERAGE
          </div>
          {[
            { label: 'STRAINS', count: stats.total, pct: 100 },
            { label: 'HAVE THC', count: stats.withThc, pct: stats.total ? Math.round(stats.withThc / stats.total * 100) : 0 },
            { label: 'HAVE CBD', count: stats.withCbd, pct: stats.total ? Math.round(stats.withCbd / stats.total * 100) : 0 },
            { label: 'HAVE TERPENES', count: stats.withTerpenes, pct: stats.total ? Math.round(stats.withTerpenes / stats.total * 100) : 0 },
          ].map((row) => (
            <div key={row.label} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_TEXT }}>{row.label}</span>
                <span style={{ fontFamily: FONT, fontSize: 8, color: barColor(row.pct) }}>
                  {row.count} ({row.pct}%)
                </span>
              </div>
              <div style={{ background: GBC_DARKEST, height: 6, width: '100%' }}>
                <div style={{
                  background: barColor(row.pct),
                  height: '100%',
                  width: `${row.pct}%`,
                }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section 2: Outliers */}
      {outliers.length > 0 && (
        <div style={{
          border: '3px solid #f59e0b',
          boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
          background: GBC_BOX,
          padding: '10px 12px',
          flexShrink: 0,
        }}>
          <div style={{ fontFamily: FONT, fontSize: 9, color: GBC_AMBER, marginBottom: 10 }}>
            SUSPICIOUS VALUES ({outliers.length} STRAINS &gt;35% THC)
          </div>
          {outliers.slice(0, 8).map((s) => (
            <div key={s.Strain} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 6, gap: 8,
            }}>
              <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_TEXT, flex: 1 }}>{displayName(s)}</span>
              <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_RED, flexShrink: 0 }}>THC {s.thc}%</span>
              <button
                onClick={() => transitionTo('/smokedex')}
                style={{
                  fontFamily: FONT, fontSize: 7, padding: '4px 8px', minHeight: 32,
                  border: `1px solid ${GBC_AMBER}`, background: 'transparent',
                  color: GBC_AMBER, cursor: 'pointer', flexShrink: 0,
                }}
              >
                EDIT
              </button>
            </div>
          ))}
          {outliers.length > 8 && (
            <div style={{ fontFamily: FONT, fontSize: 8, color: GBC_MUTED, marginTop: 4 }}>
              ...and {outliers.length - 8} more
            </div>
          )}
        </div>
      )}

      {/* Section 3: Live Comparison */}
      <div style={{ ...pokeBox, padding: '10px 12px', flexShrink: 0 }}>
        <div style={{ fontFamily: FONT, fontSize: 9, color: GBC_MUTED, marginBottom: 10 }}>
          LIVE COMPARISON
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {/* NEW SAMPLE */}
          <button
            onClick={loadSample}
            style={{
              flex: 1, minHeight: 44, fontFamily: FONT, fontSize: 9,
              color: GBC_MUTED, border: `2px solid ${GBC_MUTED}`,
              background: 'transparent', cursor: 'pointer', padding: '8px 4px',
            }}
          >
            NEW SAMPLE
          </button>

          {/* FETCH LIVE */}
          <button
            onClick={fetchLive}
            disabled={sample.length === 0 || fetching}
            style={{
              flex: 1, minHeight: 44, fontFamily: FONT, fontSize: 9,
              color: sample.length === 0 || fetching ? GBC_DARKEST : GBC_GREEN,
              border: `2px solid ${sample.length === 0 || fetching ? GBC_DARKEST : GBC_GREEN}`,
              background: 'transparent',
              cursor: sample.length === 0 || fetching ? 'default' : 'pointer',
              padding: '8px 4px',
            }}
          >
            {fetching ? 'FETCHING...' : 'FETCH LIVE'}
          </button>
        </div>

        {sample.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '20px 0',
            fontFamily: FONT, fontSize: 9, color: GBC_MUTED,
          }}>
            TAP NEW SAMPLE TO BEGIN
          </div>
        )}

        {fetchDone && sample.length > 0 && (
          <div style={{
            fontFamily: FONT, fontSize: 8, color: GBC_MUTED,
            marginBottom: 8, textAlign: 'center',
          }}>
            LOCAL → LIVE · RED=&gt;5% DIFF · AMBER=2-5%
          </div>
        )}

        {sample.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sample.map((s) => {
              const live = liveData[s.Strain]
              const fetched = s.Strain in liveData

              return (
                <div key={s.Strain} style={{
                  ...pokeBox,
                  border: '2px solid ' + GBC_DARKEST,
                  boxShadow: 'none',
                  padding: '8px 10px',
                }}>
                  {/* Name + type badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: GBC_TEXT,
                      flex: 1,
                    }}>
                      {displayName(s)}
                    </span>
                    <span style={{
                      fontFamily: FONT, fontSize: 7,
                      color: typeColor(s.Type),
                      border: `1px solid ${typeColor(s.Type)}`,
                      padding: '2px 4px',
                      flexShrink: 0,
                    }}>
                      {s.Type.toUpperCase()}
                    </span>
                  </div>

                  {/* THC row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3, flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: FONT, fontSize: 8,
                      color: s.thc != null ? GBC_GREEN : GBC_DARKEST,
                    }}>
                      THC: {s.thc != null ? `${s.thc}%` : 'N/A'}
                    </span>
                    {fetched && (
                      <>
                        <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_MUTED }}>→</span>
                        <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_TEXT }}>
                          {live?.thc != null ? `${live.thc}%` : 'N/A'}
                        </span>
                        {s.thc != null && live?.thc != null && (
                          <span style={{ fontFamily: FONT, fontSize: 8, color: deltaColor(s.thc, live.thc) }}>
                            ({delta(s.thc, live.thc)})
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* CBD row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3, flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: FONT, fontSize: 8,
                      color: s.cbd != null ? GBC_GREEN : GBC_DARKEST,
                    }}>
                      CBD: {s.cbd != null ? `${s.cbd}%` : 'N/A'}
                    </span>
                    {fetched && (
                      <>
                        <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_MUTED }}>→</span>
                        <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_TEXT }}>
                          {live?.cbd != null ? `${live.cbd}%` : 'N/A'}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Terpenes from live */}
                  {fetched && live?.terpenes && (
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                      color: GBC_MUTED, marginTop: 2,
                    }}>
                      {live.terpenes}
                    </div>
                  )}

                  {/* No live data */}
                  {fetched && live === null && (
                    <div style={{ fontFamily: FONT, fontSize: 8, color: GBC_DARKEST, marginTop: 2 }}>
                      NO LIVE DATA
                    </div>
                  )}

                  {/* Gemini section */}
                  {(() => {
                    const gd = geminiData[s.Strain]
                    if (!gd) {
                      return (
                        <button
                          onClick={() => fetchGemini(s)}
                          style={{
                            marginTop: 8, width: '100%', minHeight: 36,
                            fontFamily: FONT, fontSize: 8, padding: '6px 0',
                            border: `1px solid ${GBC_VIOLET}`, background: 'transparent',
                            color: GBC_VIOLET, cursor: 'pointer',
                          }}
                        >
                          ► ASK GEMINI
                        </button>
                      )
                    }
                    if (gd === 'loading') {
                      return (
                        <div style={{ fontFamily: FONT, fontSize: 8, color: GBC_VIOLET, marginTop: 8 }}>
                          ASKING GEMINI...
                        </div>
                      )
                    }
                    if (gd === 'error') {
                      return (
                        <div style={{ fontFamily: FONT, fontSize: 8, color: GBC_RED, marginTop: 8 }}>
                          GEMINI ERROR
                        </div>
                      )
                    }
                    return (
                      <div style={{ marginTop: 8, borderTop: `1px solid ${GBC_VIOLET}33`, paddingTop: 8 }}>
                        <div style={{ fontFamily: FONT, fontSize: 7, color: GBC_VIOLET, marginBottom: 6 }}>
                          GEMINI
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: gd.terpenes || gd.effects || gd.history ? 6 : 0 }}>
                          {gd.type && (
                            <span style={{ fontFamily: FONT, fontSize: 7, color: typeColor(gd.type), border: `1px solid ${typeColor(gd.type)}`, padding: '1px 4px' }}>
                              {gd.type.toUpperCase()}
                            </span>
                          )}
                          <span style={{ fontFamily: FONT, fontSize: 8, color: gd.thc != null ? GBC_GREEN : GBC_DARKEST }}>
                            THC: {gd.thc != null ? `${gd.thc}%` : 'N/A'}
                            {gd.thc != null && s.thc != null && (
                              <span style={{ color: deltaColor(s.thc, gd.thc), marginLeft: 4 }}>({delta(s.thc, gd.thc)})</span>
                            )}
                          </span>
                          <span style={{ fontFamily: FONT, fontSize: 8, color: gd.cbd != null ? GBC_MUTED : GBC_DARKEST }}>
                            CBD: {gd.cbd != null ? `${gd.cbd}%` : 'N/A'}
                          </span>
                        </div>
                        {gd.terpenes && (
                          <div style={{ fontFamily: 'monospace', fontSize: 11, color: GBC_MUTED, marginBottom: 4 }}>
                            {gd.terpenes}
                          </div>
                        )}
                        {gd.effects && (
                          <div style={{ fontFamily: 'monospace', fontSize: 11, color: GBC_TEXT, opacity: 0.7, marginBottom: 4, lineHeight: 1.5 }}>
                            {gd.effects}
                          </div>
                        )}
                        {gd.history && (
                          <div style={{ fontFamily: 'monospace', fontSize: 11, color: GBC_TEXT, opacity: 0.6, lineHeight: 1.6, borderTop: `1px solid ${GBC_DARKEST}`, paddingTop: 6, marginTop: 4 }}>
                            {gd.history}
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
