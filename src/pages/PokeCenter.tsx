import { useState, useEffect, useCallback } from 'react'
import { useStash } from '../context/StashContext'
import type { StrainEntry } from '../context/StashContext'
import Typewriter from '../components/Typewriter'

// ── Building-entry transition ─────────────────────────────────────────────────

const STRIP_COUNT = 10

function TrainerSprite({ bobbing }: { bobbing: boolean }) {
  // GBC-style female trainer (Kris/Crystal protagonist)
  const [legPhase, setLegPhase] = useState(0)
  useEffect(() => {
    if (!bobbing) return
    const id = setInterval(() => setLegPhase((p) => (p + 1) % 4), 120)
    return () => clearInterval(id)
  }, [bobbing])
  const leftLegDown  = legPhase === 0 || legPhase === 1
  const rightLegDown = legPhase === 2 || legPhase === 3
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      {/* Hair buns — sit above the head */}
      <div style={{ display: 'flex', gap: 6, marginBottom: -1 }}>
        <div style={{ width: 6, height: 6, background: '#3a1808', border: '1px solid #1a0808' }} />
        <div style={{ width: 6, height: 6, background: '#3a1808', border: '1px solid #1a0808' }} />
      </div>
      {/* Head */}
      <div style={{ width: 14, height: 11, background: '#d4a870', border: '1px solid #a07848', position: 'relative' }}>
        {/* fringe */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#3a1808' }} />
        {/* eyes */}
        <div style={{ position: 'absolute', bottom: 2, left: 3, width: 2, height: 2, background: '#301808' }} />
        <div style={{ position: 'absolute', bottom: 2, right: 3, width: 2, height: 2, background: '#301808' }} />
      </div>
      {/* Torso — white top with teal trim (Kris colours) */}
      <div style={{ width: 16, height: 12, background: '#e8f8f8', border: '1px solid #a0c8c8', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#40b8b8' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: '#40b8b8' }} />
      </div>
      {/* Skirt */}
      <div style={{ width: 18, height: 7, background: '#40b8b8', border: '1px solid #20a0a0' }} />
      {/* Legs */}
      <div style={{ display: 'flex', gap: 2 }}>
        <div style={{ width: 6, height: leftLegDown ? 8 : 6, background: '#d4a870', border: '1px solid #a07848', alignSelf: 'flex-end' }} />
        <div style={{ width: 6, height: rightLegDown ? 8 : 6, background: '#d4a870', border: '1px solid #a07848', alignSelf: 'flex-end' }} />
      </div>
      {/* Boots */}
      <div style={{ display: 'flex', gap: 2 }}>
        <div style={{ width: 6, height: 4, background: '#182848', border: '1px solid #0e1830' }} />
        <div style={{ width: 6, height: 4, background: '#182848', border: '1px solid #0e1830' }} />
      </div>
    </div>
  )
}

function PCBuilding() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Roof */}
      <div style={{ width: 120, height: 20, background: '#e05080', border: '2px solid #b03060', position: 'relative' }}>
        {/* Cross symbol */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 14, height: 4, background: '#fff' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 4, height: 14, background: '#fff' }} />
      </div>
      {/* Sign */}
      <div style={{ width: 90, height: 10, background: '#c03060', border: '1px solid #903050', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "'Press Start 2P'", fontSize: 5, color: '#fff', letterSpacing: 0.5 }}>POKEMON CENTER</span>
      </div>
      {/* Walls */}
      <div style={{ width: 120, height: 36, background: '#f0e8d0', border: '2px solid #c0b8a0', borderTop: 'none', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
        {/* Windows */}
        <div style={{ position: 'absolute', top: 6, left: 14, width: 18, height: 16, background: '#a0d0f0', border: '2px solid #80b0d0' }} />
        <div style={{ position: 'absolute', top: 6, right: 14, width: 18, height: 16, background: '#a0d0f0', border: '2px solid #80b0d0' }} />
        {/* Door */}
        <div style={{ width: 24, height: 30, background: '#e84040', border: '2px solid #c02020', marginBottom: 0 }} />
      </div>
      {/* Steps */}
      <div style={{ width: 130, height: 6, background: '#d0c8b0', border: '1px solid #a0a090' }} />
      <div style={{ width: 140, height: 4, background: '#c0b8a0', border: '1px solid #909080' }} />
    </div>
  )
}

