import { useState, useCallback, useMemo } from 'react'

const GBC_GREEN = '#84cc16'
const GBC_TEXT = '#c8e890'
const GBC_MUTED = '#4a7a10'
const GBC_DARKEST = '#2a4a08'

const pokeBox = {
  border: '3px solid #84cc16',
  boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
  background: '#0a1408',
}

const terpenes = [
  {
    name: 'Myrcene',
    aroma: ['Earthy', 'Musky', 'Herbal'],
    effects: ['Relaxing', 'Sedating', 'Anti-inflammatory'],
    foundIn: ['Mango', 'Hops', 'Lemongrass'],
    color: '#84cc16',
    description:
      'The most abundant terpene in cannabis. Myrcene contributes to the classic "couch-lock" effect in heavy indicas. It may increase cell permeability, potentially helping cannabinoids cross the blood-brain barrier faster.',
  },
  {
    name: 'Limonene',
    aroma: ['Citrus', 'Lemon', 'Orange'],
    effects: ['Uplifting', 'Stress relief', 'Anti-anxiety'],
    foundIn: ['Citrus peel', 'Juniper', 'Peppermint'],
    color: '#f59e0b',
    description:
      'Gives strains their bright, zesty scent. Limonene is strongly associated with mood elevation and stress relief, and is common in sativa-dominant strains. Also found in cleaning products for its fresh scent.',
  },
  {
    name: 'Caryophyllene',
    aroma: ['Spicy', 'Peppery', 'Woody'],
    effects: ['Anti-inflammatory', 'Pain relief', 'Calming'],
    foundIn: ['Black pepper', 'Cloves', 'Cinnamon'],
    color: '#f97316',
    description:
      'The only terpene known to also act as a cannabinoid — it binds directly to CB2 receptors. If you ever feel too high, sniffing or chewing black pepper (rich in caryophyllene) may help calm the anxiety.',
  },
  {
    name: 'Linalool',
    aroma: ['Floral', 'Lavender', 'Spicy'],
    effects: ['Calming', 'Anti-anxiety', 'Sleep aid'],
    foundIn: ['Lavender', 'Birch', 'Coriander'],
    color: '#a78bfa',
    description:
      'The dominant terpene in lavender. Linalool has powerful calming and anti-anxiety properties and is commonly found in indica and CBD strains aimed at sleep and relaxation.',
  },
  {
    name: 'Pinene',
    aroma: ['Pine', 'Fresh', 'Sharp'],
    effects: ['Alertness', 'Memory retention', 'Bronchodilator'],
    foundIn: ['Pine trees', 'Rosemary', 'Dill'],
    color: '#84cc16',
    description:
      'Two forms: alpha-pinene and beta-pinene. May counteract some of the short-term memory impairment caused by THC. Promotes mental clarity and has a distinctive pine-forest aroma.',
  },
  {
    name: 'Terpinolene',
    aroma: ['Fresh', 'Piney', 'Floral'],
    effects: ['Uplifting', 'Mildly sedating', 'Antioxidant'],
    foundIn: ['Apples', 'Cumin', 'Lilacs'],
    color: '#84cc16',
    description:
      'A complex, multi-layered terpene with piney, floral, and herbal notes. Common in Jack Herer strains. Generally uplifting but can contribute to mild drowsiness in high quantities.',
  },
  {
    name: 'Humulene',
    aroma: ['Hoppy', 'Earthy', 'Woody'],
    effects: ['Appetite suppressant', 'Anti-inflammatory', 'Antibacterial'],
    foundIn: ['Hops', 'Ginger', 'Sage'],
    color: '#f97316',
    description:
      'Cannabis and hops are botanical cousins — humulene is what they share. Uniquely among cannabis terpenes, humulene acts as an appetite suppressant. Used in many craft beers for its distinctive hoppy character.',
  },
  {
    name: 'Ocimene',
    aroma: ['Sweet', 'Herbal', 'Tropical'],
    effects: ['Uplifting', 'Antiviral', 'Decongestant'],
    foundIn: ['Mint', 'Parsley', 'Orchids'],
    color: '#84cc16',
    description:
      'A sweet, herbal terpene used widely in perfumery. In cannabis it contributes to uplifting, euphoric effects. Research also points to strong antifungal and antiviral properties.',
  },
  {
    name: 'Bisabolol',
    aroma: ['Floral', 'Sweet', 'Chamomile'],
    effects: ['Calming', 'Anti-inflammatory', 'Skin healing'],
    foundIn: ['Chamomile', 'Candeia tree', 'Sweet basil'],
    color: '#a78bfa',
    description:
      'Best known as a skincare ingredient, bisabolol has significant anti-inflammatory and analgesic properties. It may also enhance skin absorption of other compounds — suggesting it could help cannabinoids penetrate more effectively.',
  },
  {
    name: 'Valencene',
    aroma: ['Citrus', 'Sweet', 'Orange peel'],
    effects: ['Energising', 'Anti-inflammatory', 'Uplifting'],
    foundIn: ['Valencia oranges', 'Grapefruit', 'Tangerines'],
    color: '#f59e0b',
    description:
      'Named after Valencia oranges. Gives strains like Tangie their distinctive sweet citrus punch. Research suggests anti-inflammatory effects, and it is used as a natural insect repellent in some applications.',
  },
  {
    name: 'Geraniol',
    aroma: ['Floral', 'Rose', 'Fruity'],
    effects: ['Neuroprotective', 'Anti-anxiety', 'Relaxing'],
    foundIn: ['Roses', 'Geraniums', 'Citronella'],
    color: '#a78bfa',
    description:
      'A rosy, floral terpene also used extensively in perfumery. Geraniol shows strong neuroprotective properties in preliminary research and has demonstrated effectiveness as a natural mosquito repellent.',
  },
  {
    name: 'Camphene',
    aroma: ['Woody', 'Fir', 'Damp earth'],
    effects: ['Anti-inflammatory', 'Antioxidant', 'Analgesic'],
    foundIn: ['Fir needles', 'Ginger', 'Cypress'],
    color: '#84cc16',
    description:
      'One of the lesser-known cannabis terpenes, camphene has a distinctly damp, earthy-fir quality. Traditionally used in 19th century oil lamps for its flammability. Research suggests cardiovascular benefits and strong antioxidant properties.',
  },
  {
    name: 'Eucalyptol',
    aroma: ['Minty', 'Cooling', 'Medicinal'],
    effects: ['Mental clarity', 'Bronchodilator', 'Anti-inflammatory'],
    foundIn: ['Eucalyptus', 'Bay laurel', 'Tea tree'],
    color: '#84cc16',
    description:
      'The dominant compound in eucalyptus oil. Eucalyptol acts as a powerful bronchodilator — opening airways — which may partly explain why some users report easier breathing when vaping strains high in this terpene.',
  },
  {
    name: 'Terpineol',
    aroma: ['Pine', 'Floral', 'Lilac'],
    effects: ['Sedating', 'Relaxing', 'Antibacterial'],
    foundIn: ['Pine bark', 'Eucalyptus', 'Lime blossoms'],
    color: '#a78bfa',
    description:
      'Commonly found alongside high-myrcene strains, terpineol is thought to amplify sedating effects. It is widely used in cosmetics and cleaning products and has demonstrated antibiotic properties against several bacteria including E. coli.',
  },
  {
    name: 'Nerolidol',
    aroma: ['Woody', 'Floral', 'Fresh bark'],
    effects: ['Sedating', 'Anti-parasitic', 'Anti-fungal'],
    foundIn: ['Neroli', 'Jasmine', 'Ginger'],
    color: '#a78bfa',
    description:
      'A sesquiterpene with notable sedating properties. Research has found nerolidol to be effective against Leishmania parasites and certain fungi. Its distinctive bark-like scent appears in strains with earthy, woody profiles.',
  },
  {
    name: 'Guaiol',
    aroma: ['Pine', 'Rose', 'Woody'],
    effects: ['Anti-inflammatory', 'Antimicrobial', 'Diuretic'],
    foundIn: ['Guaiacum wood', 'Cypress pine', 'Apples'],
    color: '#84cc16',
    description:
      'A sesquiterpene alcohol (technically not a terpene but classified with them). Guaiacum wood has been used medicinally for centuries for arthritis and respiratory conditions. Found in strains with complex woody-floral profiles.',
  },
]

