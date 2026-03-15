import { useState, useEffect } from 'react'
import { useTransitionNav } from '../context/NavigationContext'
import { playNavigate } from '../utils/sounds'
import { haptic } from '../utils/haptic'

// Pokémon-style double text box border
const pokeBox = {
  border: '4px double #84cc16',
  outline: '2px solid #2a5008',
  outlineOffset: '-6px',
  background: '#050e04',
}

const FONT = "'PokemonGb', 'Press Start 2P', monospace"

// Sprite colours per tag — gives each item a distinct pixel icon tint
const spriteColor: Record<string, string> = {
  '[DEX]':    '#84cc16',
  '[RX]':     '#a78bfa',
  '[AI]':     '#84cc16',
  '[VAPE]':   '#f0e040',
  '[AVB]':    '#f59e0b',
  '[HOW-TO]': '#f59e0b',
  '[LEARN]':  '#a78bfa',
  '[DAILY]':  '#84cc16',
  '[ES]':     '#e84040',
  '[SOS]':    '#e84040',
  '[DATA]':   '#4a9a20',
}

const cartridges = [
  { to: '/smokedex',    label: 'SMOKÉDEX',     description: 'YOUR PERSONAL STRAIN JOURNAL',    tag: '[DEX]',    tagColor: '#84cc16' },
  { to: '/poke-center', label: 'POKÉ CENTER',  description: 'SYMPTOM-BASED RECOMMENDER',       tag: '[RX]',     tagColor: '#a78bfa' },
  { to: '/strain-match',label: 'STRAIN MATCH', description: 'AI POWERED STRAIN FINDER',        tag: '[AI]',     tagColor: '#84cc16' },
  { to: '/castform',    label: 'CASTFORM DIAL',description: 'VAPE TEMPERATURE GUIDE',          tag: '[VAPE]',   tagColor: '#f0e040' },
  { to: '/avb',         label: 'AVB STATUS',   description: 'ALREADY VAPED BUD + TIMERS',      tag: '[AVB]',    tagColor: '#f59e0b' },
  { to: '/abv-guide',   label: 'AVB GUIDE',    description: '6 METHODS TO USE YOUR LEFTOVERS', tag: '[HOW-TO]', tagColor: '#f59e0b' },
  { to: '/terpenes',    label: 'TERPENE DICT', description: 'EXPLORE & QUIZ YOUR KNOWLEDGE',   tag: '[LEARN]',  tagColor: '#a78bfa' },
  { to: '/facts',       label: 'FACT CART',    description: 'DAILY CANNABIS HISTORY',          tag: '[DAILY]',  tagColor: '#84cc16' },
  { to: '/law',         label: 'LAW GUIDE',    description: 'SPAIN CANNABIS LAW REFERENCE',    tag: '[ES]',     tagColor: '#e84040' },
  { to: '/escape',      label: 'ESCAPE ROPE',  description: 'PANIC & GROUNDING GUIDE',         tag: '[SOS]',    tagColor: '#e84040' },
  { to: '/save',        label: 'SAVE STATE',   description: 'EXPORT / IMPORT YOUR DATA',       tag: '[DATA]',   tagColor: '#4a9a20' },
]

// 24×24 sprite placeholder — tinted to the item's tag colour
function Sprite({ color }: { color: string }) {
  return (
    <div style={{
      width: 24, height: 24,
      flexShrink: 0,
      border: `1px solid ${color}`,
      background: `${color}22`,
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridTemplateRows: 'repeat(4, 1fr)',
      gap: 1,
      padding: 3,
      boxSizing: 'border-box',
    }}>
      {Array.from({ length: 16 }).map((_, i) => {
        const row = Math.floor(i / 4)
        const col = i % 4
        const lit = (row === 1 || row === 2) && (col === 1 || col === 2)
        return <div key={i} style={{ background: lit ? color : 'transparent' }} />
      })}
    </div>
  )
}

export default function DashboardHome() {
  const [cursor, setCursor] = useState(0)
  const { transitionTo } = useTransitionNav()

  const moveCursor = (dir: 1 | -1) => {
    setCursor((prev) => {
      const next = Math.max(0, Math.min(cartridges.length - 1, prev + dir))
      if (next !== prev) { haptic(15); playNavigate() }
      return next
    })
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); moveCursor(1) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); moveCursor(-1) }
      if (e.key === 'Enter')     { e.preventDefault(); transitionTo(cartridges[cursor].to) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [cursor, transitionTo])

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: '6px 4px',
      background: '#050e04',
      boxSizing: 'border-box',
    }}>

      {/* ── Header ── */}
      <div style={{
        ...pokeBox,
        padding: '10px 12px',
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontFamily: FONT, fontSize: 18, color: '#84cc16', letterSpacing: 1 }}>
          SMOK<span style={{ fontFamily: "'Press Start 2P', monospace" }}>é</span>MON
        </span>
        <span style={{ fontFamily: FONT, fontSize: 9, color: '#4a9a20' }}>
          {cartridges.length} CARTS
        </span>
      </div>

      {/* ── Menu list ── */}
      <div style={{ ...pokeBox, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '4px 0' }}>
        {cartridges.map((c, i) => {
          const isActive = cursor === i
          const sp = spriteColor[c.tag] ?? '#84cc16'
          return (
            <button
              key={c.to}
              onPointerEnter={() => { setCursor(i); haptic(10); playNavigate() }}
              onClick={() => transitionTo(c.to)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: isActive ? '14px 10px' : '12px 10px',
                background: isActive ? 'rgba(132,204,22,0.10)' : 'transparent',
                border: 'none',
                boxSizing: 'border-box',
                cursor: 'pointer',
                flexShrink: 0,
                width: '100%',
                textAlign: 'left',
                gap: 8,
              }}
            >
              {/* Title row: cursor arrow + sprite + label + tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontFamily: FONT, fontSize: 13, color: '#84cc16',
                  opacity: isActive ? 1 : 0,
                  flexShrink: 0, width: 14,
                }}>►</span>

                <Sprite color={sp} />

                <span style={{
                  fontFamily: FONT, fontSize: 13,
                  color: isActive ? '#e8ffb0' : '#84cc16',
                  flex: 1,
                }}>{c.label}</span>

                <span style={{
                  fontFamily: FONT, fontSize: 8,
                  color: c.tagColor,
                  border: `1px solid ${c.tagColor}`,
                  padding: '3px 6px',
                  flexShrink: 0,
                }}>{c.tag}</span>
              </div>

              {/* Description — only shown for the active item */}
              {isActive && (
                <div style={{
                  fontFamily: FONT, fontSize: 9,
                  color: '#88ff88',
                  paddingLeft: 48,
                  lineHeight: 1.8,
                }}>{c.description}</div>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Footer hint ── */}
      <div style={{
        ...pokeBox, padding: '10px 12px', flexShrink: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontFamily: FONT, fontSize: 10, color: '#84cc16' }}>[A] OPEN</span>
        <span style={{ fontFamily: FONT, fontSize: 9, color: '#4a9a20' }}>▲▼ SCROLL</span>
      </div>
    </div>
  )
}
