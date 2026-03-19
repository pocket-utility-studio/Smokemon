/**
 * BudSprite.tsx
 * Cannabis bud images — 13 PNG variants served from /public.
 * Variant chosen deterministically from strain name hash + optional context keywords.
 */

// ── Image URL helper ──────────────────────────────────────────────────────────

function budImageUrl(n: number): string {
  return n === 1 ? '/Smokemon/Bud1.png' : `/Smokemon/bud${n}.png`
}

// 24 named designs mapped to image numbers 1–13
// Bud1=tall green sativa, bud2=fluffy sage, bud3=dense brown/earthy,
// bud4=purple flower, bud5=green+blue pistils, bud6=frosty white,
// bud7=dark navy/midnight, bud8=pink/lavender, bud9=yellow-green,
// bud10=dark purple clusters, bud11=multicolor leaf, bud12=spiky green leafy, bud13=small simple nugget
const DESIGN_TO_IMAGE: Record<string, number> = {
  sativa_green:    1,   // tall narrow green
  indica_sage:     2,   // fluffy sage/grey-green
  og_kush:         3,   // dense earthy brown
  hindu_afghani:   3,   // dense earthy
  orange_clusters: 3,   // dense clusters
  orange_dense:    3,   // dense
  fire_og:         3,   // dense earthy
  purple_indica:   4,   // purple flower
  blueberry:       5,   // blue-green pistils
  teal_hybrid:     5,   // teal/blue
  crystal_white:   6,   // frosty white
  sativa_powder:   6,   // pale/cloudy
  dark_navy:       7,   // dark navy
  midnight_hybrid: 7,   // dark midnight blue
  lavender_pink:   8,   // pink/lavender
  lemon_green:     9,   // yellow-green
  cheese:          9,   // creamy yellow-green
  golden_haze:     9,   // golden amber
  purple_rock:     10,  // dark purple dense clusters
  gelato:          11,  // multi-tone colorful
  sativa_autumn:   12,  // mixed color leafy spiky
  long_pistil:     12,  // spiky/hairy
  fluffy_landrace: 12,  // loose spiky structure
  popcorn_bud:     13,  // small simple nugget
}

// ── Design selection ──────────────────────────────────────────────────────────

export interface BudContext {
  description?: string
  effects?:     string
  terpenes?:    string
  history?:     string
  flavor?:      string
  notes?:       string
}

function nameHash(name: string): number {
  return [...name].reduce((h, c) => ((h * 31 + c.charCodeAt(0)) >>> 0) & 0xffff, 0)
}

/**
 * Keyword → design mapping.
 * Each entry lists the words/phrases that strongly suggest a particular bud design.
 * Matched against the full combined context text (description + effects + terpenes etc.)
 */
const DESIGN_KEYWORDS: Record<string, string[]> = {
  crystal_white:   ['crystal', 'frost', 'frosty', 'trichome', 'icy', 'white', 'snow', 'sugar coat', 'sugary', 'frozen', 'sparkl', 'glitter'],
  lemon_green:     ['lemon', 'lime', 'citrus', 'zest', 'tangy', 'yellow', 'sour', 'tart', 'limonene'],
  purple_rock:     ['deep purple', 'very purple', 'dark purple', 'dense purple', 'plum', 'dark grape', 'almost black'],
  purple_indica:   ['purple', 'grape', 'violet', 'amethyst', 'anthocyanin'],
  dark_navy:       ['black', 'coal', 'jet ', 'very dark', 'extremely dark', 'blacken', 'jet black'],
  blueberry:       ['blueberry', 'cobalt', 'indigo', 'ocean blue', 'blue hue', 'blue tint', 'blue'],
  lavender_pink:   ['pink', 'lavender', 'rose', 'floral', 'jasmine', 'blossom', 'petal', 'floral aroma'],
  orange_clusters: ['orange', 'tangerine', 'apricot', 'peach', 'mandarin', 'mango', 'myrcene'],
  orange_dense:    ['dense orange', 'deep orange', 'burnt orange', 'dark amber', 'rich amber'],
  fire_og:         ['fire', 'fiery', 'hot', 'pepper', 'spicy', 'sharp', 'chili', 'caryophyllene', 'red hair'],
  gelato:          ['gelato', 'dessert', 'candy', 'cookie', 'vanilla', 'sherbet', 'ice cream', 'sweet cream', 'waffle'],
  cheese:          ['cheese', 'cheesy', 'funky', 'dairy', 'savory', 'sharp cheese'],
  teal_hybrid:     ['teal', 'mint', 'menthol', 'aqua', 'minty', 'cool', 'refreshing', 'pinene', 'terpinolene'],
  golden_haze:     ['haze', 'golden', 'soaring', 'cerebral', 'uplifting', 'euphoric', 'gold', 'amber glow', 'heady'],
  og_kush:         ['kush', 'pine', 'piney', 'earthy', 'woody', 'forest', 'resin', 'og ', 'resinous', 'humulene'],
  hindu_afghani:   ['afghan', 'hash', 'hashish', 'ancient', 'pungent', 'incense', 'heavy resin', 'old world'],
  fluffy_landrace: ['fluffy', 'airy', 'wispy', 'landrace', 'heritage', 'traditional', 'loose structure', 'open structure'],
  sativa_powder:   ['powdery', 'cloud', 'delicate', 'feathery', 'linalool', 'light bud'],
  popcorn_bud:     ['popcorn', 'small bud', 'nugget', 'mini bud', 'larfy', 'larfy bud'],
  long_pistil:     ['pistil', 'orange hair', 'red pistil', 'hairy', 'long pist', 'prominent hair'],
  sativa_autumn:   ['autumn', 'fall color', 'two-tone', 'mixed color', 'warm spice', 'spiced'],
  sativa_green:    ['bright green', 'vibrant green', 'lime green', 'kelly green', 'vivid green'],
  midnight_hybrid: ['midnight', 'deep blue', 'dark blue', 'oceanic', 'abyss', 'dark teal'],
  indica_sage:     ['sage', 'muted green', 'grey green', 'forest green', 'olive', 'moss'],
}

