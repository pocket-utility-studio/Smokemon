// 5-axis radar chart — pure SVG, GBC kiwi palette, no external charting library

export type EffectScores = {
  happy:   number  // 0–100
  sleepy:  number
  hungry:  number
  focused: number
  relaxed: number
}

// Derive approximate scores from an effects string + strain type
export function deriveEffectScores(effects?: string, type?: string): EffectScores {
  const e = (effects ?? '').toLowerCase()

  const base: EffectScores =
    type === 'sativa'
      ? { happy: 65, sleepy: 15, hungry: 30, focused: 72, relaxed: 38 }
      : type === 'indica'
      ? { happy: 40, sleepy: 78, hungry: 62, focused: 22, relaxed: 82 }
      : { happy: 58, sleepy: 40, hungry: 46, focused: 56, relaxed: 56 }

  const bump = (cur: number, by = 22) => Math.min(cur + by, 100)

  const r = { ...base }
  if (/happy|euphori|gigg|uplifti/.test(e))      r.happy   = bump(r.happy)
  if (/sleep|sedat|drowsy|couch|couchlock/.test(e)) r.sleepy = bump(r.sleepy)
  if (/hungry|munch|appet/.test(e))              r.hungry  = bump(r.hungry, 28)
  if (/focus|creat|alert|energ|clear-head/.test(e)) r.focused = bump(r.focused)
  if (/relax|calm|chill|ease|peace|tingly/.test(e)) r.relaxed = bump(r.relaxed)
  return r
}

const AXES: { key: keyof EffectScores; label: string }[] = [
  { key: 'happy',   label: 'HAPPY'   },
  { key: 'focused', label: 'FOCUS'   },
  { key: 'hungry',  label: 'HUNGRY'  },
  { key: 'relaxed', label: 'RELAX'   },
  { key: 'sleepy',  label: 'SLEEPY'  },
]

const N = AXES.length
const CX = 50
const CY = 50
const R  = 36   // outer ring radius
const FONT = "'PokemonGb','Press Start 2P',monospace"

function polar(angle: number, r: number): [number, number] {
  // angle in radians, starting from top (-π/2), clockwise
  return [CX + r * Math.cos(angle), CY + r * Math.sin(angle)]
}

function axisAngles(): number[] {
  // Start at top (-π/2), rotate clockwise by 2π/N each step
  return Array.from({ length: N }, (_, i) => -Math.PI / 2 + (2 * Math.PI * i) / N)
}

interface StatPentagonProps {
  scores: EffectScores
  color?: string
  size?: number
}

export default function StatPentagon({
  scores,
  color = '#84cc16',
  size = 140,
}: StatPentagonProps) {
  const angles = axisAngles()

  // Background rings at 25%, 50%, 75%, 100%
  const rings = [0.25, 0.5, 0.75, 1].map((pct) =>
    angles.map((a) => polar(a, R * pct)).map((p) => p.join(',')).join(' ')
  )

  // Filled data polygon
  const dataPoints = angles.map((a, i) => {
    const score = scores[AXES[i].key] / 100
    return polar(a, R * score)
  })
  const dataPath = dataPoints.map((p) => p.join(',')).join(' ')

  // Labels
  const labelOffset = R + 10

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ display: 'block', imageRendering: 'pixelated' }}
    >
      {/* Background rings */}
      {rings.map((pts, ri) => (
        <polygon
          key={ri}
          points={pts}
          fill="none"
          stroke="#1a3008"
          strokeWidth={0.5}
        />
      ))}

      {/* Axis lines */}
      {angles.map((a, i) => {
        const [x2, y2] = polar(a, R)
        return (
          <line
            key={i}
            x1={CX} y1={CY}
            x2={x2} y2={y2}
            stroke="#2a4a08"
            strokeWidth={0.5}
          />
        )
      })}

      {/* Filled data area */}
      <polygon
        points={dataPath}
        fill={`${color}30`}
        stroke={color}
        strokeWidth={1.2}
      />

      {/* Data point dots */}
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.6} fill={color} />
      ))}

      {/* Centre dot */}
      <circle cx={CX} cy={CY} r={1.2} fill="#2a4a08" />

      {/* Axis labels */}
      {angles.map((a, i) => {
        const [lx, ly] = polar(a, labelOffset)
        const anchor =
          lx < CX - 2 ? 'end' : lx > CX + 2 ? 'start' : 'middle'
        return (
          <text
            key={i}
            x={lx} y={ly + 1.5}
            textAnchor={anchor}
            fontFamily={FONT}
            fontSize={4.8}
            fill="#4a7a10"
          >
            {AXES[i].label}
          </text>
        )
      })}

      {/* Score values */}
      {dataPoints.map(([x, y], i) => {
        const score = scores[AXES[i].key]
        if (score < 5) return null
        return (
          <text
            key={`v-${i}`}
            x={x + (x < CX ? -2 : 2)}
            y={y - 2}
            textAnchor={x < CX - 2 ? 'end' : 'start'}
            fontFamily={FONT}
            fontSize={3.5}
            fill={color}
          >
            {score}
          </text>
        )
      })}
    </svg>
  )
}
