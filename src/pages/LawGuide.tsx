import { useState } from 'react'

const FONT = "'PokemonGb', 'Press Start 2P', monospace"
const GBC_GREEN  = '#84cc16'
const GBC_TEXT   = '#c8e890'
const GBC_MUTED  = '#4a7a10'
const GBC_AMBER  = '#f59e0b'
const GBC_RED    = '#e84040'
const GBC_BG     = '#050a04'
const GBC_BOX    = '#0a1408'

const pokeBox = {
  border: '3px solid #84cc16',
  boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
  background: GBC_BOX,
}

// ── UK ────────────────────────────────────────────────────────────────────────

type Section = { title: string; accent: string; icon: string; text: string }

const UK_SECTIONS: Section[] = [
  {
    title: 'YOUR PRESCRIPTION',
    accent: GBC_GREEN,
    icon: '★',
    text:
      'A valid CBPM (Cannabis-Based Product for Medicinal Use) prescription is issued by a specialist clinician registered with the GMC. It is a Schedule 2 controlled drug prescription under the Misuse of Drugs Regulations 2001. You are legally entitled to possess and use your prescribed medication.',
  },
  {
    title: 'KEEP ORIGINAL PACKAGING',
    accent: GBC_GREEN,
    icon: '■',
    text:
      'Your medication MUST remain in the original pharmacy-dispensed packaging with the dispensary label intact. This label is your proof of lawful possession. Decanting into another container removes legal protection and may be treated as unlawful possession by police.',
  },
  {
    title: 'VAPORIZING VS SMOKING',
    accent: GBC_AMBER,
    icon: '▲',
    text:
      'Vaporizing (heating below combustion point to produce vapour) is the accepted inhalation method under a CBPM prescription. Smoking — combustion with tobacco or alone — is not covered by your prescription and remains illegal in all circumstances in the UK.',
  },
  {
    title: 'DRIVING & ROAD LAW',
    accent: GBC_AMBER,
    icon: '►',
    text:
      'Section 5A of the Road Traffic Act 1988 sets a drug drive limit of 2μg/L blood for THC. A valid prescription is a statutory medical defence. Carry your prescription and pharmacy label when driving. You must still not drive if impaired — impairment is a separate offence under Section 4.',
  },
  {
    title: 'PUBLIC POSSESSION',
    accent: GBC_AMBER,
    icon: '◆',
    text:
      'You may carry your prescribed cannabis in public in its original packaging. If stopped by police, politely present your prescription. Officers may not recognise CBPMs — remain calm. You may be detained while they verify. Carrying a printed copy of your prescription alongside the medication is advisable.',
  },
  {
    title: 'INTERNATIONAL TRAVEL',
    accent: GBC_RED,
    icon: '✕',
    text:
      'It is illegal to carry your prescribed cannabis across any international border, including within the Schengen Area or to other UK territories. Cannabis remains a controlled substance under international conventions. A UK prescription provides no legal protection outside the UK.',
  },
  {
    title: 'RECREATIONAL USE',
    accent: GBC_RED,
    icon: '✕',
    text:
      'Recreational cannabis use remains illegal in the UK. Cannabis is a Class B drug under the Misuse of Drugs Act 1971. Possession without a valid prescription can result in up to 5 years imprisonment. Supply or intent to supply carries up to 14 years. Your prescription does not permit supply to others.',
  },
  {
    title: 'CBD PRODUCTS',
    accent: GBC_GREEN,
    icon: '●',
    text:
      'CBD products with less than 0.2% THC are legal to buy and sell in the UK as food supplements, provided they do not make medical claims. Novel Food authorisation from the FSA is required for CBD consumables sold after 2019. Always buy from reputable suppliers with third-party lab results.',
  },
]

const UK_QUICK_FACTS = [
  { text: 'CBPMs legal since Nov 2018',           color: GBC_GREEN },
  { text: 'Must keep in original packaging',      color: GBC_AMBER },
  { text: 'Vaporizing: OK under prescription',    color: GBC_GREEN },
  { text: 'Smoking: still illegal',               color: GBC_RED },
  { text: 'Driving limit: 2μg/L THC (blood)',     color: GBC_AMBER },
  { text: 'Prescription = statutory defence',     color: GBC_GREEN },
  { text: 'International travel: never legal',    color: GBC_RED },
  { text: 'CBD <0.2% THC: legal supplement',      color: GBC_GREEN },
]

