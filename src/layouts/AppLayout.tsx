import { useCallback } from 'react'
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

// ── D-Pad ──────────────────────────────────────────────────────────────────────
// 88px total, 29px arm width. Real GBC has circular thumb-rest indentation
// in centre and embossed raised arrows on each arm.
function DPad() {
  const arm: React.CSSProperties = {
    background: 'linear-gradient(160deg, #252525 0%, #161616 50%, #0e0e0e 100%)',
    border: '1.5px solid #060606',
    boxShadow: [
      'inset 0 1px 2px rgba(255,255,255,0.06)',
      'inset 0 -1px 2px rgba(0,0,0,0.8)',
      '0 4px 10px rgba(0,0,0,0.8)',
    ].join(', '),
    position: 'absolute',
  }
  // Embossed arrow: slightly raised look via box-shadow on the triangle
  // Using border-trick triangles. Centers: L=(14.5,43.5) R=(73,43.5) U=(43.5,14.5) D=(43.5,73)
  const arrows = [
    { top: 38, left: 10,    borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: '9px solid #666',  filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.12))' },
    { top: 38, right: 10,   borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '9px solid #666',   filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.12))' },
    { left: 44, top: 10,    borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '9px solid #666', filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.12))' },
    { left: 44, bottom: 10, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '9px solid #666',    filter: 'drop-shadow(0 -1px 0 rgba(255,255,255,0.08))' },
  ]
  return (
    <div style={{
      position: 'relative', width: 88, height: 88,
      flexShrink: 0, pointerEvents: 'none', userSelect: 'none',
      filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.8))',
    }}>
      {/* Horizontal arm */}
      <div style={{ ...arm, top: 29, left: 0, width: 88, height: 29, borderRadius: 4 }} />
      {/* Vertical arm */}
      <div style={{ ...arm, top: 0, left: 29, width: 29, height: 88, borderRadius: 4 }} />
      {/* Circular thumb-rest indentation in the centre */}
      <div style={{
        position: 'absolute',
        top: 29 + (29 - 22) / 2, left: 29 + (29 - 22) / 2,
        width: 22, height: 22, borderRadius: '50%',
        background: 'radial-gradient(circle at 42% 38%, #262626 0%, #141414 50%, #090909 100%)',
        boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.95), inset 0 -1px 2px rgba(255,255,255,0.04)',
      }} />
      {arrows.map(({ filter: f, ...a }, i) => (
        <div key={i} style={{ position: 'absolute', width: 0, height: 0, filter: f, ...a }} />
      ))}
    </div>
  )
}

// ── A/B Buttons — blank convex domed buttons in shallow circular grooves.
// Labels "A" and "B" are printed on the shell, not on the buttons themselves.
function ActionButtons() {
  // Shallow circular groove recessed into shell, then blank convex button inside
  const btn = (size: number) => (
    <div style={{
      width: size + 10, height: size + 10, borderRadius: '50%',
      background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.2) 100%)',
      boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.7), inset 0 -1px 2px rgba(255,255,255,0.04)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Convex domed button — glossy highlight top-left */}
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 32%, #484848 0%, #282828 40%, #141414 70%, #0a0a0a 100%)',
        border: '1.5px solid #050505',
        boxShadow: '0 3px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.6), inset 0 1px 3px rgba(255,255,255,0.1)',
      }} />
    </div>
  )
  return (
    <div style={{ position: 'relative', width: 115, height: 92, flexShrink: 0, pointerEvents: 'none', userSelect: 'none' }}>
      {/* B — lower-left */}
      <div style={{ position: 'absolute', bottom: 0, left: 0 }}>
        {btn(38)}
      </div>
      {/* B label on shell — above and right of B button */}
      <span style={{
        position: 'absolute', bottom: 42, left: 36,
        fontFamily: "'Arial Black', Arial, sans-serif",
        fontStyle: 'italic', fontWeight: 900, fontSize: 10,
        color: 'rgba(0,0,0,0.35)', userSelect: 'none',
      }}>B</span>
      {/* A — upper-right */}
      <div style={{ position: 'absolute', top: 0, right: 0 }}>
        {btn(52)}
      </div>
      {/* A label on shell — below and left of A button */}
      <span style={{
        position: 'absolute', top: 54, right: 52,
        fontFamily: "'Arial Black', Arial, sans-serif",
        fontStyle: 'italic', fontWeight: 900, fontSize: 12,
        color: 'rgba(0,0,0,0.35)', userSelect: 'none',
      }}>A</span>
    </div>
  )
}

