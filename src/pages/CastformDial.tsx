import { useState } from 'react'

const pokeBox = {
  border: '3px solid #84cc16',
  boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
  background: '#0a1408',
  borderRadius: 0,
}

type TempRange = 'low' | 'mid-low' | 'mid' | 'mid-high' | 'high'

function getTempRange(temp: number): TempRange {
  if (temp <= 174) return 'low'
  if (temp <= 184) return 'mid-low'
  if (temp <= 194) return 'mid'
  if (temp <= 204) return 'mid-high'
  return 'high'
}

const EFFECT_PROFILES: Record<TempRange, { label: string; text: string; terpenes: string; accent: string }> = {
  'low': {
    label: 'LIGHT & CLEAR',
    text: 'Myrcene and limonene active. Alert, creative, minimal cough.',
    terpenes: 'Limonene, Pinene, Terpinolene',
    accent: '#84cc16',
  },
  'mid-low': {
    label: 'BALANCED',
    text: 'THC peaks. Euphoric, social, mild body relaxation.',
    terpenes: 'Myrcene, Limonene, Caryophyllene',
    accent: '#84cc16',
  },
  'mid': {
    label: 'FULL SPECTRUM',
    text: 'CBN activating. Deeper relaxation, stronger effects.',
    terpenes: 'Myrcene, Linalool, Caryophyllene',
    accent: '#f59e0b',
  },
  'mid-high': {
    label: 'HEAVY RELIEF',
    text: 'CBC and higher cannabinoids active. Strong sedation, pain relief.',
    terpenes: 'Myrcene, Linalool, Humulene',
    accent: '#f59e0b',
  },
  'high': {
    label: 'MAXIMUM EXTRACTION',
    text: 'All compounds active. Intense, heavy. Best for severe symptoms.',
    terpenes: 'Myrcene, Linalool, Bisabolol',
    accent: '#e84040',
  },
}

const RANGE_LABELS: Record<TempRange, string> = {
  'low': '160 - 174°C',
  'mid-low': '175 - 184°C',
  'mid': '185 - 194°C',
  'mid-high': '195 - 204°C',
  'high': '205 - 210°C',
}

/* Castform sprite components */

function SunnyForm() {
  // Yellow circle with ray divs around it
  const rays = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45 * Math.PI) / 180
    const dist = 44
    const x = 40 + dist * Math.cos(angle)
    const y = 40 + dist * Math.sin(angle)
    return { x, y, angle }
  })
  return (
    <div style={{ position: 'relative', width: 80, height: 80 }}>
      {rays.map((r, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: r.x - 3,
          top: r.y - 3,
          width: 6,
          height: 6,
          background: '#f0e040',
          borderRadius: 0,
          transform: `rotate(${i * 45}deg)`,
        }} />
      ))}
      <div style={{
        position: 'absolute',
        left: 15,
        top: 15,
        width: 50,
        height: 50,
        background: '#f0e040',
        border: '2px solid #c0b020',
        borderRadius: '50%',
        boxShadow: '0 0 12px rgba(240,224,64,0.4)',
      }} />
    </div>
  )
}

function NormalForm() {
  return (
    <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: 56,
        height: 56,
        background: '#c8e890',
        border: '2px solid #84cc16',
        borderRadius: '50%',
        boxShadow: 'inset 0 0 0 4px #a0c060, 0 0 10px rgba(200,232,144,0.2)',
      }} />
    </div>
  )
}

function NightForm() {
  const clouds = [
    { left: 4, top: 28, width: 28, height: 14 },
    { left: 46, top: 22, width: 26, height: 12 },
    { left: 18, top: 48, width: 32, height: 14 },
  ]
  return (
    <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        position: 'absolute',
        left: 15,
        top: 10,
        width: 50,
        height: 50,
        background: '#6060c0',
        border: '2px solid #4040a0',
        borderRadius: '50%',
        boxShadow: '0 0 12px rgba(96,96,192,0.3)',
        zIndex: 1,
      }} />
      {clouds.map((c, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: c.left,
          top: c.top,
          width: c.width,
          height: c.height,
          background: '#8080d0',
          border: '1px solid #6060b0',
          borderRadius: 0,
          zIndex: 2,
        }} />
      ))}
    </div>
  )
}

function CastformSprite({ range }: { range: TempRange }) {
  if (range === 'low' || range === 'mid-low') return <SunnyForm />
  if (range === 'mid') return <NormalForm />
  return <NightForm />
}

