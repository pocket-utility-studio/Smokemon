import { useState, useEffect } from 'react'
import { useTransitionNav } from '../context/NavigationContext'
import { playNavigate } from '../utils/sounds'
import { haptic } from '../utils/haptic'

const pokeBox = {
  border: '3px solid #84cc16',
  boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
  background: '#0a1408',
}

const cartridges = [
  { to: '/smokedex',    label: 'SMOKEDEX',     description: 'YOUR PERSONAL STRAIN JOURNAL',    tag: '[DEX]',    tagColor: '#84cc16' },
  { to: '/poke-center', label: 'POKE CENTER',  description: 'SYMPTOM-BASED RECOMMENDER',       tag: '[RX]',     tagColor: '#a78bfa' },
  { to: '/strain-match',label: 'STRAIN MATCH', description: 'AI POWERED STRAIN FINDER',        tag: '[AI]',     tagColor: '#84cc16' },
  { to: '/castform',    label: 'CASTFORM DIAL',description: 'VAPE TEMPERATURE GUIDE',          tag: '[VAPE]',   tagColor: '#f0e040' },
  { to: '/avb',         label: 'AVB STATUS',   description: 'ALREADY VAPED BUD + TIMERS',      tag: '[AVB]',    tagColor: '#f59e0b' },
  { to: '/abv-guide',   label: 'AVB GUIDE',    description: '6 METHODS TO USE YOUR LEFTOVERS', tag: '[HOW-TO]', tagColor: '#f59e0b' },
  { to: '/terpenes',    label: 'TERPENE DICT', description: 'EXPLORE & QUIZ YOUR KNOWLEDGE',   tag: '[LEARN]',  tagColor: '#a78bfa' },
  { to: '/facts',       label: 'FACT CART',    description: 'DAILY CANNABIS HISTORY',          tag: '[DAILY]',  tagColor: '#84cc16' },
  { to: '/law',         label: 'LAW GUIDE',    description: 'SPAIN CANNABIS LAW REFERENCE',    tag: '[ES]',     tagColor: '#e84040' },
  { to: '/escape',      label: 'ESCAPE ROPE',  description: 'PANIC & GROUNDING GUIDE',         tag: '[SOS]',    tagColor: '#e84040' },
  { to: '/save',        label: 'SAVE STATE',   description: 'EXPORT / IMPORT YOUR DATA',       tag: '[DATA]',   tagColor: '#4a7a10' },
]

export default function DashboardHome() {
  const [cursor, setCursor] = useState(0)
  const { transitionTo } = useTransitionNav()

  const moveCursor = (dir: 1 | -1) => {
    setCursor((prev) => {
      const next = Math.max(0, Math.min(cartridges.length - 1, prev + dir))
      if (next !== prev) {
        haptic(15)
        playNavigate()
      }
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
      padding: '10px',
      background: '#050a04',
      boxSizing: 'border-box',
    }}>
      <div style={{
        ...pokeBox,
        padding: '8px 12px',
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: '#84cc16', letterSpacing: 1 }}>
          SMOKEMON
        </span>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#4a7a10' }}>
          {cartridges.length} CARTS
        </span>
      </div>

      <div style={{ ...pokeBox, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {cartridges.map((c, i) => {
          const isActive = cursor === i
          return (
            <button
              key={c.to}
              onPointerEnter={() => { setCursor(i); haptic(10); playNavigate() }}
              onClick={() => transitionTo(c.to)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '10px 12px',
                textDecoration: 'none',
                background: isActive ? 'rgba(132,204,22,0.07)' : 'transparent',
                borderBottom: '1px solid #1a3004',
                border: 'none',
                borderBottomColor: '#1a3004',
                borderBottomWidth: 1,
                borderBottomStyle: 'solid',
                boxSizing: 'border-box',
                cursor: 'pointer',
                flexShrink: 0,
                width: '100%',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 11, color: '#84cc16',
                  opacity: isActive ? 1 : 0,
                  flexShrink: 0, width: 12,
                }}>►</span>
                <span style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 11,
                  color: isActive ? '#c8e890' : '#4a7a10',
                  flex: 1,
                }}>{c.label}</span>
                <span style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 7,
                  color: c.tagColor,
                  border: `1px solid ${c.tagColor}`,
                  padding: '2px 5px',
                  flexShrink: 0,
                }}>{c.tag}</span>
              </div>
              <div style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 8,
                color: isActive ? '#4a7a10' : '#1a3a04',
                marginTop: 5, paddingLeft: 20,
              }}>{c.description}</div>
            </button>
          )
        })}
      </div>

      <div style={{
        ...pokeBox, padding: '6px 12px', flexShrink: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#84cc16' }}>[A] OPEN</span>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#4a7a10' }}>▲▼ SCROLL</span>
      </div>
    </div>
  )
}
