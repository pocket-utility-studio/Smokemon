import { useCallback, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useVibe } from '../context/VibeContext'
import { useLayoutMode } from '../context/LayoutModeContext'
import SplashScreen from '../pages/SplashScreen'

import { useTransitionNav } from '../context/NavigationContext'
import WipeOverlay from '../components/WipeOverlay'

const KIWI_GRAD = 'linear-gradient(160deg, #a8e030 0%, #84cc16 40%, #6aaa08 100%)'
const BEZEL = '#181818'
const BEZEL_INNER = '#0e0e0e'

// Easing used on every animated property
const T = '0.6s cubic-bezier(0.25, 1, 0.5, 1)'

// ── GBC Controls SVG ───────────────────────────────────────────────────────────
// Single SVG replaces all individual CSS button components.
// viewBox 0 0 300 240 — coordinates derived from real Kiwi GBC reference photo.
// Aspect ratio 300:240 ≈ 1.25:1 matches the controls area proportions.
function GBCControlsSVG() {
  // Key centres (x, y) in viewBox coordinates
  const dp  = { x: 75,  y: 118 }  // D-pad
  const bB  = { x: 197, y: 133 }  // B button
  const aB  = { x: 240, y: 112 }  // A button
  const bdg = { x: 150, y: 26  }  // Nintendo badge
  const sel = { x: 107, y: 197 }  // SELECT
  const sta = { x: 156, y: 192 }  // START
  const spk = { x: 216, y: 180 }  // Speaker grid top-left

  // Speaker: 7 cols × 6 rows, 8px spacing, r=2.8
  const dots: { cx: number; cy: number }[] = []
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 7; c++)
      dots.push({ cx: spk.x + c * 8, cy: spk.y + r * 8 })

  return (
    <svg
      viewBox="0 0 300 240"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="g-arm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#2a2a2a" />
          <stop offset="50%"  stopColor="#181818" />
          <stop offset="100%" stopColor="#0e0e0e" />
        </linearGradient>
        <radialGradient id="g-dome" cx="38%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#484848" />
          <stop offset="40%"  stopColor="#2c2c2c" />
          <stop offset="70%"  stopColor="#161616" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </radialGradient>
        <radialGradient id="g-dpc" cx="42%" cy="38%" r="60%">
          <stop offset="0%"   stopColor="#282828" />
          <stop offset="50%"  stopColor="#141414" />
          <stop offset="100%" stopColor="#080808" />
        </radialGradient>
        <linearGradient id="g-badge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.07)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.22)" />
        </linearGradient>
        <linearGradient id="g-pill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#303030" />
          <stop offset="60%"  stopColor="#232323" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
        <filter id="f-btn" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(0,0,0,0.85)" />
        </filter>
        <filter id="f-dp" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="rgba(0,0,0,0.9)" />
        </filter>
      </defs>

      {/* ── Nintendo badge ─────────────────────────────────── */}
      <rect
        x={bdg.x - 52} y={bdg.y - 13} width={104} height={26} rx={13}
        fill="url(#g-badge)" stroke="rgba(0,0,0,0.30)" strokeWidth={1.5}
      />
      <text
        x={bdg.x - 2} y={bdg.y + 5}
        textAnchor="middle"
        fontFamily="Arial, sans-serif" fontStyle="italic" fontWeight="900"
        fontSize={12} fill="rgba(0,0,0,0.28)"
      >Nintendo</text>
      <text
        x={bdg.x + 50} y={bdg.y + 2}
        textAnchor="middle"
        fontFamily="Arial, sans-serif" fontSize={7} fill="rgba(0,0,0,0.24)"
      >®</text>

      {/* ── D-pad ──────────────────────────────────────────── */}
      {/* Horizontal arm */}
      <rect
        x={dp.x - 44} y={dp.y - 14} width={88} height={28} rx={4}
        fill="url(#g-arm)" stroke="#050505" strokeWidth={1.5}
        filter="url(#f-dp)"
      />
      {/* Vertical arm */}
      <rect
        x={dp.x - 14} y={dp.y - 44} width={28} height={88} rx={4}
        fill="url(#g-arm)" stroke="#050505" strokeWidth={1.5}
        filter="url(#f-dp)"
      />
      {/* Centre thumb indent */}
      <circle cx={dp.x} cy={dp.y} r={12} fill="url(#g-dpc)" />
      {/* Arrows */}
      <polygon points={`${dp.x-26},${dp.y} ${dp.x-18},${dp.y-6} ${dp.x-18},${dp.y+6}`} fill="#555" />
      <polygon points={`${dp.x+26},${dp.y} ${dp.x+18},${dp.y-6} ${dp.x+18},${dp.y+6}`} fill="#555" />
      <polygon points={`${dp.x},${dp.y-26} ${dp.x-6},${dp.y-18} ${dp.x+6},${dp.y-18}`} fill="#555" />
      <polygon points={`${dp.x},${dp.y+26} ${dp.x-6},${dp.y+18} ${dp.x+6},${dp.y+18}`} fill="#555" />

      {/* ── B button ───────────────────────────────────────── */}
      {/* Outer groove shadow ring */}
      <circle cx={bB.x} cy={bB.y} r={22} fill="rgba(0,0,0,0.38)" />
      {/* Dome */}
      <circle
        cx={bB.x} cy={bB.y} r={18}
        fill="url(#g-dome)" stroke="#040404" strokeWidth={1.5}
        filter="url(#f-btn)"
      />
      <text
        x={bB.x} y={bB.y + 4} textAnchor="middle"
        fontFamily="'PokemonGb', 'Press Start 2P', monospace"
        fontSize={8} fill="#606060"
      >B</text>

      {/* ── A button ───────────────────────────────────────── */}
      {/* Outer groove shadow ring */}
      <circle cx={aB.x} cy={aB.y} r={28} fill="rgba(0,0,0,0.38)" />
      {/* Dome */}
      <circle
        cx={aB.x} cy={aB.y} r={23}
        fill="url(#g-dome)" stroke="#040404" strokeWidth={1.5}
        filter="url(#f-btn)"
      />
      <text
        x={aB.x} y={aB.y + 4} textAnchor="middle"
        fontFamily="'PokemonGb', 'Press Start 2P', monospace"
        fontSize={9} fill="#606060"
      >A</text>

      {/* ── SELECT pill ────────────────────────────────────── */}
      <rect
        x={sel.x - 24} y={sel.y - 7} width={48} height={14} rx={7}
        fill="url(#g-pill)" stroke="#161616" strokeWidth={1}
      />
      <text
        x={sel.x} y={sel.y + 17} textAnchor="middle"
        fontFamily="'PokemonGb', 'Press Start 2P', monospace"
        fontSize={4} fill="#3a6010"
      >SELECT</text>

      {/* ── START pill ─────────────────────────────────────── */}
      <rect
        x={sta.x - 24} y={sta.y - 7} width={48} height={14} rx={7}
        fill="url(#g-pill)" stroke="#161616" strokeWidth={1}
      />
      <text
        x={sta.x} y={sta.y + 17} textAnchor="middle"
        fontFamily="'PokemonGb', 'Press Start 2P', monospace"
        fontSize={4} fill="#3a6010"
      >START</text>

      {/* ── Speaker grille (7 × 6 dots) ────────────────────── */}
      {dots.map(({ cx, cy }, i) => (
        <circle key={i} cx={cx} cy={cy} r={2.8} fill="#0d0d0d" />
      ))}
    </svg>
  )
}

