import { useState } from 'react'

const pokeBox = {
  border: '3px solid #84cc16',
  boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
  background: '#0a1408',
  borderRadius: 0,
}

const STEPS = [
  'CHEW ON 3 BLACK PEPPERCORNS.',
  'SPLASH FREEZING COLD WATER ON YOUR FACE.',
  'TAKE A DOSE OF PURE CBD ISOLATE.',
]

export default function EscapeRope() {
  const [active, setActive] = useState(false)
  const [step, setStep] = useState(0)

  const handleActivate = () => {
    setActive(true)
    setStep(0)
  }

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1)
    } else {
      setActive(false)
      setStep(0)
    }
  }

  const handleDeactivate = () => {
    setActive(false)
    setStep(0)
  }

  return (
    <div style={{
      minHeight: '100%',
      background: active ? '#020204' : '#050a04',
      padding: '10px',
      boxSizing: 'border-box',
      transition: 'background 0.5s ease',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <style>{`
        @keyframes gbc-breathe {
          0%   { width: 120px; height: 120px; opacity: 0.7; }
          50%  { width: 160px; height: 160px; opacity: 1; }
          100% { width: 120px; height: 120px; opacity: 0.7; }
        }
        .gbc-breathe {
          animation: gbc-breathe 4s ease-in-out infinite;
        }
        @keyframes gbc-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .gbc-blink {
          animation: gbc-blink 1s step-end infinite;
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid #2a4a08',
        paddingBottom: 8,
        marginBottom: 12,
      }}>
        <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 13, color: '#84cc16' }}>
          ESCAPE ROPE
        </span>
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P'",
          fontSize: 8,
          color: '#4a7a10',
          border: '2px solid #2a4a08',
          padding: '2px 6px',
          borderRadius: 0,
        }}>
          {active ? '[ACTIVE]' : '[READY]'}
        </span>
      </div>

      {!active ? (
        /* Inactive state */
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            ...pokeBox,
            padding: 20,
            width: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            alignItems: 'center',
          }}>
            <span style={{
              fontFamily: "'PokemonGb', 'Press Start 2P'",
              fontSize: 16,
              color: '#84cc16',
              textAlign: 'center',
              letterSpacing: 1,
            }}>
              ESCAPE ROPE
            </span>

            <div style={{
              width: '100%',
              height: 1,
              background: '#2a4a08',
            }} />

            <p style={{
              fontFamily: 'monospace',
              fontSize: 13,
              color: '#c8e890',
              lineHeight: 1.7,
              textAlign: 'center',
              margin: 0,
            }}>
              Feeling overwhelmed? This grounding guide will help you through it.
            </p>

            <button
              onClick={handleActivate}
              style={{
                border: '3px solid #e84040',
                color: '#e84040',
                background: 'rgba(232,64,64,0.1)',
                fontSize: 12,
                padding: 14,
                width: '100%',
                fontFamily: "'PokemonGb', 'Press Start 2P'",
                cursor: 'pointer',
                borderRadius: 0,
                letterSpacing: 1,
              }}
            >
              ► ACTIVATE
            </button>

            <span style={{
              fontFamily: "'PokemonGb', 'Press Start 2P'",
              fontSize: 9,
              color: '#4a7a10',
              textAlign: 'center',
              letterSpacing: 0.5,
            }}>
              FOR WHEN YOU'VE HAD TOO MUCH
            </span>
          </div>
        </div>
      ) : (
        /* Active state */
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          position: 'relative',
        }}>
          {/* Deactivate button top-right */}
          <button
            onClick={handleDeactivate}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              border: '2px solid #e84040',
              color: '#e84040',
              background: 'rgba(232,64,64,0.08)',
              fontFamily: "'PokemonGb', 'Press Start 2P'",
              fontSize: 8,
              padding: '4px 8px',
              cursor: 'pointer',
              borderRadius: 0,
            }}
          >
            ► DEACTIVATE
          </button>

          {/* Breathing circle */}
          <div style={{
            marginTop: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 180,
            height: 180,
          }}>
            <div
              className="gbc-breathe"
              style={{
                border: '4px solid #84cc16',
                boxShadow: '0 0 24px rgba(132,204,22,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{
                fontFamily: "'PokemonGb', 'Press Start 2P'",
                fontSize: 7,
                color: '#84cc16',
                textAlign: 'center',
                lineHeight: 1.6,
              }}>
                BREATHE
              </span>
            </div>
          </div>

          {/* Step poke-box */}
          <div style={{
            ...pokeBox,
            padding: 16,
            width: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            alignItems: 'center',
          }}>
            <span style={{
              fontFamily: "'PokemonGb', 'Press Start 2P'",
              fontSize: 8,
              color: '#4a7a10',
              letterSpacing: 1,
            }}>
              STEP {step + 1} OF 3
            </span>

            <p style={{
              fontFamily: 'monospace',
              fontSize: 14,
              color: '#c8e890',
              lineHeight: 1.7,
              textAlign: 'center',
              margin: 0,
            }}>
              {STEPS[step]}
            </p>

            {/* Progress indicator */}
            <div style={{ display: 'flex', gap: 6 }}>
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 16,
                    height: 16,
                    border: '2px solid #2a4a08',
                    background: i <= step ? '#84cc16' : 'transparent',
                    borderRadius: 0,
                  }}
                />
              ))}
            </div>

            <span style={{
              fontFamily: "'PokemonGb', 'Press Start 2P'",
              fontSize: 9,
              color: '#4a7a10',
            }}>
              [{step + 1} / 3]
            </span>

            <button
              onClick={handleNext}
              style={{
                border: '3px solid #84cc16',
                color: '#84cc16',
                background: 'rgba(132,204,22,0.1)',
                fontSize: 11,
                padding: '12px 20px',
                width: '100%',
                fontFamily: "'PokemonGb', 'Press Start 2P'",
                cursor: 'pointer',
                borderRadius: 0,
                letterSpacing: 1,
              }}
            >
              {step < 2 ? '► NEXT STEP' : '► DONE'}
            </button>
          </div>

          {/* Calming tone indicator */}
          <span
            className="gbc-blink"
            style={{
              fontFamily: "'PokemonGb', 'Press Start 2P'",
              fontSize: 8,
              color: '#4a7a10',
              letterSpacing: 0.5,
              textAlign: 'center',
            }}
          >
            ♪ CALMING TONE PLAYING ♪
          </span>
        </div>
      )}
    </div>
  )
}
