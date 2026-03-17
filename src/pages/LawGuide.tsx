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

type Section = {
  title: string
  accent: string
  icon: string
  text: string
}

const SECTIONS: Section[] = [
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

const QUICK_FACTS = [
  { text: 'CBPMs legal since Nov 2018',           color: GBC_GREEN },
  { text: 'Must keep in original packaging',      color: GBC_AMBER },
  { text: 'Vaporizing: OK under prescription',    color: GBC_GREEN },
  { text: 'Smoking: still illegal',               color: GBC_RED },
  { text: 'Driving limit: 2μg/L THC (blood)',     color: GBC_AMBER },
  { text: 'Prescription = statutory defence',     color: GBC_GREEN },
  { text: 'International travel: never legal',    color: GBC_RED },
  { text: 'CBD <0.2% THC: legal supplement',      color: GBC_GREEN },
]

export default function LawGuide() {
  return (
    <div style={{
      minHeight: '100%',
      background: GBC_BG,
      padding: '10px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid #2a4a08',
        paddingBottom: 8,
      }}>
        <span style={{ fontFamily: FONT, fontSize: 12, color: GBC_GREEN }}>
          UK CANNABIS LAW
        </span>
        <span style={{
          fontFamily: FONT, fontSize: 8, color: GBC_RED,
          border: '2px solid #e84040', padding: '2px 6px',
        }}>
          [UK]
        </span>
      </div>

      {/* Officer Jenny disclaimer */}
      <div style={{
        border: '3px solid #e84040',
        boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a0808',
        background: '#0a0808',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}>
        <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_RED, letterSpacing: 0.5 }}>
          ▲ OFFICER JENNY SAYS
        </span>
        <p style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT, lineHeight: 1.7, margin: 0 }}>
          This is an informational guide, not legal advice. Laws change. If you are stopped by police, stay calm and cooperative. Contact a solicitor if you are arrested.
        </p>
      </div>

      {/* Quick facts ticker */}
      <div style={{ ...pokeBox, padding: '10px 12px' }}>
        <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, display: 'block', marginBottom: 8 }}>
          QUICK REFERENCE
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {QUICK_FACTS.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, background: f.color, flexShrink: 0 }} />
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT }}>
                {f.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sections */}
      {SECTIONS.map((s) => (
        <div
          key={s.title}
          style={{
            border: `3px solid ${s.accent}`,
            boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
            background: GBC_BOX,
            padding: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontFamily: FONT, fontSize: 9, color: s.accent }}>{s.icon}</span>
            <span style={{ fontFamily: FONT, fontSize: 9, color: s.accent, letterSpacing: 0.5 }}>
              {s.title}
            </span>
          </div>
          <p style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT, lineHeight: 1.7, margin: 0 }}>
            {s.text}
          </p>
        </div>
      ))}

      {/* Footer */}
      <div style={{ textAlign: 'center', paddingBottom: 8 }}>
        <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED }}>
          MISUSE OF DRUGS ACT 1971 · MISUSE OF DRUGS REGS 2001
        </span>
      </div>

    </div>
  )
}
