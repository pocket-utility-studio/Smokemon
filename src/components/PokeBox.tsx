import { type CSSProperties, type ReactNode } from 'react'
import { useTimeOfDay } from '../context/TimeOfDayContext'
import type { Palette } from '../context/TimeOfDayContext'

interface PokeBoxProps {
  title?: string
  children: ReactNode
  style?: CSSProperties
  palette?: Palette
  accent?: string
  noPadding?: boolean
}

// Darken the accent to get the dim inner-border tone
function dimColor(hex: string): string {
  // Parse and halve each channel
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const dr = Math.round(r * 0.45).toString(16).padStart(2, '0')
  const dg = Math.round(g * 0.45).toString(16).padStart(2, '0')
  const db = Math.round(b * 0.45).toString(16).padStart(2, '0')
  return `#${dr}${dg}${db}`
}

export function PokeBox({
  title,
  children,
  style,
  palette,
  accent: accentProp,
  noPadding = false,
}: PokeBoxProps) {
  const { palette: ctxPalette } = useTimeOfDay()
  const p = palette ?? ctxPalette

  const accent = accentProp ?? p.accent
  const boxBg = p.boxBg
  const borderDark = p.borderDark
  const dimAccent = dimColor(accent)

  return (
    <div
      style={{
        border: `3px solid ${accent}`,
        boxShadow: `inset 0 0 0 2px ${boxBg}, inset 0 0 0 4px ${dimAccent}`,
        background: boxBg,
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            borderBottom: `2px solid ${borderDark}`,
            padding: '6px 10px',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 10,
            color: accent,
          }}
        >
          {title}
        </div>
      )}
      <div style={{ padding: noPadding ? 0 : '10px 12px' }}>{children}</div>
    </div>
  )
}
