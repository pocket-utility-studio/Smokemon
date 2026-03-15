import { useState, useEffect } from 'react'
import { playBoot, playPressStart, playPowerUp } from '../utils/sounds'

type Phase = 'boot' | 'title' | 'flash'

const pokeBox = {
  border: '3px solid #84cc16',
  boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
  background: '#0a1408',
}

export default function StartScreen({ onStart }: { onStart: () => void }) {
  const [phase, setPhase] = useState<Phase>('boot')
  const [logoVisible, setLogoVisible] = useState(false)

  // Boot sequence timing
  useEffect(() => {
    const t1 = setTimeout(() => {
      setLogoVisible(true)
      playBoot()
    }, 300)
    const t2 = setTimeout(() => setPhase('title'), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // Key / tap handler — only active on title screen
  useEffect(() => {
    if (phase !== 'title') return
    const fire = () => {
      playPressStart()
      setPhase('flash')
      playPowerUp()
      setTimeout(onStart, 500)
    }
    window.addEventListener('keydown', fire)
    return () => window.removeEventListener('keydown', fire)
  }, [phase, onStart])

  const handleTap = () => {
    if (phase !== 'title') return
    playPressStart()
    setPhase('flash')
    playPowerUp()
    setTimeout(onStart, 500)
  }

  /* Boot screen */
  if (phase === 'boot') {
    return (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#050a04', gap: 10,
        transition: 'none',
      }}>
        <div style={{
          opacity: logoVisible ? 1 : 0,
          transition: 'opacity 0.6s ease-in',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 11, color: '#8ab840', fontFamily: "'PokemonGb', 'Press Start 2P'", letterSpacing: 2 }}>
            GAME BOY
          </span>
          <span style={{ fontSize: 14, color: '#84cc16', fontFamily: "'PokemonGb', 'Press Start 2P'", letterSpacing: 3 }}>
            COLOR
          </span>
          <div style={{ marginTop: 8, width: 60, height: 2, background: '#2a4a08' }} />
          <span style={{ fontSize: 6, color: '#2a5008', fontFamily: "'PokemonGb', 'Press Start 2P'", letterSpacing: 1, marginTop: 4 }}>
            ® NINTENDO
          </span>
        </div>
      </div>
    )
  }

  /* Flash transition */
  if (phase === 'flash') {
    return (
      <div style={{
        height: '100%',
        background: '#c8e890',
        transition: 'background 0.3s ease-out',
      }} />
    )
  }

  /* Title screen */
  return (
    <div
      onClick={handleTap}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#050a04',
        cursor: 'pointer',
        padding: '12px 10px',
        boxSizing: 'border-box',
        userSelect: 'none',
        position: 'relative',
      }}
    >
      {/* Corner pixel decorations */}
      <div style={{ position: 'absolute', top: 6, left: 6, width: 4, height: 4, background: '#2a4a08' }} />
      <div style={{ position: 'absolute', top: 6, right: 6, width: 4, height: 4, background: '#2a4a08' }} />
      <div style={{ position: 'absolute', bottom: 6, left: 6, width: 4, height: 4, background: '#2a4a08' }} />
      <div style={{ position: 'absolute', bottom: 6, right: 6, width: 4, height: 4, background: '#2a4a08' }} />

      {/* Top header poke-box */}
      <div style={{
        ...pokeBox,
        padding: '8px 16px',
        width: '100%',
        textAlign: 'center',
        boxSizing: 'border-box',
      }}>
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P'",
          fontSize: 18,
          color: '#84cc16',
          letterSpacing: 2,
        }}>
          SMOK<span style={{ fontFamily: "'Press Start 2P', monospace" }}>é</span>MON
        </span>
      </div>

      {/* Cartridge graphic */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div style={{ position: 'relative', width: 56, height: 64 }}>
          {/* Cart body */}
          <div style={{
            width: 56, height: 60,
            background: 'linear-gradient(180deg, #1a3004 0%, #0e1c02 100%)',
            border: '2px solid #3a6010',
            position: 'absolute', top: 4,
          }}>
            {/* Label area */}
            <div style={{
              margin: '6px 4px 4px',
              background: 'linear-gradient(135deg, #1e3c06 0%, #162c04 100%)',
              border: '1px solid #2a4a08',
              padding: '6px 4px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            }}>
              <span style={{ fontSize: 7, color: '#84cc16', fontFamily: "'PokemonGb', 'Press Start 2P'", letterSpacing: 0.5 }}>UTIL</span>
              <span style={{ fontSize: 9, color: '#c8e890', fontFamily: "'PokemonGb', 'Press Start 2P'", letterSpacing: 0.5 }}>HUB</span>
              <div style={{ width: '80%', height: 1, background: '#2a4a08', margin: '2px 0' }} />
              <span style={{ fontSize: 5, color: '#4a7a10', fontFamily: "'PokemonGb', 'Press Start 2P'" }}>v1.0</span>
            </div>
            {/* Bottom notch lines */}
            <div style={{ position: 'absolute', bottom: 4, left: 6, right: 6, display: 'flex', gap: 2 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ flex: 1, height: 3, background: '#0a1602' }} />
              ))}
            </div>
          </div>
          {/* Cart top tab */}
          <div style={{
            position: 'absolute', top: 0, left: 12, right: 12, height: 8,
            background: '#1a3004', border: '2px solid #3a6010', borderBottom: 'none',
          }} />
        </div>

        {/* Version poke-box */}
        <div style={{
          ...pokeBox,
          padding: '6px 14px',
          textAlign: 'center',
        }}>
          <span style={{
            fontFamily: "'PokemonGb', 'Press Start 2P'",
            fontSize: 9,
            color: '#4a7a10',
            letterSpacing: 1,
          }}>
            VERSION 1.0
          </span>
        </div>
      </div>

      {/* Press start poke-box */}
      <div style={{
        ...pokeBox,
        padding: '8px 14px',
        textAlign: 'center',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <span
          className="gbc-blink"
          style={{
            fontFamily: "'PokemonGb', 'Press Start 2P'",
            fontSize: 11,
            color: '#c8e890',
            letterSpacing: 1.5,
          }}
        >
          PRESS START
        </span>
      </div>

      {/* Copyright */}
      <span style={{
        fontFamily: "'PokemonGb', 'Press Start 2P'",
        fontSize: 6,
        color: '#183004',
        letterSpacing: 0.5,
      }}>
        © 2026 SMOK<span style={{ fontFamily: "'Press Start 2P', monospace" }}>é</span>MON
      </span>
    </div>
  )
}
