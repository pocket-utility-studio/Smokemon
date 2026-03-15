import { useState, useEffect, useCallback, useRef } from 'react'
import { useGifMode } from '../context/GifModeContext'
import { useStash } from '../context/StashContext'
import type { StrainEntry } from '../context/StashContext'
import { useStrainDb, displayName } from '../hooks/useStrainDb'
import Typewriter from '../components/Typewriter'

// ── Building-entry transition ─────────────────────────────────────────────────

function BuildingEntry({ onDone }: { onDone: () => void }) {
  const stableDone = useCallback(onDone, [])
  const [started, setStarted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { setGifMode } = useGifMode()

  useEffect(() => {
    setGifMode(true)
    return () => setGifMode(false)
  }, [setGifMode])

  useEffect(() => {
    if (!started) return
    const tDone = setTimeout(() => stableDone(), 14000)
    const tAudio = setTimeout(() => {
      audioRef.current?.play().catch(() => {})
    }, 3000)
    return () => {
      clearTimeout(tDone)
      clearTimeout(tAudio)
    }
  }, [started, stableDone])

  const handleTap = useCallback(() => {
    if (!started) {
      // Unlock audio during the user gesture, then pause immediately
      const a = audioRef.current
      if (a) {
        a.play().then(() => a.pause()).catch(() => {})
        a.currentTime = 0
      }
      setStarted(true)
    } else {
      stableDone()
    }
  }, [started, stableDone])

  return (
    <div
      onClick={handleTap}
      style={{
        position: 'absolute', inset: 0, zIndex: 9999,
        background: '#050a04',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <audio ref={audioRef} src={`${import.meta.env.BASE_URL}111-pokemon-recovery.mp3`} />
      <img
        src={`${import.meta.env.BASE_URL}pokemon-center.gif`}
        alt=""
        style={{
          width: '100%',
          height: 'auto',
          imageRendering: 'pixelated',
          display: 'block',
        }}
      />
      {!started && (
        <div style={{
          position: 'absolute',
          bottom: 60,
          left: 0, right: 0,
          textAlign: 'center',
          fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
          fontSize: 11,
          color: '#84cc16',
          animation: 'gbc-blink 0.8s step-end infinite',
        }}>
          TAP TO ENTER
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

const GBC_GREEN = '#84cc16'
const GBC_TEXT = '#c8e890'
const GBC_MUTED = '#4a7a10'
const GBC_DARKEST = '#2a4a08'
const GBC_BG = '#050a04'
const GBC_BOX = '#0a1408'
const GBC_AMBER = '#f59e0b'
const GBC_VIOLET = '#a78bfa'

const pokeBox = {
  border: '3px solid #84cc16',
  boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
  background: GBC_BOX,
}

type Symptom = 'PAIN' | 'INSOMNIA' | 'ANXIETY' | 'NAUSEA' | 'FATIGUE' | 'STRESS' | 'APPETITE' | 'FOCUS'
const ALL_SYMPTOMS: Symptom[] = ['PAIN', 'INSOMNIA', 'ANXIETY', 'NAUSEA', 'FATIGUE', 'STRESS', 'APPETITE', 'FOCUS']

function typeColor(type?: StrainEntry['type']): string {
  if (type === 'sativa') return GBC_GREEN
  if (type === 'indica') return GBC_VIOLET
  if (type === 'hybrid') return GBC_AMBER
  return GBC_MUTED
}

function TypeSprite({ type }: { type?: StrainEntry['type'] }) {
  const color = typeColor(type)
  const size = 40

  if (type === 'sativa') {
    return (
      <div style={{
        width: size,
        height: size,
        border: `2px solid ${color}`,
        background: GBC_BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <div style={{
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderBottom: `18px solid ${color}`,
        }} />
      </div>
    )
  }
  if (type === 'indica') {
    return (
      <div style={{
        width: size,
        height: size,
        border: `2px solid ${color}`,
        background: GBC_BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <div style={{
          width: 20,
          height: 20,
          background: color,
          transform: 'rotate(45deg)',
        }} />
      </div>
    )
  }
  return (
    <div style={{
      width: size,
      height: size,
      border: `2px solid ${color}`,
      background: GBC_BG,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <div style={{
        width: 20,
        height: 20,
        background: color,
      }} />
    </div>
  )
}

function scoreStrain(strain: StrainEntry, symptoms: Symptom[]): number {
  let score = 0
  const t = strain.type
  const thc = strain.thc ?? 0
  const cbd = strain.cbd ?? 0

  if (t === 'sativa') {
    if (symptoms.includes('FOCUS') || symptoms.includes('FATIGUE')) score += 3
    if (symptoms.includes('ANXIETY') || symptoms.includes('INSOMNIA')) score -= 1
  }
  if (t === 'indica') {
    if (symptoms.includes('INSOMNIA') || symptoms.includes('PAIN') || symptoms.includes('STRESS')) score += 3
    if (symptoms.includes('FOCUS')) score -= 1
  }
  if (t === 'hybrid') {
    score += 1
  }
  if (thc > 20) {
    if (symptoms.includes('PAIN') || symptoms.includes('INSOMNIA')) score += 1
    if (symptoms.includes('ANXIETY')) score -= 1
  }
  if (cbd > 1) {
    if (symptoms.includes('ANXIETY') || symptoms.includes('NAUSEA')) score += 2
  }

  return score
}

function buildWhyText(strain: StrainEntry, symptoms: Symptom[]): string {
  const typeLabel = strain.type ? strain.type.charAt(0).toUpperCase() + strain.type.slice(1) : 'This'
  const listed = symptoms.slice(0, 3).join(', ')
  const thc = strain.thc ?? 0
  const cbd = strain.cbd ?? 0
  const parts: string[] = []

  parts.push(`${typeLabel} strain matches your ${listed} needs.`)

  if (thc > 20 && (symptoms.includes('PAIN') || symptoms.includes('INSOMNIA'))) {
    parts.push(`High THC (${thc}%) aids pain and sleep.`)
  }
  if (cbd > 1 && (symptoms.includes('ANXIETY') || symptoms.includes('NAUSEA'))) {
    parts.push(`CBD (${cbd}%) helps ease anxiety and nausea.`)
  }

  return parts.join(' ')
}

// ─── Party Roster ─────────────────────────────────────────────────────────────

function PartyRoster({
  party,
  highlightId,
}: {
  party: StrainEntry[]
  highlightId: string | null
}) {
  if (party.length === 0) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {party.map((s) => {
        const highlighted = s.id === highlightId
        const color = typeColor(s.type)
        return (
          <div
            key={s.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              background: highlighted ? 'rgba(132,204,22,0.10)' : 'transparent',
              border: `2px solid ${highlighted ? GBC_GREEN : GBC_DARKEST}`,
              boxShadow: highlighted
                ? `0 0 0 1px ${GBC_DARKEST}, inset 0 0 0 1px #1a3008`
                : 'none',
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            {/* Type sprite */}
            <TypeSprite type={s.type} />

            {/* Name + type badge */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 10,
                color: highlighted ? GBC_GREEN : GBC_TEXT,
                marginBottom: 5,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {s.name.toUpperCase()}
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                {s.type && (
                  <span style={{
                    fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                    fontSize: 7,
                    border: `1px solid ${color}`,
                    color,
                    padding: '1px 4px',
                    flexShrink: 0,
                  }}>
                    {s.type.toUpperCase()}
                  </span>
                )}
                <span style={{
                  fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                  fontSize: 7,
                  color: GBC_MUTED,
                }}>
                  THC:{s.thc != null ? `${s.thc}%` : '--'}
                </span>
                {s.amount && (
                  <span style={{
                    fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                    fontSize: 7,
                    color: GBC_MUTED,
                  }}>
                    {s.amount}
                  </span>
                )}
              </div>
            </div>

            {/* Recommended arrow */}
            {highlighted && (
              <span style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 14,
                color: GBC_GREEN,
                flexShrink: 0,
                animation: 'gbc-blink 0.8s step-end infinite',
              }}>
                {'\u25ba'}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

type PhaseState = 'idle' | 'loading' | 'result'

export default function PokeCenter() {
  const { strains } = useStash()
  const { db } = useStrainDb()
  const [entered, setEntered] = useState(false)
  const [selected, setSelected] = useState<Symptom[]>([])
  const [phase, setPhase] = useState<PhaseState>('idle')
  const [resultIndex, setResultIndex] = useState(0)
  const [ranked, setRanked] = useState<StrainEntry[]>([])

  const inStock = strains.filter((s) => s.inStock)
  const hasSymptoms = selected.length > 0
  const result = ranked[resultIndex] ?? null
  const resultDbEntry = result
    ? db.find((r) => displayName(r).toLowerCase() === result.name.toLowerCase())
    : null

  const toggleSymptom = (s: Symptom) => {
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  const runMatch = (startIndex = 0) => {
    const scored = inStock
      .map((s) => ({ strain: s, score: scoreStrain(s, selected) }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return (b.strain.thc ?? 0) - (a.strain.thc ?? 0)
      })
      .map((x) => x.strain)

    setRanked(scored)
    setResultIndex(startIndex)
    setPhase('loading')
    setTimeout(() => setPhase('result'), 1500)
  }

  const handleFind = () => {
    if (!hasSymptoms || inStock.length === 0) return
    runMatch(0)
  }

  const handleTryAnother = () => {
    const nextIndex = (resultIndex + 1) % ranked.length
    setResultIndex(nextIndex)
    setPhase('loading')
    setTimeout(() => setPhase('result'), 1500)
  }

  return (
    <>
      {!entered && <BuildingEntry onDone={() => setEntered(true)} />}
    <div style={{
      minHeight: '100%',
      padding: '10px',
      background: GBC_BG,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      boxSizing: 'border-box',
      opacity: entered ? 1 : 0,
      transition: 'opacity 0.2s ease-in',
    }}>

      {/* Header */}
      <div style={{
        ...pokeBox,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
          fontSize: 13,
          color: GBC_GREEN,
        }}>
          POKE CENTER
        </span>
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
          fontSize: 8,
          color: GBC_MUTED,
          border: `1px solid ${GBC_MUTED}`,
          padding: '2px 6px',
        }}>
          [RX]
        </span>
      </div>

      {/* Nurse Joy counter */}
      <div style={{
        background: '#1a3004',
        border: `2px solid ${GBC_DARKEST}`,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 12,
        paddingRight: 12,
        gap: 10,
        flexShrink: 0,
      }}>
        {/* Pixel face */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ width: 4, height: 4, background: GBC_TEXT }} />
            <div style={{ width: 4, height: 4, background: GBC_TEXT }} />
          </div>
          <div style={{
            width: 12,
            height: 2,
            background: GBC_TEXT,
            clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)',
          }} />
        </div>
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
          fontSize: 8,
          color: GBC_TEXT,
        }}>
          <Typewriter text="WELCOME TO THE POKE CENTER!" speed={60} sound={false} />
        </span>
      </div>

      {/* Empty stash warning */}
      {inStock.length === 0 && (
        <div style={{
          ...pokeBox,
          padding: '14px',
        }}>
          <p style={{
            fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
            fontSize: 10,
            color: GBC_AMBER,
            marginBottom: 8,
          }}>
            YOUR BAG IS EMPTY!
          </p>
          <p style={{
            fontFamily: 'monospace',
            fontSize: 12,
            color: GBC_TEXT,
            opacity: 0.7,
            lineHeight: 1.6,
            margin: 0,
          }}>
            Add strains to your party in the Smokedex.
          </p>
        </div>
      )}

      {/* Party roster */}
      {inStock.length > 0 && (
        <div style={{ ...pokeBox, padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{
            fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
            fontSize: 9,
            color: GBC_GREEN,
            margin: 0,
          }}>
            YOUR PARTY ({inStock.length}/6)
          </p>
          <PartyRoster
            party={inStock}
            highlightId={phase === 'result' && result ? result.id : null}
          />
        </div>
      )}

      {/* Symptom selector */}
      <div style={{ ...pokeBox, padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{
          fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
          fontSize: 9,
          color: GBC_GREEN,
          margin: 0,
        }}>
          WHAT ARE YOUR SYMPTOMS?
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {ALL_SYMPTOMS.map((s) => {
            const active = selected.includes(s)
            return (
              <button
                key={s}
                onClick={() => toggleSymptom(s)}
                style={{
                  fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                  fontSize: 9,
                  padding: '6px 10px',
                  border: `2px solid ${active ? GBC_GREEN : GBC_DARKEST}`,
                  background: active ? 'rgba(132,204,22,0.12)' : 'transparent',
                  color: active ? GBC_GREEN : GBC_MUTED,
                  cursor: 'pointer',
                }}
              >
                {s}
              </button>
            )
          })}
        </div>
      </div>

      {/* Find match button */}
      <button
        onClick={handleFind}
        disabled={!hasSymptoms || inStock.length === 0 || phase === 'loading'}
        style={{
          fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
          fontSize: 12,
          padding: '12px',
          width: '100%',
          border: hasSymptoms && inStock.length > 0 && phase !== 'loading'
            ? `3px solid ${GBC_GREEN}`
            : `3px solid ${GBC_DARKEST}`,
          background: hasSymptoms && inStock.length > 0 && phase !== 'loading'
            ? GBC_GREEN
            : 'transparent',
          color: hasSymptoms && inStock.length > 0 && phase !== 'loading'
            ? GBC_BG
            : GBC_MUTED,
          cursor: hasSymptoms && inStock.length > 0 && phase !== 'loading'
            ? 'pointer'
            : 'not-allowed',
          boxShadow: hasSymptoms && inStock.length > 0 && phase !== 'loading'
            ? 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010'
            : 'none',
          flexShrink: 0,
        }}
      >
        {'\u25ba'} FIND MY MATCH
      </button>

      {/* Loading state */}
      {phase === 'loading' && (
        <div style={{
          ...pokeBox,
          padding: '28px 12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}>
          {/* Pokeball animation */}
          <style>{`
            @keyframes pokeball-spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
          <div style={{
            width: 40,
            height: 40,
            position: 'relative',
            animation: 'pokeball-spin 0.8s linear infinite',
            flexShrink: 0,
          }}>
            {/* Top half */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 40,
              height: 20,
              background: '#e84040',
              borderTop: '2px solid #c8e890',
              borderLeft: '2px solid #c8e890',
              borderRight: '2px solid #c8e890',
              boxSizing: 'border-box',
            }} />
            {/* Bottom half */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: 40,
              height: 20,
              background: GBC_TEXT,
              borderBottom: '2px solid #c8e890',
              borderLeft: '2px solid #c8e890',
              borderRight: '2px solid #c8e890',
              boxSizing: 'border-box',
            }} />
            {/* Center line */}
            <div style={{
              position: 'absolute',
              top: 18,
              left: 0,
              width: 40,
              height: 4,
              background: GBC_TEXT,
              border: 'none',
            }} />
            {/* Center circle */}
            <div style={{
              position: 'absolute',
              top: 14,
              left: 14,
              width: 12,
              height: 12,
              background: GBC_TEXT,
              border: `2px solid #c8e890`,
              boxSizing: 'border-box',
            }} />
          </div>
          <span
            className="gbc-blink"
            style={{
              fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
              fontSize: 12,
              color: GBC_GREEN,
            }}
          >
            I CHOOSE YOU...
          </span>
        </div>
      )}

      {/* Result card */}
      {phase === 'result' && result && (
        <div style={{
          ...pokeBox,
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <p style={{
            fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
            fontSize: 9,
            color: GBC_GREEN,
            margin: 0,
          }}>
            {'\u25ba'} I CHOOSE YOU...
          </p>

          {/* Sprite + name row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TypeSprite type={result.type} />
            <div>
              <p style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 12,
                color: typeColor(result.type),
                margin: 0,
                marginBottom: 4,
              }}>
                {result.name.toUpperCase()}
              </p>
              {result.type && (
                <span style={{
                  fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                  fontSize: 8,
                  border: `2px solid ${typeColor(result.type)}`,
                  color: typeColor(result.type),
                  padding: '2px 5px',
                }}>
                  {result.type.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* THC / CBD */}
          <div style={{
            fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
            fontSize: 9,
            color: GBC_MUTED,
          }}>
            THC: {result.thc != null ? `${result.thc}%` : '--'}
            {'  '}
            CBD: {result.cbd != null ? `${result.cbd}%` : '--'}
          </div>

          {/* Why */}
          <div>
            <p style={{
              fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
              fontSize: 8,
              color: GBC_MUTED,
              marginBottom: 6,
            }}>
              WHY:
            </p>
            <p style={{
              fontFamily: 'monospace',
              fontSize: 12,
              color: GBC_TEXT,
              lineHeight: 1.6,
              margin: 0,
            }}>
              {buildWhyText(result, selected)}
            </p>
          </div>

          {/* Terpenes from db */}
          {resultDbEntry?.terpenes && (
            <div style={{ borderTop: `1px solid ${GBC_DARKEST}`, paddingTop: 8 }}>
              <p style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 8,
                color: GBC_MUTED,
                marginBottom: 6,
              }}>
                TERPENES:
              </p>
              <p style={{
                fontFamily: 'monospace',
                fontSize: 12,
                color: GBC_TEXT,
                margin: 0,
                lineHeight: 1.6,
              }}>
                {resultDbEntry.terpenes}
              </p>
            </div>
          )}

          {/* Medical from db */}
          {resultDbEntry?.medical && (
            <div style={{ borderTop: `1px solid ${GBC_DARKEST}`, paddingTop: 8 }}>
              <p style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 8,
                color: GBC_MUTED,
                marginBottom: 6,
              }}>
                RX:
              </p>
              <p style={{
                fontFamily: 'monospace',
                fontSize: 12,
                color: GBC_TEXT,
                margin: 0,
                lineHeight: 1.6,
              }}>
                {resultDbEntry.medical}
              </p>
            </div>
          )}

          {/* Amount */}
          {result.amount && (
            <div style={{
              fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
              fontSize: 9,
              color: GBC_MUTED,
              borderTop: `1px solid ${GBC_DARKEST}`,
              paddingTop: 8,
            }}>
              AMOUNT REMAINING: {result.amount}
            </div>
          )}

          {/* Try another */}
          {ranked.length > 1 && (
            <button
              onClick={handleTryAnother}
              style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 10,
                padding: '10px',
                width: '100%',
                border: `3px solid ${GBC_DARKEST}`,
                background: 'transparent',
                color: GBC_MUTED,
                cursor: 'pointer',
                boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #1a3008',
                marginTop: 4,
              }}
            >
              {'\u25ba'} TRY ANOTHER
            </button>
          )}
        </div>
      )}

    </div>
    </>
  )
}
