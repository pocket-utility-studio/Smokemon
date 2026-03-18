const FONT    = "'PokemonGb', 'Press Start 2P', monospace"
const GBC_GREEN  = '#84cc16'
const GBC_TEXT   = '#c8e890'
const GBC_MUTED  = '#4a7a10'
const GBC_DARKEST = '#2a4a08'
const GBC_BG     = '#050a04'
const GBC_BOX    = '#0a1408'
const GBC_VIOLET = '#a78bfa'
const GBC_AMBER  = '#f59e0b'

interface Cannabinoid {
  id: string
  name: string
  full: string
  color: string
  tag: string
  psychoactive: boolean
  boilingPoint: string
  body: string
  effects: string[]
  found: string
}

const CANNABINOIDS: Cannabinoid[] = [
  {
    id: 'thc',
    name: 'THC',
    full: 'Tetrahydrocannabinol',
    color: GBC_VIOLET,
    tag: 'PSYCHOACTIVE',
    psychoactive: true,
    boilingPoint: '157°C',
    body: 'The primary psychoactive compound in cannabis. THC binds directly to CB1 receptors in the brain, producing euphoria, altered perception, and increased appetite. It also activates CB2 receptors, contributing to pain relief and anti-inflammation. Formed when heat converts non-psychoactive THCA through decarboxylation.',
    effects: ['Euphoria', 'Relaxation', 'Appetite', 'Pain relief', 'Altered perception'],
    found: 'All cannabis strains. Highest in unfertilised female flowers.',
  },
  {
    id: 'cbd',
    name: 'CBD',
    full: 'Cannabidiol',
    color: GBC_GREEN,
    tag: 'NON-PSYCHOACTIVE',
    psychoactive: false,
    boilingPoint: '160°C',
    body: 'The second most abundant cannabinoid and the most researched non-psychoactive compound. CBD does not bind strongly to CB1 or CB2 receptors — instead it modulates them indirectly. It also acts on serotonin (5-HT1A), vanilloid (TRPV1), and adenosine receptors. FDA-approved as Epidiolex for severe epilepsy. High-CBD strains can moderate the anxiety caused by high-THC varieties.',
    effects: ['Anxiety relief', 'Anti-seizure', 'Anti-inflammation', 'Neuroprotection', 'Sleep support'],
    found: 'Hemp strains and CBD-specific cultivars. Low in most recreational strains.',
  },
  {
    id: 'cbg',
    name: 'CBG',
    full: 'Cannabigerol',
    color: GBC_AMBER,
    tag: 'NON-PSYCHOACTIVE',
    psychoactive: false,
    boilingPoint: '52°C',
    body: 'Known as the "mother cannabinoid" — CBGA (its acid form) is the chemical precursor from which THC, CBD, and CBC are all synthesised in the plant. By harvest, most CBG has converted to other cannabinoids, so concentrations are typically below 1%. CBG acts on both CB1 and CB2 receptors and has shown potent antibacterial activity against MRSA in lab studies. It does not produce intoxication.',
    effects: ['Focus', 'Antibacterial', 'Anti-inflammation', 'Eye pressure reduction', 'Appetite stimulation'],
    found: 'Present in small amounts in most strains. Higher in young plants before conversion.',
  },
  {
    id: 'cbn',
    name: 'CBN',
    full: 'Cannabinol',
    color: GBC_MUTED,
    tag: 'MILDLY PSYCHOACTIVE',
    psychoactive: true,
    boilingPoint: '185°C',
    body: 'CBN forms as THC oxidises and degrades over time through exposure to heat, light, and air. It is the primary cannabinoid in old, poorly stored cannabis. CBN binds to CB1 receptors but with roughly 10% the potency of THC. It is widely associated with sedation, though controlled studies show mixed results — the sedating effect may come from residual terpenes in aged material rather than CBN itself.',
    effects: ['Sedation', 'Sleep aid', 'Antibacterial', 'Appetite stimulation', 'Pain relief'],
    found: 'Highest in old or improperly stored cannabis. Increases as THC degrades.',
  },
  {
    id: 'thcv',
    name: 'THCV',
    full: 'Tetrahydrocannabivarin',
    color: '#f97316',
    tag: 'MILDLY PSYCHOACTIVE',
    psychoactive: true,
    boilingPoint: '220°C',
    body: 'Structurally similar to THC but with a propyl side chain instead of pentyl. At low doses, THCV acts as a CB1 antagonist — blocking rather than activating the receptor. This makes it unusual: potentially appetite-suppressing rather than appetite-stimulating. At high doses it can act as a CB1 agonist. THCV also has a very high boiling point, so it is largely inactive at standard vaping temperatures.',
    effects: ['Appetite suppression', 'Clear-headed high (high dose)', 'Blood sugar regulation', 'Bone growth stimulation'],
    found: 'African sativa landraces (Durban Poison). Rare in most strains.',
  },
  {
    id: 'cbc',
    name: 'CBC',
    full: 'Cannabichromene',
    color: '#60c8f0',
    tag: 'NON-PSYCHOACTIVE',
    psychoactive: false,
    boilingPoint: '220°C',
    body: 'One of the most abundant cannabinoids in the plant but largely overlooked. CBC does not bind to CB1 receptors and produces no psychoactive effect. It does bind to TRPA1 and TRPV1 receptors involved in pain signalling. Research suggests CBC may amplify the analgesic effects of THC and CBD through synergistic mechanisms. It has also shown antidepressant activity in animal studies.',
    effects: ['Pain amplification (synergy)', 'Anti-inflammation', 'Antidepressant', 'Antifungal', 'Neurogenesis'],
    found: 'Present in most strains in small amounts. Higher in tropical sativas.',
  },
  {
    id: 'thca',
    name: 'THCA',
    full: 'Tetrahydrocannabinolic Acid',
    color: '#c0a0f0',
    tag: 'NON-PSYCHOACTIVE (RAW)',
    psychoactive: false,
    boilingPoint: '105°C (decarb)',
    body: 'The raw, unheated precursor to THC. Fresh cannabis contains almost no THC — it is almost entirely THCA. Heat converts THCA to THC through decarboxylation (losing a carboxyl group as CO₂). THCA itself is non-psychoactive and has shown anti-inflammatory, neuroprotective, and anti-nausea properties in research. It is why eating raw cannabis will not produce a high.',
    effects: ['Anti-nausea (raw)', 'Anti-inflammatory', 'Neuroprotective', 'Antiproliferative'],
    found: 'Raw, unheated cannabis. Converts to THC at approximately 105°C+.',
  },
  {
    id: 'cbda',
    name: 'CBDA',
    full: 'Cannabidiolic Acid',
    color: '#5a9a18',
    tag: 'NON-PSYCHOACTIVE (RAW)',
    psychoactive: false,
    boilingPoint: '120°C (decarb)',
    body: 'The raw precursor to CBD, found in abundance in fresh hemp and high-CBD plants. CBDA converts to CBD when heated. Research interest has grown significantly since studies showed CBDA may be more bioavailable than CBD and a potent agonist of 5-HT1A serotonin receptors — potentially making it more effective for nausea and anxiety than CBD in some contexts.',
    effects: ['Anti-nausea', 'Anxiety relief', 'Anti-inflammatory', 'Anti-proliferative'],
    found: 'Raw, fresh high-CBD plants and hemp. Converts to CBD when heated.',
  },
]

