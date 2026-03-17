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

const FONT = "'PokemonGb', 'Press Start 2P', monospace"
const GBC_GREEN = '#84cc16'
const GBC_MUTED = '#4a7a10'

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
        const PIXEL_SIZE = 32
        // Offscreen canvas for downsampling
        const off = document.createElement('canvas')
        off.width = PIXEL_SIZE
        off.height = PIXEL_SIZE
        const offCtx = off.getContext('2d')!
        offCtx.drawImage(img, 0, 0, PIXEL_SIZE, PIXEL_SIZE)
        const { data } = offCtx.getImageData(0, 0, PIXEL_SIZE, PIXEL_SIZE)

        // Map each pixel to nearest palette colour
        const mapped = new Uint8ClampedArray(data.length)
        for (let i = 0; i < data.length; i += 4) {
          const [r, g, b] = nearestColor(data[i], data[i + 1], data[i + 2])
          mapped[i] = r; mapped[i + 1] = g; mapped[i + 2] = b; mapped[i + 3] = 255
        }
        offCtx.putImageData(new ImageData(mapped, PIXEL_SIZE, PIXEL_SIZE), 0, 0)

        // Display canvas — scale up with pixelated rendering
        const display = canvasRef.current!
        const SCALE = 5
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

      {/* Hidden display canvas */}
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
          5-COLOR GBC PALETTE APPLIED
        </span>
      )}
    </div>
  )
}
