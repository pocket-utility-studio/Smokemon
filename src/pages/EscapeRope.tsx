import { useState, useEffect } from 'react'

const FONT = "'PokemonGb', 'Press Start 2P'"
const pokeBox = {
  border: '3px solid #84cc16',
  boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
  background: '#0a1408',
  borderRadius: 0,
}

// ── Sound generation ──────────────────────────────────────────────────────────

const SOUNDS = [
  { id: 'rain',  label: 'RAIN',   gain: 0.40 },
  { id: 'ocean', label: 'OCEAN',  gain: 0.55 },
  { id: 'brown', label: 'BROWN',  gain: 0.45 },
  { id: 'white', label: 'WHITE',  gain: 0.22 },
  { id: 'tone',  label: '432HZ', gain: 0.15 },
  { id: 'off',   label: 'OFF',    gain: 0    },
]

function makeNoiseBuffer(ctx: AudioContext, type: 'white' | 'pink' | 'brown'): AudioBuffer {
  const size = 2 * ctx.sampleRate
  const buf = ctx.createBuffer(1, size, ctx.sampleRate)
  const d = buf.getChannelData(0)
  if (type === 'white') {
    for (let i = 0; i < size; i++) d[i] = Math.random() * 2 - 1
  } else if (type === 'pink') {
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0
    for (let i = 0; i < size; i++) {
      const w = Math.random() * 2 - 1
      b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759
      b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856
      b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980
      d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926
    }
  } else {
    let last = 0
    for (let i = 0; i < size; i++) {
      const w = Math.random() * 2 - 1
      last = (last + 0.02 * w) / 1.02
      d[i] = Math.max(-1, Math.min(1, last * 3.5))
    }
  }
  return buf
}

function connectSound(id: string, ctx: AudioContext, out: GainNode): () => void {
  const loop = (buf: AudioBuffer) => {
    const src = ctx.createBufferSource()
    src.buffer = buf; src.loop = true; return src
  }

  if (id === 'rain') {
    const src = loop(makeNoiseBuffer(ctx, 'white'))
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 500
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 0.35
    src.connect(hp); hp.connect(bp); bp.connect(out); src.start()
    return () => { try { src.stop() } catch (_) {} }

  } else if (id === 'ocean') {
    const src = loop(makeNoiseBuffer(ctx, 'pink'))
    const wg = ctx.createGain(); wg.gain.value = 0.65
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.10; lfo.type = 'sine'
    const la = ctx.createGain(); la.gain.value = 0.28
    lfo.connect(la); la.connect(wg.gain)
    src.connect(wg); wg.connect(out); src.start(); lfo.start()
    return () => { try { src.stop(); lfo.stop() } catch (_) {} }

  } else if (id === 'brown') {
    const src = loop(makeNoiseBuffer(ctx, 'brown'))
    src.connect(out); src.start()
    return () => { try { src.stop() } catch (_) {} }

  } else if (id === 'white') {
    const src = loop(makeNoiseBuffer(ctx, 'white'))
    src.connect(out); src.start()
    return () => { try { src.stop() } catch (_) {} }

  } else if (id === 'tone') {
    const o1 = ctx.createOscillator(); const o2 = ctx.createOscillator()
    o1.type = 'sine'; o2.type = 'sine'
    o1.frequency.value = 432; o2.frequency.value = 436
    const g = ctx.createGain(); g.gain.value = 0.5
    o1.connect(g); o2.connect(g); g.connect(out); o1.start(); o2.start()
    return () => { try { o1.stop(); o2.stop() } catch (_) {} }
  }

  return () => {}
}

function useAmbientSound(soundId: string) {
  useEffect(() => {
    if (soundId === 'off') return
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext
    if (!AC) return
    let ctx: AudioContext
    try { ctx = new AC() } catch (_) { return }

    const targetGain = SOUNDS.find(s => s.id === soundId)?.gain ?? 0.3
    const master = ctx.createGain()
    master.gain.setValueAtTime(0, ctx.currentTime)
    master.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 2.0)
    master.connect(ctx.destination)

    const stop = connectSound(soundId, ctx, master)
    const ref = ctx
    return () => {
      stop()
      try {
        const now = ref.currentTime
        master.gain.cancelScheduledValues(now)
        master.gain.setValueAtTime(master.gain.value, now)
        master.gain.linearRampToValueAtTime(0, now + 0.8)
        setTimeout(() => { try { ref.close() } catch (_) {} }, 1200)
      } catch (_) {}
    }
  }, [soundId])
}

// ── Breath phases ─────────────────────────────────────────────────────────────