function CannabinoidCard({ c }: { c: Cannabinoid }) {
  return (
    <div style={{
      border: `3px solid ${c.color}`,
      boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #1a2a08',
      background: GBC_BOX,
      padding: 14,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: FONT, fontSize: 14, color: c.color, marginBottom: 4 }}>{c.name}</div>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: GBC_MUTED }}>{c.full}</div>
        </div>
        <span style={{
          fontFamily: FONT, fontSize: 7, color: c.color,
          border: `1px solid ${c.color}`, padding: '3px 5px', flexShrink: 0,
          textAlign: 'right', lineHeight: 1.6,
        }}>
          {c.tag}
        </span>
      </div>

      {/* Boiling point */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED }}>BOILING PT</span>
        <span style={{ fontFamily: FONT, fontSize: 9, color: GBC_AMBER }}>{c.boilingPoint}</span>
      </div>

      {/* Body */}
      <p style={{
        fontFamily: 'monospace', fontSize: 13, color: GBC_TEXT,
        lineHeight: 1.7, margin: '0 0 12px',
      }}>
        {c.body}
      </p>

      {/* Effects */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, marginBottom: 6 }}>EFFECTS</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {c.effects.map((e) => (
            <span key={e} style={{
              fontFamily: FONT, fontSize: 7,
              color: c.color, border: `1px solid ${c.color}`,
              padding: '3px 6px',
            }}>{e.toUpperCase()}</span>
          ))}
        </div>
      </div>

      {/* Found in */}
      <div style={{ borderTop: `1px solid ${GBC_DARKEST}`, paddingTop: 8 }}>
        <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED }}>FOUND IN  </span>
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_MUTED }}>{c.found}</span>
      </div>
    </div>
  )
}

