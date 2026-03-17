import { useState, useEffect } from 'react'

const FONT = "'PokemonGb', 'Press Start 2P'"

const pokeBox = {
  border: '3px solid #84cc16',
  boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
  background: '#0a1408',
  borderRadius: 0,
}

const TECHNIQUES = [
  {
    id: 'breathing',
    label: 'BOX BREATHING',
    desc: 'Slow your nervous system with a 4-4-4-4 breath pattern.',
  },
  {
    id: 'grounding',
    label: '5-4-3-2-1 GROUNDING',
    desc: 'Anchor yourself to the present using your senses.',
  },
  {
    id: 'cold',
    label: 'COLD WATER RESET',
    desc: 'Trigger the dive reflex with freezing water on your face.',
  },
  {
    id: 'peppercorn',
    label: 'PEPPERCORN PROTOCOL',
    desc: 'Chew 3 black peppercorns. Beta-caryophyllene may take the edge off.',
  },
  {
    id: 'cbd',
    label: 'CBD DOSE',
    desc: 'Pure CBD isolate can balance the high without adding more THC.',
  },
  {
    id: 'muscle',
    label: 'MUSCLE RELEASE',
    desc: 'Progressive tension and release to drain anxiety from the body.',
  },
  {
    id: 'humming',
    label: 'VAGUS RESET',
    desc: 'Hum or sing for 2 minutes to activate your vagus nerve.',
  },
]

const TECHNIQUE_STEPS: Record<string, string[]> = {
  grounding: [
    'NAME 5 THINGS YOU CAN SEE.',
    'NAME 4 THINGS YOU CAN TOUCH.',
    'NAME 3 THINGS YOU CAN HEAR.',
    'NAME 2 THINGS YOU CAN SMELL.',
    'NAME 1 THING YOU CAN TASTE.',
    'BREATHE. YOU ARE HERE.',
  ],
  cold: [
    'GO TO A SINK OR BASIN.',
    'FILL IT WITH THE COLDEST WATER YOU CAN GET.',
    'SPLASH YOUR FACE SEVERAL TIMES.',
    'THE MAMMALIAN DIVE REFLEX WILL SLOW YOUR HEART RATE.',
  ],
  peppercorn: [
    'FIND 3 WHOLE BLACK PEPPERCORNS.',
    'CHEW THEM SLOWLY.',
    'BETA-CARYOPHYLLENE BINDS TO CB2 RECEPTORS.',
    'IT MAY HELP TAKE THE EDGE OFF ANXIETY.',
  ],
  cbd: [
    'MEASURE A DOSE OF PURE CBD ISOLATE.',
    'CBD IS ANXIOLYTIC AND NON-INTOXICATING.',
    'IT WILL NOT INCREASE THE HIGH.',
    'GIVE IT 15-20 MINUTES TO WORK.',
  ],
  muscle: [
    'CLENCH YOUR FISTS. HOLD 5 SECONDS. RELEASE.',
    'SCRUNCH YOUR SHOULDERS UP TO YOUR EARS. HOLD. RELEASE.',
    'TENSE YOUR CORE. HOLD. RELEASE.',
    'TENSE YOUR THIGHS AND CALVES. HOLD. RELEASE.',
    'BREATHE DEEPLY BETWEEN EACH GROUP.',
    'FEEL THE TENSION DRAIN OUT AS YOU LET GO.',
  ],
  humming: [
    'SIT OR LIE DOWN COMFORTABLY.',
    'HUM ANY NOTE AND FEEL THE VIBRATION IN YOUR CHEST.',
    'KEEP GOING FOR AT LEAST 2 MINUTES.',
    'OR JUST SING ANY SONG OUT LOUD.',
    'THIS VIBRATION ACTIVATES YOUR VAGUS NERVE.',
    'IT SIGNALS SAFETY TO YOUR NERVOUS SYSTEM.',
  ],
}

type BreathPhase = 'in' | 'hold-in' | 'out' | 'hold-out'