// ── GBC Logo ───────────────────────────────────────────────────────────────────
function GBCLogo() {
  const colorWord = [
    { ch: 'C', c: '#e03030' }, { ch: 'o', c: '#3060e0' }, { ch: 'L', c: '#d4b800' },
    { ch: 'o', c: '#20a030' }, { ch: 'R', c: '#e03030' },
  ]
  const base: React.CSSProperties = {
    fontFamily: "'Arial Black', Arial, sans-serif",
    fontStyle: 'italic', fontWeight: 900, fontSize: 13, letterSpacing: 0.5,
  }
  return (
    <div style={{ textAlign: 'center', userSelect: 'none' }}>
      <span style={{ ...base, color: '#888' }}>GAME BOY </span>
      {colorWord.map(({ ch, c }, i) => (
        <span key={i} style={{ ...base, color: c }}>{ch}</span>
      ))}
    </div>
  )
}


// ── AppLayout ──────────────────────────────────────────────────────────────────
export default function AppLayout() {
  const { font } = useVibe()
  const { layoutMode, setLayoutMode } = useLayoutMode()
  const { wipePhase } = useTransitionNav()

  const emu = layoutMode === 'emulator'
  // Separate from emu — only true during the initial splash boot sequence
  const [booting, setBooting] = useState(() => sessionStorage.getItem('hasBooted') !== '1')

  // Called by SplashScreen when user taps through to the app
  const handleStart = useCallback(() => {
    sessionStorage.setItem('hasBooted', '1')
    setBooting(false)
    setLayoutMode('fullscreen')
  }, [setLayoutMode])

  return (
    // ── Kiwi backdrop — shell anchored to top with safe-area padding ──────
    <div style={{
      width: '100vw',
      height: '100dvh',
      background: KIWI_GRAD,
      display: 'flex',
      alignItems: 'flex-start',   // top-anchored
      justifyContent: 'center',
      overflow: 'hidden',
      paddingTop: 'max(env(safe-area-inset-top, 0px), 20px)',
      boxSizing: 'border-box',
    }}>

      {/* ── GBC device shell ─────────────────────────────────────────────── */}
      <div style={{
        width: 'min(100vw, calc(100dvh * 78 / 133))',
        height: emu
          ? 'min(calc(100dvh - max(env(safe-area-inset-top, 0px), 20px)), calc(100vw * 133 / 78))'
          : 'calc(100dvh - max(env(safe-area-inset-top, 0px), 20px))',
        transition: `height ${T}, width ${T}`,
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'relative',
      }}>

        {/* COMM port notch — tight to the top edge */}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '3px',
          opacity: emu ? 1 : 0.4,
          transition: `opacity ${T}`,
        }}>
          <div style={{
            width: '12%', height: 6,
            background: 'linear-gradient(180deg, #3a7008 0%, #2a5806 100%)',
            borderRadius: '0 0 4px 4px',
            border: '1px solid #1a3804', borderTop: 'none',
          }} />
        </div>

        {/* Minimal green rim above lens */}
        <div style={{ flexShrink: 0, height: '4px' }} />


        {/* ── Black lens — flex:1 so it grows to fill space above controls ─ */}
        <div style={{
          flex: 1,
          minHeight: 0,
          margin: emu ? '0 4%' : '0 2%',
          transition: `margin ${T}`,
          background: BEZEL,
          borderRadius: '12px 12px 6px 6px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: [
            'inset 0 2px 12px rgba(0,0,0,0.95)',
            '0 6px 20px rgba(0,0,0,0.5)',
          ].join(', '),
          display: 'flex',
          flexDirection: 'column',
        }}>

          {/* Power LED — left bezel, dot with POWER label below */}
          <div style={{
            position: 'absolute', left: 12, top: 8, zIndex: 2,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #ff6060, #cc0000)',
              boxShadow: '0 0 6px #ff2020, 0 0 14px rgba(255,32,32,0.55)',
            }} />
            <span style={{
              fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
              fontSize: 4, color: '#2a3a1a', letterSpacing: 0.5,
            }}>POWER</span>
          </div>

          {/*
            ── Screen area — flex:1 so it fills the lens ─────────────────────
            Chain: lens (flex col) → screen-area (flex:1) → inner frame (flex:1)
            → active display (flex:1) → content (absolute fill)
          */}
          <div style={{
            flex: 1,
            minHeight: 0,
            padding: '26px 12px 0',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Dark inner frame */}
            <div style={{
              flex: 1,
              minHeight: 0,
              background: BEZEL_INNER,
              borderRadius: 6,
              padding: 5,
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.95)',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Active display */}
              <div className="gbc-active-display" style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: '#0e1a0b',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.8)',
                }}>
                  {/* Glare */}
                  <div aria-hidden style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '25%',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)',
                    pointerEvents: 'none', zIndex: 100,
                  }} />
                  {/* Scanlines */}
                  <div aria-hidden style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 99,
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 3px)',
                  }} />
                  {/* Content */}
                  <div className={`${font} gbc-screen-content`} style={{
                    position: 'absolute', inset: 0, zIndex: 1,
                    color: '#c8e890', fontSize: '16px',
                    display: 'flex', flexDirection: 'column',
                  }}>
                    {/* App content — always in DOM, fades in after boot */}
                    <div style={{
                      flex: 1, overflowY: 'auto',
                      opacity: booting ? 0 : 1,
                      transition: `opacity ${T}`,
                      pointerEvents: booting ? 'none' : 'auto',
                    }}>
                      <Outlet />
                    </div>
                    {/* Splash — always in DOM, fades out after boot */}
                    <div style={{
                      position: 'absolute', inset: 0, zIndex: 2,
                      opacity: booting ? 1 : 0,
                      transition: `opacity ${T}`,
                      pointerEvents: booting ? 'auto' : 'none',
                    }}>
                      <SplashScreen onStart={handleStart} />
                    </div>
                    {wipePhase !== 'idle' && <WipeOverlay phase={wipePhase} />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logo area — slim bottom bezel of lens */}
          <div style={{
            height: 40,
            flexShrink: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 2,
          }}>
            <GBCLogo />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontFamily: "'Arial', sans-serif", fontStyle: 'italic',
                fontWeight: 700, fontSize: 7, color: '#444', letterSpacing: 1, userSelect: 'none',
              }}>Nintendo</span>
              <span style={{
                fontFamily: 'monospace', fontSize: 6, color: '#333', userSelect: 'none',
              }}>v{__APP_VERSION__}</span>
            </div>
          </div>
        </div>

        {/* ── Green controls area — collapses to nav bar height in fullscreen ── */}
        <div style={{
          flexShrink: 0,
          height: emu ? '42%' : '6px',
          transition: `height ${T}`,
          overflow: 'hidden',
          position: 'relative',
        }}>

          {/* Hardware buttons — single SVG, scales to fill controls area */}
          <div style={{
            position: 'absolute', inset: 0,
            opacity: emu ? 1 : 0,
            transform: emu ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
            transition: `opacity ${T}, transform ${T}`,
            pointerEvents: emu ? 'auto' : 'none',
          }}>
            <GBCControlsSVG />
          </div>

        </div>
      </div>
    </div>
  )
}
