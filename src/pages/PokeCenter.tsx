import { useState, useEffect, useRef, useCallback } from 'react'
import { parseGIF, decompressFrames } from 'gifuct-js'
import { useGifMode } from '../context/GifModeContext'
import { useLayoutMode } from '../context/LayoutModeContext'
import { useStash } from '../context/StashContext'
import { useStrainDb } from '../hooks/useStrainDb'
import type { StrainRecord } from '../hooks/useStrainDb'
import { askNurseJoy, generateDualBlend } from '../services/gemini'
import type { EnrichedStrain, ConsultationFeedback, DualBlendResult } from '../services/gemini'
import { BudSprite } from '../components/BudSprite'
import {
  getCleaningInterval,
  setCleaningInterval,
  markCleaned,
  daysUntilCleaningDue,
  isCleaningOverdue,
  requestNotificationPermission,
} from '../hooks/useNotificationScheduler'

// ── Constants ─────────────────────────────────────────────────────────────────

const GBC_GREEN   = '#84cc16'
const GBC_MUTED   = '#4a7a10'
const GBC_DARKEST = '#2a4a08'
const GBC_TEXT    = '#c8e890'
const GBC_BG      = '#050a04'
const GBC_BOX     = '#0a1408'
const GBC_VIOLET  = '#a78bfa'
const GBC_AMBER   = '#f59e0b'
const FONT        = "'PokemonGb', 'Press Start 2P', monospace"
const TOTAL_BOXES = 10

const BALL_SPRITES: Record<string, string> = {
  sativa: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png',
  hybrid: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
  indica: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png',
}

function TypeSprite({ type, size = 20 }: { type?: string; size?: number }) {
  const src = BALL_SPRITES[type ?? 'hybrid'] ?? BALL_SPRITES.hybrid
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={type ?? 'hybrid'}
      style={{ imageRendering: 'pixelated', display: 'block', flexShrink: 0 }}
    />
  )
}

const pokeBox = {
  border: '3px solid #84cc16',
  boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
  background: GBC_BOX,
}

const EFFECT_TAGS = [
  'SLEEP', 'FOCUS', 'ENERGY', 'SOCIAL',
  'CREATIVE', 'RELAXATION', 'PAIN RELIEF', 'ANXIETY',
]

// ── GIF canvas player ─────────────────────────────────────────────────────────

function GifCanvas({ src, onDone, onFirstFrame }: { src: string; onDone: () => void; onFirstFrame?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stableDone = useCallback(onDone, [])
  const stableFirst = useCallback(onFirstFrame ?? (() => {}), [])

  useEffect(() => {
    let cancelled = false
    let timer = 0

    fetch(src)
      .then(r => r.arrayBuffer())
      .then(buf => {
        if (cancelled) return
        const gif = parseGIF(buf)
        const frames = decompressFrames(gif, true)
        if (!frames.length) { stableDone(); return }

        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = gif.lsd.width
        canvas.height = gif.lsd.height
        const ctx = canvas.getContext('2d')!
        const tmp = document.createElement('canvas')
        const tmpCtx = tmp.getContext('2d')!

        const TARGET_MS = 7000
        const nativeTotalMs = frames.reduce((sum, f) => sum + (f.delay || 2) * 10, 0)
        const scale = TARGET_MS / nativeTotalMs
        let cursor = 0
        const frameAt = frames.map(f => {
          const t = cursor
          cursor += Math.round((f.delay || 2) * 10 * scale)
          return t
        })
        const startedAt = performance.now()

        const drawFrame = (i: number) => {
          if (cancelled) return
          if (i >= frames.length) { stableDone(); return }
          if (i === 0) stableFirst()
          const frame = frames[i]
          if (i > 0 && frames[i - 1].disposalType === 2) ctx.clearRect(0, 0, canvas.width, canvas.height)
          const { top, left, width: fw, height: fh } = frame.dims
          tmp.width = fw; tmp.height = fh
          tmpCtx.putImageData(new ImageData(new Uint8ClampedArray(frame.patch), fw, fh), 0, 0)
          ctx.drawImage(tmp, left, top)
          if (i + 1 < frames.length) {
            const nextAt = startedAt + frameAt[i + 1]
            const delay = Math.max(0, nextAt - performance.now())
            timer = window.setTimeout(() => drawFrame(i + 1), delay)
          } else {
            stableDone()
          }
        }
        drawFrame(0)
      })
      .catch(() => stableDone())

    return () => { cancelled = true; clearTimeout(timer) }
  }, [src, stableDone, stableFirst])

  return (
    <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', imageRendering: 'pixelated', display: 'block' }} />
  )
}

// ── Building entry (GIF + audio) ──────────────────────────────────────────────

function BuildingEntry({ onDone }: { onDone: () => void }) {
  const stableDone = useCallback(onDone, [])
  const audioRef = useRef<HTMLAudioElement>(null)
  const { setGifMode } = useGifMode()
  const { setLayoutMode } = useLayoutMode()

  useEffect(() => {
    setGifMode(true)
    setLayoutMode('emulator')
    return () => {
      setGifMode(false)
      setLayoutMode('fullscreen')
    }
  }, [setGifMode, setLayoutMode])

  const handleFirstFrame = useCallback(() => {
    setTimeout(() => audioRef.current?.play().catch(() => {}), 3000)
  }, [])

  return (
    <div
      onClick={stableDone}
      style={{
        position: 'absolute', inset: 0, zIndex: 9999,
        background: '#050a04',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <audio ref={audioRef} src={`${import.meta.env.BASE_URL}111-pokemon-recovery.mp3`} />
      <GifCanvas src={`${import.meta.env.BASE_URL}pokemon-center.gif`} onDone={stableDone} onFirstFrame={handleFirstFrame} />
    </div>
  )
}

// ── Typewriter hook ───────────────────────────────────────────────────────────

function useTypewriter(text: string, speed = 16): { displayed: string; done: boolean } {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!text) { setDisplayed(''); setDone(false); return }
    setDisplayed('')
    setDone(false)
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(id); setDone(true) }
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  return { displayed, done }
}

// ── Pixel loading bar ─────────────────────────────────────────────────────────

function LoadingBar() {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % TOTAL_BOXES), 120)
    return () => clearInterval(id)
  }, [])
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: TOTAL_BOXES }).map((_, i) => (
        <div key={i} style={{
          width: 10, height: 14,
          background: i === frame ? GBC_GREEN : GBC_DARKEST,
          border: `1px solid ${i === frame ? GBC_MUTED : '#1a2e08'}`,
        }} />
      ))}
    </div>
  )
}

