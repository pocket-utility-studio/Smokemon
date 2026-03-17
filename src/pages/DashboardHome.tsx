import { useState, useEffect } from 'react'
import { useTransitionNav } from '../context/NavigationContext'
import { playNavigate } from '../utils/sounds'
import { haptic } from '../utils/haptic'

const pokeBox = {
  border: '4px solid #84cc16',
  background: '#050e04',
}

const FONT = "'PokemonGb', 'Press Start 2P', monospace"

// ── Data model ────────────────────────────────────────────────────────────────

type Leaf = {
  kind: 'leaf'
  to: string
  label: string
  description: string
  tag: string
  tagColor: string
}

type Group = {
  kind: 'group'
  id: string
  label: string
  description: string
  tag: string
  tagColor: string
  children: Leaf[]
}

type TopItem = Leaf | Group

const MENU: TopItem[] = [
  { kind: 'leaf', to: '/smokedex',    label: 'SMOKÉDEX',     description: 'YOUR PERSONAL STRAIN JOURNAL',       tag: '[DEX]',  tagColor: '#84cc16' },
  { kind: 'leaf', to: '/poke-center', label: 'SMOKÉ CENTER', description: 'AI POWERED STRAIN FINDER',           tag: '[RX]',   tagColor: '#a78bfa' },
  {
    kind: 'group', id: 'vape',
    label: "PROF T-OAK'S LAB", description: 'TEMP GUIDES, AVB RESEARCH & EXPERIMENTS',
    tag: '[VAPE]', tagColor: '#f0e040',
    children: [
      { kind: 'leaf', to: '/castform',  label: 'HEAT LAB', description: 'VAPE TEMPERATURE RESEARCH',        tag: '[VAPE]',   tagColor: '#f0e040' },
      { kind: 'leaf', to: '/avb',       label: 'AVB ANALYSIS',  description: 'ALREADY VAPED BUD + TIMERS',       tag: '[DATA]',   tagColor: '#f59e0b' },
      { kind: 'leaf', to: '/abv-guide', label: 'FOSSIL REVIVE', description: '6 METHODS TO USE YOUR LEFTOVERS',  tag: '[COOK]',   tagColor: '#f59e0b' },
    ],
  },
  {
    kind: 'group', id: 'library',
    label: 'TRAINER SCHOOL', description: 'TERPENES, HISTORY & LAW REFERENCE',
    tag: '[LEARN]', tagColor: '#a78bfa',
    children: [
      { kind: 'leaf', to: '/terpenes', label: 'TERPENE DICT', description: 'EXPLORE & QUIZ YOUR KNOWLEDGE',    tag: '[LEARN]', tagColor: '#a78bfa' },
      { kind: 'leaf', to: '/facts',    label: 'FACT CART',    description: 'DAILY CANNABIS HISTORY',           tag: '[DAILY]', tagColor: '#84cc16' },
      { kind: 'leaf', to: '/law',      label: 'LAW GUIDE',    description: 'UK + ES CANNABIS LAW',              tag: '[LAW]',   tagColor: '#e84040' },
      { kind: 'leaf', to: '/data-audit', label: 'DATA AUDIT', description: 'VERIFY STRAIN DATA QUALITY', tag: '[AUDIT]', tagColor: '#4a9a20' },
    ],
  },
  { kind: 'leaf', to: '/escape', label: 'ESCAPE ROPE', description: 'PANIC & GROUNDING GUIDE',    tag: '[SOS]',  tagColor: '#e84040' },
  { kind: 'leaf', to: '/save',   label: 'SAVE GAME',   description: 'EXPORT / IMPORT YOUR DATA',  tag: '[DATA]', tagColor: '#4a9a20' },
]

// ── Sprite ────────────────────────────────────────────────────────────────────

function Sprite({ color }: { color: string }) {
  return (
    <div style={{
      width: 24, height: 24, flexShrink: 0,
      border: `1px solid ${color}`, background: `${color}22`,
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(4, 1fr)',
      gap: 1, padding: 3, boxSizing: 'border-box',
    }}>
      {Array.from({ length: 16 }).map((_, i) => {
        const r = Math.floor(i / 4), c = i % 4
        return <div key={i} style={{ background: (r === 1 || r === 2) && (c === 1 || c === 2) ? color : 'transparent' }} />
      })}
    </div>
  )
}

// ── Row shared renderer ────────────────────────────────────────────────────────

