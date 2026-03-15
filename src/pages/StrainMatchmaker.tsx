import { useState } from 'react'
import { useStrainDb, displayName } from '../hooks/useStrainDb'
import type { StrainRecord } from '../hooks/useStrainDb'

const situationTags = [
  { label: 'SLEEP' },
  { label: 'FOCUS' },
  { label: 'ENERGY' },
  { label: 'SOCIAL' },
  { label: 'CREATIVE' },
  { label: 'RELAXATION' },
  { label: 'OUTDOORS' },
  { label: 'SPIRITUAL' },
]

const TAG_EFFECTS: Record<string, string[]> = {
  SLEEP:      ['sleepy', 'relaxed', 'drowsy'],
  FOCUS:      ['focused', 'uplifted', 'energetic', 'clear-headed'],
  ENERGY:     ['energetic', 'uplifted', 'happy', 'tingly'],
  SOCIAL:     ['talkative', 'happy', 'euphoric', 'giggly'],
  CREATIVE:   ['creative', 'uplifted', 'energetic'],
  RELAXATION: ['relaxed', 'calm', 'euphoric', 'happy'],
  OUTDOORS:   ['energetic', 'happy', 'uplifted', 'tingly'],
  SPIRITUAL:  ['euphoric', 'uplifted', 'happy', 'creative'],
}

const KEYWORD_EFFECTS: [RegExp, string[]][] = [
  [/sleep|insomnia|tired|rest/i, ['sleepy', 'relaxed']],
  [/focus|work|study|concentrate/i, ['focused', 'uplifted']],
  [/creat|art|paint|music|write/i, ['creative', 'uplifted']],
  [/social|party|friend|talk/i, ['talkative', 'happy', 'euphoric']],
  [/relax|stress|calm|chill/i, ['relaxed', 'euphoric']],
  [/energy|active|exercise|motivat/i, ['energetic', 'uplifted']],
  [/pain|ache|hurt/i, ['relaxed', 'sleepy']],
  [/happy|mood|laugh|fun/i, ['happy', 'euphoric', 'giggly']],
  [/anxi|nerv|worry/i, ['relaxed', 'calm', 'euphoric']],
  [/depress/i, ['happy', 'uplifted', 'euphoric']],
]

// Terpene → effects mapping (science-based)
const TERPENE_EFFECTS: Record<string, string[]> = {
  myrcene:       ['relaxed', 'sleepy', 'pain relief'],
  limonene:      ['uplifted', 'happy', 'energetic'],
  caryophyllene: ['relaxed', 'focused', 'pain relief'],
  linalool:      ['sleepy', 'relaxed', 'calm'],
  pinene:        ['focused', 'energetic', 'alert'],
  terpinolene:   ['creative', 'uplifted', 'energetic'],
  humulene:      ['relaxed', 'focused'],
  ocimene:       ['uplifted', 'energetic'],
  bisabolol:     ['calm', 'relaxed'],
  valencene:     ['uplifted', 'energetic'],
}

