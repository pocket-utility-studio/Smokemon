import { useState, useEffect, useRef, useCallback } from 'react'
import { parseGIF, decompressFrames } from 'gifuct-js'
import { useGifMode } from '../context/GifModeContext'
import { useLayoutMode } from '../context/LayoutModeContext'
import { useStash } from '../context/StashContext'
import { askProfessorToke } from '../services/gemini'

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

// ── Nurse Joy dialogue box ────────────────────────────────────────────────────

function NurseJoyDialogue({ text }: { text: string }) {
  const { displayed, done } = useTypewriter(text)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [displayed])

  return (
    <div style={{ ...pokeBox, padding: '14px' }}>
      <div style={{
        fontFamily: FONT, fontSize: 9, color: GBC_GREEN,
        borderBottom: `1px solid ${GBC_DARKEST}`, paddingBottom: 8, marginBottom: 10,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        NURSE JOY
      </div>
      <p style={{
        fontFamily: 'monospace', fontSize: 14, color: GBC_TEXT,
        lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap',
        minHeight: 80,
      }}>
        {displayed}
        {!done && <span className="gbc-blink" style={{ color: GBC_GREEN }}>█</span>}
      </p>
      <div ref={bottomRef} />
    </div>
  )
}

// ── Party card ────────────────────────────────────────────────────────────────

function PartyCard({ name, type, thc, inStock }: {
  name: string; type?: string; thc?: number; inStock: boolean
}) {
  const col = type === 'sativa' ? GBC_GREEN : type === 'indica' ? GBC_VIOLET : GBC_AMBER
  return (
    <div style={{
      ...pokeBox,
      padding: '8px 10px',
      opacity: inStock ? 1 : 0.4,
      flex: '1 1 calc(50% - 4px)',
      minWidth: 0,
    }}>
      <div style={{ fontFamily: FONT, fontSize: 9, color: col, marginBottom: 4, wordBreak: 'break-word', lineHeight: 1.5 }}>
        {name.toUpperCase()}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        {type && (
          <span style={{ fontFamily: FONT, fontSize: 7, color: col, border: `1px solid ${col}`, padding: '1px 4px' }}>
            {type.toUpperCase()}
          </span>
        )}
        {thc != null && (
          <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED }}>THC {thc}%</span>
        )}
        {!inStock && (
          <span style={{ fontFamily: FONT, fontSize: 7, color: '#e84040' }}>OUT</span>
        )}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function PokeCenter() {
  const { strains } = useStash()
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
    try {
      const result = await askProfessorToke(fullQuery, party)
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
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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

        {/* Party */}
        <div style={{ ...pokeBox, padding: '10px 12px', flexShrink: 0 }}>
          <div style={{ fontFamily: FONT, fontSize: 9, color: GBC_MUTED, marginBottom: 8 }}>
            YOUR PARTY ({party.length} IN STOCK)
          </div>
          {strains.length === 0 ? (
            <p style={{ fontFamily: FONT, fontSize: 9, color: GBC_DARKEST, lineHeight: 1.8 }}>
              NO STRAINS IN STASH.{'\n'}ADD SOME IN SMOKÉDEX FIRST.
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {strains.map((s) => (
                <PartyCard key={s.id} name={s.name} type={s.type} thc={s.thc} inStock={s.inStock} />
              ))}
            </div>
          )}
        </div>

        {/* Ask Nurse Joy */}
        <div style={{ ...pokeBox, padding: '12px', flexShrink: 0 }}>
          <div style={{ fontFamily: FONT, fontSize: 9, color: GBC_MUTED, marginBottom: 8 }}>
            WHAT DO YOU WANT TO FEEL?
          </div>
          <textarea
            rows={2}
            value={desiredEffect}
            onChange={(e) => setDesiredEffect(e.target.value)}
            placeholder="e.g. I want to relax and sleep..."
            style={{
              width: '100%', background: GBC_BG,
              border: `2px solid ${focused ? '#4a8a10' : GBC_DARKEST}`,
              color: GBC_TEXT, fontSize: 13, fontFamily: 'monospace',
              padding: '10px', resize: 'none', outline: 'none', boxSizing: 'border-box',
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
                    fontFamily: FONT, fontSize: 9, padding: '5px 10px',
                    border: `2px solid ${active ? GBC_GREEN : GBC_DARKEST}`,
                    background: active ? 'rgba(132,204,22,0.12)' : 'transparent',
                    color: active ? GBC_GREEN : GBC_MUTED, cursor: 'pointer',
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
              marginTop: 12, width: '100%', fontFamily: FONT, fontSize: 11,
              padding: '12px 0',
              background: canAsk && !loading ? GBC_GREEN : 'transparent',
              color: canAsk && !loading ? '#050a04' : GBC_MUTED,
              border: `3px solid ${canAsk && !loading ? GBC_GREEN : GBC_DARKEST}`,
              boxShadow: canAsk && !loading ? 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010' : 'none',
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
            <span className="gbc-blink" style={{ fontFamily: FONT, fontSize: 11, color: GBC_GREEN, textAlign: 'center', lineHeight: 2 }}>
              NURSE JOY IS ANALYZING{'\n'}YOUR PARTY...
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

        {/* Waiting state */}
        {!loading && !response && !error && (
          <div style={{
            ...pokeBox, padding: '32px 12px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          }}>
            <p style={{ fontFamily: FONT, fontSize: 11, color: GBC_DARKEST, textAlign: 'center', lineHeight: 2 }}>
              NURSE JOY IS WAITING...
            </p>
            <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#1a3004', textAlign: 'center' }}>
              Select your desired effect and ask for advice
            </p>
          </div>
        )}

      </div>
    </>
  )
}