// ── ES ────────────────────────────────────────────────────────────────────────

const ES_SECTIONS: Section[] = [
  {
    title: 'PRIVATE USE',
    accent: GBC_GREEN,
    icon: '★',
    text:
      'Personal cultivation of a small number of plants at home is generally tolerated. Cannabis clubs operate in a legal gray area — privately organised, membership-based, and not formally regulated.',
  },
  {
    title: 'PUBLIC USE',
    accent: GBC_AMBER,
    icon: '▲',
    text:
      'Consuming or possessing cannabis in public spaces is a sanctionable civil offense under the Public Safety Law (Ley Mordaza). Administrative fines apply. It is not a criminal matter.',
  },
  {
    title: 'CANNABIS CLUBS',
    accent: GBC_GREEN,
    icon: '■',
    text:
      'Private, member-only associations that collectively cultivate and distribute cannabis among members. They exist in a legal gray area — tolerated in some regions but not formally regulated at a national level.',
  },
  {
    title: 'TRAFFICKING',
    accent: GBC_RED,
    icon: '✕',
    text:
      'Supply or sale of cannabis is a criminal offense under Article 368 of the Penal Code. This applies regardless of the quantity involved and carries custodial sentences.',
  },
]

// ── Officer Jenny sprite ───────────────────────────────────────────────────────