function parseTerpeneList(terpenes: string): string[] {
  return terpenes
    .split(/[,;]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
}

function scoreStrain(strain: StrainRecord, desiredEffects: string[]): number {
  if (desiredEffects.length === 0) return 0

  // --- Effects tag score (weight 0.4) ---
  const strainEffects = strain.Effects.toLowerCase().split(',').map((e) => e.trim())
  const effectMatches = desiredEffects.filter((e) => strainEffects.includes(e)).length
  const effectScore = effectMatches / Math.max(desiredEffects.length, 1)

  // --- Terpene score (weight 0.4) ---
  let terpeneScore = 0
  if (strain.terpenes) {
    const terpeneList = parseTerpeneList(strain.terpenes)
    let terpeneMatches = 0
    let totalTerpeneEffects = 0
    for (const terp of terpeneList.slice(0, 5)) {
      const terpEffects = TERPENE_EFFECTS[terp] ?? []
      const m = terpEffects.filter((e) => desiredEffects.includes(e)).length
      terpeneMatches += m
      totalTerpeneEffects += terpEffects.length
    }
    if (totalTerpeneEffects > 0) {
      terpeneScore = terpeneMatches / Math.max(desiredEffects.length, 1)
    }
  }

  // --- THC/CBD ratio bonus (weight 0.2) ---
  let ratioBonus = 0
  if (strain.thc != null) {
    const wantsSleep = desiredEffects.some((e) => ['sleepy', 'relaxed', 'calm', 'pain relief'].includes(e))
    const wantsEnergy = desiredEffects.some((e) => ['energetic', 'uplifted', 'focused', 'alert'].includes(e))
    const thc = strain.thc
    const cbd = strain.cbd ?? 0
    const ratio = cbd > 0 ? thc / cbd : thc / 0.1

    if (wantsSleep && thc > 18) ratioBonus = 0.6
    else if (wantsSleep && cbd > 5) ratioBonus = 0.8
    else if (wantsEnergy && thc > 20 && thc < 28) ratioBonus = 0.7
    else if (wantsEnergy && ratio > 20) ratioBonus = 0.5
    else ratioBonus = 0.3
  }

  const combined = effectScore * 0.4 + terpeneScore * 0.4 + ratioBonus * 0.2
  const ratingBonus = (strain.Rating / 5) * 0.15

  return Math.round(Math.min((combined * 0.85 + ratingBonus) * 100, 99))
}

interface ResultStrain {
  name: string
  type: string
  typeColor: string
  effects: string[]
  flavors: string[]
  description: string
  rating: number
  match: number
  terpenes: string[]
  thc?: number
  cbd?: number
  medical?: string
}

const GBC_GREEN = '#84cc16'
const GBC_MUTED = '#4a7a10'
const GBC_DARKEST = '#2a4a08'
const GBC_TEXT = '#c8e890'
const TOTAL_BOXES = 10

const pokeBox = {
  border: '3px solid #84cc16',
  boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
  background: '#0a1408',
}

function PixelBar({ filled, total = TOTAL_BOXES }: { filled: number; total?: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 10,
            height: 14,
            background: i < filled ? GBC_GREEN : '#1a3004',
            border: `1px solid ${i < filled ? GBC_MUTED : '#1a2e08'}`,
          }}
        />
      ))}
    </div>
  )
}

function LoadingPixelBar() {
  const [frame] = useState(() => Math.floor(Date.now() / 200) % TOTAL_BOXES)
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {Array.from({ length: TOTAL_BOXES }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 9,
            height: 14,
            background: i === frame ? GBC_GREEN : GBC_DARKEST,
            border: `1px solid ${i === frame ? GBC_MUTED : '#1a2e08'}`,
          }}
        />
      ))}
    </div>
  )
}