function MenuRow({
  label, description, tag, tagColor, isActive, isBack = false,
  onEnter, onHover,
}: {
  label: string
  description?: string
  tag: string
  tagColor: string
  isActive: boolean
  isBack?: boolean
  onEnter: () => void
  onHover: () => void
}) {
  return (
    <button
      onPointerEnter={onHover}
      onClick={onEnter}
      style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: isActive ? '16px 10px' : '12px 10px',
        background: isActive ? '#84cc16' : 'transparent',
        border: 'none', boxSizing: 'border-box', cursor: 'pointer',
        flexShrink: 0, width: '100%', textAlign: 'left', gap: 8,
      }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Cursor arrow */}
        <span style={{
          fontFamily: FONT, fontSize: 13,
          opacity: isActive ? 1 : 0, flexShrink: 0, width: 14,
          color: isActive ? '#050e04' : '#84cc16',
        }}>►</span>

        {!isBack && <Sprite color={tagColor} />}

        {/* Label + tag inline */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: FONT, fontSize: 13,
            color: isBack ? '#4a7a10' : isActive ? '#050e04' : '#84cc16',
          }}>
            {isBack ? '◄ BACK' : label}
          </span>
          {!isBack && (
            <span style={{
              fontFamily: FONT, fontSize: 8,
              color: tagColor, border: `1px solid ${tagColor}`,
              padding: '3px 6px', flexShrink: 0,
            }}>{tag}</span>
          )}
        </div>
      </div>

      {/* Description — active only */}
      {isActive && description && (
        <div style={{
          fontFamily: FONT, fontSize: 9,
          color: isActive ? '#0a2808' : '#88ff88', paddingLeft: isBack ? 24 : 48,
          lineHeight: 1.8,
        }}>{description}</div>
      )}
    </button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function DashboardHome() {
  const [cursor, setCursor] = useState(0)
  const [openGroup, setOpenGroup] = useState<Group | null>(null)
  const { transitionTo } = useTransitionNav()

  // Items visible in the current view (main or sub-menu)
  const items: Array<{ kind: 'back' } | TopItem> = openGroup
    ? [{ kind: 'back' }, ...openGroup.children]
    : MENU

  const moveCursor = (dir: 1 | -1) => {
    setCursor((prev) => {
      const next = Math.max(0, Math.min(items.length - 1, prev + dir))
      if (next !== prev) { haptic(15); playNavigate() }
      return next
    })
  }

  const activate = (item: typeof items[number]) => {
    if (item.kind === 'back') {
      setOpenGroup(null)
      setCursor(MENU.findIndex((m) => m.kind === 'group' && m.id === openGroup?.id))
      return
    }
    if (item.kind === 'group') {
      haptic(20); playNavigate()
      setOpenGroup(item)
      setCursor(1) // skip BACK, land on first child
      return
    }
    transitionTo(item.to)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown')  { e.preventDefault(); moveCursor(1) }
      if (e.key === 'ArrowUp')    { e.preventDefault(); moveCursor(-1) }
      if (e.key === 'Escape' && openGroup) {
        e.preventDefault()
        activate({ kind: 'back' })
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        activate(items[cursor])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [cursor, items, openGroup])

  const isSubMenu = openGroup !== null

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      gap: 8, padding: '6px 4px', background: '#050e04', boxSizing: 'border-box',
    }}>

      {/* ── Header ── */}
      <div style={{
        ...pokeBox, padding: '10px 12px', flexShrink: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontFamily: FONT, fontSize: 18, color: '#84cc16', letterSpacing: 1 }}>
          SMOK<span style={{ fontFamily: "'Press Start 2P', monospace" }}>é</span>MON
        </span>
        {isSubMenu ? (
          <span style={{ fontFamily: FONT, fontSize: 9, color: openGroup.tagColor }}>
            {openGroup.label}
          </span>
        ) : (
          <span style={{ fontFamily: FONT, fontSize: 9, color: '#4a9a20' }}>
            {MENU.length} ITEMS
          </span>
        )}
      </div>

      {/* ── Menu list ── */}
      <div style={{
        ...pokeBox, flex: 1, overflowY: 'auto',
        display: 'flex', flexDirection: 'column', padding: '4px 0',
      }}>
        {items.map((item, i) => {
          const isBack = item.kind === 'back'
          const label = isBack ? '' : item.label
          const tag   = isBack ? '' : item.tag
          const tagColor = isBack ? '#84cc16' : item.tagColor
          const description = isBack ? undefined : item.description

          return (
            <MenuRow
              key={isBack ? '__back__' : (item as Leaf | Group).label}
              label={label}
              description={description}
              tag={tag}
              tagColor={tagColor}
              isActive={cursor === i}
              isBack={isBack}
              onEnter={() => activate(item)}
              onHover={() => { setCursor(i); haptic(10); playNavigate() }}
            />
          )
        })}
      </div>

      {/* ── Footer hint ── */}
      <div style={{
        ...pokeBox, padding: '6px 12px', flexShrink: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <button
          onClick={() => isSubMenu ? activate({ kind: 'back' }) : activate(items[cursor])}
          style={{
            fontFamily: FONT, fontSize: 10, color: '#84cc16',
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '6px 0', minHeight: 44, minWidth: 80, textAlign: 'left',
          }}
        >
          {isSubMenu ? '[B] BACK' : '[A] OPEN'}
        </button>
        <span style={{ fontFamily: FONT, fontSize: 9, color: '#4a9a20' }}>▲▼ SCROLL</span>
      </div>
    </div>
  )
}
