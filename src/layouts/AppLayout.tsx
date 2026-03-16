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
// 88px, 29px arms. Circular thumb-rest indentation. Embossed arrows.
// Arrow centres: L=(14.5,43.5) R=(73,43.5) U=(43.5,14.5) D=(43.5,73)
function DPad() {
  const arm: React.CSSProperties = {
    background: 'linear-gradient(160deg, #252525 0%, #161616 50%, #0e0e0e 100%)',
    border: '1.5px solid #060606',
    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.06), inset 0 -1px 2px rgba(0,0,0,0.8), 0 4px 10px rgba(0,0,0,0.8)',
    position: 'absolute',
  }
  const arrows = [
    { top: 38, left: 10,    borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: '9px solid #666',  filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.12))' },
    { top: 38, right: 10,   borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '9px solid #666',   filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.12))' },
    { left: 44, top: 10,    borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '9px solid #666', filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.12))' },
    { left: 44, bottom: 10, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '9px solid #666',    filter: 'drop-shadow(0 -1px 0 rgba(255,255,255,0.08))' },
  ]
  return (
    <div style={{
      position: 'relative', width: 88, height: 88,
      pointerEvents: 'none', userSelect: 'none',
      filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.8))',
    }}>
      <div style={{ ...arm, top: 29, left: 0, width: 88, height: 29, borderRadius: 4 }} />
      <div style={{ ...arm, top: 0, left: 29, width: 29, height: 88, borderRadius: 4 }} />
      <div style={{
        position: 'absolute', top: 32.5, left: 32.5, width: 22, height: 22, borderRadius: '50%',
        background: 'radial-gradient(circle at 42% 38%, #262626 0%, #141414 50%, #090909 100%)',
        boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.95), inset 0 -1px 2px rgba(255,255,255,0.04)',
      }} />
      {arrows.map(({ filter: f, ...a }, i) => (
        <div key={i} style={{ position: 'absolute', width: 0, height: 0, filter: f, ...a }} />
      ))}
    </div>
  )
}

// ── A Button — convex dome, label inside, shallow circular groove ─────────────
function AButton() {
  return (
    <div style={{
      width: 62, height: 62, borderRadius: '50%',
      background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.15) 100%)',
      boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none', userSelect: 'none',
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 30%, #484848 0%, #2a2a2a 40%, #141414 70%, #0a0a0a 100%)',
        border: '1.5px solid #050505',
        boxShadow: '0 4px 10px rgba(0,0,0,0.95), inset 0 1px 3px rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 9, color: '#666' }}>A</span>
      </div>
    </div>
  )
}

// ── B Button — same but smaller ───────────────────────────────────────────────
function BButton() {
  return (
    <div style={{
      width: 48, height: 48, borderRadius: '50%',
      background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.15) 100%)',
      boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none', userSelect: 'none',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 30%, #484848 0%, #2a2a2a 40%, #141414 70%, #0a0a0a 100%)',
        border: '1.5px solid #050505',
        boxShadow: '0 3px 8px rgba(0,0,0,0.95), inset 0 1px 3px rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 8, color: '#666' }}>B</span>
      </div>
    </div>
  )
}

// ── Pill Button (SELECT / START) — flush matte rubber ────────────────────────
function PillButton({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, pointerEvents: 'none', userSelect: 'none' }}>
      <div style={{
        width: 36, height: 12, borderRadius: 7,
        background: 'linear-gradient(180deg, #2e2e2e 0%, #222 60%, #1a1a1a 100%)',
        border: '1px solid #181818',
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.05), inset 0 2px 4px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.5)',
      }} />
      <span style={{
        fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
        fontSize: 4, color: '#3a6010', letterSpacing: 0.5,
      }}>{label}</span>
    </div>
  )
}

// ── Nintendo Oval Badge — embossed into green shell ───────────────────────────
function NintendoBadge() {
  return (
    <div style={{
      width: 88, height: 28, borderRadius: 14,
      border: '2px solid rgba(0,0,0,0.22)',
      background: 'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.18) 100%)',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.08), 0 1px 2px rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none', userSelect: 'none',
    }}>
      <span style={{
        fontFamily: "'Arial', sans-serif",
        fontStyle: 'italic', fontWeight: 700, fontSize: 12,
        color: 'rgba(0,0,0,0.35)', letterSpacing: 0.3,
      }}>Nintendo</span>
    </div>
  )
}

// ── Speaker Grille — 7×7 dot grid, straight (no rotation), deep cutout ────────
function SpeakerGrille() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, pointerEvents: 'none', userSelect: 'none' }}>
      {Array.from({ length: 7 }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: 5 }}>
          {Array.from({ length: 7 }).map((_, c) => (
            <div key={c} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, #010201 15%, #010101 85%, rgba(60,80,20,0.1) 100%)',
              boxShadow: '0 -1px 0 rgba(255,255,255,0.08), 0 1px 0 rgba(130,204,22,0.14), inset 0 2px 4px rgba(0,0,0,1)',
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

          {/* Hardware buttons — pixel-accurate absolute positioning */}
          <div style={{
            position: 'absolute', inset: 0,
            opacity: emu ? 1 : 0,
            transform: emu ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
            transition: `opacity ${T}, transform ${T}`,
            pointerEvents: emu ? 'auto' : 'none',
          }}>
            {/* Nintendo badge */}
            <div style={{ position: 'absolute', left: '50%', top: '12%', transform: 'translate(-50%, -50%)' }}>
              <NintendoBadge />
            </div>
            {/* D-pad */}
            <div style={{ position: 'absolute', left: '23%', top: '44%', transform: 'translate(-50%, -50%)' }}>
              <DPad />
            </div>
            {/* B button */}
            <div style={{ position: 'absolute', left: '67%', top: '48%', transform: 'translate(-50%, -50%)' }}>
              <BButton />
            </div>
            {/* A button */}
            <div style={{ position: 'absolute', left: '79%', top: '39%', transform: 'translate(-50%, -50%)' }}>
              <AButton />
            </div>
            {/* SELECT */}
            <div style={{ position: 'absolute', left: '37%', top: '74%', transform: 'translate(-50%, -50%)' }}>
              <PillButton label="SELECT" />
            </div>
            {/* START */}
            <div style={{ position: 'absolute', left: '48%', top: '71%', transform: 'translate(-50%, -50%)' }}>
              <PillButton label="START" />
            </div>
            {/* Speaker grille */}
            <div style={{ position: 'absolute', left: '82%', top: '78%', transform: 'translate(-50%, -50%)' }}>
              <SpeakerGrille />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
