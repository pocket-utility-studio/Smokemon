import { useState, useEffect, useCallback } from 'react'
import { useStrainDb, displayName } from '../hooks/useStrainDb'
import type { StrainRecord } from '../hooks/useStrainDb'

const FONT = "'PokemonGb', 'Press Start 2P', monospace"
const GBC_BG = '#050a04'
const GBC_TEXT = '#c8e890'
const GBC_MUTED = '#4a7a10'
const GBC_DARKEST = '#2a4a08'
const GBC_GREEN = '#84cc16'
const GBC_BOX = '#0a1408'
const GBC_AMBER = '#f59e0b'
const GBC_VIOLET = '#a78bfa'
const GBC_RED = '#e84040'

const HS_KEY = 'utilhub_quiz_highscore'

// First 4 pages of the Smokedex — quiz only uses these 80 strains
const POPULAR_STRAINS: string[] = [
  'OG Kush', 'Blue Dream', 'Sour Diesel', 'Girl Scout Cookies', 'Jack Herer',
  'White Widow', 'AK-47', 'Northern Lights', 'Gelato', 'Gorilla Glue #4',
  'Pineapple Express', 'Granddaddy Purple', 'Purple Haze', 'Super Silver Haze',
  'Trainwreck', 'Blueberry', 'Amnesia Haze', 'Cheese', 'Skunk #1', 'Bubba Kush',
  'Strawberry Cough', 'Durban Poison', 'Hindu Kush', 'Wedding Cake', 'Runtz',
  'Do-Si-Dos', 'Bruce Banner', 'Zkittlez', 'Tangie', 'Gelato 41',
  'Green Crack', 'LA Confidential', 'Lemon Haze', 'Maui Wowie', 'NYC Diesel',
  'Purple Kush', 'Super Lemon Haze', 'Animal Cookies', 'Chemdawg', 'Fire OG',
  'Grapefruit', 'Harlequin', 'Jack the Ripper', 'Lemon OG', 'Obama Kush',
  'Skywalker OG', 'Sunset Sherbet', 'White Fire OG', 'Chocolope', 'Gushers',
  'Biscotti', 'MAC 1', 'Triangle Kush', 'Platinum OG', 'Lemon Skunk',
  'Strawberry Banana', 'Blue Cheese', 'Cherry Pie', 'Headband', 'Mimosa',
  'Ice Cream Cake', 'Alien OG', 'Critical Mass', 'Death Star', 'Forbidden Fruit',
  'Tropicana Cookies', 'Blue Cookies', 'Sour OG', 'Larry Bird', 'Papaya',
  'Sherbet', 'Pink Kush', 'Black Diamond', 'Banana OG', 'Cookies and Cream',
  'Cereal Milk', 'Jealousy', 'Gary Payton', 'London Pound Cake', 'Purple Punch',
]

interface Question {
  type: 'A' | 'B' | 'C'
  prompt: string
  options: string[]
  correct: string
  fact?: string
}

type Phase = 'idle' | 'answering' | 'feedback' | 'complete'

function typeColor(t?: string): string {
  if (t === 'sativa') return GBC_GREEN
  if (t === 'indica') return GBC_VIOLET
  if (t === 'hybrid') return GBC_AMBER
  return GBC_MUTED
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}