function CastformLabel({ range }: { range: TempRange }) {
  const labels: Record<TempRange, { text: string; color: string }> = {
    'low': { text: 'SUNNY FORM', color: '#f0e040' },
    'mid-low': { text: 'SUNNY FORM', color: '#f0e040' },
    'mid': { text: 'NORMAL FORM', color: '#c8e890' },
    'mid-high': { text: 'NIGHT FORM', color: '#8080d0' },
    'high': { text: 'NIGHT FORM', color: '#8080d0' },
  }
  const { text, color } = labels[range]
  return (
    <span style={{
      fontFamily: "'PokemonGb', 'Press Start 2P'",
      fontSize: 7,
      color,
      letterSpacing: 0.5,
    }}>
      {text}
    </span>
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

export default function CastformDial() {
  const [temp, setTemp] = useState(185)

  const range = getTempRange(temp)
  const profile = EFFECT_PROFILES[range]
  const rangeLabel = RANGE_LABELS[range]

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
        marginBottom: 0,
      }}>
        <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 13, color: '#84cc16' }}>
          HEAT LAB
        </span>
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P'",
          fontSize: 8,
          color: '#4a7a10',
          border: '2px solid #2a4a08',
          padding: '2px 6px',
          borderRadius: 0,
        }}>
          [VAPE]
        </span>
      </div>

      <ProfToakSprite />

      {/* Castform sprite area */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <CastformSprite range={range} />
        <CastformLabel range={range} />
      </div>

      {/* Temperature display */}
      <div style={{ textAlign: 'center' }}>
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P'",
          fontSize: 22,
          color: '#84cc16',
          letterSpacing: 2,
        }}>
          {temp}
          <span style={{ fontSize: 13, color: '#4a7a10', marginLeft: 6 }}>°C</span>
        </span>
      </div>

      {/* Range slider */}
      <div style={{ padding: '0 4px' }}>
        <style>{`
          .castform-slider {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 8px;
            background: #0a1408;
            border: 2px solid #2a4a08;
            border-radius: 0;
            outline: none;
            cursor: pointer;
          }
          .castform-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 28px;
            background: #84cc16;
            border: 2px solid #2a4a08;
            border-radius: 0;
            cursor: pointer;
          }
          .castform-slider::-moz-range-thumb {
            width: 20px;
            height: 28px;
            background: #84cc16;
            border: 2px solid #2a4a08;
            border-radius: 0;
            cursor: pointer;
          }
          .castform-slider::-webkit-slider-runnable-track {
            border-radius: 0;
          }
        `}</style>
        <input
          type="range"
          className="castform-slider"
          min={160}
          max={210}
          step={1}
          value={temp}
          onChange={(e) => setTemp(Number(e.target.value))}
        />
        {/* Tick marks */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 4,
          padding: '0 2px',
        }}>
          {[160, 170, 180, 190, 200, 210].map((t) => (
            <span key={t} style={{
              fontFamily: "'PokemonGb', 'Press Start 2P'",
              fontSize: 6,
              color: temp >= t ? '#84cc16' : '#2a4a08',
            }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Effect profile poke-box */}
      <div style={{
        ...pokeBox,
        border: `3px solid ${profile.accent}`,
        padding: 14,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{
            fontFamily: "'PokemonGb', 'Press Start 2P'",
            fontSize: 9,
            color: profile.accent,
            letterSpacing: 0.5,
          }}>
            {profile.label}
          </span>
          <span style={{
            fontFamily: "'PokemonGb', 'Press Start 2P'",
            fontSize: 7,
            color: '#4a7a10',
          }}>
            {rangeLabel}
          </span>
        </div>
        <p style={{
          fontFamily: 'monospace',
          fontSize: 13,
          color: '#c8e890',
          lineHeight: 1.7,
          margin: 0,
        }}>
          {profile.text}
        </p>
      </div>

      {/* Terpene highlight poke-box */}
      <div style={{ ...pokeBox, padding: 12 }}>
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P'",
          fontSize: 8,
          color: '#4a7a10',
          display: 'block',
          marginBottom: 6,
          letterSpacing: 0.5,
        }}>
          TERPENES ACTIVE
        </span>
        <p style={{
          fontFamily: 'monospace',
          fontSize: 13,
          color: '#c8e890',
          lineHeight: 1.7,
          margin: 0,
        }}>
          {profile.terpenes}
        </p>
      </div>
    </div>
  )
}