export default function CannabinoidGuide() {
  return (
    <div style={{
      minHeight: '100%', background: GBC_BG, padding: '10px',
      boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12,
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: `2px solid ${GBC_DARKEST}`, paddingBottom: 8,
      }}>
        <span style={{ fontFamily: FONT, fontSize: 11, color: GBC_GREEN }}>CANNABINOID GUIDE</span>
        <span style={{
          fontFamily: FONT, fontSize: 7, color: GBC_MUTED,
          border: `1px solid ${GBC_DARKEST}`, padding: '2px 5px',
        }}>
          {CANNABINOIDS.length} ENTRIES
        </span>
      </div>

      {/* Intro */}
      <div style={{
        border: `3px solid ${GBC_DARKEST}`,
        boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #1a3008',
        background: GBC_BOX, padding: 12,
      }}>
        <p style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_MUTED, lineHeight: 1.7, margin: 0 }}>
          Over 140 cannabinoids exist in cannabis. Each interacts differently with your endocannabinoid system. These are the most important ones — what they do, where they act, and when they activate.
        </p>
      </div>

      {/* Psychoactive banner */}
      <div style={{
        border: `2px solid ${GBC_VIOLET}`,
        background: 'rgba(167,139,250,0.06)',
        padding: '8px 12px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_VIOLET }}>PSYCHOACTIVE</span>
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_MUTED }}>THC, CBN (mild), THCV (high dose only)</span>
      </div>

      {/* Cards */}
      {CANNABINOIDS.map((c) => <CannabinoidCard key={c.id} c={c} />)}

      {/* Endocannabinoid system note */}
      <div style={{
        border: `3px solid ${GBC_DARKEST}`,
        background: GBC_BOX, padding: 12,
      }}>
        <div style={{ fontFamily: FONT, fontSize: 9, color: GBC_GREEN, marginBottom: 8 }}>THE ECS</div>
        <p style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_MUTED, lineHeight: 1.7, margin: 0 }}>
          The endocannabinoid system (ECS) was only discovered in 1988. It regulates mood, pain, appetite, memory, and sleep through CB1 receptors (brain/nervous system) and CB2 receptors (immune system). Your body produces its own cannabinoids — anandamide and 2-AG — that use these same pathways. Plant cannabinoids work because they mimic or interact with this existing system.
        </p>
      </div>

      <div style={{ textAlign: 'center', paddingBottom: 8 }}>
        <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_DARKEST }}>
          TRAINER SCHOOL · CANNABINOID REFERENCE
        </span>
      </div>

    </div>
  )
}