type EntryPhase = 'walk' | 'wipe' | 'done'

function BuildingEntry({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<EntryPhase>('walk')
  const [charY, setCharY] = useState(0)   // 0 = bottom, 1 = arrived at door

  const stableDone = useCallback(onDone, [])  // stable ref

  useEffect(() => {
    // Walk toward building
    const t1 = setTimeout(() => setCharY(1), 50)
    // Start wipe strips
    const t2 = setTimeout(() => setPhase('wipe'), 900)
    // Done
    const t3 = setTimeout(() => { setPhase('done'); stableDone() }, 1500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [stableDone])

  if (phase === 'done') return null

  return (
    <>
      <style>{`
        @keyframes strip-from-left {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        @keyframes strip-from-right {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#050a04',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
        paddingBottom: 40,
        overflow: 'hidden',
      }}>
        {/* Building at top */}
        <div style={{
          position: 'absolute', top: 24, left: 0, right: 0,
          display: 'flex', justifyContent: 'center',
        }}>
          <PCBuilding />
        </div>

        {/* Path / ground */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
          background: 'repeating-linear-gradient(0deg, #0a1a06 0px, #0a1a06 2px, #071204 2px, #071204 8px)',
        }} />

        {/* Trainer sprite — slides up toward the building */}
        <div style={{
          position: 'absolute',
          bottom: charY === 0 ? 60 : 160,
          left: '50%', transform: 'translateX(-50%)',
          transition: 'bottom 0.85s linear',
          zIndex: 10,
        }}>
          <TrainerSprite bobbing={phase === 'walk'} />
        </div>

        {/* Venetian wipe strips */}
        {phase === 'wipe' && Array.from({ length: STRIP_COUNT }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: `${(i / STRIP_COUNT) * 100}%`,
              left: 0, right: 0,
              height: `${100 / STRIP_COUNT}%`,
              background: '#0a0a0a',
              animation: `${i % 2 === 0 ? 'strip-from-left' : 'strip-from-right'} 0.35s ease-in both`,
              animationDelay: `${i * 0.025}s`,
            }}
          />
        ))}
      </div>
    </>
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

type PhaseState = 'idle' | 'loading' | 'result'

export default function PokeCenter() {
  const { strains } = useStash()
  const [entered, setEntered] = useState(false)
  const [selected, setSelected] = useState<Symptom[]>([])
  const [phase, setPhase] = useState<PhaseState>('idle')
  const [resultIndex, setResultIndex] = useState(0)
  const [ranked, setRanked] = useState<StrainEntry[]>([])

  const inStock = strains.filter((s) => s.inStock)
  const hasSymptoms = selected.length > 0

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

  const result = ranked[resultIndex] ?? null

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
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 13,
          color: GBC_GREEN,
        }}>
          POKE CENTER
        </span>
        <span style={{
          fontFamily: "'Press Start 2P', monospace",
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
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 8,
          color: GBC_TEXT,
        }}>
          <Typewriter text="WELCOME TO THE POKE CENTER!" speed={60} sound />
        </span>
      </div>

      {/* Empty stash warning */}
      {inStock.length === 0 && (
        <div style={{
          ...pokeBox,
          padding: '14px',
        }}>
          <p style={{
            fontFamily: "'Press Start 2P', monospace",
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

      {/* Symptom selector */}
      <div style={{ ...pokeBox, padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{
          fontFamily: "'Press Start 2P', monospace",
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
                  fontFamily: "'Press Start 2P', monospace",
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
          fontFamily: "'Press Start 2P', monospace",
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
              fontFamily: "'Press Start 2P', monospace",
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
            fontFamily: "'Press Start 2P', monospace",
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
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 12,
                color: typeColor(result.type),
                margin: 0,
                marginBottom: 4,
              }}>
                {result.name.toUpperCase()}
              </p>
              {result.type && (
                <span style={{
                  fontFamily: "'Press Start 2P', monospace",
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
            fontFamily: "'Press Start 2P', monospace",
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
              fontFamily: "'Press Start 2P', monospace",
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

          {/* Amount */}
          {result.amount && (
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
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
                fontFamily: "'Press Start 2P', monospace",
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
