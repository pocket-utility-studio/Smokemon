import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import { useStrainDb, displayName } from '../hooks/useStrainDb'
import { useStash } from '../context/StashContext'
import { useTransitionNav } from '../context/NavigationContext'

const FONT = "'PokemonGb', 'Press Start 2P', monospace"
const GBC_BG = '#050a04'
const GBC_TEXT = '#c8e890'
const GBC_MUTED = '#4a7a10'
const GBC_DARKEST = '#2a4a08'
const GBC_GREEN = '#84cc16'
const GBC_BOX = '#0a1408'
const GBC_AMBER = '#f59e0b'
const GBC_VIOLET = '#a78bfa'
const GBC_RED = '#e84040'

interface SearchResult {
  id: string
  category: 'STRAIN' | 'STASH' | 'SESSION' | 'WANTED'
  title: string
  subtitle?: string
  tag: string
  tagColor: string
  navigateTo: string
}

interface SessionRecord {
  id: string
  strainName: string
  strainType?: string
  date?: string
  notes?: string
  rating?: number
}

interface WantedRecord {
  id: string
  name: string
  type?: string
  notes?: string
  acquired?: boolean
}

const MAX_PER_CAT = 5

export default function UniversalSearch() {
  const [query, setQuery] = useState('')
  const { db: strains } = useStrainDb()
  const { entries: stash } = useStash()
  const { transitionTo } = useTransitionNav()

  const sessions = useMemo<SessionRecord[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('utilhub_sessions') ?? '[]') ?? []
    } catch {
      return []
    }
  }, [])

  const wanted = useMemo<WantedRecord[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('utilhub_wanted') ?? '[]') ?? []
    } catch {
      return []
    }
  }, [])

  const strainFuse = useMemo(
    () =>
      new Fuse(strains, {
        keys: [
          { name: 'Strain', weight: 3 },
          { name: 'Effects', weight: 1 },
          { name: 'terpenes', weight: 1 },
        ],
        threshold: 0.3,
        distance: 100,
      }),
    [strains],
  )

  const stashFuse = useMemo(
    () =>
      new Fuse(stash, {
        keys: [
          { name: 'name', weight: 3 },
          { name: 'notes', weight: 1 },
        ],
        threshold: 0.3,
      }),
    [stash],
  )

  const sessionFuse = useMemo(
    () =>
      new Fuse(sessions, {
        keys: [
          { name: 'strainName', weight: 3 },
          { name: 'notes', weight: 1 },
        ],
        threshold: 0.3,
      }),
    [sessions],
  )

  const wantedFuse = useMemo(
    () =>
      new Fuse(wanted, {
        keys: [
          { name: 'name', weight: 3 },
          { name: 'notes', weight: 1 },
        ],
        threshold: 0.3,
      }),
    [wanted],
  )

  const results = useMemo<{
    strains: SearchResult[]
    stash: SearchResult[]
    sessions: SearchResult[]
    wanted: SearchResult[]
  }>(() => {
    if (!query.trim()) {
      return { strains: [], stash: [], sessions: [], wanted: [] }
    }

    const strainResults: SearchResult[] = strainFuse
      .search(query)
      .slice(0, MAX_PER_CAT)
      .map((r) => ({
        id: `strain-${r.item.Strain}`,
        category: 'STRAIN',
        title: displayName(r.item),
        subtitle: r.item.Type ? r.item.Type.toUpperCase() : undefined,
        tag: '[STRAIN]',
        tagColor: GBC_GREEN,
        navigateTo: '/smokedex',
      }))

    const stashResults: SearchResult[] = stashFuse
      .search(query)
      .slice(0, MAX_PER_CAT)
      .map((r) => ({
        id: `stash-${r.item.id}`,
        category: 'STASH',
        title: r.item.name,
        subtitle: r.item.type ? r.item.type.toUpperCase() : undefined,
        tag: '[STASH]',
        tagColor: GBC_AMBER,
        navigateTo: '/smokedex',
      }))

    const sessionResults: SearchResult[] = sessionFuse
      .search(query)
      .slice(0, MAX_PER_CAT)
      .map((r) => ({
        id: `session-${r.item.id}`,
        category: 'SESSION',
        title: r.item.strainName,
        subtitle: r.item.date ? r.item.date.slice(0, 10) : undefined,
        tag: '[SESSION]',
        tagColor: GBC_VIOLET,
        navigateTo: '/sessions',
      }))

    const wantedResults: SearchResult[] = wantedFuse
      .search(query)
      .slice(0, MAX_PER_CAT)
      .map((r) => ({
        id: `wanted-${r.item.id}`,
        category: 'WANTED',
        title: r.item.name,
        subtitle: r.item.type ? r.item.type.toUpperCase() : undefined,
        tag: '[WANTED]',
        tagColor: GBC_RED,
        navigateTo: '/wanted',
      }))

    return {
      strains: strainResults,
      stash: stashResults,
      sessions: sessionResults,
      wanted: wantedResults,
    }
  }, [query, strainFuse, stashFuse, sessionFuse, wantedFuse])

  const totalCount =
    results.strains.length +
    results.stash.length +
    results.sessions.length +
    results.wanted.length

  const hasQuery = query.trim().length > 0

  const categoryGroups: Array<{
    key: keyof typeof results
    label: string
    color: string
  }> = [
    { key: 'strains', label: '[STRAIN]', color: GBC_GREEN },
    { key: 'stash', label: '[STASH]', color: GBC_AMBER },
    { key: 'sessions', label: '[SESSION]', color: GBC_VIOLET },
    { key: 'wanted', label: '[WANTED]', color: GBC_RED },
  ]

  return (
    <div
      style={{
        fontFamily: FONT,
        background: GBC_BG,
        color: GBC_TEXT,
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px',
        boxSizing: 'border-box',
        gap: '12px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontFamily: FONT,
            fontSize: '10px',
            color: GBC_GREEN,
            letterSpacing: '0.05em',
          }}
        >
          UNIVERSAL SEARCH
        </span>
        <span
          style={{
            fontFamily: FONT,
            fontSize: '9px',
            color: hasQuery ? GBC_TEXT : GBC_MUTED,
            background: GBC_DARKEST,
            padding: '4px 8px',
            border: `1px solid ${hasQuery ? GBC_GREEN : GBC_MUTED}`,
          }}
        >
          {hasQuery ? `${totalCount} RESULTS` : 'SEARCH ALL'}
        </span>
      </div>

      {/* Search box */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: GBC_BOX,
          border: `2px solid ${GBC_GREEN}`,
        }}
      >
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Strain, effect, terpene..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '14px',
            color: GBC_TEXT,
            padding: '12px',
            minHeight: '44px',
            boxSizing: 'border-box',
          }}
        />
        {hasQuery && (
          <button
            onPointerDown={(e) => {
              e.preventDefault()
              setQuery('')
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: GBC_MUTED,
              fontFamily: FONT,
              fontSize: '11px',
              cursor: 'pointer',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
              flexShrink: 0,
            }}
            aria-label="Clear search"
          >
            [X]
          </button>
        )}
      </div>

      {/* Results */}
      {hasQuery && totalCount > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {categoryGroups.map(({ key, label, color }) => {
            const items = results[key]
            if (items.length === 0) return null
            return (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {/* Category header */}
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: '9px',
                    color,
                    padding: '4px 0',
                    borderBottom: `1px solid ${GBC_DARKEST}`,
                    marginBottom: '4px',
                  }}
                >
                  {label} {items.length}
                </div>
                {/* Result rows */}
                {items.map((result) => (
                  <div
                    key={result.id}
                    onPointerDown={() => transitionTo(result.navigateTo)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      minHeight: '44px',
                      padding: '8px 10px',
                      background: GBC_BOX,
                      border: `1px solid ${GBC_DARKEST}`,
                      cursor: 'pointer',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '12px',
                          color: GBC_TEXT,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {result.title}
                      </span>
                      {result.subtitle && (
                        <span
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '11px',
                            color: GBC_MUTED,
                          }}
                        >
                          {result.subtitle}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontFamily: FONT,
                        fontSize: '8px',
                        color: result.tagColor,
                        border: `1px solid ${result.tagColor}`,
                        padding: '3px 5px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {result.tag}
                    </span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* No results */}
      {hasQuery && totalCount === 0 && (
        <div
          style={{
            fontFamily: FONT,
            fontSize: '9px',
            color: GBC_MUTED,
            textAlign: 'center',
            padding: '24px 12px',
            border: `1px solid ${GBC_DARKEST}`,
            background: GBC_BOX,
          }}
        >
          NO RESULTS FOR '{query.toUpperCase()}'
        </div>
      )}

      {/* Empty state */}
      {!hasQuery && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            {
              label: 'STRAINS',
              color: GBC_GREEN,
              desc: 'Strain database — name, effects, terpenes',
            },
            {
              label: 'STASH',
              color: GBC_AMBER,
              desc: 'Your saved stash entries and notes',
            },
            {
              label: 'SESSIONS',
              color: GBC_VIOLET,
              desc: 'Logged sessions with ratings and notes',
            },
            {
              label: 'WANTED',
              color: GBC_RED,
              desc: 'Strains on your wanted list',
            },
          ].map(({ label, color, desc }) => (
            <div
              key={label}
              style={{
                border: `2px solid ${color}`,
                background: GBC_BOX,
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <span
                style={{
                  fontFamily: FONT,
                  fontSize: '9px',
                  color,
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px',
                  color: GBC_MUTED,
                }}
              >
                {desc}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