const PHASE_LABELS: Record<BreathPhase, string> = {
  'in': 'BREATHE IN',
  'hold-in': 'HOLD',
  'out': 'BREATHE OUT',
  'hold-out': 'HOLD',
}

const BREATH_PHASES: BreathPhase[] = ['in', 'hold-in', 'out', 'hold-out']

function useAudioTone(active: boolean) {
  useEffect(() => {
    if (!active) return

    const AC = (window as any).AudioContext || (window as any).webkitAudioContext
    if (!AC) return

    let ctx: AudioContext | null = null
    try {
      ctx = new AC() as AudioContext
    } catch (_) {
      return
    }

    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const master = ctx.createGain()

    osc1.type = 'sine'
    osc2.type = 'sine'
    osc1.frequency.value = 432
    osc2.frequency.value = 436

    osc1.connect(master)
    osc2.connect(master)
    master.gain.setValueAtTime(0, ctx.currentTime)
    master.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 2.5)
    master.connect(ctx.destination)

    osc1.start()
    osc2.start()

    const ctxCopy = ctx
    return () => {
      try {
        const now = ctxCopy.currentTime
        master.gain.cancelScheduledValues(now)
        master.gain.setValueAtTime(master.gain.value, now)
        master.gain.linearRampToValueAtTime(0, now + 1.0)
        osc1.stop(now + 1.1)
        osc2.stop(now + 1.1)
        setTimeout(() => { try { ctxCopy.close() } catch (_) {} }, 1500)
      } catch (_) {}
    }
  }, [active])
}