type BreathPhase = 'in' | 'hold-in' | 'out' | 'hold-out'
const PHASES: BreathPhase[] = ['in', 'hold-in', 'out', 'hold-out']
const PHASE_LABEL: Record<BreathPhase, string> = {
  'in':       'BREATHE IN',
  'hold-in':  'HOLD',
  'out':      'BREATHE OUT',
  'hold-out': 'HOLD',
}

// ── Techniques ────────────────────────────────────────────────────────────────

const TECHNIQUES = [
  { id: 'breath478',  label: '4-7-8 BREATHING',      desc: 'Slow your heart rate fast with this nerve-calming breath pattern.' },
  { id: 'cold',       label: 'COLD WATER RESET',     desc: 'Trigger the dive reflex with freezing water on your face.' },
  { id: 'peppercorn', label: 'PEPPERCORN PROTOCOL',  desc: 'Chew 3 black peppercorns. Beta-caryophyllene may take the edge off.' },
  { id: 'cbd',        label: 'CBD DOSE',              desc: 'Pure CBD isolate can balance the high without adding more THC.' },
  { id: 'muscle',     label: 'MUSCLE RELEASE',        desc: 'Progressive tension and release to drain anxiety from the body.' },
  { id: 'humming',    label: 'VAGUS RESET',           desc: 'Hum or sing for 2 minutes to activate your vagus nerve.' },
]