function selectDesignFromContext(text: string, nameH: number): string | null {
  const lower = text.toLowerCase()

  const scores: [string, number][] = Object.entries(DESIGN_KEYWORDS).map(([design, keywords]) => [
    design,
    keywords.reduce((n, kw) => n + (lower.includes(kw) ? 1 : 0), 0),
  ])

  const max = Math.max(...scores.map(([, s]) => s))
  if (max === 0) return null

  const top = scores.filter(([, s]) => s === max).map(([d]) => d)
  return top[nameH % top.length]
}

const TYPE_FALLBACK: Record<string, string[]> = {
  sativa: [
    'sativa_green',
    'sativa_powder',
    'sativa_autumn',
    'lemon_green',
    'long_pistil',
    'fluffy_landrace',
    'crystal_white',
    'golden_haze',
  ],
  indica: [
    'indica_sage',
    'purple_indica',
    'purple_rock',
    'dark_navy',
    'og_kush',
    'blueberry',
    'cheese',
    'hindu_afghani',
  ],
  hybrid: [
    'orange_clusters',
    'orange_dense',
    'teal_hybrid',
    'midnight_hybrid',
    'lavender_pink',
    'gelato',
    'popcorn_bud',
    'fire_og',
  ],
}

// All 24 design keys in display order (grouped by visual theme)
export const ALL_BUD_DESIGNS: string[] = [
  'sativa_green',   'lemon_green',    'long_pistil',    'fluffy_landrace',
  'sativa_autumn',  'crystal_white',  'golden_haze',    'sativa_powder',
  'purple_indica',  'purple_rock',    'dark_navy',      'midnight_hybrid',
  'blueberry',      'indica_sage',    'og_kush',        'hindu_afghani',
  'orange_clusters','orange_dense',   'fire_og',        'cheese',
  'teal_hybrid',    'lavender_pink',  'gelato',         'popcorn_bud',
]

export function getBudDesign(name: string, type?: string, context?: BudContext, override?: string): string {
  // Manual override — use directly if valid
  if (override && DESIGN_TO_IMAGE[override] !== undefined) return override

  const h = nameHash(name)

  // If we have any descriptive text, let keywords drive the choice
  if (context) {
    const text = [
      context.description,
      context.effects,
      context.terpenes,
      context.history,
      context.flavor,
      context.notes,
    ].filter(Boolean).join(' ')

    if (text.trim()) {
      const contextDesign = selectDesignFromContext(text, h)
      if (contextDesign) return contextDesign
    }
  }

  // Fallback: type-based hash
  const variants = TYPE_FALLBACK[type ?? ''] ?? TYPE_FALLBACK['hybrid']
  return variants[h % variants.length]
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BudSprite({
  name,
  type,
  size = 24,
  context,
  budDesign,
}: {
  name: string
  type?: string
  size?: number
  context?: BudContext
  budDesign?: string
}) {
  const design = getBudDesign(name, type, context, budDesign)
  const imageNum = DESIGN_TO_IMAGE[design] ?? 1
  const src = budImageUrl(imageNum)

  return (
    <img
      src={src}
      alt={name}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0,
        imageRendering: 'auto',
      }}
    />
  )
}