function OfficerJenny() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: 48, height: 64, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Cap */}
        <div style={{ width: 40, height: 14, background: '#2040c0', border: '1px solid #1030a0', position: 'relative', zIndex: 2 }}>
          <div style={{ position: 'absolute', bottom: -3, left: -2, right: -2, height: 3, background: '#1030a0' }} />
        </div>
        {/* Head */}
        <div style={{ width: 32, height: 20, background: '#d4a870', border: '1px solid #b08850', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{ width: 4, height: 4, background: '#301808' }} />
          <div style={{ width: 4, height: 4, background: '#301808' }} />
        </div>
        {/* Uniform */}
        <div style={{ width: 40, height: 28, background: '#1a30a0', border: '1px solid #102080', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 12, height: 10, background: '#f0d020', border: '1px solid #c0a010', position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)' }} />
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 2, height: 10, background: '#0e1a70' }} />
        </div>
        {/* Legs */}
        <div style={{ display: 'flex', gap: 4 }}>
          <div style={{ width: 14, height: 8, background: '#1a30a0', border: '1px solid #102080' }} />
          <div style={{ width: 14, height: 8, background: '#1a30a0', border: '1px solid #102080' }} />
        </div>
        {/* Boots */}
        <div style={{ display: 'flex', gap: 4 }}>
          <div style={{ width: 14, height: 6, background: '#181818', border: '1px solid #080808' }} />
          <div style={{ width: 14, height: 6, background: '#181818', border: '1px solid #080808' }} />
        </div>
      </div>
      <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_MUTED, letterSpacing: 0.5 }}>
        OFFICER JENNY
      </span>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LawGuide() {
  const [tab, setTab] = useState<'uk' | 'es'>('uk')

  return (
    <div style={{ minHeight: '100%', background: GBC_BG, padding: '10px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12 }}>

      <style>{`
        @keyframes gbc-border-flash {
          0%, 49% { border-color: #e84040; }
          50%, 100% { border-color: #4a0a0a; }
        }
        .gbc-border-flash { animation: gbc-border-flash 0.8s step-end infinite; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #2a4a08', paddingBottom: 8 }}>
        <span style={{ fontFamily: FONT, fontSize: 12, color: GBC_GREEN }}>LAW GUIDE</span>
        {/* Tab toggle */}
        <div style={{ display: 'flex', gap: 6 }}>
          {(['uk', 'es'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                fontFamily: FONT,
                fontSize: 8,
                padding: '3px 8px',
                background: tab === t ? GBC_GREEN : 'transparent',
                color: tab === t ? GBC_BG : GBC_MUTED,
                border: `2px solid ${tab === t ? GBC_GREEN : '#2a4a08'}`,
                cursor: 'pointer',
              }}
            >
              [{t.toUpperCase()}]
            </button>
          ))}
        </div>
      </div>

      {tab === 'uk' ? (
        <>
          {/* Officer Jenny disclaimer */}
          <div style={{ border: '3px solid #e84040', boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a0808', background: '#0a0808', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_RED, letterSpacing: 0.5 }}>▲ OFFICER JENNY SAYS</span>
            <p style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT, lineHeight: 1.7, margin: 0 }}>
              This is an informational guide, not legal advice. Laws change. If you are stopped by police, stay calm and cooperative. Contact a solicitor if you are arrested.
            </p>
          </div>

          {/* Quick facts */}
          <div style={{ ...pokeBox, padding: '10px 12px' }}>
            <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, display: 'block', marginBottom: 8 }}>QUICK REFERENCE</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {UK_QUICK_FACTS.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, background: f.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {UK_SECTIONS.map((s) => (
            <div key={s.title} style={{ border: `3px solid ${s.accent}`, boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010', background: GBC_BOX, padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: FONT, fontSize: 9, color: s.accent }}>{s.icon}</span>
                <span style={{ fontFamily: FONT, fontSize: 9, color: s.accent, letterSpacing: 0.5 }}>{s.title}</span>
              </div>
              <p style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT, lineHeight: 1.7, margin: 0 }}>{s.text}</p>
            </div>
          ))}

          <div style={{ textAlign: 'center', paddingBottom: 8 }}>
            <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED }}>
              MISUSE OF DRUGS ACT 1971 · MISUSE OF DRUGS REGS 2001
            </span>
          </div>
        </>
      ) : (
        <>
          <OfficerJenny />

          {/* Intro box */}
          <div style={{ ...pokeBox, padding: 14 }}>
            <p style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT, lineHeight: 1.7, margin: 0 }}>
              <span style={{ fontFamily: FONT, fontSize: 10, color: GBC_GREEN, display: 'block', marginBottom: 8 }}>
                CANNABIS LAW IN SPAIN
              </span>
              Spain operates in a legal{' '}
              <span style={{ color: GBC_GREEN }}>GRAY AREA</span>
              {' '}regarding cannabis. Personal cultivation and consumption in{' '}
              <span style={{ color: GBC_GREEN }}>PRIVATE</span>
              {' '}spaces is generally tolerated under established case law. However, carrying cannabis in{' '}
              <span style={{ color: GBC_AMBER }}>PUBLIC</span>
              {' '}spaces is a civil — not criminal — offense, subject to administrative fines.
            </p>
          </div>

          {ES_SECTIONS.map((s) => (
            <div key={s.title} style={{ ...pokeBox, border: `3px solid ${s.accent}`, padding: 12 }}>
              <span style={{ fontFamily: FONT, fontSize: 9, color: s.accent, display: 'block', marginBottom: 8, letterSpacing: 0.5 }}>{s.title}</span>
              <p style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT, lineHeight: 1.7, margin: 0 }}>{s.text}</p>
            </div>
          ))}

          {/* Critical warning */}
          <div
            className="gbc-border-flash"
            style={{ background: 'rgba(232,64,64,0.08)', boxShadow: 'inset 0 0 0 2px #1a0404, inset 0 0 0 4px #3a0808', padding: 14, border: '3px solid #e84040' }}
          >
            <span style={{ fontFamily: FONT, fontSize: 11, color: GBC_RED, display: 'block', marginBottom: 10, letterSpacing: 0.5 }}>
              !! SERIOUS WARNING !!
            </span>
            <p style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT, lineHeight: 1.7, margin: 0 }}>
              Manufacturing cannabis concentrates using volatile solvents (BHO/butane extraction) is{' '}
              <span style={{ color: GBC_RED }}>NOT</span>
              {' '}the same as personal cultivation. It constitutes manufacture of a controlled substance and is treated as a{' '}
              <span style={{ color: GBC_RED }}>SERIOUS CRIMINAL OFFENSE</span>
              {' '}under Spanish law, regardless of intent.
            </p>
          </div>

          <p style={{ fontFamily: 'monospace', fontSize: 10, color: GBC_MUTED, lineHeight: 1.6, margin: 0, textAlign: 'center', borderTop: '1px solid #2a4a08', paddingTop: 10 }}>
            This is educational information only, not legal advice. Laws change — always consult a qualified legal professional.
          </p>
        </>
      )}

    </div>
  )
}
