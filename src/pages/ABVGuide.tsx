import { useState } from 'react'
import {
  Info,
  Pill, Coffee, FlaskConical, Leaf, Droplets, Waves,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const GBC_GREEN = '#84cc16'
const GBC_TEXT = '#c8e890'
const GBC_MUTED = '#4a7a10'
const GBC_AMBER = '#f59e0b'

const pokeBox = {
  border: '3px solid #84cc16',
  boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
  background: '#0a1408',
}

const methods: {
  name: string
  icon: LucideIcon
  iconColor: string
  difficulty: 'Easy' | 'Medium' | 'Advanced'
  time: string
  materials: string[]
  description: string
  tips: string[]
}[] = [
  {
    name: 'Gel Capsules',
    icon: Pill,
    iconColor: GBC_GREEN,
    difficulty: 'Easy',
    time: '10 min',
    materials: ['AVB', 'Empty gel capsules (size 00)', 'Small funnel or toothpick', 'Coconut oil (optional)'],
    description:
      'The simplest ABV method. Fill empty gel capsules with your ground AVB and swallow like a supplement. Effects take 1–2 hours but last significantly longer than vaping.',
    tips: [
      'Mix with melted coconut oil first for better cannabinoid absorption',
      'Start with 0.3–0.5g per capsule until you know your tolerance',
      'Store caps in a dark, cool place — they keep for months',
    ],
  },
  {
    name: 'Cannabis Tea',
    icon: Coffee,
    iconColor: GBC_GREEN,
    difficulty: 'Easy',
    time: '20 min',
    materials: ['AVB', 'Full-fat milk or coconut milk', 'Water', 'Tea bag (optional)', 'Honey to taste'],
    description:
      'Steep AVB in hot water with a fat source. Cannabinoids are fat-soluble, so full-fat milk is essential — without it, most of the goodness goes down the drain.',
    tips: [
      "Simmer on low for 15+ mins — don't boil",
      'Strain through a coffee filter or cheesecloth before drinking',
      'The taste is earthy; strong tea or honey masks it well',
      'Effects hit in 45–90 mins',
    ],
  },
  {
    name: 'Alcohol Tincture',
    icon: FlaskConical,
    iconColor: GBC_AMBER,
    difficulty: 'Medium',
    time: '2–4 weeks',
    materials: ['AVB', 'High-proof alcohol (Everclear or vodka 95%+)', 'Mason jar', 'Cheesecloth', 'Dropper bottle'],
    description:
      'Soak AVB in high-proof alcohol for weeks, shaking daily. Strain and store in a dropper bottle. Place drops under the tongue for fast-acting, measured effects — ideal for precise dosing.',
    tips: [
      'Keep the jar in a cool, dark cupboard while soaking',
      'Shake once daily for best extraction',
      'Start with 5–10 drops under the tongue and wait an hour',
      'Use Everclear (95%) not standard vodka for maximum extraction',
    ],
  },
  {
    name: 'Twaxing',
    icon: Leaf,
    iconColor: GBC_GREEN,
    difficulty: 'Easy',
    time: '2 min',
    materials: ['AVB', 'Fresh flower', 'Pipe, bong, or rolling papers'],
    description:
      'Sprinkle AVB directly into a bowl with fresh flower, or inside a joint. A quick way to use up small amounts of AVB while adding potency to your regular session.',
    tips: [
      'Mix thoroughly with fresh flower for an even burn',
      'Use with pungent flower to mask the stale AVB taste',
      'Great for low-ABV sessions — AVB is already partially decarbed',
    ],
  },
  {
    name: 'Topical Salve',
    icon: Droplets,
    iconColor: GBC_AMBER,
    difficulty: 'Medium',
    time: '2–3 hrs',
    materials: ['AVB', 'Coconut oil', 'Beeswax pellets', 'Double boiler', 'Cheesecloth', 'Small tins or jars'],
    description:
      "Infuse AVB into coconut oil using low heat, strain it, then combine with melted beeswax to make a firm salve. Apply directly to sore muscles or joints. No psychoactive effect — cannabinoids don't cross the skin barrier to the bloodstream.",
    tips: [
      '1:1 coconut oil to beeswax ratio = firm salve texture',
      'Add a few drops of lavender or peppermint essential oil for scent',
      'Infuse on very low heat (60–70 C) for 2 hours — do not overheat',
      'Perfect for muscle recovery and localised pain relief',
    ],
  },
  {
    name: 'Cannabis Bath Soak',
    icon: Waves,
    iconColor: GBC_GREEN,
    difficulty: 'Easy',
    time: '5 min prep',
    materials: ['AVB', 'Epsom salts', 'Coconut oil or bath oil', 'Muslin/cheesecloth bag', 'Essential oils (optional)'],
    description:
      'Fill a muslin bag with AVB and Epsom salts, tie it shut, and hang it under the hot tap as your bath fills. The heat and bath oils pull terpenes and cannabinoids through your skin for topical relaxation.',
    tips: [
      'No psychoactive effect — purely topical',
      'Squeeze the bag occasionally while soaking',
      'Add lavender or eucalyptus essential oil to the bath',
      'Great for recovery after exercise or a hard day',
    ],
  },
]

export default function ABVGuide() {
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggle = (name: string) => {
    setExpanded((prev) => (prev === name ? null : name))
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
          AVB GUIDE
        </span>
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
          fontSize: 8,
          color: GBC_MUTED,
          border: `1px solid ${GBC_MUTED}`,
          padding: '2px 6px',
        }}>
          [HOW-TO]
        </span>
      </div>

      {/* Info poke-box */}
      <div style={{
        ...pokeBox,
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        flexShrink: 0,
      }}>
        <Info size={14} color={GBC_MUTED} style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{
          fontFamily: 'monospace',
          fontSize: 11,
          color: GBC_TEXT,
          opacity: 0.7,
          lineHeight: 1.6,
          margin: 0,
        }}>
          Already Vaped Bud (AVB) still contains a significant amount of cannabinoids — typically 30–50% of the original THC. These methods let you extract that value without eating edibles.
        </p>
      </div>

      {/* Methods: single column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {methods.map((m) => {
          const isOpen = expanded === m.name
          const Icon = m.icon
          const isEasy = m.difficulty === 'Easy'
          const diffColor = isEasy ? GBC_GREEN : GBC_AMBER

          return (
            <div
              key={m.name}
              style={{
                border: isOpen ? '3px solid #4a8a10' : '3px solid #2a4a08',
                boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #1a3a08',
                background: '#0a1408',
                overflow: 'hidden',
              }}
            >
              {/* Header button */}
              <button
                onClick={() => toggle(m.name)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderBottom: isOpen ? '1px solid #1a3004' : 'none',
                  boxSizing: 'border-box',
                }}
              >
                {/* Icon box */}
                <div style={{
                  width: 36,
                  height: 36,
                  border: `2px solid #2a4a08`,
                  background: '#050a04',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={16} color={m.iconColor} />
                </div>

                {/* Name + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                    fontSize: 12,
                    color: GBC_TEXT,
                    marginBottom: 5,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {m.name.toUpperCase()}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                      fontSize: 8,
                      padding: '2px 5px',
                      border: `2px solid ${diffColor}`,
                      color: diffColor,
                    }}>
                      {m.difficulty.toUpperCase()}
                    </span>
                    <span style={{
                      fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                      fontSize: 8,
                      color: GBC_MUTED,
                    }}>
                      {m.time.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Expand indicator */}
                <span style={{
                  fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                  fontSize: 12,
                  color: GBC_MUTED,
                  flexShrink: 0,
                }}>
                  {isOpen ? '[-]' : '[+]'}
                </span>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 12 }}>

                  {/* Description */}
                  <p style={{
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: GBC_TEXT,
                    lineHeight: 1.7,
                    margin: 0,
                  }}>
                    {m.description}
                  </p>

                  {/* Materials */}
                  <div>
                    <p style={{
                      fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                      fontSize: 8,
                      color: GBC_MUTED,
                      marginBottom: 8,
                    }}>
                      YOU WILL NEED
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {m.materials.map((mat) => (
                        <li
                          key={mat}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 8,
                            fontFamily: 'monospace',
                            fontSize: 12,
                            color: GBC_TEXT,
                            lineHeight: 1.5,
                          }}
                        >
                          <span style={{ color: GBC_GREEN, flexShrink: 0 }}>·</span>
                          {mat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tips */}
                  <div>
                    <p style={{
                      fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                      fontSize: 8,
                      color: GBC_MUTED,
                      marginBottom: 8,
                    }}>
                      TIPS
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {m.tips.map((tip) => (
                        <li
                          key={tip}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 8,
                            fontFamily: 'monospace',
                            fontSize: 12,
                            color: GBC_TEXT,
                            lineHeight: 1.5,
                          }}
                        >
                          <span style={{ color: GBC_GREEN, flexShrink: 0, marginTop: 1 }}>·</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}
