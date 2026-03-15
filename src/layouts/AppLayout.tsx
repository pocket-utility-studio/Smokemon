import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useVibe } from '../context/VibeContext'
import GBCBottomBar from '../components/GBCBottomBar'
import SplashScreen from '../pages/SplashScreen'
import { setVolume } from '../utils/sounds'
import { useTransitionNav } from '../context/NavigationContext'
import WipeOverlay from '../components/WipeOverlay'

const KIWI = 'linear-gradient(160deg, #c8f050 0%, #96d028 30%, #80be1c 65%, #68a010 100%)'

function CartridgeSlot() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{
        width: 64, height: 10,
        borderRadius: '0 0 5px 5px',
        background: 'linear-gradient(180deg, #1a2802 0%, #0e1c02 100%)',
        boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.8)',
        border: '1px solid #0a1202',
        borderTop: 'none',
      }} />
    </div>
  )
}

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
    fontSize: 15,
    letterSpacing: 0.5,
  }
  return (
    <div style={{ textAlign: 'center', padding: '5px 0 6px', userSelect: 'none', flexShrink: 0 }}>
      <span style={{ ...base, color: '#b0b0b8' }}>GAME BOY </span>
      {colorWord.map(({ ch, c }, i) => (
        <span key={i} style={{ ...base, color: c }}>{ch}</span>
      ))}
    </div>
  )
}

function SpeakerGrille() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 5px)', gap: '4px' }}>
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} style={{
          width: 5, height: 5, borderRadius: '50%',
          background: '#3a6010',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
        }} />
      ))}
    </div>
  )
}

export default function AppLayout() {
  const { font } = useVibe()
  const [started, setStarted] = useState(false)
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
      boxShadow: [
        'inset 0 1px 0 rgba(255,255,255,0.3)',
        'inset 0 -2px 0 rgba(0,0,0,0.25)',
        '0 8px 32px rgba(0,0,0,0.6)',
      ].join(', '),
    }}>

      {/* Cartridge slot */}
      <CartridgeSlot />

      {/* Dark bezel — takes up almost all space */}
      <div style={{
        flex: 1,
        margin: '0 8px',
        background: 'linear-gradient(160deg, #1c1c1c 0%, #101010 100%)',
        borderRadius: '0 0 14px 14px',
        padding: '6px 8px 0',
        boxShadow: [
          'inset 0 6px 24px rgba(0,0,0,0.9)',
          'inset 0 0 0 1px rgba(255,255,255,0.03)',
          '0 4px 12px rgba(0,0,0,0.4)',
        ].join(', '),
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 0,
      }}>

        {/* Power LED + VOL row */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 4px', marginBottom: 4, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#ff2020',
              boxShadow: '0 0 5px #ff2020, 0 0 12px rgba(255,32,32,0.5)',
            }} />
            <span style={{ fontFamily: "'Press Start 2P'", fontSize: 5, color: '#2a2a2a' }}>POWER</span>
          </div>
          <span style={{ fontFamily: "'Press Start 2P'", fontSize: 4, color: '#222', letterSpacing: 0.4 }}>
            DOT MATRIX WITH STEREO SOUND
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ fontFamily: "'Press Start 2P'", fontSize: 5, color: '#2a2a2a' }}>VOL</span>
            <input
              type="range" min={0} max={100} value={Math.round(volume * 100)}
              onChange={(e) => handleVolume(Number(e.target.value) / 100)}
              className="gbc-vol-slider"
            />
          </div>
        </div>

        {/* Screen glass */}
        <div style={{
          flex: 1,
          borderRadius: '4px 4px 0 0',
          overflow: 'hidden',
          position: 'relative',
          background: '#0e1a0b',
          minHeight: 0,
          boxShadow: [
            'inset 0 0 0 2px rgba(0,0,0,0.9)',
            'inset 0 4px 20px rgba(0,0,0,0.6)',
          ].join(', '),
        }}>
          <div aria-hidden style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '20%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
            pointerEvents: 'none', zIndex: 100,
          }} />
          <div aria-hidden style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 99,
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.09) 0px, rgba(0,0,0,0.09) 1px, transparent 1px, transparent 3px)',
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
            <SplashScreen onStart={() => setStarted(true)} />
          )}
        </div>

        {/* GBC logo sits inside the bezel below the screen */}
        <GBCLogo />
      </div>

      {/* Thin kiwi bottom strip — purely decorative with SELECT/START ovals + speaker */}
      <div style={{
        flexShrink: 0,
        padding: '8px 20px',
        paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Nintendo badge */}
        <div style={{
          border: '1px solid #4a8010',
          borderRadius: 10,
          padding: '2px 10px',
        }}>
          <span style={{
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            fontSize: 10,
            color: '#4a8010',
          }}>Nintendo</span>
        </div>

        {/* SELECT / START ovals */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {['SELECT', 'START'].map((label) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{
                width: 40, height: 14, borderRadius: 7,
                background: 'linear-gradient(180deg, #252525 0%, #101010 100%)',
                border: '1px solid #080808',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
              }} />
              <span style={{ fontFamily: "'Press Start 2P'", fontSize: 5, color: '#3a6010' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Speaker grille */}
        <SpeakerGrille />
      </div>
    </div>
  )
}
