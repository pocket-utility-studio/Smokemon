import { useState, useEffect } from 'react'

const pokeBox = {
  border: '3px solid #84cc16',
  boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
  background: '#0a1408',
  borderRadius: 0,
}

type AvbCondition = 'raw' | 'light' | 'perfect' | 'dark' | 'burned'

const CONDITIONS: Record<AvbCondition, {
  label: string
  accent: string
  statusTag: string
  statusColor: string
  desc: string
  potency: number
  tip: string
}> = {
  raw: {
    label: 'UNVAPED',
    accent: '#84cc16',
    statusTag: 'HP', statusColor: '#84cc16',
    desc: 'Fresh flower. THCA not yet decarboxylated. Maximum terpene profile intact.',
    potency: 100,
    tip: 'Vape first — raw flower eaten raw has minimal psychoactive effect.',
  },
  light: {
    label: 'LIGHTLY VAPED',
    accent: '#c8e890',
    statusTag: 'OK', statusColor: '#c8e890',
    desc: 'Pale tan or yellow-green. Partial decarb. Strong AVB — best for edibles.',
    potency: 65,
    tip: 'Highest potency AVB for cooking. Mild earthy flavour. Great in capsules.',
  },
  perfect: {
    label: 'PERFECTLY VAPED',
    accent: '#f59e0b',
    statusTag: 'PSN', statusColor: '#f59e0b',
    desc: 'Medium brown. Fully decarboxylated. Ideal for all AVB uses.',
    potency: 35,
    tip: 'Classic AVB. Excellent for butter, oils, capsules. Manageable strength.',
  },
  dark: {
    label: 'DARK VAPED',
    accent: '#ca8a04',
    statusTag: 'BRN', statusColor: '#ca8a04',
    desc: 'Dark brown. Heavily vaped. Low potency — CBN dominant. Sedating.',
    potency: 15,
    tip: 'Very mild. Best used in large quantity or discarded. Strong sleep aid.',
  },
  burned: {
    label: 'COMBUSTED',
    accent: '#e84040',
    statusTag: 'KO', statusColor: '#e84040',
    desc: 'Black. Combusted material. No cannabinoids remain. Discard.',
    potency: 0,
    tip: 'Nothing left to extract. Lower your temp — this should never happen.',
  },
}

const ONSET_METHODS = [
  { label: 'ORAL (CAPSULES)', onset: '45–120 MIN', peak: '2–4 HRS', duration: '4–8 HRS', accent: '#84cc16' },
  { label: 'COOKED (EDIBLES)', onset: '30–90 MIN', peak: '2–3 HRS', duration: '4–6 HRS', accent: '#f59e0b' },
  { label: 'FAT WASH', onset: '20–60 MIN', peak: '1–3 HRS', duration: '3–6 HRS', accent: '#a78bfa' },
  { label: 'SUBLINGUAL OIL', onset: '15–45 MIN', peak: '1–2 HRS', duration: '3–5 HRS', accent: '#84cc16' },
]

function PotencyBar({ value }: { value: number }) {
  const filled = Math.round((value / 100) * 10)
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 12,
            height: 12,
            background: i < filled ? '#84cc16' : '#1a3004',
            border: '1px solid #2a4a08',
          }}
        />
      ))}
      <span style={{
        fontFamily: "'PokemonGb', 'Press Start 2P'",
        fontSize: 8,
        color: '#4a7a10',
        marginLeft: 6,
      }}>
        {value}%
      </span>
    </div>
  )
}

function OnsetTimer({ method }: { method: typeof ONSET_METHODS[0] }) {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60

  return (
    <div style={{
      ...pokeBox,
      border: `2px solid ${method.accent}`,
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P'",
          fontSize: 8,
          color: method.accent,
        }}>
          {method.label}
        </span>
        <button
          onClick={() => {
            if (running) { setRunning(false); setElapsed(0) }
            else setRunning(true)
          }}
          style={{
            fontFamily: "'PokemonGb', 'Press Start 2P'",
            fontSize: 7,
            padding: '3px 7px',
            border: `1px solid ${method.accent}`,
            background: 'transparent',
            color: method.accent,
            cursor: 'pointer',
          }}
        >
          {running ? '■ STOP' : '► START'}
        </button>
      </div>

      {running && (
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P'",
          fontSize: 11,
          color: '#c8e890',
          letterSpacing: 2,
        }}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </span>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#c8e890' }}>
          ONSET: {method.onset}
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#4a7a10' }}>
          PEAK: {method.peak}
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#4a7a10' }}>
          DUR: {method.duration}
        </span>
      </div>
    </div>
  )
}

function ProfToakSprite() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <img
        src={`${import.meta.env.BASE_URL}prof-toak.png`}
        alt="Prof T-Oak"
        width={96}
        height={96}
        style={{ imageRendering: 'pixelated', display: 'block', objectFit: 'contain' }}
      />
      <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, color: '#4a7a10', letterSpacing: 0.5 }}>
        PROF T-OAK
      </span>
    </div>
  )
}

export default function AbvPage() {
  const [condition, setCondition] = useState<AvbCondition>('perfect')
  const c = CONDITIONS[condition]

  return (
    <div style={{
      minHeight: '100%',
      background: '#050a04',
      padding: '10px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid #2a4a08',
        paddingBottom: 8,
      }}>
        <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 13, color: '#84cc16' }}>
          AVB ANALYSIS
        </span>
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P'",
          fontSize: 10,
          color: c.statusColor,
          border: `2px solid ${c.statusColor}`,
          padding: '2px 8px',
        }}>
          {c.statusTag}
        </span>
      </div>

      <ProfToakSprite />

      {/* Condition picker */}
      <div style={{ ...pokeBox, padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 9, color: '#4a7a10', letterSpacing: 0.5 }}>
          SELECT AVB CONDITION
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(Object.keys(CONDITIONS) as AvbCondition[]).map((key) => {
            const co = CONDITIONS[key]
            const active = condition === key
            return (
              <button
                key={key}
                onClick={() => setCondition(key)}
                style={{
                  fontFamily: "'PokemonGb', 'Press Start 2P'",
                  fontSize: 8,
                  padding: '6px 10px',
                  border: `2px solid ${active ? co.accent : '#2a4a08'}`,
                  background: active ? `${co.accent}1a` : 'transparent',
                  color: active ? co.accent : '#4a7a10',
                  cursor: 'pointer',
                }}
              >
                {co.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Condition info */}
      <div style={{
        ...pokeBox,
        border: `3px solid ${c.accent}`,
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 11, color: c.accent }}>
          {c.label}
        </span>

        <p style={{ fontFamily: 'monospace', fontSize: 13, color: '#c8e890', lineHeight: 1.7, margin: 0 }}>
          {c.desc}
        </p>

        <div>
          <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 8, color: '#4a7a10', display: 'block', marginBottom: 6 }}>
            POTENCY REMAINING
          </span>
          <PotencyBar value={c.potency} />
        </div>

        <div style={{ borderTop: '1px solid #2a4a08', paddingTop: 8 }}>
          <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 8, color: '#84cc16', display: 'block', marginBottom: 6 }}>
            TIP
          </span>
          <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#c8e890', lineHeight: 1.7, margin: 0, opacity: 0.85 }}>
            {c.tip}
          </p>
        </div>
      </div>

      {/* Onset timers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 9, color: '#4a7a10', marginBottom: 4 }}>
          ONSET TIMERS
        </span>
        {ONSET_METHODS.map((m) => (
          <OnsetTimer key={m.label} method={m} />
        ))}
      </div>
    </div>
  )
}
