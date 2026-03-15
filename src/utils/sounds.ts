// GBC-style sound effects — square waves approximating the original hardware

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null

function getCtx(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext()
    return ctx
  } catch {
    return null
  }
}

function getMaster(c: AudioContext): GainNode {
  if (!masterGain) {
    masterGain = c.createGain()
    masterGain.gain.value = 0.8
    masterGain.connect(c.destination)
  }
  return masterGain
}

async function ensureCtx(): Promise<AudioContext | null> {
  const c = getCtx()
  if (!c) return null
  if (c.state === 'suspended') {
    try { await c.resume() } catch { return null }
  }
  return c
}

function note(
  c: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  volume = 0.12,
  type: OscillatorType = 'square',
) {
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain)
  gain.connect(getMaster(c))   // route through master gain
  osc.type = type
  osc.frequency.setValueAtTime(freq, startTime)
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.003)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.01)
}

/**
 * Synchronously create + resume the AudioContext.
 * Must be called directly inside a user-gesture handler (required by iOS Safari).
 */
export function unlockAudio(): void {
  const c = getCtx()
  if (c && c.state === 'suspended') {
    c.resume().catch(() => {})
  }
}

/** Set master volume 0–1. Called by the GBC volume slider. */
export function setVolume(level: number) {
  const c = getCtx()
  if (!c) return
  getMaster(c).gain.value = Math.max(0, Math.min(1, level))
}

// ── Public sound effects ────────────────────────────────────────────────────

export async function playBoot() {
  const c = await ensureCtx()
  if (!c) return
  note(c, 1047, c.currentTime, 0.35, 0.18)
}

export async function playCursor() {
  const c = await ensureCtx()
  if (!c) return
  note(c, 1046, c.currentTime, 0.045, 0.07)
}

export async function playPressStart() {
  const c = await ensureCtx()
  if (!c) return
  const t = c.currentTime
  note(c, 523,  t + 0.00, 0.08, 0.12)
  note(c, 1047, t + 0.10, 0.18, 0.15)
}

export async function playPowerUp() {
  const c = await ensureCtx()
  if (!c) return
  const t = c.currentTime
  note(c, 262,  t + 0.00, 0.06, 0.10)
  note(c, 330,  t + 0.07, 0.06, 0.10)
  note(c, 392,  t + 0.14, 0.06, 0.10)
  note(c, 523,  t + 0.21, 0.06, 0.10)
  note(c, 659,  t + 0.28, 0.06, 0.10)
  note(c, 784,  t + 0.35, 0.18, 0.14)
}

export async function playSelect() {
  const c = await ensureCtx()
  if (!c) return
  const t = c.currentTime
  note(c, 784,  t + 0.00, 0.07, 0.10)
  note(c, 1047, t + 0.08, 0.14, 0.14)
}

/** Single short tick for typewriter text — very quiet, very brief */
export async function playTick() {
  const c = await ensureCtx()
  if (!c) return
  note(c, 1200, c.currentTime, 0.018, 0.04)
}

export async function playNavigate() {
  const c = await ensureCtx()
  if (!c) return
  note(c, 880, c.currentTime, 0.035, 0.055)
}

export async function playWipeTransition() {
  const c = await ensureCtx()
  if (!c) return
  const t = c.currentTime
  note(c, 523, t + 0.00, 0.05, 0.07)
  note(c, 392, t + 0.05, 0.05, 0.07)
  note(c, 262, t + 0.10, 0.09, 0.09)
}

export async function playHeal() {
  const c = await ensureCtx()
  if (!c) return
  const t = c.currentTime
  note(c, 262,  t + 0.00, 0.06, 0.09)
  note(c, 330,  t + 0.07, 0.06, 0.09)
  note(c, 392,  t + 0.14, 0.06, 0.09)
  note(c, 523,  t + 0.21, 0.06, 0.09)
  note(c, 659,  t + 0.28, 0.06, 0.09)
  note(c, 784,  t + 0.35, 0.14, 0.12)
}

export async function playSave() {
  const c = await ensureCtx()
  if (!c) return
  const t = c.currentTime
  note(c, 523,  t + 0.00, 0.07, 0.10)
  note(c, 659,  t + 0.08, 0.07, 0.10)
  note(c, 784,  t + 0.16, 0.07, 0.10)
  note(c, 1047, t + 0.24, 0.22, 0.14)
}

export async function playError() {
  const c = await ensureCtx()
  if (!c) return
  const t = c.currentTime
  note(c, 220, t + 0.00, 0.07, 0.11)
  note(c, 185, t + 0.08, 0.07, 0.11)
  note(c, 147, t + 0.16, 0.14, 0.11)
}