// ── Nurse Joy sprite ──────────────────────────────────────────────────────────

function NurseJoySprite({ size = 60 }: { size?: number }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}nurse-joy.png`}
      alt="Nurse Joy"
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated', display: 'block', flexShrink: 0, objectFit: 'contain' }}
    />
  )
}

// ── Nurse Joy response parser ─────────────────────────────────────────────────

const SECTION_HEADERS = [
  'RECOMMENDATION',
  'TERPENE SCIENCE',
  'TEMPERATURE GUIDE',
  'STRAIN HISTORY',
  'WHAT TO EXPECT',
]

const SECTION_COLORS: Record<string, string> = {
  'RECOMMENDATION':   GBC_GREEN,
  'TERPENE SCIENCE':  '#a78bfa',
  'TEMPERATURE GUIDE':'#f59e0b',
  'STRAIN HISTORY':   '#5a9a18',
  'WHAT TO EXPECT':   '#84cc16',
}

function parseResponse(text: string): { header: string; body: string }[] {
  const regex = new RegExp(`(${SECTION_HEADERS.join('|')})`, 'g')
  const parts = text.split(regex)
  const sections: { header: string; body: string }[] = []
  // parts[0] is any preamble before first header
  if (parts[0].trim()) sections.push({ header: '', body: parts[0].trim() })
  for (let i = 1; i < parts.length; i += 2) {
    sections.push({ header: parts[i], body: (parts[i + 1] ?? '').trimStart() })
  }
  return sections.length ? sections : [{ header: '', body: text }]
}

// ── Nurse Joy dialogue box ────────────────────────────────────────────────────

function NurseJoyDialogue({ text }: { text: string }) {
  const allSections = parseResponse(text)
  const firstBody = allSections[0]?.body ?? ''
  const { displayed, done } = useTypewriter(firstBody)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (done) bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [done])

  return (
    <div style={{ ...pokeBox, padding: '14px' }}>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${GBC_DARKEST}`, paddingBottom: 8, marginBottom: 14,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <NurseJoySprite size={44} />
        <span style={{ fontFamily: FONT, fontSize: 9, color: GBC_GREEN }}>NURSE JOY</span>
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {allSections.map((sec, i) => {
          const col = sec.header ? (SECTION_COLORS[sec.header] ?? GBC_GREEN) : GBC_TEXT
          // First section gets typewriter; rest appear instantly
          const body = i === 0 ? displayed : sec.body
          const showCursor = i === 0 && !done
          return (
            <div key={i}>
              {sec.header && (
                <div style={{
                  fontFamily: FONT, fontSize: 9, color: col,
                  borderBottom: `1px solid ${GBC_DARKEST}`,
                  paddingBottom: 6, marginBottom: 8,
                  letterSpacing: 0.5,
                }}>
                  {sec.header}
                </div>
              )}
              <p style={{
                fontFamily: 'monospace', fontSize: 14, color: GBC_TEXT,
                lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap',
              }}>
                {body}
                {showCursor && (
                  <span className="gbc-blink" style={{ color: GBC_GREEN }}>█</span>
                )}
              </p>
            </div>
          )
        })}
      </div>
      <div ref={bottomRef} />
    </div>
  )
}

