import { useState, useRef, useMemo, useEffect } from 'react'
import Tesseract from 'tesseract.js'
import { useStash } from '../context/StashContext'
import type { StrainEntry } from '../context/StashContext'
import { useStrainDb, displayName } from '../hooks/useStrainDb'
import type { StrainRecord } from '../hooks/useStrainDb'

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

const inputBase = {
  background: GBC_BG,
  border: `2px solid ${GBC_DARKEST}`,
  color: GBC_TEXT,
  fontFamily: 'monospace',
  fontSize: 13,
  padding: '8px',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box' as const,
}

function typeColor(type?: StrainEntry['type']): string {
  if (type === 'sativa') return GBC_GREEN
  if (type === 'indica') return GBC_VIOLET
  if (type === 'hybrid') return GBC_AMBER
  return GBC_MUTED
}

const BALL_SPRITES: Record<string, string> = {
  sativa: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
  hybrid: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png',
  indica: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png',
}

function TypeSprite({ type, size = 24 }: { type?: StrainEntry['type']; size?: number }) {
  const src = type ? BALL_SPRITES[type] : BALL_SPRITES['hybrid']
  return (
    <img
      src={src}
      alt={type ?? 'unknown'}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
        flexShrink: 0,
        display: 'block',
      }}
    />
  )
}

function StashList({
  strains,
  db,
  onDelete,
}: {
  strains: StrainEntry[]
  db: StrainRecord[]
  onDelete: (id: string) => void
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const lookupDb = (name: string) => {
    const norm = name.toLowerCase().replace(/[^a-z0-9]/g, '')
    return db.find((d) => String(d.Strain).toLowerCase().replace(/[^a-z0-9]/g, '') === norm)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {strains.map((s) => {
        const dbe = lookupDb(s.name)
        const col = typeColor(s.type)
        const thc = s.thc ?? dbe?.thc
        const cbd = s.cbd ?? dbe?.cbd
        const fill = thc != null ? Math.min(thc / 40, 1) : 1

        return (
          <div key={s.id} style={{ ...pokeBox, padding: '14px' }}>

            {/* Row 1: sprite + name + delete */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <TypeSprite type={s.type} />
              <span style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 13,
                color: col,
                flex: 1,
                lineHeight: 1.5,
                wordBreak: 'break-word',
              }}>
                {s.name.toUpperCase()}
              </span>
              {confirmDeleteId === s.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, color: GBC_AMBER }}>RELEASE?</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => { onDelete(s.id); setConfirmDeleteId(null) }}
                      style={{ background: 'transparent', border: `1px solid ${GBC_AMBER}`, color: GBC_AMBER, fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, padding: '6px 10px', cursor: 'pointer', minHeight: 44 }}
                    >YES</button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      style={{ background: 'transparent', border: `1px solid ${GBC_DARKEST}`, color: GBC_MUTED, fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, padding: '6px 10px', cursor: 'pointer', minHeight: 44 }}
                    >NO</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(s.id)}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${GBC_DARKEST}`,
                    color: GBC_MUTED,
                    fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                    fontSize: 9,
                    padding: '6px 8px',
                    cursor: 'pointer',
                    flexShrink: 0,
                    minWidth: 44,
                    minHeight: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  [x]
                </button>
              )}
            </div>

            {/* Row 2: HP bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, color: GBC_MUTED, flexShrink: 0 }}>HP</span>
              <div style={{ flex: 1, height: 8, background: '#0a1e04', border: '1px solid #1a3a08', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${fill * 100}%`, background: GBC_GREEN }} />
              </div>
              <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, color: GBC_TEXT, flexShrink: 0 }}>
                {thc != null ? `${thc}%` : '--'}
              </span>
            </div>

            {/* Row 3: type badge + stock + CBD */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              {s.type && (
                <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, border: `2px solid ${col}`, color: col, padding: '3px 6px' }}>
                  {s.type.toUpperCase()}
                </span>
              )}
              <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, color: s.inStock ? GBC_GREEN : GBC_MUTED }}>
                {s.inStock ? '● IN STOCK' : '○ OUT'}
              </span>
              {cbd != null && (
                <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, color: GBC_MUTED }}>
                  CBD {cbd}%
                </span>
              )}
            </div>

            {/* Row 4: medical uses */}
            {dbe?.medical && (
              <div style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_MUTED, lineHeight: 1.5, marginBottom: 6 }}>
                RX: {dbe.medical}
              </div>
            )}

            {/* Row 5: terpenes */}
            {dbe?.terpenes && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                {dbe.terpenes.split(/[,;]+/).map((t) => t.trim()).filter(Boolean).slice(0, 4).map((t) => (
                  <span key={t} style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, padding: '2px 5px', border: '1px solid #1e4a08', color: '#5a9a18' }}>
                    {t.toUpperCase()}
                  </span>
                ))}
              </div>
            )}

            {/* Row 6: notes */}
            {s.notes && (
              <div style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT, opacity: 0.7, lineHeight: 1.5 }}>
                {s.notes}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Party View ──────────────────────────────────────────────────────────────