// ── Start / Select — soft conductive rubber, matte, almost flush with shell ───
function StartSelect() {
  const pill = (label: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      {/* Rubber pill: matte, barely raised, dark grey */}
      <div style={{
        width: 34, height: 11,
        background: 'linear-gradient(180deg, #2e2e2e 0%, #242424 60%, #1c1c1c 100%)',
        borderRadius: 6,
        border: '1px solid #181818',
        // Very subtle shadow — flush feel, not hard plastic
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.05), 0 1px 3px rgba(0,0,0,0.6)',
      }} />
      <span style={{
        fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
        fontSize: 4, color: '#3a6010', letterSpacing: 0.5,
      }}>{label}</span>
    </div>
  )
  return (
    <div style={{
      display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'center',
      transform: 'rotate(-25deg)', transformOrigin: 'center',
      pointerEvents: 'none', userSelect: 'none',
    }}>
      {pill('SELECT')}
      {pill('START')}
    </div>
  )
}

// ── Speaker Grille — physical slots cut through shell, depth visible inside ───
function SpeakerGrille() {
  const slotCounts = [3, 5, 6, 6, 5, 3]
  return (
    <div style={{ transform: 'rotate(-20deg)', display: 'flex', gap: 5, alignItems: 'center' }}>
      {slotCounts.map((count, c) => (
        <div key={c} style={{ display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
          {Array.from({ length: count }).map((_, r) => (
            <div key={r} style={{
              width: 5, height: 14, borderRadius: 3,
              // Top edge (inside hole): bright plastic rim catching light
              // Mid: very dark — looking into the device
              // Bottom edge: subtle bounce light from interior
              background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, #020402 8%, #010201 80%, rgba(60,80,20,0.12) 100%)',
              boxShadow: [
                // Outer rim highlight — the plastic edge around the slot
                '0 -1px 0 rgba(255,255,255,0.1)',
                '0 1px 0 rgba(130,204,22,0.18)',
                // Deep inset — simulates actual hole going into device
                'inset 0 3px 6px rgba(0,0,0,1)',
                'inset 0 -2px 4px rgba(0,0,0,0.9)',
              ].join(', '),
            }} />
          ))}
        </div>
      ))}
    </div>
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

  // Called by SplashScreen (manual click OR 3 s auto-timer)
  const handleStart = useCallback(() => {
    sessionStorage.setItem('hasBooted', '1')
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
                    {/* App content — always in DOM, fades in on boot */}
                    <div style={{
                      flex: 1, overflowY: 'auto',
                      opacity: emu ? 0 : 1,
                      transition: `opacity ${T}`,
                      pointerEvents: emu ? 'none' : 'auto',
                    }}>
                      <Outlet />
                    </div>
                    {/* Splash — always in DOM, fades out on boot */}
                    <div style={{
                      position: 'absolute', inset: 0, zIndex: 2,
                      opacity: emu ? 1 : 0,
                      transition: `opacity ${T}`,
                      pointerEvents: emu ? 'auto' : 'none',
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

          {/* Hardware buttons — visible in emulator, fade out in fullscreen */}
          <div style={{
            position: 'absolute', inset: 0,
            padding: '2% 7% 0',
            paddingBottom: 'max(2%, env(safe-area-inset-bottom))',
            display: 'flex', flexDirection: 'column',
            opacity: emu ? 1 : 0,
            transform: emu ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
            transition: `opacity ${T}, transform ${T}`,
            pointerEvents: emu ? 'auto' : 'none',
          }}>
            {/* D-pad + A/B — close to lens */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '4%',
            }}>
              <DPad />
              <ActionButtons />
            </div>
            {/* Start + Select */}
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              marginBottom: '4%',
            }}>
              <StartSelect />
            </div>
            {/* Speaker — bottom right, flex:1 spacer creates the gap */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
              <SpeakerGrille />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
