import { useRef, useState, useCallback, useEffect } from 'react'
import { removeBackground } from '@imgly/background-removal'

const BG: [number, number, number] = [5, 10, 4] // #050a04 — background + outline colour

function blobToImageElement(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload  = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('load failed')) }
    img.src = url
  })
}

// Find a square crop centred on non-transparent subject pixels
function findSubjectCrop(img: HTMLImageElement): { sx: number; sy: number; size: number } {
  const W = img.naturalWidth, H = img.naturalHeight
  const sc = Math.min(1, 512 / Math.max(W, H))
  const sw = Math.round(W * sc), sh = Math.round(H * sc)
  const c = document.createElement('canvas')
  c.width = sw; c.height = sh
  const ctx = c.getContext('2d')!
  ctx.drawImage(img, 0, 0, sw, sh)
  const { data } = ctx.getImageData(0, 0, sw, sh)
  let minX = sw, minY = sh, maxX = 0, maxY = 0, any = false
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      if (data[(y * sw + x) * 4 + 3] > 20) {
        if (x < minX) minX = x; if (x > maxX) maxX = x
        if (y < minY) minY = y; if (y > maxY) maxY = y
        any = true
      }
    }
  }
  if (!any) return { sx: 0, sy: 0, size: Math.min(W, H) }
  const pad  = Math.round(Math.max(maxX - minX, maxY - minY) * 0.10)
  const x1   = Math.max(0, (minX - pad) / sc), y1 = Math.max(0, (minY - pad) / sc)
  const x2   = Math.min(W, (maxX + pad) / sc), y2 = Math.min(H, (maxY + pad) / sc)
  const half = Math.max((x2 - x1) / 2, (y2 - y1) / 2)
  const cx   = x1 + (x2 - x1) / 2, cy = y1 + (y2 - y1) / 2
  return { sx: Math.max(0, cx - half), sy: Math.max(0, cy - half), size: Math.min(half * 2, W, H) }
}

// Separate subject from background using alpha channel.
// Transparent pixels get alpha=0 so the outline pass can detect the edge.
function separateAlpha(data: Uint8ClampedArray, w: number, h: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(data)
  for (let i = 0; i < w * h; i++) {
    const idx = i * 4
    if (data[idx + 3] < 20) {
      out[idx] = BG[0]; out[idx+1] = BG[1]; out[idx+2] = BG[2]; out[idx+3] = 0
    } else {
      out[idx+3] = 255
    }
  }
  return out
}

// Paint a 1-pixel dark outline on any opaque pixel that touches a transparent one (8-connected).
// This gives the hand-drawn sprite look.
function addOutline(data: Uint8ClampedArray, w: number, h: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(data)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      if (data[i + 3] === 0) continue   // already background
      outer: for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue
          const nx = x + dx, ny = y + dy
          const isEdge = nx < 0 || nx >= w || ny < 0 || ny >= h
          if (isEdge || data[(ny * w + nx) * 4 + 3] === 0) {
            out[i] = BG[0]; out[i+1] = BG[1]; out[i+2] = BG[2]
            break outer
          }
        }
      }
    }
  }
  return out
}

// Flatten alpha: composite subject onto solid dark background
function flatten(data: Uint8ClampedArray, w: number, h: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(w * h * 4)
  for (let i = 0; i < w * h; i++) {
    const idx = i * 4
    if (data[idx + 3] === 0) {
      out[idx] = BG[0]; out[idx+1] = BG[1]; out[idx+2] = BG[2]; out[idx+3] = 255
    } else {
      out[idx] = data[idx]; out[idx+1] = data[idx+1]; out[idx+2] = data[idx+2]; out[idx+3] = 255
    }
  }
  return out
}

// ─────────────────────────────────────────────────────────────────────────────

const FONT      = "'PokemonGb', 'Press Start 2P', monospace"
const GBC_GREEN = '#84cc16'
const GBC_MUTED = '#4a7a10'
const GBC_BG    = '#050a04'

const PIXEL_SIZE = 256  // native pixel grid
const SCALE      = 2    // stored as 512×512

type Step        = 'idle' | 'removing' | 'dithering'
type RevealPhase = 'idle' | 'silhouette' | 'flash' | 'revealed'

interface BitBudCanvasProps {
  onCapture: (dataUrl: string) => void
}

