import { useState } from 'react'

const pokeBox = {
  border: '3px solid #84cc16',
  boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
  background: '#0a1408',
  borderRadius: 0,
}

const DATE_FACTS: Record<string, string> = {
  '01-16': 'In 1997, researchers at Hebrew University identified the endocannabinoid 2-AG (2-arachidonoylglycerol), one of the primary natural ligands for cannabinoid receptors in the human body.',
  '02-08': 'In 1976, the US government established the Compassionate Investigational New Drug programme, which supplied federal cannabis cigarettes to a small number of patients with conditions including glaucoma and multiple sclerosis.',
  '03-22': 'In 2001, Canada became the first country in the world to adopt a national medical cannabis programme, establishing a federal framework for licensed production and patient access.',
  '04-01': 'The first documented clinical trial specifically investigating cannabidiol (CBD) for epilepsy was published in 1980 in the journal Pharmacology, reporting significant reductions in seizure frequency.',
  '04-20': 'The term 420 originates from a group of students at San Rafael High School, California, who met at 4:20 PM in 1971 to search for a rumoured abandoned cannabis crop.',
  '05-14': 'In 1986, the US DEA approved dronabinol (synthetic THC) as a Schedule II prescription drug for the treatment of nausea and vomiting associated with chemotherapy.',
  '06-02': 'In 2018, the FDA approved Epidiolex, the first plant-derived cannabidiol medicine, for the treatment of two rare and severe forms of epilepsy — Dravet syndrome and Lennox-Gastaut syndrome.',
  '06-19': 'In 2019, Illinois became the 11th US state to legalise recreational cannabis, effective January 2020.',
  '07-04': 'Hemp was one of the first plants to be cultivated by humans, with evidence of fibre production in China dating back over 10,000 years.',
  '07-18': 'In 2018, Canada became the second country in the world — after Uruguay — to legalise recreational cannabis nationally with the Cannabis Act coming into force.',
  '08-02': 'In 1937, the US Marihuana Tax Act was passed, effectively criminalising cannabis at a federal level for the first time.',
  '08-14': 'Dr. Raphael Mechoulam first isolated and synthesised THC (tetrahydrocannabinol) in 1964 at the Hebrew University of Jerusalem, a breakthrough that launched modern cannabis science.',
  '09-01': 'In 2003, the US government was granted Patent 6,630,507 covering the use of cannabinoids as neuroprotectants and antioxidants, despite simultaneously maintaining cannabis as a Schedule I substance with no accepted medical use.',
  '09-15': 'The terpene myrcene, found in high concentrations in many cannabis strains, is also present in hops, lemongrass, and thyme. It is associated with sedating, relaxing effects.',
  '10-01': 'In 1993, the CB2 receptor — distinct from the brain-focused CB1 receptor — was discovered, primarily located in immune tissues. This opened research into cannabis compounds for inflammation and immune modulation.',
  '10-17': 'In 2018, Canada fully legalised recreational cannabis nationally. It was the first G7 nation to do so.',
  '11-02': 'The word "cannabis" derives from the ancient Greek "kannabis," which itself is thought to originate from a Scythian or Thracian root word. The plant has been documented in ancient Assyrian, Chinese, and Egyptian texts.',
  '11-20': 'In 1988, the first cannabinoid receptor (CB1) was identified by Allyn Howlett and William Devane, revealing that the human brain contains a dedicated system for responding to cannabinoid compounds.',
  '12-04': 'In 1964, the United Nations Single Convention on Narcotic Drugs placed cannabis in Schedule IV — its most restrictive category. In 2020, the UN Commission on Narcotic Drugs voted to remove cannabis from Schedule IV, though it remains in Schedule I.',
  '12-20': 'In 2020, the US House of Representatives passed the MORE Act (Marijuana Opportunity Reinvestment and Expungement Act) to federally decriminalise cannabis for the first time — though it did not pass the Senate.',
}

const TRIVIA_POOL: string[] = [
  'Cannabis contains over 140 known cannabinoids, of which THC and CBD are the most studied. Lesser-known cannabinoids such as CBG, CBC, CBN, and THCV are the subject of growing research interest.',
  'The entourage effect is a proposed mechanism by which the various compounds in cannabis — cannabinoids, terpenes, and flavonoids — work together synergistically to produce effects greater than any single compound alone.',
  'Terpenes are the aromatic compounds responsible for the scent of cannabis and many other plants. Limonene is associated with uplifting citrus notes, while linalool (also found in lavender) is associated with calming, floral effects.',
  'The endocannabinoid system (ECS) regulates a wide range of physiological processes including pain perception, mood, appetite, memory, and immune function. It was only formally identified in the early 1990s.',
  'Industrial hemp and psychoactive cannabis are both Cannabis sativa L. but are distinguished legally and horticulturally by their THC content. EU regulations define hemp as containing no more than 0.3% THC by dry weight.',
  'Vaporising cannabis at controlled temperatures below 230°C allows users to inhale cannabinoids and terpenes without the combustion byproducts (carbon monoxide, tar, benzene) associated with smoking.',
  'THCA (tetrahydrocannabinolic acid) is the raw, non-psychoactive precursor to THC found in the living cannabis plant. It converts to THC through decarboxylation — the application of heat.',
  'CBN (cannabinol) forms as THC oxidises and degrades over time, particularly when cannabis is exposed to air and light. It is associated with sedative properties and is being researched for sleep applications.',
  'Spain has among the highest rates of cannabis consumption in the European Union. Barcelona is home to hundreds of cannabis social clubs, though their legal status remains ambiguous under national law.',
  'The first vaporiser designed specifically for cannabis was patented in the early 1990s. Temperature-controlled vaporisation allows selective activation of different cannabinoids and terpenes at their specific boiling points.',
  'Linalool, a terpene found in both cannabis and lavender, activates the same GABA receptors in the brain targeted by benzodiazepines — potentially explaining its calming and anti-anxiety properties.',
  'Cannabis roots were used in traditional Chinese medicine as far back as 2700 BCE, with preparations applied for pain, inflammation, and a range of other conditions. The Pen-ts ao Ching (Divine Husbandman\'s Classic) documents these uses.',
]

