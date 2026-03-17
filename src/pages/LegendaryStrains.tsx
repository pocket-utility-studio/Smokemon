import legendaryStrains from '../data/legendaryStrains'
import type { LegendaryStrain } from '../data/legendaryStrains'

const FONT   = "'PokemonGb', 'Press Start 2P', monospace"
const GBC_GREEN  = '#84cc16'
const GBC_TEXT   = '#c8e890'
const GBC_MUTED  = '#4a7a10'
const GBC_DARKEST = '#2a4a08'
const GBC_BG     = '#050a04'
const GBC_BOX    = '#0a1408'
const GBC_VIOLET = '#a78bfa'
const GBC_AMBER  = '#f59e0b'

const TYPE_COLOR: Record<string, string> = {
  Sativa: GBC_GREEN,
  Indica: GBC_VIOLET,
  Hybrid: GBC_AMBER,
}

const ERA_ORDER = ['The Ancestors', 'The Foundation', 'The Modern Era']

const ERA_SUBTITLES: Record<string, string> = {
  'The Ancestors':   'LANDRACES & ORIGINALS',
  'The Foundation':  'THE STRAINS THAT BUILT THE INDUSTRY',
  'The Modern Era':  'LEGENDS OF THE NEW GENERATION',
}

function StrainCard({ s }: { s: LegendaryStrain }) {
  const col = TYPE_COLOR[s.type] ?? GBC_GREEN
  return (
    <div style={{
      border: `2px solid ${col}`,
      boxShadow: `inset 0 0 0 1px #0e1a0b`,
      background: GBC_BOX,
      padding: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
        <span style={{ fontFamily: FONT, fontSize: 9, color: col, lineHeight: 1.5, flex: 1 }}>
          {s.name.toUpperCase()}
        </span>
        <span style={{
          fontFamily: FONT, fontSize: 7, color: col,
          border: `1px solid ${col}`, padding: '1px 5px', flexShrink: 0,
        }}>
          {s.type.toUpperCase()}
        </span>
      </div>
      <p style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT, lineHeight: 1.7, margin: 0 }}>
        {s.lore}
      </p>
    </div>
  )
}

export default function LegendaryStrains() {
  const byEra = ERA_ORDER.map((era) => ({
    era,
    strains: legendaryStrains.filter((s) => s.era === era),
  }))

  return (
    <div style={{
      minHeight: '100%', background: GBC_BG, padding: '10px',
      boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12,
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: `2px solid ${GBC_DARKEST}`, paddingBottom: 8,
      }}>
        <span style={{ fontFamily: FONT, fontSize: 11, color: GBC_GREEN }}>LEGENDARY STRAINS</span>
        <span style={{
          fontFamily: FONT, fontSize: 7, color: GBC_MUTED,
          border: `1px solid ${GBC_DARKEST}`, padding: '2px 5px',
        }}>
          {legendaryStrains.length} ENTRIES
        </span>
      </div>

      {/* Intro */}
      <div style={{
        border: `3px solid ${GBC_DARKEST}`,
        boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #1a3008',
        background: GBC_BOX, padding: '12px',
      }}>
        <p style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_MUTED, lineHeight: 1.7, margin: 0 }}>
          The strains that shaped history. From ancient landraces to the genetics that define the modern market — these are the originals.
        </p>
      </div>

      {/* Era sections */}
      {byEra.map(({ era, strains }) => (
        <div key={era} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* Era header */}
          <div style={{
            borderBottom: `2px solid ${GBC_DARKEST}`,
            paddingBottom: 6,
          }}>
            <span style={{ fontFamily: FONT, fontSize: 9, color: GBC_GREEN, display: 'block' }}>
              {era.toUpperCase()}
            </span>
            <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED }}>
              {ERA_SUBTITLES[era]}
            </span>
          </div>

          {strains.map((s) => <StrainCard key={s.id} s={s} />)}
        </div>
      ))}

      <div style={{ textAlign: 'center', paddingBottom: 8 }}>
        <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_DARKEST }}>
          TRAINER SCHOOL · HALL OF FAME
        </span>
      </div>

    </div>
  )
}