// 8×8 pixel art icons (each cell = 2px → 16×16 rendered)
const TERPENE_PIXELS: Record<string, string[]> = {
  Myrcene: [
    '...##...',
    '..###...',
    '.#####..',
    '.#####..',
    '..###...',
    '...#....',
    '...#....',
    '........',
  ],
  Limonene: [
    '..####..',
    '.######.',
    '########',
    '###.####',
    '########',
    '.######.',
    '..####..',
    '........',
  ],
  Caryophyllene: [
    '.#.#.#..',
    '..###...',
    '.#####..',
    '########',
    '.#####..',
    '..###...',
    '.#.#.#..',
    '........',
  ],
  Linalool: [
    '.#.#.#..',
    '.#####..',
    '..###...',
    '...#....',
    '...#....',
    '...##...',
    '..####..',
    '........',
  ],
  Pinene: [
    '...##...',
    '..####..',
    '.######.',
    '########',
    '...##...',
    '...##...',
    '..####..',
    '........',
  ],
}
const DEFAULT_PIXELS = [
  '...##...',
  '..####..',
  '.######.',
  '########',
  '.######.',
  '..####..',
  '...##...',
  '........',
]

function TerpeneIcon({ name, color }: { name: string; color: string }) {
  const rows = TERPENE_PIXELS[name] ?? DEFAULT_PIXELS
  const s = 2
  return (
    <svg
      width={8 * s} height={8 * s}
      style={{ imageRendering: 'pixelated', display: 'block', flexShrink: 0 }}
    >
      {rows.map((row, ry) =>
        [...row].map((cell, cx) =>
          cell === '#' ? (
            <rect key={`${ry}-${cx}`} x={cx * s} y={ry * s} width={s} height={s} fill={color} />
          ) : null
        )
      )}
    </svg>
  )
}

