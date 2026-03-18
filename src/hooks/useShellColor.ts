/**
 * useShellColor.ts
 * Manages the hardware shell colour customiser.
 *
 * One hex value is stored in localStorage; all seven CSS variables
 * (shell gradient stops + D-pad arm tints + arrow colour) are derived
 * from it and applied to :root via setProperty.
 *
 * The derivation runs immediately at module-load time so there is no
 * flash-of-default-colour before the first React render.
 */

const STORAGE_KEY   = 'smokemon_shell_color'
export const DEFAULT_SHELL = '#84cc16'

// ── Colour math ───────────────────────────────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l   = (max + min) / 2

  if (max === min) return [0, 0, Math.round(l * 100)]

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h = 0
  if      (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else                h = ((r - g) / d + 4) / 6

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360; s /= 100; l /= 100
  let r: number, g: number, b: number
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  const hex2 = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0')
  return `#${hex2(r)}${hex2(g)}${hex2(b)}`
}

// ── CSS variable application ───────────────────────────────────────────────────

export function applyShellColor(baseHex: string): void {
  if (!/^#[0-9a-f]{6}$/i.test(baseHex)) return

  const [h, s, l] = hexToHsl(baseHex)

  // Shell gradient: three stops — lighter, base, darker
  const shellLight = hslToHex(h, s,                     Math.min(95, l + 15))
  const shellMid   = baseHex
  const shellDark  = hslToHex(h, s,                     Math.max(5,  l - 15))

  // D-pad arms: very desaturated so they stay realistically dark.
  // S is clamped to a low value to keep a faint hue tint without
  // overwhelming the dark hardware look.
  const dpadS = Math.min(22, s * 0.25)  // ≤22 % saturation for arms
  const dpadA = hslToHex(h, dpadS, 14)   // lightest arm gradient stop
  const dpadB = hslToHex(h, dpadS,  9)   // mid arm gradient stop
  const dpadC = hslToHex(h, dpadS,  5)   // darkest arm gradient stop

  // Arrow polygons: a little brighter so they read against the dark arms
  const dpadArrow = hslToHex(h, Math.min(35, s * 0.45), 30)

  const root = document.documentElement
  root.style.setProperty('--shell-light', shellLight)
  root.style.setProperty('--shell-mid',   shellMid)
  root.style.setProperty('--shell-dark',  shellDark)
  root.style.setProperty('--dpad-arm-a',  dpadA)
  root.style.setProperty('--dpad-arm-b',  dpadB)
  root.style.setProperty('--dpad-arm-c',  dpadC)
  root.style.setProperty('--dpad-arrow',  dpadArrow)
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getShellColor(): string {
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_SHELL
}

export function setShellColor(hex: string): void {
  localStorage.setItem(STORAGE_KEY, hex)
  applyShellColor(hex)
}

export function resetShellColor(): void {
  localStorage.removeItem(STORAGE_KEY)
  applyShellColor(DEFAULT_SHELL)
}

// Apply immediately at module load — zero flash-of-default-colour on reload
if (typeof document !== 'undefined') {
  applyShellColor(getShellColor())
}
