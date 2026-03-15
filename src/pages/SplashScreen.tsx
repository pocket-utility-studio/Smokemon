import { useState, useEffect, useRef, useCallback } from 'react'
import { parseGIF, decompressFrames } from 'gifuct-js'
import { unlockAudio, playBoot, playPressStart } from '../utils/sounds'

// Cap per-frame delay so the animation plays at least at 20fps
const MAX_FRAME_MS = 100  // 2x slower than native speed

// Renders a GIF once via canvas — stops on the last frame, never loops
function GifCanvas({ src, onDone }: { src: string; onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let cancelled = false
    let timer = 0

    fetch(src)
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        if (cancelled) return
        const gif = parseGIF(buf)
        const frames = decompressFrames(gif, true)
        if (!frames.length) { onDone(); return }

        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = gif.lsd.width
        canvas.height = gif.lsd.height
        const ctx = canvas.getContext('2d')!

        const tmp = document.createElement('canvas')
        const tmpCtx = tmp.getContext('2d')!

        const drawFrame = (i: number) => {
          if (cancelled) return
          if (i >= frames.length) { onDone(); return }

          const frame = frames[i]

          // Dispose previous frame if needed
          if (i > 0 && frames[i - 1].disposalType === 2) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
          }

          // Draw patch
          const { top, left, width: fw, height: fh } = frame.dims
          tmp.width = fw
          tmp.height = fh
          tmpCtx.putImageData(new ImageData(new Uint8ClampedArray(frame.patch), fw, fh), 0, 0)
          ctx.drawImage(tmp, left, top)

          // Use this frame's delay (capped) before showing the next one
          const delay = Math.min((frame.delay || 2) * 20, MAX_FRAME_MS)  // *20 = 2x slower
          timer = window.setTimeout(() => drawFrame(i + 1), delay)
        }

        drawFrame(0)
      })
      .catch(() => onDone())

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [src, onDone])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: 'auto',
        imageRendering: 'pixelated',
        display: 'block',
      }}
    />
  )
}

type Phase = 'startup' | 'silver' | 'title'

export default function SplashScreen({ onStart }: { onStart: () => void }) {
  const [phase, setPhase] = useState<Phase>('startup')
  const [startupVisible, setStartupVisible] = useState(true)
  const [silverVisible, setSilverVisible] = useState(false)
  const [titleVisible, setTitleVisible] = useState(false)

  const handleStartupDone = useCallback(() => {
    setStartupVisible(false)
    setTimeout(() => {
      setPhase('silver')
      setSilverVisible(true)
    }, 400)
  }, [])

  const handleSilverDone = useCallback(() => {
    setSilverVisible(false)
    setTimeout(() => {
      setPhase('title')
      setTimeout(() => setTitleVisible(true), 300)
    }, 400)
  }, [])

  const handleClick = () => {
    if (phase === 'silver') {
      // Skip the rest of the silver GIF → jump straight to title
      setSilverVisible(false)
      setPhase('title')
      setTimeout(() => setTitleVisible(true), 300)
      return
    }
    if (phase === 'title') {
      unlockAudio()
      playBoot()
      setTimeout(() => playPressStart(), 350)
      onStart()
    }
  }

  const bg = phase === 'startup' ? '#e8e8e0' : '#050a04'

  return (
    <div
      onClick={handleClick}
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: bg,
        transition: 'background 0.6s ease',
        cursor: phase === 'title' ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* GBC boot animation */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        opacity: startupVisible ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none',
      }}>
        <GifCanvas src={`${import.meta.env.BASE_URL}gbc-startup.gif`} onDone={handleStartupDone} />
      </div>

      {/* Pokémon Silver intro */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        opacity: silverVisible ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none',
      }}>
        {phase === 'silver' && (
          <GifCanvas src={`${import.meta.env.BASE_URL}pokesilver.gif`} onDone={handleSilverDone} />
        )}
      </div>

      {/* SMOKEDEX title */}
      <div style={{
        position: 'absolute',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32,
        opacity: titleVisible ? 1 : 0,
        transition: 'opacity 0.8s ease',
        pointerEvents: 'none',
      }}>
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P'",
          fontSize: 28,
          color: '#84cc16',
          letterSpacing: 3,
          textAlign: 'center',
        }}>
          SMOKEDEX
        </span>
        <span
          className="gbc-blink"
          style={{
            fontFamily: "'PokemonGb', 'Press Start 2P'",
            fontSize: 12,
            color: '#c8e890',
            letterSpacing: 2,
          }}
        >
          PRESS START
        </span>
      </div>
    </div>
  )
}