type QuizQuestion = {
  question: string
  hint: string
  options: string[]
  correct: string
}

function buildQuiz(): QuizQuestion[] {
  const templates = [
    (t: typeof terpenes[0]) => ({
      question: `Which terpene smells like ${t.aroma.slice(0, 2).join(' & ')}?`,
      hint: `Also found in: ${t.foundIn.slice(0, 2).join(', ')}`,
    }),
    (t: typeof terpenes[0]) => ({
      question: `Which terpene is associated with ${t.effects[0]}?`,
      hint: `Aroma: ${t.aroma.slice(0, 2).join(', ')}`,
    }),
    (t: typeof terpenes[0]) => ({
      question: `Which terpene is found in ${t.foundIn[0]}?`,
      hint: `Effects: ${t.effects.slice(0, 2).join(', ')}`,
    }),
    (t: typeof terpenes[0]) => ({
      question: `"${t.aroma.slice(0, 2).join(', ')}" aromas — which terpene?`,
      hint: `Effect: ${t.effects[0]}`,
    }),
  ]

  return [...terpenes]
    .sort(() => Math.random() - 0.5)
    .slice(0, 8)
    .map((t) => {
      const template = templates[Math.floor(Math.random() * templates.length)]
      const { question, hint } = template(t)
      const wrong = terpenes
        .filter((x) => x.name !== t.name)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((x) => x.name)
      return {
        question,
        hint,
        options: [...wrong, t.name].sort(() => Math.random() - 0.5),
        correct: t.name,
      }
    })
}

type QuizState = 'idle' | 'playing' | 'finished'

const OPTION_LABELS = ['A', 'B', 'C', 'D']

function PixelProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 8,
            background: i < current ? GBC_GREEN : GBC_DARKEST,
            border: `1px solid ${i < current ? GBC_MUTED : '#1a2e08'}`,
          }}
        />
      ))}
    </div>
  )
}

