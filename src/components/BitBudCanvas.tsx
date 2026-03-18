import { useRef, useState, useCallback } from 'react'

// GBC 5-color kiwi palette (R, G, B)
const GBC_PALETTE: [number, number, number][] = [
  [5,   10,  4],   // #050a04 — darkest
  [14,  26,  11],  // #0e1a0b — charcoal
  [42,  74,  8],   // #2a4a08 — muted
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
// giving far more perceived detail with the same 5-colour palette
function floydSteinberg(data: Uint8ClampedArray, w: number, h: number): Uint8ClampedArray {
  // Float buffer so errors accumulate without clamping
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

const FONT = "'PokemonGb', 'Press Start 2P', monospace"
const GBC_GREEN = '#84cc16'
const GBC_MUTED = '#4a7a10'

// 48×48 gives noticeably more detail than 32×32 while staying clearly pixel art
const PIXEL_SIZE = 48
const SCALE = 5  // stored as 240×240

interface BitBudCanvasProps {
  onCapture: (dataUrl: string) => void
}

export default function BitBudCanvas({ onCapture }: BitBudCanvasProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const processImage = useCallback((file: File) => {
    setProcessing(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Downsample to PIXEL_SIZE×PIXEL_SIZE
        const off = document.createElement('canvas')
        off.width = PIXEL_SIZE
        off.height = PIXEL_SIZE
        const offCtx = off.getContext('2d')!
        offCtx.drawImage(img, 0, 0, PIXEL_SIZE, PIXEL_SIZE)
        const { data } = offCtx.getImageData(0, 0, PIXEL_SIZE, PIXEL_SIZE)

        // Apply Floyd-Steinberg dithering into GBC palette
        const dithered = floydSteinberg(data, PIXEL_SIZE, PIXEL_SIZE)
        offCtx.putImageData(new ImageData(Uint8ClampedArray.from(dithered), PIXEL_SIZE, PIXEL_SIZE), 0, 0)

        // Scale up with pixelated rendering
        const display = canvasRef.current!
        display.width = PIXEL_SIZE * SCALE
        display.height = PIXEL_SIZE * SCALE
        const dCtx = display.getContext('2d')!
        dCtx.imageSmoothingEnabled = false
        dCtx.drawImage(off, 0, 0, PIXEL_SIZE * SCALE, PIXEL_SIZE * SCALE)

        const dataUrl = display.toDataURL('image/png')
        setPreview(dataUrl)
        setProcessing(false)
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  }, [])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processImage(file)
    e.target.value = ''
  }

  const handleSave = () => {
    if (preview) onCapture(preview)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontFamily: FONT, fontSize: 9, color: GBC_GREEN, letterSpacing: 0.5 }}>
        BIT-BUD FILTER
      </span>
      <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#c8e890', lineHeight: 1.7, margin: 0 }}>
        Upload a bud photo to convert it to 8-bit GBC style.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        style={{ display: 'none' }}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={processing}
        style={{
          fontFamily: FONT,
          fontSize: 10,
          padding: '11px 14px',
          cursor: processing ? 'default' : 'pointer',
          border: '3px solid #84cc16',
          color: '#84cc16',
          background: 'rgba(132,204,22,0.08)',
          width: '100%',
          boxSizing: 'border-box',
          letterSpacing: 0.5,
        }}
      >
        {processing ? '► PROCESSING...' : '► UPLOAD PHOTO'}
      </button>

      {/* Display canvas */}
      <canvas
        ref={canvasRef}
        style={{
          display: preview ? 'block' : 'none',
          imageRendering: 'pixelated',
          width: '100%',
          border: '3px solid #84cc16',
          boxSizing: 'border-box',
        }}
      />

      {preview && (
        <button
          onClick={handleSave}
          style={{
            fontFamily: FONT,
            fontSize: 10,
            padding: '11px 14px',
            cursor: 'pointer',
            border: '3px solid #84cc16',
            color: '#84cc16',
            background: 'rgba(132,204,22,0.15)',
            width: '100%',
            boxSizing: 'border-box',
            letterSpacing: 0.5,
          }}
        >
          ► SAVE AS BUD PHOTO
        </button>
      )}

      {preview && (
        <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, textAlign: 'center' }}>
          5-COLOR GBC PALETTE · DITHERED
        </span>
      )}
    </div>
  )
}