// ── Party card ────────────────────────────────────────────────────────────────

function PartyCard({ name, type, thc, inStock, dbMatch, onToggle }: {
  name: string; type?: string; thc?: number; inStock: boolean; dbMatch?: StrainRecord; onToggle: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const col = type === 'sativa' ? GBC_GREEN : type === 'indica' ? GBC_VIOLET : GBC_AMBER

  const terpenes = dbMatch?.terpenes
  const effects = dbMatch?.Effects
  const medical = dbMatch?.medical
  const cbd = dbMatch?.cbd
  const description = dbMatch?.Description

  const terpeneList = terpenes
    ? terpenes.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  return (
    <div
      onClick={() => setExpanded((v) => !v)}
      style={{
        ...pokeBox,
        padding: '10px 10px',
        opacity: inStock ? 1 : 0.5,
        flex: expanded ? '1 1 100%' : '1 1 calc(50% - 4px)',
        minWidth: 0,
        cursor: 'pointer',
        transition: 'flex 0.15s',
      }}
    >
      {/* Name + sprite row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          <TypeSprite type={type} size={28} />
          <BudSprite name={name} type={type} size={64} context={dbMatch ? { description: dbMatch.Description, effects: dbMatch.Effects, terpenes: dbMatch.terpenes, flavor: dbMatch.Flavor } : undefined} />
        </div>
        <div style={{ fontFamily: FONT, fontSize: 11, color: col, wordBreak: 'break-word', lineHeight: 1.5, flex: 1 }}>
          {name.toUpperCase()}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggle() }}
          style={{
            fontFamily: FONT, fontSize: 11, flexShrink: 0,
            width: 28, height: 28, cursor: 'pointer',
            border: `2px solid ${inStock ? GBC_MUTED : GBC_GREEN}`,
            background: inStock ? 'transparent' : 'rgba(132,204,22,0.15)',
            color: inStock ? GBC_MUTED : GBC_GREEN,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            WebkitTapHighlightColor: 'transparent' as unknown as string,
          }}
        >{inStock ? '-' : '+'}</button>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        {type && (
          <span style={{ fontFamily: FONT, fontSize: 7, color: col, border: `1px solid ${col}`, padding: '1px 4px' }}>
            {type.toUpperCase()}
          </span>
        )}
        {thc != null && (
          <span style={{ fontFamily: FONT, fontSize: 9, color: GBC_MUTED }}>THC {thc}%</span>
        )}
        {cbd != null && (
          <span style={{ fontFamily: FONT, fontSize: 9, color: GBC_MUTED }}>CBD {cbd}%</span>
        )}
        {!inStock && (
          <span style={{ fontFamily: FONT, fontSize: 7, color: '#e84040' }}>OUT</span>
        )}
        <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_DARKEST, marginLeft: 'auto' }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ marginTop: 10, borderTop: `1px solid ${GBC_DARKEST}`, paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>

          {terpeneList.length > 0 && (
            <div>
              <div style={{ fontFamily: FONT, fontSize: 9, color: GBC_MUTED, marginBottom: 4 }}>TERPENES</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {terpeneList.map((t) => (
                  <span key={t} style={{
                    fontFamily: FONT, fontSize: 9, color: GBC_VIOLET,
                    border: `1px solid ${GBC_VIOLET}`, padding: '2px 5px',
                  }}>{t.toUpperCase()}</span>
                ))}
              </div>
            </div>
          )}

          {effects && (
            <div>
              <div style={{ fontFamily: FONT, fontSize: 9, color: GBC_MUTED, marginBottom: 4 }}>EFFECTS</div>
              <div style={{ fontFamily: 'monospace', fontSize: 13, color: GBC_TEXT, lineHeight: 1.5 }}>{effects}</div>
            </div>
          )}

          {medical && (
            <div>
              <div style={{ fontFamily: FONT, fontSize: 9, color: GBC_MUTED, marginBottom: 4 }}>MEDICAL</div>
              <div style={{ fontFamily: 'monospace', fontSize: 13, color: GBC_TEXT, lineHeight: 1.5 }}>{medical}</div>
            </div>
          )}

          {description && (
            <div>
              <div style={{ fontFamily: FONT, fontSize: 9, color: GBC_MUTED, marginBottom: 4 }}>ABOUT</div>
              <div style={{ fontFamily: 'monospace', fontSize: 13, color: GBC_TEXT, lineHeight: 1.6 }}>{description}</div>
            </div>
          )}

          {!terpenes && !effects && !medical && !description && (
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: GBC_DARKEST }}>
              No database entry found for this strain.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Spinning square loader ────────────────────────────────────────────────────

// 8 positions clockwise: TL T TR R BR B BL L
const SPIN_POS: [number, number][] = [
  [0,0],[1,0],[2,0],
  [2,1],
  [2,2],[1,2],[0,2],
  [0,1],
]

function SpinningSquare() {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % 8), 100)
    return () => clearInterval(id)
  }, [])
  const DOT = 6, GAP = 5
  const SIZE = DOT * 3 + GAP * 2
  return (
    <div style={{ position: 'relative', width: SIZE, height: SIZE, flexShrink: 0 }}>
      {SPIN_POS.map(([col, row], i) => {
        const age = (frame - i + 8) % 8
        const color = age <= 2 ? GBC_GREEN : GBC_DARKEST
        const opacity = age === 0 ? 1 : age === 1 ? 0.55 : age === 2 ? 0.25 : 0.1
        return (
          <div key={i} style={{
            position: 'absolute',
            left: col * (DOT + GAP),
            top: row * (DOT + GAP),
            width: DOT, height: DOT,
            background: color,
            opacity,
          }} />
        )
      })}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

function findDbMatch(name: string, db: StrainRecord[]): StrainRecord | undefined {
  const norm = (s: string) => s.toLowerCase().replace(/[-_\s]+/g, '')
  const target = norm(name)
  return db.find((r) => norm(String(r.Strain)) === target)
}


export default function PokeCenter() {
  const { strains, updateStrain } = useStash()
  const { db } = useStrainDb()
  const [entered, setEntered] = useState(false)
  const [desiredEffect, setDesiredEffect] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(false)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') ?? '')
  const [keyInput, setKeyInput] = useState('')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [cleanInterval, setCleanIntervalState] = useState(() => getCleaningInterval())
  const [cleanTick, setCleanTick] = useState(0)  // bumped to force re-render after markCleaned

  const handleSetCleanInterval = async (days: number) => {
    setCleaningInterval(days)
    setCleanIntervalState(days)
    if (days > 0) await requestNotificationPermission()
  }

  const handleJustCleaned = () => {
    markCleaned()
    setCleanTick((t) => t + 1)
  }

  // Compute cleaning status fresh each render (reads localStorage)
  const cleanDaysLeft = cleanInterval > 0 ? daysUntilCleaningDue() : null
  const cleanOverdue  = cleanInterval > 0 ? isCleaningOverdue() : false
  void cleanTick  // consumed to satisfy lint

  // Consultation feedback memory
  const [feedbackHistory, setFeedbackHistory] = useState<ConsultationFeedback[]>(() => {
    try { return JSON.parse(localStorage.getItem('utilhub_consult_log') ?? '[]') } catch { return [] }
  })
  const [feedbackRating, setFeedbackRating] = useState<'up' | 'down' | null>(null)
  const [feedbackNote, setFeedbackNote]     = useState('')
  const [feedbackSaved, setFeedbackSaved]   = useState(false)
  const [lastRecommended, setLastRecommended] = useState<string | null>(null)

  // Blend suggestion
  const [blendGoal, setBlendGoal]       = useState('')
  const [blendLoading, setBlendLoading] = useState(false)
  const [blendResults, setBlendResults] = useState<DualBlendResult | null>(null)
  const [blendError, setBlendError]     = useState('')

  const handleBlend = async () => {
    if (party.length < 2 || !hasKey || blendLoading) return
    setBlendLoading(true)
    setBlendResults(null)
    setBlendError('')
    try {
      const enriched: EnrichedStrain[] = party.map((s) => {
        const match = findDbMatch(s.name, db)
        return {
          name: s.name,
          type: s.type ?? match?.Type,
          thc: s.thc ?? match?.thc,
          cbd: s.cbd ?? match?.cbd,
          terpenes: match?.terpenes,
          effects: match?.Effects,
          medical: match?.medical,
          notes: s.notes,
        }
      })
      setBlendResults(await generateDualBlend(blendGoal.trim(), enriched))
    } catch (e) {
      setBlendError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setBlendLoading(false)
    }
  }

  const saveFeedback = () => {
    if (!feedbackRating || !lastRecommended) return
    const entry: ConsultationFeedback = {
      strainName: lastRecommended,
      rating:     feedbackRating,
      note:       feedbackNote.trim(),
      date:       new Date().toISOString().slice(0, 10),
    }
    const next = [...feedbackHistory, entry]
    setFeedbackHistory(next)
    localStorage.setItem('utilhub_consult_log', JSON.stringify(next))
    setFeedbackSaved(true)
    setFeedbackNote('')
    setFeedbackRating(null)
  }

  const hasKey = apiKey.length > 0
  const party = strains.filter((s) => s.inStock)
  const fullQuery = [desiredEffect.trim(), ...selectedTags].filter(Boolean).join(', ')
  const canAsk = fullQuery.length > 0 && party.length > 0 && hasKey

  const saveKey = () => {
    const k = keyInput.trim()
    if (!k) return
    localStorage.setItem('gemini_api_key', k)
    setApiKey(k)
    setKeyInput('')
    setShowKeyInput(false)
  }

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])

  const handleAsk = async () => {
    if (!canAsk || loading) return
    setLoading(true)
    setResponse('')
    setError('')
    setFeedbackRating(null)
    setFeedbackNote('')
    setFeedbackSaved(false)
    setLastRecommended(null)
    try {
      const enriched: EnrichedStrain[] = party.map((s) => {
        const match = findDbMatch(s.name, db)
        return {
          name: s.name,
          type: s.type ?? match?.Type,
          thc: s.thc ?? match?.thc,
          cbd: s.cbd ?? match?.cbd,
          terpenes: match?.terpenes,
          effects: match?.Effects,
          medical: match?.medical,
          notes: s.notes,
        }
      })
      const result = await askNurseJoy(fullQuery, enriched, feedbackHistory)
      // Best-effort: find the first party strain name mentioned in the response
      const mentioned = party.find((s) => result.toLowerCase().includes(s.name.toLowerCase()))
      if (mentioned) setLastRecommended(mentioned.name)
      setResponse(result)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.'
      setError(msg === 'NO_KEY' ? 'No API key set. Add your Gemini key above.' : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {!entered && <BuildingEntry onDone={() => setEntered(true)} />}
      <div style={{
        minHeight: '100%', padding: '10px', background: GBC_BG,
        display: 'flex', flexDirection: 'column', gap: 10, boxSizing: 'border-box',
        opacity: entered ? 1 : 0,
        transition: 'opacity 0.2s ease-in',
      }}>

        {/* Header */}
        <div style={{
          ...pokeBox, padding: '8px 12px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        }}>
          <span style={{ fontFamily: FONT, fontSize: 13, color: GBC_GREEN }}>
            SMOK<span style={{ fontFamily: "'Press Start 2P', monospace" }}>É</span> CENTER
          </span>
          <button
            onClick={() => setShowKeyInput((v) => !v)}
            style={{
              fontFamily: FONT, fontSize: 7, padding: '3px 7px',
              border: `1px solid ${hasKey ? GBC_MUTED : '#e84040'}`,
              background: 'transparent',
              color: hasKey ? GBC_MUTED : '#e84040',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {hasKey ? 'API KEY ✓' : 'SET KEY'}
          </button>
        </div>

        {/* API key input */}
        {showKeyInput && (
          <div style={{ ...pokeBox, padding: '12px', flexShrink: 0 }}>
            <div style={{ fontFamily: FONT, fontSize: 8, color: GBC_MUTED, marginBottom: 8 }}>
              GEMINI API KEY
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#4a7a10', marginBottom: 8, lineHeight: 1.6 }}>
              Get a free key at aistudio.google.com → Create API key
            </div>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Paste your key here..."
              style={{
                width: '100%', background: GBC_BG, border: `2px solid ${GBC_DARKEST}`,
                color: GBC_TEXT, fontSize: 13, fontFamily: 'monospace',
                padding: '8px', outline: 'none', boxSizing: 'border-box',
              }}
            />
            <button
              onClick={saveKey}
              disabled={!keyInput.trim()}
              style={{
                marginTop: 8, width: '100%', fontFamily: FONT, fontSize: 10,
                padding: '10px 0',
                background: keyInput.trim() ? GBC_GREEN : 'transparent',
                color: keyInput.trim() ? '#050a04' : GBC_MUTED,
                border: `2px solid ${keyInput.trim() ? GBC_GREEN : GBC_DARKEST}`,
                cursor: keyInput.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              SAVE KEY
            </button>
          </div>
        )}

        {/* Cleaning reminder */}
        <div style={{ ...pokeBox, padding: '12px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <NurseJoySprite size={28} />
            <span style={{ fontFamily: FONT, fontSize: 9, color: GBC_MUTED }}>VAPE CLEANING REMINDER</span>
          </div>

          {/* Interval selector */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {([0, 7, 14, 30] as const).map((days) => {
              const active = cleanInterval === days
              return (
                <button
                  key={days}
                  onClick={() => handleSetCleanInterval(days)}
                  style={{
                    flex: 1, fontFamily: FONT, fontSize: 8, padding: '10px 0', minHeight: 44,
                    cursor: 'pointer',
                    border: `2px solid ${active ? GBC_GREEN : GBC_DARKEST}`,
                    background: active ? 'rgba(132,204,22,0.12)' : 'transparent',
                    color: active ? GBC_GREEN : GBC_MUTED,
                  }}
                >
                  {days === 0 ? 'OFF' : `${days}D`}
                </button>
              )
            })}
          </div>

          {/* Status display */}
          {cleanInterval > 0 && (
            <div style={{ marginBottom: 10 }}>
              {cleanOverdue ? (
                <div style={{
                  border: `2px solid #e84040`, background: 'rgba(232,64,64,0.08)',
                  padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                  <span style={{ fontFamily: FONT, fontSize: 8, color: '#e84040' }}>CLEANING OVERDUE</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#ff8080', lineHeight: 1.5 }}>
                    Your vape needs a clean. Residue builds up over time and affects flavour and efficiency.
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_MUTED }}>NEXT CLEAN IN:</span>
                  <span style={{ fontFamily: FONT, fontSize: 11, color: cleanDaysLeft === 0 ? GBC_AMBER : GBC_GREEN }}>
                    {cleanDaysLeft === 0 ? 'TODAY' : `${cleanDaysLeft}D`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Just cleaned button */}
          {cleanInterval > 0 && (
            <button
              onClick={handleJustCleaned}
              style={{
                width: '100%', fontFamily: FONT, fontSize: 9, padding: '11px 0', minHeight: 44,
                cursor: 'pointer',
                border: `2px solid ${GBC_GREEN}`,
                background: 'rgba(132,204,22,0.08)',
                color: GBC_GREEN,
                boxSizing: 'border-box',
              }}
            >
              ► JUST CLEANED IT
            </button>
          )}
        </div>

        {/* Party */}
        <div style={{ ...pokeBox, padding: '10px 12px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
            <span style={{ fontFamily: FONT, fontSize: 9, color: GBC_MUTED }}>
              YOUR PARTY ({party.length} IN STOCK)
            </span>
            {party.length > 0 && (
              <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_DARKEST }}>TAP TO EXPAND</span>
            )}
          </div>
          {party.length === 0 ? (
            <p style={{ fontFamily: FONT, fontSize: 9, color: GBC_DARKEST, lineHeight: 1.8 }}>
              {strains.length === 0 ? 'NO STRAINS IN STASH. ADD SOME IN SMOKÉDEX FIRST.' : 'NO STRAINS IN STOCK. ADD ONE FROM YOUR STASH BELOW.'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {party.map((s) => (
                <PartyCard
                  key={s.id}
                  name={s.name}
                  type={s.type}
                  thc={s.thc}
                  inStock={s.inStock}
                  dbMatch={findDbMatch(s.name, db)}
                  onToggle={() => updateStrain(s.id, { inStock: !s.inStock })}
                />
              ))}
            </div>
          )}
        </div>

        {/* Blend suggestion */}
        {party.length >= 2 && hasKey && (
          <div style={{ ...pokeBox, padding: '10px 12px', flexShrink: 0 }}>
            <div style={{ fontFamily: FONT, fontSize: 9, color: GBC_MUTED, marginBottom: 8 }}>
              BLEND SUGGESTION
            </div>
            <input
              type="text"
              value={blendGoal}
              onChange={(e) => setBlendGoal(e.target.value)}
              placeholder="e.g. sleep, focus, creativity..."
              style={{
                width: '100%', background: GBC_BG, border: `2px solid ${GBC_DARKEST}`,
                color: GBC_TEXT, fontFamily: 'monospace', fontSize: 13,
                padding: '8px', outline: 'none', boxSizing: 'border-box', marginBottom: 8,
              }}
            />
            <button
              onClick={handleBlend}
              disabled={blendLoading}
              style={{
                width: '100%', fontFamily: FONT, fontSize: 10, padding: '10px 0',
                border: `2px solid ${blendLoading ? GBC_DARKEST : GBC_GREEN}`,
                background: blendLoading ? 'transparent' : 'rgba(132,204,22,0.1)',
                color: blendLoading ? GBC_MUTED : GBC_GREEN,
                cursor: blendLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              {blendLoading ? <><SpinningSquare /><span>ANALYSING...</span></> : '► GET BLEND'}
            </button>

            {blendError && (
              <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#e84040', margin: '8px 0 0', lineHeight: 1.5 }}>
                {blendError}
              </p>
            )}

            {blendResults && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                {([
                  { label: 'TASTE',   color: GBC_AMBER,  mix: blendResults.taste   },
                  { label: 'MEDICAL', color: GBC_VIOLET, mix: blendResults.medical },
                ] as const).map(({ label, color, mix }) => (
                  <div key={label} style={{ border: `2px solid ${color}`, background: GBC_BG, padding: '10px' }}>
                    <div style={{ fontFamily: FONT, fontSize: 7, color, marginBottom: 6 }}>[{label}]</div>
                    <div style={{ fontFamily: FONT, fontSize: 9, color: GBC_GREEN, marginBottom: 8, lineHeight: 1.6 }}>
                      {mix.strainA.toUpperCase()} + {mix.strainB.toUpperCase()}
                    </div>
                    <p style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT, lineHeight: 1.6, margin: '0 0 6px' }}>
                      {mix.flavourReason}
                    </p>
                    <p style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_MUTED, lineHeight: 1.6, margin: 0 }}>
                      {mix.terpeneReason}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stash — add to party */}
        {strains.filter((s) => !s.inStock).length > 0 && (
          <div style={{ ...pokeBox, padding: '10px 12px', flexShrink: 0 }}>
            <div style={{ fontFamily: FONT, fontSize: 9, color: GBC_MUTED, marginBottom: 8 }}>
              BILL'S PC
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {strains.filter((s) => !s.inStock).map((s) => (
                <PartyCard
                  key={s.id}
                  name={s.name}
                  type={s.type}
                  thc={s.thc}
                  inStock={s.inStock}
                  dbMatch={findDbMatch(s.name, db)}
                  onToggle={() => updateStrain(s.id, { inStock: !s.inStock })}
                />
              ))}
            </div>
          </div>
        )}

        {/* Ask Nurse Joy */}
        <div style={{
          border: `3px solid ${GBC_AMBER}`,
          boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a2c00',
          background: '#0a0900',
          padding: '14px',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_AMBER }}>►</span>
            <span style={{ fontFamily: FONT, fontSize: 10, color: GBC_AMBER, letterSpacing: 0.5 }}>
              WHAT DO YOU WANT TO FEEL?
            </span>
          </div>
          <textarea
            rows={2}
            value={desiredEffect}
            onChange={(e) => setDesiredEffect(e.target.value)}
            placeholder="e.g. I want to relax and sleep..."
            style={{
              width: '100%', background: '#060e05',
              border: `2px solid ${focused ? '#84cc16' : '#3a6010'}`,
              color: '#e8f8c0', fontSize: 13, fontFamily: 'monospace',
              padding: '14px', resize: 'none', outline: 'none', boxSizing: 'border-box',
              lineHeight: 1.7,
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {EFFECT_TAGS.map((tag) => {
              const active = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{
                    fontFamily: FONT, fontSize: 9, padding: '7px 12px', minHeight: 36,
                    border: `2px solid ${active ? GBC_AMBER : GBC_DARKEST}`,
                    background: active ? 'rgba(245,158,11,0.15)' : 'transparent',
                    color: active ? GBC_AMBER : GBC_MUTED, cursor: 'pointer',
                  }}
                >
                  {tag}
                </button>
              )
            })}
          </div>
          <button
            onClick={handleAsk}
            disabled={!canAsk || loading}
            style={{
              marginTop: 14, width: '100%', fontFamily: FONT, fontSize: 11,
              padding: '14px 0',
              background: canAsk && !loading ? GBC_AMBER : 'transparent',
              color: canAsk && !loading ? '#050a04' : GBC_MUTED,
              border: `3px solid ${canAsk && !loading ? GBC_AMBER : GBC_DARKEST}`,
              boxShadow: canAsk && !loading ? 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a2c00' : 'none',
              cursor: canAsk && !loading ? 'pointer' : 'not-allowed',
            }}
          >
            {loading ? 'ANALYZING...' : '► ASK NURSE JOY'}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{
            ...pokeBox, padding: '24px 12px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          }}>
            <NurseJoySprite size={48} />
            <span style={{ fontFamily: FONT, fontSize: 11, color: GBC_GREEN, textAlign: 'center', lineHeight: 2 }}>
              NURSE JOY IS CHECKING{'\n'}YOUR PARTY...
            </span>
            <LoadingBar />
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ ...pokeBox, padding: '14px', border: '3px solid #e84040', boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #601010' }}>
            <span style={{ fontFamily: FONT, fontSize: 9, color: '#e84040' }}>ERROR</span>
            <p style={{ fontFamily: 'monospace', fontSize: 13, color: '#ff8080', marginTop: 8, lineHeight: 1.6 }}>{error}</p>
          </div>
        )}

        {/* Nurse Joy response */}
        {response && <NurseJoyDialogue text={response} />}

        {/* Review consultation form */}
        {response && !feedbackSaved && (
          <div style={{
            ...pokeBox,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <span style={{ fontFamily: FONT, fontSize: 9, color: GBC_MUTED }}>
              REVIEW CONSULTATION
            </span>
            {lastRecommended && (
              <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED }}>
                RE: {lastRecommended.toUpperCase()}
              </span>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              {(['up', 'down'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setFeedbackRating(feedbackRating === r ? null : r)}
                  style={{
                    flex: 1, fontFamily: FONT, fontSize: 9, padding: '8px 0', cursor: 'pointer',
                    minHeight: 44,
                    border: `2px solid ${feedbackRating === r ? (r === 'up' ? GBC_GREEN : '#e84040') : GBC_DARKEST}`,
                    color: feedbackRating === r ? (r === 'up' ? GBC_GREEN : '#e84040') : GBC_MUTED,
                    background: feedbackRating === r ? (r === 'up' ? 'rgba(132,204,22,0.1)' : 'rgba(232,64,64,0.1)') : 'transparent',
                  }}
                >{r === 'up' ? '▲ HELPED' : '▼ DIDN\'T HELP'}</button>
              ))}
            </div>
            <textarea
              rows={2}
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              placeholder="How did it actually make you feel? (optional)"
              style={{
                fontFamily: 'monospace', fontSize: 12,
                background: '#060e05', color: '#e8f8c0',
                border: '2px solid #2a4a08', padding: '8px',
                resize: 'none', width: '100%', boxSizing: 'border-box', lineHeight: 1.6, outline: 'none',
              }}
            />
            <button
              onClick={saveFeedback}
              disabled={!feedbackRating}
              style={{
                fontFamily: FONT, fontSize: 9, padding: '10px 0', cursor: feedbackRating ? 'pointer' : 'not-allowed',
                border: `2px solid ${feedbackRating ? GBC_GREEN : GBC_DARKEST}`,
                color: feedbackRating ? GBC_GREEN : GBC_MUTED,
                background: feedbackRating ? 'rgba(132,204,22,0.08)' : 'transparent',
                width: '100%',
              }}
            >► SAVE FEEDBACK</button>
          </div>
        )}
        {response && feedbackSaved && (
          <div style={{ textAlign: 'center', padding: '6px 0' }}>
            <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_MUTED }}>
              FEEDBACK SAVED TO PATIENT HISTORY
            </span>
          </div>
        )}

        {/* Waiting state */}
        {!loading && !response && !error && (
          <div style={{
            ...pokeBox, padding: '24px 12px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          }}>
            <NurseJoySprite size={72} />
            <p style={{ fontFamily: FONT, fontSize: 11, color: GBC_DARKEST, textAlign: 'center', lineHeight: 2, margin: 0 }}>
              NURSE JOY IS WAITING...
            </p>
            <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#1a3004', textAlign: 'center', margin: 0 }}>
              Select your desired effect and ask for advice
            </p>
          </div>
        )}

      </div>
    </>
  )
}
