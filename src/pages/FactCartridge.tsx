import { useState } from 'react'

const FONT = "'PokemonGb', 'Press Start 2P', monospace"

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

type Fact = { text: string; category: string; color: string }

const TRIVIA_POOL: Fact[] = [
  // SCIENCE
  { category: '[SCIENCE]', color: '#a78bfa', text: 'THC and CBD are both derived from CBGa (cannabigerolic acid) — the "mother cannabinoid" from which all major cannabinoids are synthesised.' },
  { category: '[SCIENCE]', color: '#a78bfa', text: 'The endocannabinoid system was only discovered in 1988 when CB1 receptors were first identified by Allyn Howlett and William Devane.' },
  { category: '[SCIENCE]', color: '#a78bfa', text: '2-AG and anandamide are the body\'s own endocannabinoids — produced on demand, not stored, and broken down immediately after use.' },
  { category: '[SCIENCE]', color: '#a78bfa', text: 'Cannabis terpenes can modulate blood-brain barrier permeability, potentially enhancing cannabinoid uptake and altering how compounds reach the brain.' },
  { category: '[SCIENCE]', color: '#a78bfa', text: 'Myrcene is the most abundant terpene in most cannabis strains, often exceeding 50% of total terpene content.' },
  { category: '[SCIENCE]', color: '#a78bfa', text: 'THCA (tetrahydrocannabinolic acid) is non-psychoactive until decarboxylated by heat above approximately 105°C — raw cannabis will not get you high.' },
  { category: '[SCIENCE]', color: '#a78bfa', text: 'CBN forms as THC oxidises over time. Aged, air-exposed cannabis has significantly higher CBN and lower THC than fresh material.' },
  { category: '[SCIENCE]', color: '#a78bfa', text: 'The boiling point of THC is approximately 157°C; CBD boils at around 160°C; myrcene at 167°C. Temperature control directly changes which compounds you inhale.' },
  { category: '[SCIENCE]', color: '#a78bfa', text: 'Caryophyllene is unique: the only terpene that also acts as a cannabinoid, binding directly to CB2 receptors without producing psychoactive effects.' },
  { category: '[SCIENCE]', color: '#a78bfa', text: 'The entourage effect proposes that cannabinoids and terpenes work synergistically — whole-plant extracts typically outperform isolated compounds in studies.' },
  { category: '[SCIENCE]', color: '#a78bfa', text: 'Terpenes evaporate at lower temperatures than cannabinoids. The first vapour at low temps (below 160°C) is mostly terpenes, not THC.' },
  { category: '[SCIENCE]', color: '#a78bfa', text: 'The CB1 receptor density in the brain is one of the highest of any G-protein coupled receptor in the entire central nervous system.' },
  { category: '[SCIENCE]', color: '#a78bfa', text: 'Cannabis flavonoids called cannflavins A and B are approximately 30 times more potent than aspirin as anti-inflammatory agents in lab studies.' },
  { category: '[SCIENCE]', color: '#a78bfa', text: 'Linalool activates GABA receptors — the same receptors targeted by benzodiazepines — potentially explaining its anxiolytic and sedating effects.' },
  // HISTORY
  { category: '[HISTORY]', color: '#f59e0b', text: 'Cannabis cultivation evidence dates back over 10,000 years in China — the oldest known woven hemp textile was found there.' },
  { category: '[HISTORY]', color: '#f59e0b', text: 'The Pen-ts\'ao Ching (2700 BCE), attributed to Emperor Shen Nong, is the first written record of cannabis as medicine.' },
  { category: '[HISTORY]', color: '#f59e0b', text: 'In 1484, Pope Innocent VIII issued a papal bull condemning cannabis use in connection with witchcraft practices.' },
  { category: '[HISTORY]', color: '#f59e0b', text: 'Napoleon\'s army encountered hashish in Egypt (1798–1801). It was later banned by French military decree, but the encounter sparked European scientific interest.' },
  { category: '[HISTORY]', color: '#f59e0b', text: 'In 1839, William B. O\'Shaughnessy introduced cannabis to Western medicine via his landmark paper on its use in tetanus and convulsions.' },
  { category: '[HISTORY]', color: '#f59e0b', text: 'The 1937 US Marihuana Tax Act effectively criminalised cannabis nationally — largely driven by a lobbying campaign connected to newspaper magnate William Randolph Hearst.' },
  { category: '[HISTORY]', color: '#f59e0b', text: 'Dr. Raphael Mechoulam first isolated and synthesised THC in 1964 at Hebrew University, Jerusalem — launching the modern era of cannabinoid science.' },
  { category: '[HISTORY]', color: '#f59e0b', text: 'In 1988, the first CB1 receptor was discovered by Allyn Howlett and William Devane, revealing the existence of the endocannabinoid system.' },
  { category: '[HISTORY]', color: '#f59e0b', text: 'In 1993, the CB2 receptor was identified, opening new research into cannabis for immune and inflammatory conditions.' },
  { category: '[HISTORY]', color: '#f59e0b', text: 'In 1996, California passed Proposition 215 — the first US state medical cannabis law, fundamentally changing the political landscape.' },
  { category: '[HISTORY]', color: '#f59e0b', text: 'In 2001, Canada became the first country to establish a national medical cannabis programme.' },
  { category: '[HISTORY]', color: '#f59e0b', text: 'Uruguay became the first country to fully legalise recreational cannabis in 2013 under President José Mujica.' },
  { category: '[HISTORY]', color: '#f59e0b', text: 'Canada became the first G7 nation to legalise recreational cannabis nationally in October 2018.' },
  { category: '[HISTORY]', color: '#f59e0b', text: 'In 2020, the UN Commission on Narcotic Drugs voted to remove cannabis from Schedule IV (most restrictive) — it remains in Schedule I.' },
  // CULTURE
  { category: '[CULTURE]', color: '#84cc16', text: 'The term "420" traces to a group of San Rafael High School students who met at 4:20 PM in 1971 to search for an abandoned cannabis crop.' },
  { category: '[CULTURE]', color: '#84cc16', text: 'Bob Marley was buried with a Bible, a guitar, and a bud of cannabis.' },
  { category: '[CULTURE]', color: '#84cc16', text: 'The phrase "reefer madness" comes from the 1936 propaganda film commissioned to frighten Americans away from cannabis use.' },
  { category: '[CULTURE]', color: '#84cc16', text: 'Carl Sagan wrote essays under the pseudonym "Mr X" describing his cannabis use and its role in inspiring his scientific thinking.' },
  { category: '[CULTURE]', color: '#84cc16', text: 'The word "assassin" may derive from "hashishin" — members of an 11th century Persian sect led by Hassan-i-Sabbah, allegedly rewarded with hashish.' },
  { category: '[CULTURE]', color: '#84cc16', text: 'Hemp rope was used in the rigging of Christopher Columbus\'s ships in 1492.' },
  { category: '[CULTURE]', color: '#84cc16', text: 'Cannabis was listed in the United States Pharmacopeia as a recognised medicine from 1850 to 1942.' },
  { category: '[CULTURE]', color: '#84cc16', text: 'The first vaporiser designed specifically for cannabis was patented in the United States in 1994.' },
  // LAW
  { category: '[LAW]', color: '#e84040', text: 'In 2003, the US government held Patent 6,630,507 covering cannabinoids as neuroprotectants — while simultaneously classifying cannabis as Schedule I with no accepted medical use.' },
  { category: '[LAW]', color: '#e84040', text: 'Thailand became the first Asian country to decriminalise cannabis in 2022, but reversed course with new restrictions in 2024.' },
  { category: '[LAW]', color: '#e84040', text: 'The Netherlands\' cannabis tolerance policy (gedoogbeleid) has been in place since the 1970s — cannabis is illegal but prosecution is formally deprioritised.' },
  { category: '[LAW]', color: '#e84040', text: 'Spain\'s cannabis social clubs operate under constitutional rights of privacy and freedom of association — not explicit legislation — creating regional legal fragmentation.' },
  { category: '[LAW]', color: '#e84040', text: 'In 2020, the US MORE Act passed the House of Representatives to federally decriminalise cannabis. It did not pass the Senate.' },
  { category: '[LAW]', color: '#e84040', text: 'Malta became the first EU member state to legalise personal cannabis use and home cultivation in 2021.' },
  // GROW
  { category: '[GROW]', color: '#84cc16', text: 'Cannabis is dioecious — it produces separate male and female plants. Only unfertilised females produce the resin-rich flowers used for consumption.' },
  { category: '[GROW]', color: '#84cc16', text: 'The term "sensimilla" (from Spanish sin semilla, "without seeds") refers to unfertilised female flowers — the standard for modern cannabis production.' },
  { category: '[GROW]', color: '#84cc16', text: 'Hemp and cannabis are the same species (Cannabis sativa L.) — distinguished legally by THC content, not by biology or genetics.' },
  { category: '[GROW]', color: '#84cc16', text: 'Cannabis plants grown under 12 hours of light per day enter the flowering stage. Growers use this to trigger blooming indoors year-round.' },
  { category: '[GROW]', color: '#84cc16', text: 'Trichomes — the crystal-like structures on cannabis flowers — are the primary site of cannabinoid and terpene production.' },
  { category: '[GROW]', color: '#84cc16', text: 'The ruderalis subspecies of cannabis is autoflowering — it flowers based on age rather than light cycle — enabling faster grows at northern latitudes.' },
  { category: '[GROW]', color: '#84cc16', text: 'Cannabis roots were used in traditional Chinese medicine for over 2,000 years for pain and inflammation.' },
  // CANNA
  { category: '[CANNA]', color: '#c8e890', text: 'There are over 140 known cannabinoids in cannabis — THC and CBD are the most studied, but CBG, CBC, CBN, and THCV each have distinct properties.' },
  { category: '[CANNA]', color: '#c8e890', text: 'CBG (cannabigerol) is considered the precursor cannabinoid — all major cannabinoids derive from CBGA through enzymatic conversion in the plant.' },
  { category: '[CANNA]', color: '#c8e890', text: 'THCV (tetrahydrocannabivarin) is structurally similar to THC but acts as a CB1 antagonist at low doses — potentially suppressing appetite rather than stimulating it.' },
  { category: '[CANNA]', color: '#c8e890', text: 'CBC (cannabichromene) does not bind to CB1 receptors but may amplify the pain-relieving effects of THC and CBD through other pathways.' },
  { category: '[CANNA]', color: '#c8e890', text: 'CBG has shown antibacterial activity against MRSA strains in preliminary lab studies — a finding of significant medical interest.' },
  { category: '[CANNA]', color: '#c8e890', text: 'Epidiolex (plant-derived CBD) was approved by the FDA in 2018 for two forms of severe childhood epilepsy — the first plant-derived cannabis medicine to receive FDA approval.' },
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
  const [triviaIndex, setTriviaIndex] = useState(() => Math.floor(Math.random() * TRIVIA_POOL.length))

  const todayKey = getTodayKey()
  const dateFact = DATE_FACTS[todayKey]

  const handleNextFact = () => {
    setTriviaIndex((prev) => (prev + 1) % TRIVIA_POOL.length)
  }

  const isDateFact = triviaIndex === 0 && dateFact
  const displayFact: Fact = isDateFact
    ? { text: dateFact, category: '[HISTORY]', color: '#f59e0b' }
    : TRIVIA_POOL[triviaIndex % TRIVIA_POOL.length]
  const factTitle = isDateFact ? 'ON THIS DAY' : 'DID YOU KNOW?'

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
        <span style={{ fontFamily: FONT, fontSize: 13, color: '#84cc16' }}>
          FACT CARTRIDGE
        </span>
        <span style={{
          fontFamily: FONT,
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
          fontFamily: FONT,
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
              <span style={{ fontSize: 6, color: '#84cc16', fontFamily: FONT, letterSpacing: 0.5 }}>FACT</span>
              <span style={{ fontSize: 7, color: '#c8e890', fontFamily: FONT, letterSpacing: 0.5 }}>CART</span>
              <div style={{ width: '80%', height: 1, background: '#2a4a08' }} />
              <span style={{ fontSize: 5, color: '#4a7a10', fontFamily: FONT }}>DAILY</span>
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
          fontFamily: FONT,
          fontSize: 9,
          color: '#84cc16',
          display: 'block',
          marginBottom: 10,
          letterSpacing: 0.5,
        }}>
          {factTitle}
        </span>
        {isDateFact && (
          <span style={{
            fontFamily: FONT,
            fontSize: 7,
            color: '#4a7a10',
            display: 'block',
            marginBottom: 8,
          }}>
            {formatDate().replace(/ \/ /g, '.')}
          </span>
        )}
        <span style={{
          fontFamily: FONT,
          fontSize: 8,
          color: displayFact.color,
          border: `1px solid ${displayFact.color}`,
          padding: '2px 6px',
          display: 'inline-block',
          marginBottom: 10,
        }}>
          {displayFact.category}
        </span>
        <p style={{
          fontFamily: 'monospace',
          fontSize: 13,
          color: '#c8e890',
          lineHeight: 1.7,
          margin: 0,
        }}>
          {displayFact.text}
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
          fontFamily: FONT,
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