export default function TerpeneDictionary() {
  const [tab, setTab] = useState<'dict' | 'quiz'>('dict')

  const [quizState, setQuizState] = useState<QuizState>('idle')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)

  const shuffledTerpenes = useMemo(() => [...terpenes].sort(() => Math.random() - 0.5), [])

  const startQuiz = useCallback(() => {
    setQuestions(buildQuiz())
    setCurrentIndex(0)
    setScore(0)
    setSelected(null)
    setQuizState('playing')
  }, [])

  const handleAnswer = (option: string) => {
    if (selected) return
    setSelected(option)
    if (option === questions[currentIndex].correct) {
      setScore((s) => s + 1)
    }
  }

  const next = () => {
    if (currentIndex + 1 >= questions.length) {
      setQuizState('finished')
    } else {
      setCurrentIndex((i) => i + 1)
      setSelected(null)
    }
  }

  const q = questions[currentIndex]

  const scoreRating = (s: number, total: number) => {
    if (s >= total - 1) return 'EXPERT!'
    if (s >= total - 3) return 'GOOD JOB!'
    return 'KEEP STUDYING'
  }

  return (
    <div style={{
      minHeight: '100%',
      padding: '10px',
      background: '#050a04',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      boxSizing: 'border-box',
    }}>

      {/* Title poke-box */}
      <div style={{
        ...pokeBox,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
          fontSize: 13,
          color: GBC_GREEN,
        }}>
          TERPENE DICT
        </span>
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
          fontSize: 8,
          color: GBC_MUTED,
          border: `1px solid ${GBC_MUTED}`,
          padding: '2px 6px',
        }}>
          [LEARN]
        </span>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {(['dict', 'quiz'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
              fontSize: 11,
              padding: '8px 14px',
              border: tab === t ? '3px solid #84cc16' : '3px solid #2a4a08',
              boxShadow: tab === t
                ? 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010'
                : 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #1a2e08',
              background: tab === t ? 'rgba(132,204,22,0.1)' : '#0a1408',
              color: tab === t ? GBC_GREEN : GBC_MUTED,
              cursor: 'pointer',
            }}
          >
            {t === 'dict' ? 'DICTIONARY' : 'QUIZ'}
          </button>
        ))}
      </div>

      {/* Dictionary tab */}
      {tab === 'dict' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {shuffledTerpenes.map((t) => (
            <div
              key={t.name}
              style={{
                ...pokeBox,
                padding: '12px',
              }}
            >
              {/* Name row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
                borderBottom: `1px solid #1a3004`,
                paddingBottom: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TerpeneIcon name={t.name} color={t.color} />
                  <span style={{
                    fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                    fontSize: 14,
                    color: t.color,
                  }}>
                    {t.name.toUpperCase()}
                  </span>
                </div>
                <span style={{
                  fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                  fontSize: 8,
                  padding: '2px 6px',
                  border: `2px solid ${t.color}`,
                  color: t.color,
                }}>
                  {t.aroma[0].toUpperCase()}
                </span>
              </div>

              {/* Found in */}
              <p style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 9,
                color: GBC_MUTED,
                marginBottom: 8,
              }}>
                Found in: {t.foundIn.join(', ').toUpperCase()}
              </p>

              {/* Description */}
              <p style={{
                fontFamily: 'monospace',
                fontSize: 12,
                color: GBC_TEXT,
                lineHeight: 1.6,
                marginBottom: 10,
                opacity: 0.75,
              }}>
                {t.description}
              </p>

              {/* Aroma tags */}
              <div style={{ marginBottom: 8 }}>
                <p style={{
                  fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                  fontSize: 9,
                  color: GBC_MUTED,
                  marginBottom: 5,
                }}>
                  AROMA
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {t.aroma.map((a) => (
                    <span
                      key={a}
                      style={{
                        fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                        fontSize: 9,
                        padding: '2px 6px',
                        border: `2px solid ${t.color}`,
                        color: t.color,
                      }}
                    >
                      {a.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Effects tags */}
              <div>
                <p style={{
                  fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                  fontSize: 9,
                  color: GBC_MUTED,
                  marginBottom: 5,
                }}>
                  EFFECTS
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {t.effects.map((e) => (
                    <span
                      key={e}
                      style={{
                        fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                        fontSize: 9,
                        padding: '2px 6px',
                        border: `2px solid ${GBC_DARKEST}`,
                        color: GBC_TEXT,
                      }}
                    >
                      {e.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quiz tab */}
      {tab === 'quiz' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Idle screen */}
          {quizState === 'idle' && (
            <div style={{
              ...pokeBox,
              padding: '28px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 16,
            }}>
              <p style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 16,
                color: GBC_GREEN,
              }}>
                TERPENE QUIZ
              </p>
              <p style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 11,
                color: GBC_MUTED,
              }}>
                8 QUESTIONS
              </p>
              <button
                onClick={startQuiz}
                style={{
                  width: '100%',
                  fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                  fontSize: 12,
                  padding: '12px',
                  background: GBC_GREEN,
                  color: '#050a04',
                  border: '3px solid #84cc16',
                  boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
                  cursor: 'pointer',
                }}
              >
                ► START QUIZ
              </button>
            </div>
          )}

          {/* Playing */}
          {quizState === 'playing' && q && (
            <>
              {/* Progress poke-box */}
              <div style={{
                ...pokeBox,
                padding: '10px 12px',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}>
                  <span style={{
                    fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                    fontSize: 10,
                    color: GBC_GREEN,
                  }}>
                    Q.{currentIndex + 1} / {questions.length}
                  </span>
                  <span style={{
                    fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                    fontSize: 10,
                    color: GBC_MUTED,
                  }}>
                    SCORE: {score}
                  </span>
                </div>
                <PixelProgressBar current={currentIndex} total={questions.length} />
              </div>

              {/* Question poke-box */}
              <div style={{
                ...pokeBox,
                padding: '12px',
              }}>
                <p style={{
                  fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                  fontSize: 12,
                  color: GBC_TEXT,
                  lineHeight: 1.8,
                  marginBottom: 8,
                }}>
                  {q.question.toUpperCase()}
                </p>
                <p style={{
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: GBC_MUTED,
                }}>
                  {q.hint}
                </p>
              </div>

              {/* Answer poke-box */}
              <div style={{
                ...pokeBox,
                padding: '12px',
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                  marginBottom: selected ? 10 : 0,
                }}>
                  {q.options.map((opt, idx) => {
                    let borderColor = GBC_DARKEST
                    let bg = 'transparent'
                    let color = GBC_TEXT

                    if (selected) {
                      if (opt === q.correct) {
                        borderColor = GBC_GREEN
                        bg = 'rgba(132,204,22,0.15)'
                        color = GBC_GREEN
                      } else if (opt === selected && opt !== q.correct) {
                        borderColor = '#f59e0b'
                        bg = 'rgba(245,158,11,0.15)'
                        color = '#f59e0b'
                      } else {
                        borderColor = GBC_DARKEST
                        color = GBC_MUTED
                      }
                    }

                    return (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(opt)}
                        disabled={!!selected}
                        style={{
                          textAlign: 'left',
                          padding: '8px 10px',
                          border: `3px solid ${borderColor}`,
                          background: bg,
                          color,
                          cursor: selected ? 'default' : 'pointer',
                          fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                          fontSize: 10,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span style={{ color: GBC_MUTED, flexShrink: 0 }}>[{OPTION_LABELS[idx]}]</span>
                        {opt.toUpperCase()}
                      </button>
                    )
                  })}
                </div>

                {selected && (
                  <button
                    onClick={next}
                    style={{
                      width: '100%',
                      fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                      fontSize: 11,
                      padding: '10px',
                      background: GBC_GREEN,
                      color: '#050a04',
                      border: '3px solid #84cc16',
                      boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
                      cursor: 'pointer',
                    }}
                  >
                    {currentIndex + 1 >= questions.length ? '► SEE RESULTS' : '► NEXT'}
                  </button>
                )}
              </div>
            </>
          )}

          {/* Finished */}
          {quizState === 'finished' && (
            <div style={{
              ...pokeBox,
              padding: '28px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 16,
            }}>
              <p style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 14,
                color: GBC_GREEN,
              }}>
                QUIZ COMPLETE
              </p>
              <p style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 28,
                color: GBC_GREEN,
                lineHeight: 1,
              }}>
                {score} / {questions.length}
              </p>
              <p style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 12,
                color: score >= questions.length - 1
                  ? GBC_GREEN
                  : score >= questions.length - 3
                    ? '#f59e0b'
                    : GBC_MUTED,
              }}>
                {scoreRating(score, questions.length)}
              </p>
              <button
                onClick={startQuiz}
                style={{
                  width: '100%',
                  fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                  fontSize: 12,
                  padding: '12px',
                  background: GBC_GREEN,
                  color: '#050a04',
                  border: '3px solid #84cc16',
                  boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
                  cursor: 'pointer',
                }}
              >
                ► PLAY AGAIN
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  )
}