function generateQuestions(db: StrainRecord[], count = 10): Question[] {
  if (db.length < 4) return []

  const usedStrains = new Set<string>()
  const questions: Question[] = []

  // Count how many of each type we want
  const wantA = Math.round(count * 0.5)
  const wantBC = count - wantA
  const wantB = Math.round(wantBC * 0.5)
  const wantC = wantBC - wantB

  // Strains with known types
  const typedStrains = db.filter(
    (s) => s.Type === 'sativa' || s.Type === 'indica' || s.Type === 'hybrid'
  )

  // Strains with enough terpene data
  const terpeneStrains = db.filter((s) => {
    const ts = (s.terpenes || '').split(',').map((t) => t.trim()).filter(Boolean)
    return ts.length >= 2
  })

  // All terpene values (for distractor pool)
  const allTerpeneSet = new Set<string>()
  db.forEach((s) => {
    ;(s.terpenes || '').split(',').forEach((t) => {
      const trimmed = t.trim()
      if (trimmed) allTerpeneSet.add(trimmed)
    })
  })
  const allTerpenes = Array.from(allTerpeneSet)

  // Strains with effects
  const effectStrains = db.filter((s) => {
    const effects = (s.Effects || '').split(',').map((e) => e.trim()).filter(Boolean)
    return effects.length >= 1
  })

  // Generate Type A questions
  let aCount = 0
  const shuffledTyped = shuffle(typedStrains)
  for (const strain of shuffledTyped) {
    if (aCount >= wantA) break
    const key = strain.Strain
    if (usedStrains.has(key)) continue
    usedStrains.add(key)
    const name = displayName(strain).toUpperCase()
    const correct = strain.Type.toUpperCase()
    const options = shuffle(['SATIVA', 'INDICA', 'HYBRID'])
    questions.push({
      type: 'A',
      prompt: `WHAT TYPE IS ${name}?`,
      options,
      correct,
      fact: `${name} IS A ${correct}.`,
    })
    aCount++
  }

  // Generate Type B questions
  let bCount = 0
  const shuffledTerpene = shuffle(terpeneStrains)
  for (const strain of shuffledTerpene) {
    if (bCount >= wantB) break
    const key = strain.Strain
    if (usedStrains.has(key)) continue
    const ts = (strain.terpenes || '').split(',').map((t) => t.trim()).filter(Boolean)
    if (ts.length < 2) continue
    const correct = ts[0]
    // 3 distractors from other terpenes
    const pool = allTerpenes.filter((t) => t !== correct)
    if (pool.length < 3) continue
    const distractors = shuffle(pool).slice(0, 3)
    const options = shuffle([correct, ...distractors])
    usedStrains.add(key)
    const name = displayName(strain).toUpperCase()
    questions.push({
      type: 'B',
      prompt: `WHICH TERPENE IS #1 IN ${name}?`,
      options,
      correct,
      fact: `TOP TERPENE IN ${name}: ${correct.toUpperCase()}.`,
    })
    bCount++
  }

  // Generate Type C questions
  let cCount = 0
  const shuffledEffect = shuffle(effectStrains)
  for (const strain of shuffledEffect) {
    if (cCount >= wantC) break
    const key = strain.Strain
    if (usedStrains.has(key)) continue
    const effects = (strain.Effects || '').split(',').map((e) => e.trim()).filter(Boolean)
    if (effects.length === 0) continue
    const effect = effects[0].toUpperCase()
    // 3 strains that don't have this effect
    const distractorPool = db.filter((s) => {
      if (usedStrains.has(s.Strain) && s.Strain !== key) return false
      const sEffects = (s.Effects || '').toUpperCase()
      return !sEffects.includes(effect) && s.Strain !== key
    })
    if (distractorPool.length < 3) continue
    const distractors = shuffle(distractorPool).slice(0, 3)
    const correctName = displayName(strain).toUpperCase().slice(0, 16)
    const optionStrains = shuffle([strain, ...distractors])
    const options = optionStrains.map((s) => displayName(s).toUpperCase().slice(0, 16))
    usedStrains.add(key)
    questions.push({
      type: 'C',
      prompt: `THIS STRAIN IS KNOWN FOR "${effect}". WHICH IS IT?`,
      options,
      correct: correctName,
      fact: `${displayName(strain).toUpperCase()} IS KNOWN FOR ${effect}.`,
    })
    cCount++
  }

  // Shuffle final list and trim to count
  return shuffle(questions).slice(0, count)
}

function ratingText(score: number): string {
  if (score === 10) return 'PERFECT! MASTER GROWER'
  if (score >= 8) return 'EXCELLENT! STRAIN EXPERT'
  if (score >= 6) return 'GOOD! EXPERIENCED TRAINER'
  if (score >= 4) return 'OK. KEEP STUDYING'
  return 'NEEDS WORK. HIT THE DEX'
}

