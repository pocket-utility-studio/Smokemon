import { useRef, useState, useCallback, useEffect } from 'react'
import { removeBackground } from '@imgly/background-removal'

// GBC 8-color kiwi palette — expanded from 5 for better gradation
const GBC_PALETTE: [number, number, number][] = [
  [5,   10,  4],   // #050a04 — darkest bg
  [14,  26,  11],  // #0e1a0b — charcoal
  [28,  50,  6],   // #1c3206 — dark shadow
  [42,  74,  8],   // #2a4a08 — muted
  [74,  120, 14],  // #4a780e — mid
  [100, 160, 18],  // #64a012 — mid-bright
  [132, 204, 22],  // #84cc16 — accent
  [200, 232, 144], // #c8e890 — bright
]

function nearestColor(r: number, g: number, b: number): [number, number, number] {
  let best = GBC_PALETTE[0]
  let bestDist = Infinity
  for (const [pr, pg, pb] of GBC_PALETTE) {
    const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2
    if (dist < bestDist) { bestDist = dist; best = [pr, pg, pb] }
  }
  return best
}

// Floyd-Steinberg dithering — spreads quantisation error to neighbours
function floydSteinberg(data: Uint8ClampedArray, w: number, h: number): Uint8ClampedArray {
  const buf = new Float32Array(w * h * 3)
  for (let i = 0; i < w * h; i++) {
    buf[i * 3]     = data[i * 4]
    buf[i * 3 + 1] = data[i * 4 + 1]
    buf[i * 3 + 2] = data[i * 4 + 2]
  }

  const out = new Uint8ClampedArray(w * h * 4)

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 3
      const r = Math.max(0, Math.min(255, buf[idx]))
      const g = Math.max(0, Math.min(255, buf[idx + 1]))
      const b = Math.max(0, Math.min(255, buf[idx + 2]))

      const [nr, ng, nb] = nearestColor(r, g, b)
      const oi = (y * w + x) * 4
      out[oi] = nr; out[oi + 1] = ng; out[oi + 2] = nb; out[oi + 3] = 255

      const er = r - nr, eg = g - ng, eb = b - nb

      const spread = (dx: number, dy: number, factor: number) => {
        const nx = x + dx, ny = y + dy
        if (nx < 0 || nx >= w || ny >= h) return
        const ni = (ny * w + nx) * 3
        buf[ni]     += er * factor
        buf[ni + 1] += eg * factor
        buf[ni + 2] += eb * factor
      }

      spread( 1,  0, 7 / 16)
      spread(-1,  1, 3 / 16)
      spread( 0,  1, 5 / 16)
      spread( 1,  1, 1 / 16)
    }
  }

  return out
}

function blobToImageElement(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('load failed')) }
    img.src = url
  })
}

// Find a square crop centred on the non-transparent subject pixels
function findSubjectCrop(img: HTMLImageElement): { sx: number; sy: number; size: number } {
  const W = img.naturalWidth
  const H = img.naturalHeight

  // Scan at reduced resolution for speed
  const scanScale = Math.min(1, 512 / Math.max(W, H))
  const sw = Math.round(W * scanScale)
  const sh = Math.round(H * scanScale)

  const c = document.createElement('canvas')
  c.width = sw; c.height = sh
  const ctx = c.getContext('2d')!
  ctx.drawImage(img, 0, 0, sw, sh)
  const { data } = ctx.getImageData(0, 0, sw, sh)

  let minX = sw, minY = sh, maxX = 0, maxY = 0, hasContent = false
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      if (data[(y * sw + x) * 4 + 3] > 20) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
        hasContent = true
      }
    }
  }

  if (!hasContent) return { sx: 0, sy: 0, size: Math.min(W, H) }

  // 8% padding, then make it square, convert back to original coords
  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.08)
  const x1 = Math.max(0, (minX - pad) / scanScale)
  const y1 = Math.max(0, (minY - pad) / scanScale)
  const x2 = Math.min(W, (maxX + pad) / scanScale)
  const y2 = Math.min(H, (maxY + pad) / scanScale)

  const halfW = (x2 - x1) / 2
  const halfH = (y2 - y1) / 2
  const half  = Math.max(halfW, halfH)
  const cx = x1 + halfW
  const cy = y1 + halfH

  return {
    sx:   Math.max(0, cx - half),
    sy:   Math.max(0, cy - half),
    size: Math.min(half * 2, W, H),
  }
}

const FONT      = "'PokemonGb', 'Press Start 2P', monospace"
const GBC_GREEN = '#84cc16'
const GBC_MUTED = '#4a7a10'
const GBC_BG    = '#050a04'

const PIXEL_SIZE = 72   // up from 48 — more detail
const SCALE      = 4    // stored as 288×288

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

  // silhouette (2 s) → flash (360 ms CSS anim) → revealed
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

    // Background removal — fall back to original if offline / error
    let sourceBlob: Blob = file
    try {
      sourceBlob = await removeBackground(file, { debug: false })
    } catch { /* fall back to original */ }

    setStep('dithering')

    const img = await blobToImageElement(sourceBlob)

    // Auto-crop: find the square bounding box of the subject
    const { sx, sy, size } = findSubjectCrop(img)

    const off = document.createElement('canvas')
    off.width  = PIXEL_SIZE
    off.height = PIXEL_SIZE
    const offCtx = off.getContext('2d')!

    // Fill darkest GBC colour so transparent areas disappear into the bg
    offCtx.fillStyle = '#050a04'
    offCtx.fillRect(0, 0, PIXEL_SIZE, PIXEL_SIZE)

    // Boost contrast + saturation before downsampling — richer pixel art
    offCtx.filter = 'contrast(1.5) saturate(1.8) brightness(1.05)'
    offCtx.drawImage(img, sx, sy, size, size, 0, 0, PIXEL_SIZE, PIXEL_SIZE)
    offCtx.filter = 'none'

    const { data } = offCtx.getImageData(0, 0, PIXEL_SIZE, PIXEL_SIZE)

    // Floyd-Steinberg dithering into 8-color GBC palette
    const dithered = floydSteinberg(data, PIXEL_SIZE, PIXEL_SIZE)
    offCtx.putImageData(new ImageData(Uint8ClampedArray.from(dithered), PIXEL_SIZE, PIXEL_SIZE), 0, 0)

    // Scale up with nearest-neighbour (pixelated) rendering
    const display = canvasRef.current!
    display.width  = PIXEL_SIZE * SCALE
    display.height = PIXEL_SIZE * SCALE
    const dCtx = display.getContext('2d')!
    dCtx.imageSmoothingEnabled = false
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

  const busyLabel =
    step === 'removing'  ? '► REMOVING BG...' :
    step === 'dithering' ? '► PROCESSING...'  : ''

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
        Upload a bud photo — background removed and converted to GBC pixel art.
      </p>

      {/* Hidden file inputs — camera vs gallery */}
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
            display:        preview ? 'block' : 'none',
            imageRendering: 'pixelated',
            width:          '100%',
            border:         '3px solid #84cc16',
            boxSizing:      'border-box',
            filter:         canvasFilter,
            transition:     canvasTransition,
          }}
        />

        {showOverlay && (
          <div style={{
            position: 'absolute', bottom: 3, left: 3, right: 3,
            background: `${GBC_BG}cc`, padding: '6px 8px',
            display: 'flex', justifyContent: 'center', pointerEvents: 'none',
          }}>
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
          BG REMOVED · 8-COLOR GBC · DITHERED · AUTO-CROPPED
        </span>
      )}
    </div>
  )
}