function getTodayKey(): string {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${mm}-${dd}`
}

function formatDate(): string {
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yyyy = now.getFullYear()
  return `${dd} / ${mm} / ${yyyy}`
}

export default function FactCartridge() {
  const [triviaIndex, setTriviaIndex] = useState(0)

  const todayKey = getTodayKey()
  const dateFact = DATE_FACTS[todayKey]

  const handleNextFact = () => {
    setTriviaIndex((prev) => (prev + 1) % TRIVIA_POOL.length)
  }

  const displayFact = triviaIndex === 0 && dateFact ? dateFact : TRIVIA_POOL[triviaIndex % TRIVIA_POOL.length]
  const factTitle = triviaIndex === 0 && dateFact ? 'ON THIS DAY' : 'DID YOU KNOW?'

  return (
    <div style={{
      minHeight: '100%',
      background: '#050a04',
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
        marginBottom: 0,
      }}>
        <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 13, color: '#84cc16' }}>
          FACT CARTRIDGE
        </span>
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P'",
          fontSize: 8,
          color: '#4a7a10',
          border: '2px solid #2a4a08',
          padding: '2px 6px',
          borderRadius: 0,
        }}>
          [DAILY]
        </span>
      </div>

      {/* Date display poke-box */}
      <div style={{
        ...pokeBox,
        padding: '12px 16px',
        textAlign: 'center',
      }}>
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P'",
          fontSize: 14,
          color: '#84cc16',
          letterSpacing: 2,
        }}>
          {formatDate()}
        </span>
      </div>

      {/* Pixel cartridge illustration */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 60, height: 70 }}>
          {/* Cart body */}
          <div style={{
            position: 'absolute',
            top: 8,
            left: 0,
            width: 60,
            height: 62,
            background: 'linear-gradient(180deg, #1a3004 0%, #0e1c02 100%)',
            border: '2px solid #3a6010',
            borderRadius: 0,
          }}>
            {/* Label area */}
            <div style={{
              margin: '6px 4px 4px',
              background: 'linear-gradient(135deg, #1e3c06 0%, #162c04 100%)',
              border: '1px solid #2a4a08',
              padding: '5px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}>
              <span style={{ fontSize: 6, color: '#84cc16', fontFamily: "'PokemonGb', 'Press Start 2P'", letterSpacing: 0.5 }}>FACT</span>
              <span style={{ fontSize: 7, color: '#c8e890', fontFamily: "'PokemonGb', 'Press Start 2P'", letterSpacing: 0.5 }}>CART</span>
              <div style={{ width: '80%', height: 1, background: '#2a4a08' }} />
              <span style={{ fontSize: 5, color: '#4a7a10', fontFamily: "'PokemonGb', 'Press Start 2P'" }}>DAILY</span>
            </div>
            {/* Bottom notch lines */}
            <div style={{ position: 'absolute', bottom: 4, left: 5, right: 5, display: 'flex', gap: 2 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ flex: 1, height: 3, background: '#0a1602', borderRadius: 0 }} />
              ))}
            </div>
          </div>
          {/* Cart top tab / notch */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 14,
            right: 14,
            height: 10,
            background: '#1a3004',
            border: '2px solid #3a6010',
            borderBottom: 'none',
            borderRadius: 0,
          }} />
        </div>
      </div>

      {/* Main fact poke-box */}
      <div style={{ ...pokeBox, padding: 14, flex: 1 }}>
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P'",
          fontSize: 9,
          color: '#84cc16',
          display: 'block',
          marginBottom: 10,
          letterSpacing: 0.5,
        }}>
          {factTitle}
        </span>
        {triviaIndex === 0 && dateFact && (
          <span style={{
            fontFamily: "'PokemonGb', 'Press Start 2P'",
            fontSize: 7,
            color: '#4a7a10',
            display: 'block',
            marginBottom: 8,
          }}>
            {formatDate().replace(/ \/ /g, '.')}
          </span>
        )}
        <p style={{
          fontFamily: 'monospace',
          fontSize: 13,
          color: '#c8e890',
          lineHeight: 1.7,
          margin: 0,
        }}>
          {displayFact}
        </p>
      </div>

      {/* Trivia index indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
        {TRIVIA_POOL.map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              border: '1px solid #2a4a08',
              background: i === triviaIndex % TRIVIA_POOL.length ? '#84cc16' : 'transparent',
              borderRadius: 0,
            }}
          />
        ))}
      </div>

      {/* Next fact button */}
      <button
        onClick={handleNextFact}
        style={{
          border: '3px solid #84cc16',
          color: '#84cc16',
          background: 'rgba(132,204,22,0.08)',
          fontSize: 11,
          padding: '12px 16px',
          width: '100%',
          fontFamily: "'PokemonGb', 'Press Start 2P'",
          cursor: 'pointer',
          borderRadius: 0,
          letterSpacing: 1,
          boxSizing: 'border-box',
        }}
      >
        ► NEXT FACT
      </button>
    </div>
  )
}