function PartyView({
  party,
  db,
  onDelete,
}: {
  party: StrainEntry[]
  db: StrainRecord[]
  onDelete: (id: string) => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(party[0]?.id ?? null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const lookupDb = (name: string) => {
    const norm = name.toLowerCase().replace(/[^a-z0-9]/g, '')
    return db.find((d) => String(d.Strain).toLowerCase().replace(/[^a-z0-9]/g, '') === norm)
  }

  const selected = party.find((s) => s.id === selectedId) ?? party[0] ?? null
  const selDb = selected ? lookupDb(selected.name) : undefined

  if (party.length === 0) {
    return (
      <div style={{ ...pokeBox, padding: '32px 12px', textAlign: 'center' }}>
        <p style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 11, color: GBC_MUTED }}>
          PARTY EMPTY
        </p>
        <p style={{ fontFamily: 'monospace', fontSize: 13, color: GBC_MUTED, marginTop: 10, lineHeight: 1.6 }}>
          Mark a strain as IN STOCK to add it to your party.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Selected strain — expanded card */}
      {selected && (
        <div style={{ ...pokeBox, padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <TypeSprite type={selected.type} />
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 14,
                color: typeColor(selected.type),
                lineHeight: 1.5,
                wordBreak: 'break-word',
              }}>
                {selected.name.toUpperCase()}
              </div>
              {selected.type && (
                <span style={{
                  fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                  fontSize: 9,
                  border: `2px solid ${typeColor(selected.type)}`,
                  color: typeColor(selected.type),
                  padding: '2px 6px',
                  display: 'inline-block',
                  marginTop: 6,
                }}>
                  {selected.type.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* HP bar */}
          {(() => {
            const thc = selected.thc ?? selDb?.thc
            const fill = thc != null ? Math.min(thc / 40, 1) : 1
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, color: GBC_MUTED, flexShrink: 0 }}>HP</span>
                <div style={{ flex: 1, height: 8, background: '#0a1e04', border: '1px solid #1a3a08', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${fill * 100}%`, background: GBC_GREEN }} />
                </div>
                <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 10, color: GBC_TEXT, flexShrink: 0 }}>
                  {thc != null ? `${thc}%` : '--'}
                </span>
              </div>
            )
          })()}

          {/* CBD / medical / terpenes */}
          {(selected.cbd ?? selDb?.cbd) != null && (
            <div style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, color: GBC_MUTED, marginBottom: 6 }}>
              CBD {selected.cbd ?? selDb?.cbd}%
            </div>
          )}
          {selDb?.medical && (
            <div style={{ fontFamily: 'monospace', fontSize: 13, color: GBC_MUTED, lineHeight: 1.5, marginBottom: 6 }}>
              RX: {selDb.medical}
            </div>
          )}
          {selDb?.terpenes && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
              {selDb.terpenes.split(/[,;]+/).map((t) => t.trim()).filter(Boolean).slice(0, 4).map((t) => (
                <span key={t} style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, padding: '2px 5px', border: '1px solid #1e4a08', color: '#5a9a18' }}>
                  {t.toUpperCase()}
                </span>
              ))}
            </div>
          )}
          {selected.notes && (
            <div style={{ fontFamily: 'monospace', fontSize: 13, color: GBC_TEXT, opacity: 0.7, lineHeight: 1.5 }}>
              {selected.notes}
            </div>
          )}
        </div>
      )}

      {/* Party roster rows */}
      <div style={{ ...pokeBox, overflow: 'hidden' }}>
        {party.map((s, i) => {
          const dbe = lookupDb(s.name)
          const thc = s.thc ?? dbe?.thc
          const fill = thc != null ? Math.min(thc / 40, 1) : 1
          const col = typeColor(s.type)
          const isSelected = s.id === selected?.id
          return (
            <div
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                borderBottom: i < party.length - 1 ? `1px solid ${GBC_DARKEST}` : 'none',
                background: isSelected ? 'rgba(132,204,22,0.1)' : 'transparent',
                borderLeft: isSelected ? `4px solid ${GBC_GREEN}` : '4px solid transparent',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <TypeSprite type={s.type} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                  fontSize: 11,
                  color: isSelected ? GBC_GREEN : col,
                  marginBottom: 5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {isSelected ? '► ' : ''}{s.name.toUpperCase()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 80, height: 6, background: '#0a1e04', border: '1px solid #1a3a08', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${fill * 100}%`, background: GBC_GREEN }} />
                  </div>
                  <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, color: GBC_MUTED }}>
                    {thc != null ? `${thc}%` : '--'}
                  </span>
                </div>
              </div>
              {confirmDeleteId === s.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, color: GBC_AMBER }}>RELEASE?</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(s.id); setConfirmDeleteId(null) }}
                      style={{ background: 'transparent', border: `1px solid ${GBC_AMBER}`, color: GBC_AMBER, fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, padding: '6px 10px', cursor: 'pointer', minHeight: 44, WebkitTapHighlightColor: 'transparent' as unknown as string }}
                    >YES</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null) }}
                      style={{ background: 'transparent', border: `1px solid ${GBC_DARKEST}`, color: GBC_MUTED, fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, padding: '6px 10px', cursor: 'pointer', minHeight: 44, WebkitTapHighlightColor: 'transparent' as unknown as string }}
                    >NO</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(s.id) }}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${GBC_DARKEST}`,
                    color: GBC_MUTED,
                    fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                    fontSize: 9,
                    padding: '8px 10px',
                    cursor: 'pointer',
                    minWidth: 44,
                    minHeight: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    WebkitTapHighlightColor: 'transparent' as unknown as string,
                  }}
                >
                  [x]
                </button>
              )}
            </div>
          )
        })}
      </div>

      {party.length >= 6 && (
        <div style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, color: GBC_AMBER, textAlign: 'center', padding: '6px 0' }}>
          PARTY FULL (6/6)
        </div>
      )}
    </div>
  )
}

// ─── Strain Dex ──────────────────────────────────────────────────────────────

type DexCategory = {
  label: string
  color: string
  filter: (s: StrainRecord) => boolean
}

const DEX_CATEGORIES: DexCategory[] = [
  { label: 'ALL',       color: GBC_GREEN,  filter: () => true },
  { label: 'DAYTIME',   color: '#f0e040',  filter: (s) => /energetic|uplifted|tingly|alert/i.test(s.Effects) },
  { label: 'NIGHTTIME', color: GBC_VIOLET, filter: (s) => /sleepy|drowsy/i.test(s.Effects) },
  { label: 'RELAXED',   color: '#60c8f0',  filter: (s) => /relaxed|calm/i.test(s.Effects) },
  { label: 'CREATIVE',  color: GBC_AMBER,  filter: (s) => /creative/i.test(s.Effects) },
  { label: 'FOCUSED',   color: '#a0e860',  filter: (s) => /focused|clear-headed/i.test(s.Effects) },
  { label: 'SOCIAL',    color: '#f080c0',  filter: (s) => /talkative|giggly/i.test(s.Effects) },
  { label: 'PAIN',      color: '#e06060',  filter: (s) => /pain/i.test(s.medical || '') },
  { label: 'ANXIETY',   color: '#c0a0f0',  filter: (s) => /anxiety|stress/i.test(s.medical || '') },
  { label: 'SLEEP',     color: '#8080f0',  filter: (s) => /insomnia|sleep/i.test(s.medical || '') },
  { label: 'MYRCENE',   color: '#5a9a18',  filter: (s) => /myrcene/i.test(s.terpenes || '') || (/relaxed/i.test(s.Effects) && /sleepy/i.test(s.Effects)) },
  { label: 'LIMONENE',  color: '#e8d020',  filter: (s) => /limonene/i.test(s.terpenes || '') || (/uplifted/i.test(s.Effects) && /happy/i.test(s.Effects) && /energetic/i.test(s.Effects)) },
  { label: 'PINENE',    color: '#40c880',  filter: (s) => /pinene/i.test(s.terpenes || '') || (/focused/i.test(s.Effects) && /energetic/i.test(s.Effects)) },
]

// ── Strain detail view ────────────────────────────────────────────────────────

const PAGE_SIZE = 20
type SortKey = 'az' | 'thc' | 'rating'

function scoreResult(s: StrainRecord, words: string[]): number {
  if (words.length === 0) return 1
  const name = displayName(s).toLowerCase()
  const effects = s.Effects.toLowerCase()
  const medical = (s.medical || '').toLowerCase()
  const terpenes = (s.terpenes || '').toLowerCase()
  const flavor = (s.Flavor || '').toLowerCase()
  const type = s.Type.toLowerCase()
  let total = 0
  for (const word of words) {
    if (name === word)              total += 100
    else if (name.startsWith(word)) total += 80
    else if (name.includes(word))   total += 60
    else if (type.includes(word))   total += 35
    else if (effects.includes(word)) total += 30
    else if (terpenes.includes(word)) total += 25
    else if (medical.includes(word)) total += 20
    else if (flavor.includes(word)) total += 15
    else return 0  // word matched nothing — exclude result
  }
  return total
}

function StrainDetail({ strain, onBack }: { strain: StrainRecord; onBack: () => void }) {
  const { strains, addStrain } = useStash()
  const [added, setAdded] = useState(false)
  const col = strain.Type === 'sativa' ? GBC_GREEN : strain.Type === 'indica' ? GBC_VIOLET : GBC_AMBER
  const LABEL: React.CSSProperties = { fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, color: GBC_MUTED, display: 'block', marginBottom: 4 }
  const VALUE: React.CSSProperties = { fontFamily: 'monospace', fontSize: 14, color: GBC_TEXT, lineHeight: 1.6 }

  const effects = strain.Effects ? strain.Effects.split(',').map((e) => e.trim()).filter(Boolean) : []
  const flavors = strain.Flavor ? strain.Flavor.split(',').map((f) => f.trim()).filter(Boolean) : []
  const terpenes = strain.terpenes ? strain.terpenes.split(/[,;]+/).map((t) => t.trim()).filter(Boolean) : []

  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const alreadyInStash = strains.some((s) => norm(s.name) === norm(displayName(strain)))

  const handleAdd = () => {
    addStrain({
      name: displayName(strain),
      type: strain.Type as StrainEntry['type'],
      thc: strain.thc ?? undefined,
      cbd: strain.cbd ?? undefined,
      inStock: true,
    })
    setAdded(true)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Back + name header */}
      <div style={{ ...pokeBox, padding: '10px 12px' }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: GBC_MUTED, fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, cursor: 'pointer', padding: 0, marginBottom: 8, display: 'block' }}
        >
          ◄ BACK
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
          <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 13, color: col, flex: 1, lineHeight: 1.6, wordBreak: 'break-word' }}>
            {displayName(strain)}
          </span>
          <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, border: `2px solid ${col}`, color: col, padding: '4px 8px', flexShrink: 0 }}>
            {strain.Type.toUpperCase()}
          </span>
        </div>
        {strain.Rating != null && (
          <div style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, color: GBC_AMBER, marginBottom: 10 }}>
            {'★'.repeat(Math.round(strain.Rating))}{'☆'.repeat(5 - Math.round(strain.Rating))} {strain.Rating}/5
          </div>
        )}
        {/* Add to stash */}
        {alreadyInStash || added ? (
          <div style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, color: GBC_GREEN, padding: '8px 0' }}>
            [{added && !alreadyInStash ? 'ADDED!' : 'IN STASH'}]
          </div>
        ) : (
          <button
            onClick={handleAdd}
            style={{
              width: '100%', fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 10,
              padding: '12px 0', cursor: 'pointer',
              background: GBC_GREEN, color: GBC_BG,
              border: `3px solid ${GBC_GREEN}`,
              boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
            }}
          >
            + ADD TO STASH
          </button>
        )}
      </div>

      {/* THC / CBD */}
      {(strain.thc != null || strain.cbd != null) && (
        <div style={{ ...pokeBox, padding: '10px 12px' }}>
          <span style={LABEL}>CANNABINOIDS</span>
          <div style={{ display: 'flex', gap: 24 }}>
            {strain.thc != null && (
              <div>
                <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, color: GBC_AMBER }}>THC</span>
                <div style={{ fontFamily: 'monospace', fontSize: 20, color: GBC_TEXT }}>{strain.thc}%</div>
              </div>
            )}
            {strain.cbd != null && (
              <div>
                <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, color: GBC_VIOLET }}>CBD</span>
                <div style={{ fontFamily: 'monospace', fontSize: 20, color: GBC_TEXT }}>{strain.cbd}%</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Effects */}
      {effects.length > 0 && (
        <div style={{ ...pokeBox, padding: '10px 12px' }}>
          <span style={LABEL}>EFFECTS</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {effects.map((e) => (
              <span key={e} style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, padding: '4px 8px', border: `1px solid ${col}`, color: col }}>
                {e.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Flavors */}
      {flavors.length > 0 && (
        <div style={{ ...pokeBox, padding: '10px 12px' }}>
          <span style={LABEL}>FLAVORS</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {flavors.map((f) => (
              <span key={f} style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, padding: '4px 8px', border: '1px solid #3a5010', color: GBC_MUTED }}>
                {f.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Terpenes */}
      {terpenes.length > 0 && (
        <div style={{ ...pokeBox, padding: '10px 12px' }}>
          <span style={LABEL}>TERPENES</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {terpenes.map((t) => (
              <span key={t} style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, padding: '4px 8px', border: '1px solid #1e4a08', color: '#5a9a18' }}>
                {t.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Medical */}
      {strain.medical && (
        <div style={{ ...pokeBox, padding: '10px 12px' }}>
          <span style={LABEL}>MEDICAL USES</span>
          <span style={VALUE}>{strain.medical}</span>
        </div>
      )}

      {/* Description */}
      {strain.Description && (
        <div style={{ ...pokeBox, padding: '10px 12px' }}>
          <span style={LABEL}>DESCRIPTION</span>
          <span style={{ ...VALUE, fontSize: 13, opacity: 0.85 }}>{strain.Description}</span>
        </div>
      )}
    </div>
  )
}

// ── Dex list ──────────────────────────────────────────────────────────────────

function StrainDex({ db }: { db: StrainRecord[] }) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [category, setCategory] = useState<DexCategory>(DEX_CATEGORIES[0])
  const [selected, setSelected] = useState<StrainRecord | null>(null)
  const [sort, setSort] = useState<SortKey>('az')
  const [page, setPage] = useState(0)

  // Reset to page 0 whenever search/filter/sort changes
  useEffect(() => { setPage(0) }, [query, category, sort])

  const { pageResults, total, totalPages } = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    let pool = db.filter(category.filter)

    if (words.length > 0) {
      // Score and sort by relevance
      const scored = pool
        .map((s) => ({ s, score: scoreResult(s, words) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
      pool = scored.map(({ s }) => s)
    } else {
      pool = [...pool]
      if (sort === 'az')     pool.sort((a, b) => displayName(a).localeCompare(displayName(b)))
      if (sort === 'thc')    pool.sort((a, b) => (b.thc ?? 0) - (a.thc ?? 0))
      if (sort === 'rating') pool.sort((a, b) => (b.Rating ?? 0) - (a.Rating ?? 0))
    }

    const total = pool.length
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1
    const pageResults = pool.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    return { pageResults, total, totalPages }
  }, [db, query, category, sort, page])

  if (selected) {
    return <StrainDetail strain={selected} onBack={() => setSelected(null)} />
  }

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'az',     label: 'A-Z' },
    { key: 'thc',    label: 'THC' },
    { key: 'rating', label: 'RATING' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Search */}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="OG Kush, sleepy, myrcene..."
        style={{
          background: '#050a04',
          border: `2px solid ${focused ? '#4a8a10' : GBC_DARKEST}`,
          color: GBC_TEXT,
          fontFamily: 'monospace',
          fontSize: 16,
          padding: '14px 12px',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      {/* Sort — hidden when actively searching (results sorted by relevance) */}
      {!query.trim() && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 7, color: GBC_MUTED, flexShrink: 0 }}>
            SORT:
          </span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 8, padding: '6px 10px', minHeight: 36,
                border: `2px solid ${sort === opt.key ? GBC_GREEN : GBC_DARKEST}`,
                background: sort === opt.key ? 'rgba(132,204,22,0.12)' : 'transparent',
                color: sort === opt.key ? GBC_GREEN : GBC_MUTED,
                cursor: 'pointer',
              }}
            >
              {opt.label}{sort === opt.key && opt.key !== 'az' ? ' ▼' : ''}
            </button>
          ))}
        </div>
      )}

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch' as const }}>
        {DEX_CATEGORIES.map((cat) => {
          const active = cat.label === category.label
          return (
            <button
              key={cat.label}
              onClick={() => setCategory(cat)}
              style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 9, padding: '8px 12px',
                border: `2px solid ${active ? cat.color : GBC_DARKEST}`,
                background: active ? `rgba(${cat.color === GBC_GREEN ? '132,204,22' : '80,80,80'},0.15)` : 'transparent',
                color: active ? cat.color : GBC_MUTED,
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, minHeight: 44,
                WebkitTapHighlightColor: 'transparent' as unknown as string,
              }}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Count + page indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, color: GBC_MUTED }}>
          {total} STRAINS{category.label !== 'ALL' ? ` · ${category.label}` : ''}
          {query.trim() ? ' · BY MATCH' : ''}
        </span>
        {totalPages > 1 && (
          <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, color: GBC_MUTED }}>
            PG {page + 1}/{totalPages}
          </span>
        )}
      </div>

      {/* Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {pageResults.length === 0 && (
          <div style={{ ...pokeBox, padding: '24px 12px', textAlign: 'center' }}>
            <p style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 10, color: GBC_MUTED }}>
              NO RESULTS
            </p>
          </div>
        )}
        {pageResults.map((s) => {
          const col = s.Type === 'sativa' ? GBC_GREEN : s.Type === 'indica' ? GBC_VIOLET : GBC_AMBER
          return (
            <button
              key={s.Strain}
              onClick={() => setSelected(s)}
              style={{
                ...pokeBox, padding: '12px', cursor: 'pointer',
                background: GBC_BOX, border: '3px solid #84cc16',
                width: '100%', textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 12, color: col, flex: 1, lineHeight: 1.6, wordBreak: 'break-word' }}>
                  {displayName(s)}
                </span>
                <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, border: `2px solid ${col}`, color: col, padding: '3px 6px', flexShrink: 0 }}>
                  {s.Type.toUpperCase()}
                </span>
              </div>
              {(s.thc != null || s.cbd != null) && (
                <div style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, color: GBC_MUTED, marginBottom: 6 }}>
                  {s.thc != null ? `THC ${s.thc}%` : ''}{s.thc != null && s.cbd != null ? '  ·  ' : ''}{s.cbd != null ? `CBD ${s.cbd}%` : ''}
                </div>
              )}
              {s.Rating != null && (
                <div style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, color: GBC_AMBER, marginBottom: 6 }}>
                  {'★'.repeat(Math.round(s.Rating))}{'☆'.repeat(5 - Math.round(s.Rating))}
                </div>
              )}
              {s.terpenes && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                  {s.terpenes.split(/[,;]+/).map((t) => t.trim()).filter(Boolean).slice(0, 3).map((t) => (
                    <span key={t} style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, padding: '2px 5px', border: '1px solid #1e4a08', color: '#5a9a18' }}>
                      {t.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ fontFamily: 'monospace', fontSize: 13, color: GBC_TEXT, opacity: 0.6, lineHeight: 1.5 }}>
                {s.Effects.split(',').map((e) => e.trim()).slice(0, 4).join(' · ')}
              </div>
              <div style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 7, color: GBC_MUTED, marginTop: 6, textAlign: 'right' }}>
                TAP FOR FULL INFO ►
              </div>
            </button>
          )
        })}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', paddingTop: 4 }}>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9,
              padding: '10px 16px', minHeight: 44, cursor: page === 0 ? 'not-allowed' : 'pointer',
              border: `2px solid ${page === 0 ? GBC_DARKEST : GBC_MUTED}`,
              background: 'transparent',
              color: page === 0 ? GBC_DARKEST : GBC_MUTED,
            }}
          >
            ◄ PREV
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            style={{
              fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9,
              padding: '10px 16px', minHeight: 44, cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer',
              border: `2px solid ${page === totalPages - 1 ? GBC_DARKEST : GBC_MUTED}`,
              background: 'transparent',
              color: page === totalPages - 1 ? GBC_DARKEST : GBC_MUTED,
            }}
          >
            NEXT ►
          </button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

const emptyForm = {
  name: '',
  type: undefined as StrainEntry['type'],
  thc: '',
  cbd: '',
  amount: '',
  notes: '',
}

export default function Smokedex() {
  const { strains, addStrain, deleteStrain } = useStash()
  const { db } = useStrainDb()
  const [tab, setTab] = useState<'party' | 'pc' | 'dex' | 'add'>('party')
  const [form, setForm] = useState({ ...emptyForm })
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [suggestions, setSuggestions] = useState<StrainRecord[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const party = strains.filter((s) => s.inStock)

  const resizeImage = (file: File, maxPx = 1200): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error('resize failed')), 'image/jpeg', 0.85)
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true)
    try {
      const resized = await resizeImage(file)
      const result = await Tesseract.recognize(resized, 'eng', { logger: () => {} })
      const text = result.data.text

      // Parse THC
      const thcMatch =
        text.match(/THC[:\s]+(\d+\.?\d*)\s*%/i) ||
        text.match(/(\d+\.?\d*)\s*%\s*THC/i)
      const cbdMatch =
        text.match(/CBD[:\s]+(\d+\.?\d*)\s*%/i) ||
        text.match(/(\d+\.?\d*)\s*%\s*CBD/i)

      // Extract strain name: first non-empty line, or after keywords
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
      let parsedName = ''
      for (const line of lines) {
        // skip lines that look like dosage/percentage noise
        if (/^\d/.test(line)) continue
        if (line.length < 3) continue
        parsedName = line.replace(/[^a-zA-Z0-9\s\-']/g, '').trim()
        if (parsedName.length >= 3) break
      }

      setForm((prev) => ({
        ...prev,
        name: parsedName && !prev.name ? parsedName : prev.name,
        thc: thcMatch ? thcMatch[1] : prev.thc,
        cbd: cbdMatch ? cbdMatch[1] : prev.cbd,
      }))
    } catch {
      // ignore OCR errors
    } finally {
      setScanning(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = () => {
    if (!form.name.trim()) return
    addStrain({
      name: form.name.trim(),
      type: form.type,
      thc: form.thc !== '' ? parseFloat(form.thc) : undefined,
      cbd: form.cbd !== '' ? parseFloat(form.cbd) : undefined,
      amount: form.amount.trim() || undefined,
      notes: form.notes.trim() || undefined,
      inStock: true,
    })
    setForm({ ...emptyForm })
    setConfirmed(true)
    setTimeout(() => {
      setConfirmed(false)
      setTab('party')
    }, 1500)
  }

  const inputStyle = (field: string) => ({
    ...inputBase,
    border: `2px solid ${focusedField === field ? '#4a8a10' : GBC_DARKEST}`,
  })

  const tabBtn = (active: boolean) => ({
    fontFamily: "'PokemonGb', 'Press Start 2P', monospace" as const,
    fontSize: 10,
    padding: '8px 14px',
    border: active ? `3px solid ${GBC_GREEN}` : `3px solid ${GBC_DARKEST}`,
    background: active ? 'rgba(132,204,22,0.10)' : 'transparent',
    color: active ? GBC_GREEN : GBC_MUTED,
    cursor: 'pointer',
    boxShadow: active ? 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010' : 'none',
  })

  return (
    <div style={{
      minHeight: '100%',
      padding: '10px',
      background: GBC_BG,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      boxSizing: 'border-box',
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
          SMOK<span style={{ fontFamily: "'Press Start 2P', monospace" }}>É</span>DEX
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
          <span style={{
            fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
            fontSize: 8,
            color: GBC_MUTED,
            border: `1px solid ${GBC_MUTED}`,
            padding: '2px 6px',
          }}>
            [DEX]
          </span>
          <span style={{
            fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
            fontSize: 7,
            color: GBC_MUTED,
          }}>
            {db.length.toLocaleString()} STRAINS
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button style={tabBtn(tab === 'party')} onClick={() => setTab('party')}>PARTY</button>
        <button style={tabBtn(tab === 'pc')} onClick={() => setTab('pc')}>PC</button>
        <button style={tabBtn(tab === 'dex')} onClick={() => setTab('dex')}>DEX</button>
        <button style={tabBtn(tab === 'add')} onClick={() => setTab('add')}>ADD</button>
      </div>

      {/* Summary bar */}
      {tab !== 'dex' && tab !== 'add' && (
        <div style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, color: GBC_MUTED, flexShrink: 0 }}>
          {party.length}/6 IN PARTY · {strains.length} IN PC
        </div>
      )}

      {/* PARTY TAB */}
      {tab === 'party' && (
        <PartyView
          party={party}
          db={db}
          onDelete={deleteStrain}
        />
      )}

      {/* PC TAB */}
      {tab === 'pc' && (
        strains.length === 0 ? (
          <div style={{ ...pokeBox, padding: '32px 12px', textAlign: 'center' }}>
            <p style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 11, color: GBC_MUTED }}>NO STRAINS LOGGED</p>
            <p style={{ fontFamily: 'monospace', fontSize: 13, color: GBC_MUTED, marginTop: 10 }}>Add your first strain using the ADD tab.</p>
          </div>
        ) : (
          <StashList strains={strains} db={db} onDelete={deleteStrain} />
        )
      )}

      {/* DEX TAB */}
      {tab === 'dex' && <StrainDex db={db} />}

      {/* ADD NEW TAB */}
      {tab === 'add' && (
        <>
          {/* Form poke-box */}
          <div style={{ ...pokeBox, padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>

            <p style={{
              fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
              fontSize: 9,
              color: GBC_MUTED,
              margin: 0,
            }}>
              NEW STRAIN ENTRY
            </p>

            {/* Strain name */}
            <div>
              <label style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 8,
                color: GBC_MUTED,
                display: 'block',
                marginBottom: 6,
              }}>
                STRAIN NAME *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    const value = e.target.value
                    setForm({ ...form, name: value })
                    if (value.length >= 2) {
                      const filtered = db
                        .filter((s) => displayName(s).toLowerCase().includes(value.toLowerCase()))
                        .slice(0, 6)
                      setSuggestions(filtered)
                      setShowSuggestions(true)
                    } else {
                      setSuggestions([])
                      setShowSuggestions(false)
                    }
                  }}
                  style={inputStyle('name')}
                  onFocus={() => {
                    setFocusedField('name')
                    if (form.name.length >= 2) setShowSuggestions(true)
                  }}
                  onBlur={() => {
                    setFocusedField(null)
                    setTimeout(() => setShowSuggestions(false), 150)
                  }}
                  placeholder="e.g. Blue Dream"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '100%',
                    zIndex: 50,
                    background: '#0a1408',
                    border: '2px solid #2a4a08',
                    boxSizing: 'border-box',
                  }}>
                    {suggestions.map((s) => {
                      const col = s.Type === 'sativa' ? '#84cc16' : s.Type === 'indica' ? '#a78bfa' : '#f59e0b'
                      return (
                        <div
                          key={s.Strain}
                          onMouseDown={() => {
                            setForm({
                              ...form,
                              name: displayName(s),
                              type: s.Type,
                              thc: s.thc != null ? String(s.thc) : form.thc,
                              cbd: s.cbd != null ? String(s.cbd) : form.cbd,
                            })
                            setSuggestions([])
                            setShowSuggestions(false)
                          }}
                          style={{
                            padding: '8px 10px',
                            fontFamily: 'monospace',
                            fontSize: 11,
                            color: '#c8e890',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                          onMouseEnter={undefined}
                          onMouseLeave={undefined}
                        >
                          <span>{displayName(s)}</span>
                          <span style={{
                            fontFamily: 'monospace',
                            fontSize: 10,
                            color: col,
                            border: `1px solid ${col}`,
                            padding: '1px 4px',
                            flexShrink: 0,
                          }}>
                            {s.Type}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Type selector */}
            <div>
              <label style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 8,
                color: GBC_MUTED,
                display: 'block',
                marginBottom: 6,
              }}>
                TYPE
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['sativa', 'indica', 'hybrid'] as const).map((t) => {
                  const active = form.type === t
                  const col = typeColor(t)
                  return (
                    <button
                      key={t}
                      onClick={() => setForm({ ...form, type: active ? undefined : t })}
                      style={{
                        fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                        fontSize: 8,
                        padding: '6px 10px',
                        border: `2px solid ${active ? col : GBC_DARKEST}`,
                        background: active ? `rgba(${t === 'sativa' ? '132,204,22' : t === 'indica' ? '167,139,250' : '245,158,11'},0.12)` : 'transparent',
                        color: active ? col : GBC_MUTED,
                        cursor: 'pointer',
                        flex: 1,
                      }}
                    >
                      {t.toUpperCase()}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* THC / CBD row */}
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                  fontSize: 8,
                  color: GBC_MUTED,
                  display: 'block',
                  marginBottom: 6,
                }}>
                  THC %
                </label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  step={0.1}
                  value={form.thc}
                  onChange={(e) => setForm({ ...form, thc: e.target.value })}
                  style={inputStyle('thc')}
                  onFocus={() => setFocusedField('thc')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="0–40"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{
                  fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                  fontSize: 8,
                  color: GBC_MUTED,
                  display: 'block',
                  marginBottom: 6,
                }}>
                  CBD %
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  step={0.1}
                  value={form.cbd}
                  onChange={(e) => setForm({ ...form, cbd: e.target.value })}
                  style={inputStyle('cbd')}
                  onFocus={() => setFocusedField('cbd')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="0–20"
                />
              </div>
            </div>

            {/* Amount */}
            <div>
              <label style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 8,
                color: GBC_MUTED,
                display: 'block',
                marginBottom: 6,
              }}>
                AMOUNT
              </label>
              <input
                type="text"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                style={inputStyle('amount')}
                onFocus={() => setFocusedField('amount')}
                onBlur={() => setFocusedField(null)}
                placeholder="e.g. 3.5g"
              />
            </div>

            {/* Notes */}
            <div>
              <label style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 8,
                color: GBC_MUTED,
                display: 'block',
                marginBottom: 6,
              }}>
                NOTES
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                style={{
                  ...inputStyle('notes'),
                  resize: 'none',
                }}
                onFocus={() => setFocusedField('notes')}
                onBlur={() => setFocusedField(null)}
                placeholder="Effects, flavour, occasion..."
              />
            </div>

          </div>

          {/* OCR section */}
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
              SCAN DISPENSARY LABEL
            </p>
            <p style={{
              fontFamily: 'monospace',
              fontSize: 12,
              color: GBC_TEXT,
              opacity: 0.7,
              margin: 0,
              lineHeight: 1.6,
            }}>
              Take a photo of your label to auto-fill the form.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="ocr-file-input"
            />

            <label
              htmlFor="ocr-file-input"
              style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 10,
                padding: '10px 14px',
                border: `3px solid ${GBC_DARKEST}`,
                background: 'transparent',
                color: GBC_MUTED,
                cursor: 'pointer',
                display: 'inline-block',
                boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #1a3008',
                userSelect: 'none',
              }}
            >
              {'\u25ba'} SCAN LABEL PHOTO
            </label>

            {scanning && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  className="gbc-blink"
                  style={{
                    fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                    fontSize: 10,
                    color: GBC_GREEN,
                  }}
                >
                  SCANNING...
                </span>
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!form.name.trim() || confirmed}
            style={{
              fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
              fontSize: 11,
              padding: '12px',
              width: '100%',
              border: form.name.trim() && !confirmed
                ? `3px solid ${GBC_GREEN}`
                : `3px solid ${GBC_DARKEST}`,
              background: form.name.trim() && !confirmed
                ? GBC_GREEN
                : 'transparent',
              color: form.name.trim() && !confirmed ? GBC_BG : GBC_MUTED,
              cursor: form.name.trim() && !confirmed ? 'pointer' : 'not-allowed',
              boxShadow: form.name.trim() && !confirmed
                ? 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010'
                : 'none',
            }}
          >
            {confirmed ? 'REGISTERED!' : '\u25ba ADD TO SMOKÉDEX'}
          </button>
        </>
      )}
    </div>
  )
}
