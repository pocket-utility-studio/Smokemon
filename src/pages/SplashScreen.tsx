import { useState, useEffect, useCallback } from 'react'
import { unlockAudio, playBoot, playPressStart } from '../utils/sounds'

type Phase = 'startup' | 'silver' | 'title'

export default function SplashScreen({ onStart }: { onStart: () => void }) {
  const [phase, setPhase] = useState<Phase>('startup')
  const [visible, setVisible] = useState(true)

  // Auto-advance startup → silver after gif plays (~2.5s), silver → title after 8s
  useEffect(() => {
    if (phase === 'startup') {
      const t = setTimeout(() => {
        setVisible(false)
        setTimeout(() => { setPhase('silver'); setVisible(true) }, 400)
      }, 2500)
      return () => clearTimeout(t)
    }
    if (phase === 'silver') {
      const t = setTimeout(() => {
        setVisible(false)
        setTimeout(() => { setPhase('title'); setVisible(true) }, 400)
      }, 8000)
      return () => clearTimeout(t)
    }
  }, [phase])

  const handleClick = useCallback(() => {
    if (phase === 'silver') {
      setVisible(false)
      setTimeout(() => { setPhase('title'); setVisible(true) }, 300)
      return
    }
    if (phase === 'title') {
      unlockAudio()
      playBoot()
      setTimeout(() => playPressStart(), 350)
      onStart()
    }
  }, [phase, onStart])

  const bg = phase === 'startup' ? '#e8e8e0' : '#050a04'

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'absolute', inset: 0,
        background: bg,
        transition: 'background 0.6s ease',
        cursor: phase === 'title' ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transitionProperty: 'opacity, background',
        transitionDuration: '0.4s, 0.6s',
      }}
    >
      {phase === 'startup' && (
        <img
          src={`${import.meta.env.BASE_URL}gbc-startup.gif`}
          alt=""
          style={{ width: '100%', height: 'auto', imageRendering: 'pixelated', display: 'block' }}
        />
      )}

      {phase === 'silver' && (
        <img
          src={`${import.meta.env.BASE_URL}pokesilver.gif`}
          alt=""
          style={{ width: '100%', height: 'auto', imageRendering: 'pixelated', display: 'block' }}
        />
      )}

      {phase === 'title' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 32,
        }}>
          <span style={{
            fontFamily: "'PokemonGb', 'Press Start 2P'",
            fontSize: 28,
            color: '#84cc16',
            letterSpacing: 3,
            textAlign: 'center',
          }}>
            SMOK<span style={{ fontFamily: "'Press Start 2P', monospace" }}>É</span>DEX
          </span>
          <span
            className="gbc-blink"
            style={{
              fontFamily: "'PokemonGb', 'Press Start 2P'",
              fontSize: 12,
              color: '#c8e890',
              letterSpacing: 2,
            }}
          >
            PRESS START
          </span>
        </div>
      )}
    </div>
  )
}