export default function BitBudCanvas({ onCapture }: BitBudCanvasProps) {
  const cameraInputRef  = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const canvasRef       = useRef<HTMLCanvasElement>(null)
  const [preview,     setPreview]     = useState<string | null>(null)
  const [step,        setStep]        = useState<Step>('idle')
  const [revealPhase, setRevealPhase] = useState<RevealPhase>('idle')

  // silhouette (2 s) → flash → revealed
  useEffect(() => {
    if (revealPhase === 'silhouette') {
      const t = setTimeout(() => setRevealPhase('flash'), 2000)
      return () => clearTimeout(t)
    }
    if (revealPhase === 'flash') {
      const t = setTimeout(() => setRevealPhase('revealed'), 400)
      return () => clearTimeout(t)
    }
  }, [revealPhase])

  const processImage = useCallback(async (file: File) => {
    setRevealPhase('idle')
    setStep('removing')
    setPreview(null)

    // Background removal — fall back to original on error
    let sourceBlob: Blob = file
    try {
      sourceBlob = await removeBackground(file, { debug: false })
    } catch { /* keep original */ }

    setStep('dithering')

    const img = await blobToImageElement(sourceBlob)

    // Tight square crop centred on the subject
    const { sx, sy, size } = findSubjectCrop(img)

    // Draw to pixel canvas, preserving alpha (NO background fill)
    // Boost contrast + saturation so colour regions are more distinct
    const off = document.createElement('canvas')
    off.width = PIXEL_SIZE; off.height = PIXEL_SIZE
    const offCtx = off.getContext('2d')!
    offCtx.clearRect(0, 0, PIXEL_SIZE, PIXEL_SIZE)
    offCtx.filter = 'contrast(1.15) saturate(1.3) brightness(1.02)'
    offCtx.drawImage(img, sx, sy, size, size, 0, 0, PIXEL_SIZE, PIXEL_SIZE)
    offCtx.filter = 'none'

    const { data } = offCtx.getImageData(0, 0, PIXEL_SIZE, PIXEL_SIZE)

    // 1. Mark transparent pixels, 2. flatten onto dark background — no outline
    const separated = separateAlpha(data, PIXEL_SIZE, PIXEL_SIZE)
    const final     = flatten(separated, PIXEL_SIZE, PIXEL_SIZE)

    offCtx.putImageData(new ImageData(final, PIXEL_SIZE, PIXEL_SIZE), 0, 0)

    // Scale up with nearest-neighbour — keeps pixels crisp
    const display = canvasRef.current!
    display.width = PIXEL_SIZE * SCALE; display.height = PIXEL_SIZE * SCALE
    const dCtx = display.getContext('2d')!
    dCtx.imageSmoothingEnabled = true
    dCtx.imageSmoothingQuality = 'medium'
    dCtx.drawImage(off, 0, 0, PIXEL_SIZE * SCALE, PIXEL_SIZE * SCALE)

    setPreview(display.toDataURL('image/png'))
    setStep('idle')
    setRevealPhase('silhouette')
  }, [])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processImage(file)
    e.target.value = ''
  }

  const busy = step !== 'idle'
  const busyLabel = step === 'removing' ? '► REMOVING BG...' : step === 'dithering' ? '► PROCESSING...' : ''

  const canvasFilter     = revealPhase === 'silhouette' ? 'brightness(0)' : revealPhase === 'revealed' ? 'brightness(1)' : undefined
  const canvasTransition = revealPhase === 'revealed' ? 'filter 0.3s ease-out' : 'none'
  const showOverlay      = preview && (revealPhase === 'silhouette' || revealPhase === 'flash')
  const showCapture      = preview && revealPhase === 'revealed'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontFamily: FONT, fontSize: 9, color: GBC_GREEN, letterSpacing: 0.5 }}>
        BIT-BUD FILTER
      </span>
      <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#c8e890', lineHeight: 1.7, margin: 0 }}>
        Upload a bud photo — background removed and converted to GBC sprite style.
      </p>

      <input ref={cameraInputRef}  type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: 'none' }} />
      <input ref={galleryInputRef} type="file" accept="image/*"                        onChange={handleFile} style={{ display: 'none' }} />

      {busy ? (
        <div style={{ fontFamily: FONT, fontSize: 9, color: GBC_GREEN, padding: '11px 14px', border: '3px solid #84cc16', background: 'rgba(132,204,22,0.08)', textAlign: 'center' }}>
          {busyLabel}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button
            onClick={() => cameraInputRef.current?.click()}
            style={{ fontFamily: FONT, fontSize: 9, padding: '12px 8px', cursor: 'pointer', border: '3px solid #84cc16', color: GBC_GREEN, background: 'rgba(132,204,22,0.08)', letterSpacing: 0.5 }}
          >
            ► CAMERA
          </button>
          <button
            onClick={() => galleryInputRef.current?.click()}
            style={{ fontFamily: FONT, fontSize: 9, padding: '12px 8px', cursor: 'pointer', border: '3px solid #84cc16', color: GBC_GREEN, background: 'rgba(132,204,22,0.08)', letterSpacing: 0.5 }}
          >
            ► GALLERY
          </button>
        </div>
      )}

      {/* Canvas + reveal overlay */}
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          className={revealPhase === 'flash' ? 'gbc-whodat-flash' : ''}
          style={{
            display: preview ? 'block' : 'none',
            imageRendering: 'auto',
            width: '100%',
            border: '3px solid #84cc16',
            boxSizing: 'border-box',
            filter: canvasFilter,
            transition: canvasTransition,
          }}
        />
        {showOverlay && (
          <div style={{ position: 'absolute', bottom: 3, left: 3, right: 3, background: `${GBC_BG}cc`, padding: '6px 8px', display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_GREEN, textAlign: 'center', lineHeight: 1.7, letterSpacing: 0.5 }}>
              WHO'S THAT{'\n'}SMOKÉPMON?
            </span>
          </div>
        )}
      </div>

      {showCapture && (
        <button
          onClick={() => onCapture(preview)}
          style={{ fontFamily: FONT, fontSize: 10, padding: '11px 14px', cursor: 'pointer', border: '3px solid #84cc16', color: GBC_GREEN, background: 'rgba(132,204,22,0.15)', width: '100%', boxSizing: 'border-box', letterSpacing: 0.5 }}
        >
          ► SAVE AS BUD PHOTO
        </button>
      )}
      {showCapture && (
        <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, textAlign: 'center' }}>
          BG REMOVED · FULL COLOR · OUTLINED · PIXEL ART
        </span>
      )}
    </div>
  )
}