export default function EscapeRope() {
  const [selected, setSelected] = useState<string | null>(null)
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('in')

  const active = selected !== null
  useAudioTone(active)

  useEffect(() => {
    if (selected !== 'breathing') return
    let i = 0
    setBreathPhase(BREATH_PHASES[0])
    const id = setInterval(() => {
      i = (i + 1) % 4
      setBreathPhase(BREATH_PHASES[i])
    }, 4000)
    return () => clearInterval(id)
  }, [selected])

  const techniqueLabel = TECHNIQUES.find(t => t.id === selected)?.label ?? ''

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
        @keyframes gbc-breathe-box {
          0%   { width: 100px; height: 100px; box-shadow: 0 0 10px rgba(132,204,22,0.2); }
          25%  { width: 164px; height: 164px; box-shadow: 0 0 36px rgba(132,204,22,0.5); }
          50%  { width: 164px; height: 164px; box-shadow: 0 0 36px rgba(132,204,22,0.5); }
          75%  { width: 100px; height: 100px; box-shadow: 0 0 10px rgba(132,204,22,0.2); }
          100% { width: 100px; height: 100px; box-shadow: 0 0 10px rgba(132,204,22,0.2); }
        }
        .gbc-breathe-box {
          animation: gbc-breathe-box 16s ease-in-out infinite;
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
        <span style={{ fontFamily: FONT, fontSize: 13, color: '#84cc16' }}>
          ESCAPE ROPE
        </span>
        <span style={{
          fontFamily: FONT,
          fontSize: 8,
          color: '#4a7a10',
          border: '2px solid #2a4a08',
          padding: '2px 6px',
          borderRadius: 0,
        }}>
          {active ? '[ACTIVE]' : '[READY]'}
        </span>
      </div>

      {/* ── LANDING ─────────────────────────────────────────────────────── */}
      {!active && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Nurse Joy message */}
          <div style={{
            ...pokeBox,
            padding: 14,
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}>
            <img
              src={`${import.meta.env.BASE_URL}nurse-joy.png`}
              alt="Nurse Joy"
              style={{ width: 64, height: 64, imageRendering: 'pixelated', flexShrink: 0 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontFamily: FONT, fontSize: 8, color: '#84cc16' }}>NURSE JOY</span>
              <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#c8e890', lineHeight: 1.7, margin: 0 }}>
                WHATEVER YOU'RE FEELING RIGHT NOW, IT WILL PASS. YOUR BODY IS SAFE. PICK A TECHNIQUE THAT FEELS RIGHT FOR YOU.
              </p>
            </div>
          </div>

          {/* Technique cards */}
          {TECHNIQUES.map(t => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              style={{
                ...pokeBox,
                padding: 14,
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                minHeight: 56,
              }}
            >
              <span style={{ fontFamily: FONT, fontSize: 9, color: '#84cc16' }}>► {t.label}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#4a7a10', lineHeight: 1.5 }}>{t.desc}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── BOX BREATHING ────────────────────────────────────────────────── */}
      {selected === 'breathing' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => setSelected(null)}
            style={{
              border: '2px solid #2a4a08',
              color: '#4a7a10',
              background: 'transparent',
              fontFamily: FONT,
              fontSize: 8,
              padding: '6px 12px',
              cursor: 'pointer',
              alignSelf: 'flex-start',
              minHeight: 44,
              borderRadius: 0,
            }}
          >
            ◄ BACK
          </button>

          {/* Animated box */}
          <div style={{
            width: 200,
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div
              className="gbc-breathe-box"
              style={{
                border: '4px solid #84cc16',
                borderRadius: 0,
              }}
            />
          </div>

          {/* Phase label */}
          <span style={{
            fontFamily: FONT,
            fontSize: 14,
            color: '#84cc16',
            textAlign: 'center',
            letterSpacing: 1,
            minHeight: 24,
          }}>
            {PHASE_LABELS[breathPhase]}
          </span>

          <span style={{ fontFamily: FONT, fontSize: 8, color: '#4a7a10', textAlign: 'center' }}>
            4 SECONDS EACH PHASE
          </span>

          <span className="gbc-blink" style={{
            fontFamily: FONT,
            fontSize: 8,
            color: '#4a7a10',
            textAlign: 'center',
            marginTop: 8,
          }}>
            ♪ CALMING TONE ACTIVE ♪
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto', paddingTop: 12 }}>
            <img
              src={`${import.meta.env.BASE_URL}nurse-joy.png`}
              alt="Nurse Joy"
              style={{ width: 40, height: 40, imageRendering: 'pixelated' }}
            />
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#4a7a10' }}>
              YOU'VE GOT THIS.
            </span>
          </div>
        </div>
      )}

      {/* ── OTHER TECHNIQUES ─────────────────────────────────────────────── */}
      {selected !== null && selected !== 'breathing' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => setSelected(null)}
            style={{
              border: '2px solid #2a4a08',
              color: '#4a7a10',
              background: 'transparent',
              fontFamily: FONT,
              fontSize: 8,
              padding: '6px 12px',
              cursor: 'pointer',
              alignSelf: 'flex-start',
              minHeight: 44,
              borderRadius: 0,
            }}
          >
            ◄ BACK
          </button>

          <div style={{ ...pokeBox, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontFamily: FONT, fontSize: 9, color: '#84cc16' }}>{techniqueLabel}</span>
            <div style={{ height: 1, background: '#2a4a08' }} />
            {(TECHNIQUE_STEPS[selected] ?? []).map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{
                  fontFamily: FONT,
                  fontSize: 8,
                  color: '#4a7a10',
                  flexShrink: 0,
                  paddingTop: 3,
                }}>
                  {String(i + 1).padStart(2, '0')}.
                </span>
                <p style={{
                  fontFamily: 'monospace',
                  fontSize: 13,
                  color: '#c8e890',
                  lineHeight: 1.7,
                  margin: 0,
                }}>
                  {step}
                </p>
              </div>
            ))}
          </div>

          <span className="gbc-blink" style={{
            fontFamily: FONT,
            fontSize: 8,
            color: '#4a7a10',
            textAlign: 'center',
          }}>
            ♪ CALMING TONE ACTIVE ♪
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 'auto', paddingTop: 8 }}>
            <img
              src={`${import.meta.env.BASE_URL}nurse-joy.png`}
              alt="Nurse Joy"
              style={{ width: 40, height: 40, imageRendering: 'pixelated' }}
            />
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#4a7a10' }}>
              YOU'VE GOT THIS.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