const TECHNIQUE_STEPS: Record<string, string[]> = {
  breath478:  ['SIT UPRIGHT AND CLOSE YOUR EYES.', 'INHALE QUIETLY THROUGH YOUR NOSE FOR 4 SECONDS.', 'HOLD YOUR BREATH FOR 7 SECONDS.', 'EXHALE COMPLETELY THROUGH YOUR MOUTH FOR 8 SECONDS.', 'THAT IS ONE CYCLE. REPEAT 3-4 TIMES.', 'THE EXTENDED EXHALE ACTIVATES YOUR PARASYMPATHETIC NERVOUS SYSTEM.'],
  cold:       ['GO TO A SINK OR BASIN.', 'FILL IT WITH THE COLDEST WATER YOU CAN GET.', 'SPLASH YOUR FACE SEVERAL TIMES.', 'THE MAMMALIAN DIVE REFLEX WILL SLOW YOUR HEART RATE.'],
  peppercorn: ['FIND 3 WHOLE BLACK PEPPERCORNS.', 'CHEW THEM SLOWLY.', 'BETA-CARYOPHYLLENE BINDS TO CB2 RECEPTORS.', 'IT MAY HELP TAKE THE EDGE OFF ANXIETY.'],
  cbd:        ['MEASURE A DOSE OF PURE CBD ISOLATE.', 'CBD IS ANXIOLYTIC AND NON-INTOXICATING.', 'IT WILL NOT INCREASE THE HIGH.', 'GIVE IT 15-20 MINUTES TO WORK.'],
  muscle:     ['CLENCH YOUR FISTS. HOLD 5 SECONDS. RELEASE.', 'SCRUNCH YOUR SHOULDERS UP TO YOUR EARS. HOLD. RELEASE.', 'TENSE YOUR CORE. HOLD. RELEASE.', 'TENSE YOUR THIGHS AND CALVES. HOLD. RELEASE.', 'BREATHE DEEPLY BETWEEN EACH GROUP.', 'FEEL THE TENSION DRAIN OUT AS YOU LET GO.'],
  humming:    ['SIT OR LIE DOWN COMFORTABLY.', 'HUM ANY NOTE AND FEEL THE VIBRATION IN YOUR CHEST.', 'KEEP GOING FOR AT LEAST 2 MINUTES.', 'OR JUST SING ANY SONG OUT LOUD.', 'THIS VIBRATION ACTIVATES YOUR VAGUS NERVE.', 'IT SIGNALS SAFETY TO YOUR NERVOUS SYSTEM.'],
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EscapeRope() {
  const [selected, setSelected] = useState<string | null>(null)
  const [sound, setSound] = useState<string>('off')
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('in')

  useAmbientSound(sound)

  // Breath phase cycles continuously on this page
  useEffect(() => {
    let i = 0
    setBreathPhase(PHASES[0])
    const id = setInterval(() => {
      i = (i + 1) % 4
      setBreathPhase(PHASES[i])
    }, 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{
      minHeight: '100%',
      background: '#050a04',
      padding: '10px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <style>{`
        @keyframes gbc-breathe-box {
          0%   { width: 76px;  height: 76px;  box-shadow: 0 0 8px  rgba(132,204,22,0.15); }
          25%  { width: 136px; height: 136px; box-shadow: 0 0 28px rgba(132,204,22,0.45); }
          50%  { width: 136px; height: 136px; box-shadow: 0 0 28px rgba(132,204,22,0.45); }
          75%  { width: 76px;  height: 76px;  box-shadow: 0 0 8px  rgba(132,204,22,0.15); }
          100% { width: 76px;  height: 76px;  box-shadow: 0 0 8px  rgba(132,204,22,0.15); }
        }
        .gbc-breathe-box { animation: gbc-breathe-box 16s ease-in-out infinite; }
        @keyframes gbc-blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        .gbc-blink { animation: gbc-blink 1s step-end infinite; }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid #2a4a08',
        paddingBottom: 8,
      }}>
        <span style={{ fontFamily: FONT, fontSize: 13, color: '#84cc16' }}>ESCAPE ROPE</span>
        <span style={{ fontFamily: FONT, fontSize: 8, color: '#4a7a10', border: '2px solid #2a4a08', padding: '2px 6px', borderRadius: 0 }}>
          {selected ? '[ACTIVE]' : '[READY]'}
        </span>
      </div>

      {/* ── TOP HALF: breathing box + sound selector ─────────────────────── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        paddingBottom: 10,
        borderBottom: '2px solid #2a4a08',
      }}>
        {/* Animated box */}
        <div style={{ width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="gbc-breathe-box" style={{ border: '3px solid #84cc16', borderRadius: 0 }} />
        </div>

        {/* Phase label */}
        <span style={{ fontFamily: FONT, fontSize: 11, color: '#84cc16', letterSpacing: 1, minHeight: 18 }}>
          {PHASE_LABEL[breathPhase]}
        </span>
        <span style={{ fontFamily: FONT, fontSize: 7, color: '#4a7a10' }}>
          4 SECONDS EACH PHASE
        </span>

        {/* Sound selector */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 6 }}>
          {SOUNDS.map(s => {
            const active = sound === s.id
            return (
              <button
                key={s.id}
                onClick={() => setSound(s.id)}
                style={{
                  border: `2px solid ${active ? '#84cc16' : '#2a4a08'}`,
                  color: active ? '#84cc16' : '#4a7a10',
                  background: active ? 'rgba(132,204,22,0.1)' : 'transparent',
                  fontFamily: FONT,
                  fontSize: 7,
                  padding: '7px 9px',
                  cursor: 'pointer',
                  borderRadius: 0,
                  minHeight: 36,
                  minWidth: 44,
                }}
              >
                {active && s.id !== 'off' ? <span className="gbc-blink">♪</span> : null}
                {active && s.id !== 'off' ? ' ' : ''}
                {s.label}
              </button>
            )
          })}
        </div>

        {sound === 'off' && (
          <span style={{ fontFamily: FONT, fontSize: 7, color: '#2a4a08' }}>
            TAP A SOUND TO BEGIN
          </span>
        )}
      </div>

      {/* ── BOTTOM HALF: technique menu or active technique ──────────────── */}
      {!selected ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Nurse Joy */}
          <div style={{ ...pokeBox, padding: 12, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <img
              src={`${import.meta.env.BASE_URL}nurse-joy.png`}
              alt="Nurse Joy"
              style={{ width: 52, height: 52, imageRendering: 'pixelated', flexShrink: 0 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: FONT, fontSize: 7, color: '#84cc16' }}>NURSE JOY</span>
              <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#c8e890', lineHeight: 1.7, margin: 0 }}>
                WHATEVER YOU'RE FEELING, IT WILL PASS. PICK A TECHNIQUE THAT FEELS RIGHT FOR YOU.
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
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
            <span style={{ fontFamily: FONT, fontSize: 9, color: '#84cc16' }}>
              {TECHNIQUES.find(t => t.id === selected)?.label}
            </span>
            <div style={{ height: 1, background: '#2a4a08' }} />
            {(TECHNIQUE_STEPS[selected] ?? []).map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontFamily: FONT, fontSize: 8, color: '#4a7a10', flexShrink: 0, paddingTop: 3 }}>
                  {String(i + 1).padStart(2, '0')}.
                </span>
                <p style={{ fontFamily: 'monospace', fontSize: 13, color: '#c8e890', lineHeight: 1.7, margin: 0 }}>
                  {step}
                </p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', paddingTop: 4 }}>
            <img
              src={`${import.meta.env.BASE_URL}nurse-joy.png`}
              alt="Nurse Joy"
              style={{ width: 36, height: 36, imageRendering: 'pixelated' }}
            />
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#4a7a10' }}>YOU'VE GOT THIS.</span>
          </div>
        </div>
      )}
    </div>
  )
}