export default function StrainMatchmaker() {
  const { db } = useStrainDb()
  const [situation, setSituation] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ResultStrain[] | null>(null)
  const [textareaFocused, setTextareaFocused] = useState(false)

  const toggleTag = (label: string) => {
    setSelectedTags((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    )
  }

  const canSearch = situation.trim().length > 0 || selectedTags.length > 0

  const handleSearch = () => {
    if (!canSearch) return
    setLoading(true)
    setResults(null)

    const desired = new Set<string>()
    selectedTags.forEach((tag) => TAG_EFFECTS[tag]?.forEach((e) => desired.add(e)))
    KEYWORD_EFFECTS.forEach(([re, effects]) => {
      if (re.test(situation)) effects.forEach((e) => desired.add(e))
    })

    if (desired.size === 0) {
      ['happy', 'relaxed', 'euphoric'].forEach((e) => desired.add(e))
    }

    const desiredArr = Array.from(desired)

    setTimeout(() => {
      const scored = db
        .map((s) => ({ strain: s, score: scoreStrain(s, desiredArr) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)

      setResults(
        scored.map((x) => {
          const terpeneList = x.strain.terpenes
            ? parseTerpeneList(x.strain.terpenes).slice(0, 3)
            : []
          return {
            name: displayName(x.strain),
            type: x.strain.Type,
            typeColor:
              x.strain.Type === 'sativa'
                ? '#84cc16'
                : x.strain.Type === 'indica'
                ? '#a78bfa'
                : '#f59e0b',
            effects: x.strain.Effects.split(',').map((e) => e.trim()).slice(0, 4),
            flavors: x.strain.Flavor.split(',').map((f) => f.trim()).slice(0, 3),
            description:
              x.strain.Description.slice(0, 200) +
              (x.strain.Description.length > 200 ? '...' : ''),
            rating: x.strain.Rating,
            match: x.score,
            terpenes: terpeneList,
            thc: x.strain.thc,
            cbd: x.strain.cbd,
            medical: x.strain.medical,
          }
        })
      )
      setLoading(false)
    }, 1200)
  }

  return (
    <div style={{
      minHeight: '100%',
      padding: '10px',
      background: '#050a04',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      boxSizing: 'border-box',
    }}>

      {/* Title box */}
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
          STRAIN MATCH
        </span>
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
          fontSize: 8,
          color: GBC_MUTED,
          border: `1px solid ${GBC_MUTED}`,
          padding: '2px 6px',
        }}>
          [AI]
        </span>
      </div>

      {/* Input poke-box */}
      <div style={{
        ...pokeBox,
        padding: '12px',
        flexShrink: 0,
      }}>
        {/* Textarea */}
        <div style={{ marginBottom: 0 }}>
          <label style={{
            fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
            fontSize: 9,
            color: GBC_MUTED,
            display: 'block',
            marginBottom: 8,
          }}>
            DESCRIBE YOUR SITUATION:
          </label>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="e.g. I want to paint for a few hours..."
            rows={3}
            style={{
              width: '100%',
              background: '#050a04',
              border: `2px solid ${textareaFocused ? '#4a8a10' : '#2a4a08'}`,
              color: GBC_TEXT,
              fontSize: 13,
              fontFamily: 'monospace',
              padding: '10px',
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={() => setTextareaFocused(true)}
            onBlur={() => setTextareaFocused(false)}
          />
        </div>

        {/* Quick tags */}
        <div style={{ marginTop: 10 }}>
          <p style={{
            fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
            fontSize: 9,
            color: GBC_MUTED,
            marginBottom: 8,
          }}>
            QUICK TAGS:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {situationTags.map(({ label }) => {
              const active = selectedTags.includes(label)
              return (
                <button
                  key={label}
                  onClick={() => toggleTag(label)}
                  style={{
                    fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                    fontSize: 9,
                    padding: '5px 10px',
                    border: `2px solid ${active ? GBC_GREEN : '#2a4a08'}`,
                    background: active ? 'rgba(132,204,22,0.12)' : 'transparent',
                    color: active ? GBC_GREEN : GBC_MUTED,
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Find match button */}
        <button
          onClick={handleSearch}
          disabled={!canSearch || loading}
          style={{
            marginTop: 12,
            width: '100%',
            fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
            fontSize: 12,
            padding: 12,
            background: canSearch && !loading ? GBC_GREEN : 'transparent',
            color: canSearch && !loading ? '#050a04' : GBC_MUTED,
            border: `3px solid ${canSearch && !loading ? GBC_GREEN : '#2a4a08'}`,
            boxShadow: canSearch && !loading
              ? 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010'
              : 'none',
            cursor: canSearch && !loading ? 'pointer' : 'not-allowed',
          }}
        >
          {loading ? 'SEARCHING...' : '► FIND MATCH'}
        </button>
      </div>

      {/* Results area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Loading state */}
        {loading && (
          <div style={{
            ...pokeBox,
            padding: '24px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            minHeight: 120,
          }}>
            <span
              className="gbc-blink"
              style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 14,
                color: GBC_GREEN,
              }}
            >
              SEARCHING...
            </span>
            <LoadingPixelBar />
          </div>
        )}

        {/* Empty state */}
        {!results && !loading && (
          <div style={{
            ...pokeBox,
            padding: '32px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            minHeight: 120,
          }}>
            <p style={{
              fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
              fontSize: 12,
              color: '#2a4a08',
            }}>
              AWAITING INPUT
            </p>
            <p style={{
              fontFamily: 'monospace',
              fontSize: 11,
              color: '#1a3004',
            }}>
              Results will appear here
            </p>
          </div>
        )}

        {/* Results */}
        {results && results.map((s, i) => {
          const filledBoxes = Math.round((s.match / 100) * TOTAL_BOXES)
          return (
            <div
              key={s.name}
              style={{
                ...pokeBox,
                padding: '12px',
              }}
            >
              {/* Header row */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 8,
                borderBottom: '1px solid #1a3004',
                paddingBottom: 8,
                marginBottom: 8,
              }}>
                <span style={{
                  fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                  fontSize: 13,
                  color: GBC_GREEN,
                }}>
                  #{String(i + 1).padStart(2, '0')} {s.name.toUpperCase()}
                </span>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{
                    fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                    fontSize: 20,
                    color: GBC_GREEN,
                    lineHeight: 1,
                    display: 'block',
                  }}>
                    {s.match}%
                  </span>
                  <span style={{
                    fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                    fontSize: 8,
                    color: GBC_MUTED,
                    display: 'block',
                    marginTop: 2,
                  }}>
                    MATCH
                  </span>
                </div>
              </div>

              {/* Type badge + THC/CBD stat line */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                  fontSize: 9,
                  border: `2px solid ${s.typeColor}`,
                  color: s.typeColor,
                  padding: '2px 6px',
                }}>
                  {s.type.toUpperCase()}
                </span>
                {(s.thc != null || s.cbd != null) && (
                  <span style={{
                    fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                    fontSize: 8,
                    color: GBC_MUTED,
                  }}>
                    {s.thc != null ? `THC: ${s.thc}%` : ''}
                    {s.thc != null && s.cbd != null ? ' · ' : ''}
                    {s.cbd != null ? `CBD: ${s.cbd}%` : ''}
                  </span>
                )}
              </div>

              {/* HP pixel bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                  fontSize: 9,
                  color: GBC_MUTED,
                  flexShrink: 0,
                }}>
                  HP
                </span>
                <PixelBar filled={filledBoxes} />
              </div>

              {/* Terpene tags */}
              {s.terpenes.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                    fontSize: 8,
                    color: GBC_MUTED,
                  }}>
                    TERPS:
                  </span>
                  {s.terpenes.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                        fontSize: 8,
                        padding: '2px 5px',
                        border: '1px solid #1e4a08',
                        color: '#5a9a18',
                        background: '#0a1408',
                      }}
                    >
                      {t.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <p style={{
                fontFamily: 'monospace',
                fontSize: 12,
                color: GBC_TEXT,
                opacity: 0.75,
                lineHeight: 1.6,
                marginTop: 8,
                marginBottom: 8,
              }}>
                {s.description}
              </p>

              {/* Effects tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                {s.effects.map((e) => (
                  <span
                    key={e}
                    style={{
                      fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                      fontSize: 9,
                      padding: '2px 6px',
                      border: `1px solid ${GBC_DARKEST}`,
                      color: GBC_TEXT,
                    }}
                  >
                    {e.toUpperCase()}
                  </span>
                ))}
              </div>

              {/* Medical uses */}
              {s.medical && (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                    fontSize: 8,
                    color: GBC_MUTED,
                    flexShrink: 0,
                  }}>
                    RX:
                  </span>
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: 11,
                    color: GBC_MUTED,
                  }}>
                    {s.medical}
                  </span>
                </div>
              )}

              {/* Flavours */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <span style={{
                  fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                  fontSize: 8,
                  color: GBC_MUTED,
                  marginRight: 4,
                }}>
                  FLAVOURS:
                </span>
                {s.flavors.map((f) => (
                  <span
                    key={f}
                    style={{
                      fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                      fontSize: 9,
                      color: GBC_MUTED,
                    }}
                  >
                    #{f}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
