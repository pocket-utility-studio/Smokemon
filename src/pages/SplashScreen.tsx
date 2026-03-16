import { useState, useEffect, useRef, useCallback } from 'react'
import { parseGIF, decompressFrames } from 'gifuct-js'
import { unlockAudio, playBoot, playPressStart } from '../utils/sounds'

// Plays an mp4 once then calls onDone
function VideoPlayer({ src, onDone }: { src: string; onDone: () => void }) {
  const stableDone = useCallback(onDone, [])
  return (
    <video
      src={src}
      autoPlay
      playsInline
      onEnded={stableDone}
      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
    />
  )
}

// Renders a GIF frame-by-frame on a canvas — plays once then calls onDone
function GifCanvas({ src, onDone }: { src: string; onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stableDone = useCallback(onDone, [])

  useEffect(() => {
    let cancelled = false
    let timer = 0

    fetch(src)
      .then((r) => r.arrayBuffer())
      .then((buf) => {
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

        const drawFrame = (i: number) => {
          if (cancelled) return
          if (i >= frames.length) { stableDone(); return }

          const frame = frames[i]
          if (i > 0 && frames[i - 1].disposalType === 2) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
          }
          const { top, left, width: fw, height: fh } = frame.dims
          tmp.width = fw
          tmp.height = fh
          tmpCtx.putImageData(new ImageData(new Uint8ClampedArray(frame.patch), fw, fh), 0, 0)
          ctx.drawImage(tmp, left, top)

          const delay = Math.min((frame.delay || 2) * 20, 100)
          timer = window.setTimeout(() => drawFrame(i + 1), delay)
        }

        drawFrame(0)
      })
      .catch(() => stableDone())

    return () => { cancelled = true; clearTimeout(timer) }
  }, [src, stableDone])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: 'auto', imageRendering: 'pixelated', display: 'block' }}
    />
  )
}

// Flow: startup (GIF) → tap → silver (mp4 with sound, tappable to skip) → title (tap to enter)
type Phase = 'startup' | 'silver' | 'title'

export default function SplashScreen({ onStart }: { onStart: () => void }) {
  const [phase, setPhase] = useState<Phase>('startup')
  const [silverVisible, setSilverVisible] = useState(false)
  const [titleVisible, setTitleVisible] = useState(false)
  const silverDoneRef = useRef(false)

  const handleStartupDone = useCallback(() => {}, [])

  // 8s fallback in case GIF never loads
  useEffect(() => {
    const t = setTimeout(handleStartupDone, 8000)
    return () => clearTimeout(t)
  }, [handleStartupDone])

  // mp4 ends → go to title screen
  const handleSilverDone = useCallback(() => {
    if (silverDoneRef.current) return
    silverDoneRef.current = true
    setSilverVisible(false)
    setTimeout(() => {
      setPhase('title')
      setTimeout(() => setTitleVisible(true), 300)
    }, 400)
  }, [])

  // 30s fallback on video
  useEffect(() => {
    if (phase !== 'silver') return
    const t = setTimeout(handleSilverDone, 30000)
    return () => clearTimeout(t)
  }, [phase, handleSilverDone])

  const handleClick = useCallback(() => {
    // Startup: tap triggers mp4 (user gesture = audio allowed)
    if (phase === 'startup') {
      unlockAudio()
      setPhase('silver')
      setSilverVisible(true)
      return
    }
    // Silver: tap skips video → title screen
    if (phase === 'silver') {
      handleSilverDone()
      return
    }
    // Title: tap enters app
    if (phase === 'title') {
      playBoot()
      setTimeout(() => playPressStart(), 350)
      onStart()
    }
  }, [phase, handleSilverDone, onStart])

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'absolute', inset: 0,
        background: phase === 'startup' ? '#e8e8e0' : '#050a04',
        transition: 'background 0.6s ease',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      {phase === 'startup' && (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <GifCanvas src={`${import.meta.env.BASE_URL}gbc-startup.gif`} onDone={handleStartupDone} />
        </div>
      )}

      {phase === 'silver' && (
        <div style={{ position: 'absolute', inset: 0, opacity: silverVisible ? 1 : 0, transition: 'opacity 0.4s' }}>
          <VideoPlayer src={`${import.meta.env.BASE_URL}splash.mp4`} onDone={handleSilverDone} />
        </div>
      )}

      {phase === 'title' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 32,
          opacity: titleVisible ? 1 : 0,
          transition: 'opacity 0.8s',
        }}>
          <span style={{
            fontFamily: "'PokemonGb', 'Press Start 2P'",
            fontSize: 28, color: '#84cc16', letterSpacing: 3, textAlign: 'center',
          }}>
            SMOK<span style={{ fontFamily: "'Press Start 2P', monospace" }}>É</span>DEX
          </span>
        </div>
      )}
    </div>
  )
}