export default function StrainQuiz() {
  const { db, loading } = useStrainDb()

  const [phase, setPhase] = useState<Phase>('idle')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState<number>(() => {
    const v = localStorage.getItem(HS_KEY)
    return v !== null ? parseInt(v, 10) : 0
  })
  const [isNewHigh, setIsNewHigh] = useState(false)
  const [flash, setFlash] = useState(false)

  // Flash animation for new high score
  useEffect(() => {
    if (!isNewHigh) return
    const id = setInterval(() => setFlash((f) => !f), 500)
    return () => clearInterval(id)
  }, [isNewHigh])

  const startQuiz = useCallback(() => {
    const popularLower = new Set(POPULAR_STRAINS.map((s) => s.toLowerCase()))
    const filteredDb = db.filter((s) => popularLower.has(s.Strain.toLowerCase()))
    const pool = filteredDb.length >= 4 ? filteredDb : db
    const qs = generateQuestions(pool, 10)
    if (qs.length === 0) return
    setQuestions(qs)
    setCurrentIdx(0)
    setSelected(null)
    setScore(0)
    setIsNewHigh(false)
    setPhase('answering')
  }, [db])

  const handleAnswer = useCallback(
    (option: string) => {
      if (phase !== 'answering') return
      setSelected(option)
      const correct = questions[currentIdx].correct
      const isCorrect = option === correct
      const newScore = isCorrect ? score + 1 : score
      if (isCorrect) setScore(newScore)
      setPhase('feedback')

      // Auto-advance after 1.5s
      const next = currentIdx + 1
      setTimeout(() => {
        if (next >= questions.length) {
          // Complete
          const finalScore = newScore
          if (finalScore > highScore) {
            localStorage.setItem(HS_KEY, String(finalScore))
            setHighScore(finalScore)
            setIsNewHigh(true)
          }
          setPhase('complete')
        } else {
          setCurrentIdx(next)
          setSelected(null)
          setPhase('answering')
        }
      }, 1500)
    },
    [phase, questions, currentIdx, score, highScore]
  )

  const currentQuestion = questions[currentIdx] ?? null

  // Shared styles
  const containerStyle: React.CSSProperties = {
    fontFamily: FONT,
    background: GBC_BG,
    color: GBC_TEXT,
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '12px',
    boxSizing: 'border-box',
    gap: '10px',
    overflowY: 'auto',
  }

  const pokeBoxStyle: React.CSSProperties = {
    border: `3px solid ${GBC_GREEN}`,
    boxShadow: `inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010`,
    background: GBC_BOX,
    padding: '12px',
  }

  const btnBase: React.CSSProperties = {
    fontFamily: FONT,
    fontSize: '8px',
    cursor: 'pointer',
    border: `2px solid ${GBC_DARKEST}`,
    background: GBC_BOX,
    color: GBC_TEXT,
    width: '100%',
    minHeight: '50px',
    padding: '10px 8px',
    textAlign: 'left',
    lineHeight: '1.6',
    display: 'flex',
    alignItems: 'center',
    letterSpacing: '0.05em',
    gap: '8px',
    boxSizing: 'border-box',
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none',
  }

  // ── HEADER ──────────────────────────────────────────────────────────────────
  const header = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `2px solid ${GBC_GREEN}`,
        paddingBottom: '8px',
      }}
    >
      <span style={{ fontFamily: FONT, fontSize: '10px', color: GBC_GREEN }}>
        STRAIN QUIZ
      </span>
      <span
        style={{
          fontFamily: FONT,
          fontSize: '7px',
          color: GBC_AMBER,
          border: `1px solid ${GBC_AMBER}`,
          padding: '3px 6px',
          background: GBC_BOX,
        }}
      >
        BEST: {highScore}/10
      </span>
    </div>
  )

  // ── IDLE ────────────────────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <div style={containerStyle}>
        {header}

        {loading ? (
          <div
            style={{
              color: GBC_MUTED,
              fontFamily: FONT,
              fontSize: '8px',
              textAlign: 'center',
              marginTop: '24px',
            }}
          >
            LOADING DB...
          </div>
        ) : (
          <>
            <div style={{ ...pokeBoxStyle, textAlign: 'center', gap: '10px', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: '9px',
                  color: GBC_GREEN,
                  letterSpacing: '0.08em',
                  marginBottom: '6px',
                }}
              >
                TRAINER SCHOOL
              </div>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: '7px',
                  color: GBC_TEXT,
                  lineHeight: '1.8',
                }}
              >
                TEST YOUR STRAIN KNOWLEDGE
              </div>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: '8px',
                  color: GBC_AMBER,
                  marginTop: '8px',
                }}
              >
                HIGH SCORE: {highScore}/10
              </div>
            </div>

            <div
              style={{
                fontFamily: FONT,
                fontSize: '6px',
                color: GBC_MUTED,
                textAlign: 'center',
                lineHeight: '1.8',
                padding: '4px 0',
              }}
            >
              10 QUESTIONS · 3 TYPES{'\n'}STRAIN, TYPE & TERPENE KNOWLEDGE
            </div>

            <button
              style={{
                ...btnBase,
                justifyContent: 'center',
                fontSize: '10px',
                minHeight: '56px',
                background: GBC_DARKEST,
                border: `3px solid ${GBC_GREEN}`,
                color: GBC_GREEN,
                letterSpacing: '0.1em',
              }}
              onTouchStart={() => {}}
              onClick={startQuiz}
            >
              ► START QUIZ
            </button>
          </>
        )}
      </div>
    )
  }

  // ── COMPLETE ─────────────────────────────────────────────────────────────────
  if (phase === 'complete') {
    return (
      <div style={containerStyle}>
        {header}

        <div style={{ ...pokeBoxStyle, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{ fontFamily: FONT, fontSize: '9px', color: GBC_GREEN, letterSpacing: '0.1em' }}
          >
            QUIZ COMPLETE
          </div>

          <div
            style={{
              fontFamily: FONT,
              fontSize: '28px',
              color: GBC_TEXT,
              margin: '8px 0',
              letterSpacing: '0.05em',
            }}
          >
            {score} / 10
          </div>

          <div
            style={{
              fontFamily: FONT,
              fontSize: '7px',
              color: GBC_AMBER,
              lineHeight: '1.8',
            }}
          >
            {ratingText(score)}
          </div>

          {isNewHigh && (
            <div
              style={{
                fontFamily: FONT,
                fontSize: '8px',
                color: flash ? GBC_GREEN : GBC_TEXT,
                border: `2px solid ${GBC_GREEN}`,
                padding: '6px 10px',
                background: GBC_DARKEST,
                marginTop: '4px',
                transition: 'color 0.1s',
              }}
            >
              NEW HIGH SCORE!
            </div>
          )}
        </div>

        <button
          style={{
            ...btnBase,
            justifyContent: 'center',
            fontSize: '10px',
            minHeight: '56px',
            background: GBC_DARKEST,
            border: `3px solid ${GBC_GREEN}`,
            color: GBC_GREEN,
            letterSpacing: '0.1em',
          }}
          onTouchStart={() => {}}
          onClick={startQuiz}
        >
          ► PLAY AGAIN
        </button>

        <button
          style={{
            ...btnBase,
            justifyContent: 'center',
            fontSize: '8px',
            minHeight: '44px',
            background: GBC_BOX,
            border: `2px solid ${GBC_MUTED}`,
            color: GBC_MUTED,
          }}
          onClick={() => setPhase('idle')}
        >
          BACK TO MENU
        </button>
      </div>
    )
  }

  // ── ANSWERING / FEEDBACK ─────────────────────────────────────────────────────
  if (!currentQuestion) return null

  const q = currentQuestion
  const isTypeA = q.type === 'A'

  function optionBorderColor(opt: string): string {
    if (phase === 'feedback') {
      if (opt === q.correct) return GBC_GREEN
      if (opt === selected) return GBC_RED
      return GBC_DARKEST
    }
    if (isTypeA) return typeColor(opt.toLowerCase())
    return GBC_MUTED
  }

  function optionBg(opt: string): string {
    if (phase === 'feedback') {
      if (opt === q.correct) return '#0a1f05'
      if (opt === selected) return '#1f0505'
      return GBC_BOX
    }
    return GBC_BOX
  }

  function optionTextColor(opt: string): string {
    if (phase === 'feedback') {
      if (opt === q.correct) return GBC_GREEN
      if (opt === selected) return GBC_RED
      return GBC_MUTED
    }
    if (isTypeA) return typeColor(opt.toLowerCase())
    return GBC_TEXT
  }

  function optionSuffix(opt: string): string {
    if (phase !== 'feedback') return ''
    if (opt === q.correct) return '  [CORRECT]'
    if (opt === selected && opt !== q.correct) return '  [WRONG]'
    return ''
  }

  return (
    <div style={containerStyle}>
      {header}

      {/* Progress + score */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: FONT,
          fontSize: '7px',
        }}
      >
        <span style={{ color: GBC_MUTED }}>
          Q {currentIdx + 1}/10
        </span>
        <span style={{ color: GBC_TEXT }}>
          SCORE: {score}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: '4px',
          background: GBC_DARKEST,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${((currentIdx) / 10) * 100}%`,
            background: GBC_GREEN,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Question prompt */}
      <div
        style={{
          ...pokeBoxStyle,
          fontFamily: FONT,
          fontSize: '8px',
          color: GBC_TEXT,
          lineHeight: '1.8',
          minHeight: '72px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {q.prompt}
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {q.options.map((opt) => (
          <button
            key={opt}
            style={{
              ...btnBase,
              border: `2px solid ${optionBorderColor(opt)}`,
              background: optionBg(opt),
              color: optionTextColor(opt),
              opacity: phase === 'feedback' && opt !== q.correct && opt !== selected ? 0.5 : 1,
              pointerEvents: phase === 'feedback' ? 'none' : 'auto',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onTouchStart={() => {}}
            onClick={() => handleAnswer(opt)}
            disabled={phase === 'feedback'}
          >
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                border: `2px solid ${optionBorderColor(opt)}`,
                flexShrink: 0,
                background:
                  phase === 'feedback' && opt === q.correct
                    ? GBC_GREEN
                    : phase === 'feedback' && opt === selected
                    ? GBC_RED
                    : 'transparent',
              }}
            />
            {opt}
            {optionSuffix(opt)}
          </button>
        ))}
      </div>

      {/* Feedback fact */}
      {phase === 'feedback' && q.fact && (
        <div
          style={{
            fontFamily: FONT,
            fontSize: '6px',
            color: GBC_MUTED,
            lineHeight: '1.8',
            padding: '6px 8px',
            border: `1px solid ${GBC_DARKEST}`,
            background: GBC_BOX,
          }}
        >
          {q.fact}
        </div>
      )}

      {phase === 'feedback' && (
        <div
          style={{
            fontFamily: FONT,
            fontSize: '6px',
            color: GBC_MUTED,
            textAlign: 'center',
          }}
        >
          ADVANCING...
        </div>
      )}
    </div>
  )
}
