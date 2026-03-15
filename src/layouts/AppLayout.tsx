import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useVibe } from '../context/VibeContext'
import { useGifMode } from '../context/GifModeContext'
import GBCBottomBar from '../components/GBCBottomBar'
import SplashScreen from '../pages/SplashScreen'
import { setVolume } from '../utils/sounds'
import { useTransitionNav } from '../context/NavigationContext'
import WipeOverlay from '../components/WipeOverlay'

const KIWI = 'linear-gradient(160deg, #a8e030 0%, #84cc16 40%, #6aaa08 100%)'
const KIWI_DARK = '#4a8010'
const BEZEL = '#181818'
const BEZEL_INNER = '#0e0e0e'

// ── D-Pad ─────────────────────────────────────────────────────────────────────
function DPad() {
  const arm: React.CSSProperties = {
    background: 'linear-gradient(180deg, #222 0%, #111 100%)',
    border: '1px solid #080808',
    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.06)',
    position: 'absolute',
  }
  return (
    <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
      {/* Horizontal */}
      <div style={{ ...arm, top: 24, left: 0, width: 72, height: 24, borderRadius: 3 }} />
      {/* Vertical */}
      <div style={{ ...arm, top: 0, left: 24, width: 24, height: 72, borderRadius: 3 }} />
      {/* Center nub */}
      <div style={{
        position: 'absolute', top: 24, left: 24, width: 24, height: 24,
        background: '#1a1a1a', borderRadius: 2,
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)',
      }} />
      {/* Arrows */}
      {[
        { style: { top: 28, left: 6, width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: '8px solid #444' } },
        { style: { top: 28, right: 6, width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '8px solid #444' } },
        { style: { left: 28, top: 6, width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '8px solid #444' } },
        { style: { left: 28, bottom: 6, width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid #444' } },
      ].map((a, i) => (
        <div key={i} style={{ position: 'absolute', ...a.style }} />
      ))}
    </div>
  )
}

// ── A/B Buttons ───────────────────────────────────────────────────────────────
function ActionButtons() {
  const btn = (label: string, size: number) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #2a2a2a, #0e0e0e)',
        border: '1px solid #080808',
        boxShadow: '0 3px 6px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 8, color: '#444' }}>{label}</span>
      </div>
    </div>
  )
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0 }}>
      {btn('B', 36)}
      {btn('A', 44)}
    </div>
  )
}


// ── GBC Logo ──────────────────────────────────────────────────────────────────
function GBCLogo() {
  const colorWord = [
    { ch: 'C', c: '#e03030' },
    { ch: 'o', c: '#3060e0' },
    { ch: 'L', c: '#d4b800' },
    { ch: 'o', c: '#20a030' },
    { ch: 'R', c: '#e03030' },
  ]
  const base: React.CSSProperties = {
    fontFamily: "'Arial Black', Arial, sans-serif",
    fontStyle: 'italic',
    fontWeight: 900,
    fontSize: 13,
    letterSpacing: 0.5,
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

export default function AppLayout() {
  const { font } = useVibe()
  const { gifMode } = useGifMode()
  const [started, setStarted] = useState(() => sessionStorage.getItem('app-started') === '1')
  const [volume, setVolumeState] = useState(0.8)
  const { wipePhase } = useTransitionNav()

  const handleVolume = (v: number) => {
    setVolumeState(v)
    setVolume(v)
  }

  return (
    <div style={{
      width: '100vw',
      height: '100dvh',
      background: KIWI,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>

      {/* COMM port notch at very top */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'center',
        paddingTop: 4,
      }}>
        <div style={{
          width: 48, height: 6,
          background: 'linear-gradient(180deg, #3a7008 0%, #2a5806 100%)',
          borderRadius: '0 0 4px 4px',
          border: '1px solid #1a3804',
          borderTop: 'none',
        }} />
      </div>

      {/* Black bezel — screen + logo */}
      <div style={{
        flex: 1,
        minHeight: 0,
        margin: '4px 12px 0',
        background: BEZEL,
        borderRadius: '8px 8px 6px 6px',
        padding: '8px 10px 10px',
        boxShadow: [
          'inset 0 2px 8px rgba(0,0,0,0.9)',
          '0 4px 12px rgba(0,0,0,0.4)',
        ].join(', '),
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        overflow: 'hidden',
      }}>

        {/* Power LED + VOL row */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 2,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#ff2020',
              boxShadow: '0 0 4px #ff2020, 0 0 10px rgba(255,32,32,0.4)',
            }} />
            <div style={{ display: 'flex', gap: 3 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  width: 0, height: 0,
                  borderTop: '5px solid transparent',
                  borderBottom: '5px solid transparent',
                  borderLeft: `6px solid ${i === 1 ? '#555' : '#333'}`,
                }} />
              ))}
            </div>
            <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 5, color: '#333' }}>POWER</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 4, color: '#333' }}>VOL</span>
            <input
              type="range" min={0} max={100} value={Math.round(volume * 100)}
              onChange={(e) => handleVolume(Number(e.target.value) / 100)}
              className="gbc-vol-slider"
            />
          </div>
        </div>

        {/* Screen */}
        <div style={{
          flex: 1,
          minHeight: 0,
          background: BEZEL_INNER,
          borderRadius: 4,
          padding: 4,
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.95)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            flex: 1,
            minHeight: 0,
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
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

            {started ? (
              <div className={`${font} gbc-screen-content`} style={{
                height: '100%', overflowY: 'auto',
                color: '#c8e890', fontSize: '16px',
                display: 'flex', flexDirection: 'column',
                position: 'relative',
              }}>
                <div style={{ flex: 1 }}>
                  <Outlet />
                </div>
                <GBCBottomBar />
                {wipePhase !== 'idle' && <WipeOverlay phase={wipePhase} />}
              </div>
            ) : (
              <SplashScreen onStart={() => { sessionStorage.setItem('app-started', '1'); setStarted(true) }} />
            )}
          </div>
        </div>

        {/* GBC Logo inside bezel */}
        <GBCLogo />
      </div>

      {/* Controls row — D-pad + A/B (only during gif) */}
      {gifMode && (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          minHeight: 0,
        }}>
          <DPad />
          <ActionButtons />
        </div>
      )}

      {/* Bottom padding for safe area */}
      <div style={{ flexShrink: 0, paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }} />
    </div>
  )
}
