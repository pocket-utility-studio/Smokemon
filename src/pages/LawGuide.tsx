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
    title: 'THE 2018 LAW CHANGE',
    accent: GBC_GREEN,
    icon: '★',
    text:
      'On 1 November 2018, the UK government rescheduled cannabis-based medicinal products from Schedule 1 to Schedule 2 of the Misuse of Drugs Regulations 2001. This landmark change, announced by Home Secretary Sajid Javid, made it legal for specialist clinicians on the GMC register to prescribe cannabis-based products for medicinal use (CBPMs) for the first time. This followed high-profile cases involving children with severe epilepsy who were benefiting from cannabis-based treatments abroad.',
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
    accent: GBC_AMBER,
    icon: '▲',
    text:
      'Travel with your prescribed cannabis is possible, but rules are entirely country-by-country. Always carry your original pharmacy-dispensed packaging and a copy of your prescription. Some countries require advance permission or a declaration on arrival — check with the destination country\'s embassy or border agency before you travel. Do not assume your UK prescription automatically covers you abroad.',
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
  { text: 'Medical cannabis legalised Nov 2018',   color: GBC_GREEN },
  { text: 'Must keep in original packaging',      color: GBC_AMBER },
  { text: 'Vaporizing: OK under prescription',    color: GBC_GREEN },
  { text: 'Smoking: still illegal',               color: GBC_RED },
  { text: 'Driving limit: 2μg/L THC (blood)',     color: GBC_AMBER },
  { text: 'Prescription = statutory defence',     color: GBC_GREEN },
  { text: 'Int\'l travel: check country rules',     color: GBC_AMBER },
  { text: 'CBD <0.2% THC: legal supplement',      color: GBC_GREEN },
]

const POLICE_STEPS = [
  {
    label: 'STAY CALM',
    text: 'Do not argue, raise your voice, or walk away. Keep your hands visible. You are more protected by staying composed than by confrontation.',
  },
  {
    label: 'KNOW YOUR RIGHTS',
    text: 'Police can search you under Section 23 of the Misuse of Drugs Act if they suspect drug possession. Ask calmly: "Am I being detained, or am I free to go?" If detained, ask the reason. Note the officer\'s name and badge number.',
  },
  {
    label: 'SHOW YOUR PRESCRIPTION',
    text: 'Present your prescription and the original pharmacy-dispensed packaging. Politely explain it is a legally prescribed CBPM (Cannabis-Based Product for Medicinal Use) under Schedule 2 of the Misuse of Drugs Regulations 2001.',
  },
  {
    label: 'RIGHT TO SILENCE',
    text: 'You do not have to answer questions beyond confirming your identity when required. Politely say: "I am exercising my right to remain silent and would like to speak to a solicitor." You cannot be penalised for silence.',
  },
  {
    label: 'IF ARRESTED',
    text: 'You have the right to free legal advice. Ask for a duty solicitor immediately — this is your right under PACE 1984 (Police and Criminal Evidence Act). Do not sign anything or answer interview questions without a solicitor present.',
  },
  {
    label: 'AFTER THE STOP',
    text: 'Write down everything as soon as possible: officer names, badge numbers, time, location, and what was said. If medication was seized unlawfully, you can make a complaint to the IOPC (Independent Office for Police Conduct).',
  },
]

const UK_LINKS = [
  {
    label: 'GOV.UK: Cannabis-Based Products for Medicinal Use',
    sublabel: 'Official government guidance on CBPMs',
    url: 'https://www.gov.uk/government/collections/cannabis-based-products-for-medicinal-use-cbpms',
    color: GBC_GREEN,
  },
  {
    label: 'Home Office: Travelling with controlled drugs',
    sublabel: 'How to apply for a personal licence to travel',
    url: 'https://www.gov.uk/travelling-controlled-drugs',
    color: GBC_GREEN,
  },
  {
    label: 'Legislation.gov.uk: Misuse of Drugs Regs 2001',
    sublabel: 'The Schedule 2 regulations covering CBPMs',
    url: 'https://www.legislation.gov.uk/uksi/2001/3998/contents',
    color: GBC_MUTED,
  },
  {
    label: 'Release: Know Your Rights',
    sublabel: 'Drug charity — rights when stopped by police',
    url: 'https://www.release.org.uk/know-your-rights',
    color: GBC_AMBER,
  },
  {
    label: 'Release: Helpline 0207 324 2989',
    sublabel: 'Free and confidential drugs law advice',
    url: 'https://www.release.org.uk',
    color: GBC_AMBER,
  },
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
      <img
        src={`${import.meta.env.BASE_URL}officer-jenny.png`}
        alt="Officer Jenny"
        width={96}
        height={96}
        style={{ imageRendering: 'pixelated', display: 'block', objectFit: 'contain' }}
      />
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
          <OfficerJenny />

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

          {/* If stopped by police */}
          <div style={{ border: `3px solid ${GBC_AMBER}`, boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a2c00', background: '#0a0900', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontFamily: FONT, fontSize: 9, color: GBC_AMBER, letterSpacing: 0.5 }}>IF STOPPED BY POLICE</span>
            <p style={{ fontFamily: 'monospace', fontSize: 11, color: GBC_MUTED, lineHeight: 1.6, margin: 0 }}>
              A guide for medicinal cannabis patients.
            </p>
            {POLICE_STEPS.map((step, i) => (
              <div key={i} style={{ borderLeft: `3px solid ${GBC_AMBER}`, paddingLeft: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_AMBER }}>{i + 1}. {step.label}</span>
                <p style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT, lineHeight: 1.7, margin: 0 }}>{step.text}</p>
              </div>
            ))}
          </div>

          {/* Useful links */}
          <div style={{ ...pokeBox, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, display: 'block', marginBottom: 4 }}>USEFUL LINKS</span>
            {UK_LINKS.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', padding: '8px 10px', border: `1px solid ${link.color}`, background: 'transparent', textDecoration: 'none' }}
              >
                <span style={{ fontFamily: FONT, fontSize: 8, color: link.color, display: 'block', marginBottom: 3 }}>{link.label}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: GBC_MUTED }}>{link.sublabel}</span>
              </a>
            ))}
          </div>

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
