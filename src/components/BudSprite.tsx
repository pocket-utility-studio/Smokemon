/**
 * BudSprite.tsx
 * Pixel art cannabis bud sprites — 8×12 grid, rendered as SVG.
 *
 * 24 designs based on the 32-bit strain selector reference:
 *  - 8 sativa variants  (#1, #9s, #8s, #12, #21, #23, crystal, haze)
 *  - 8 indica variants  (#2, #7, #19, #24, kush, blueberry, cheese, afghani)
 *  - 8 hybrid variants  (#6d1, #6d2, #8h, #9h, #11, #20, #22, fire)
 *
 * Variant chosen deterministically from strain name hash.
 */

import React from 'react'

const PX   = 2    // SVG units per pixel
const COLS = 8
const ROWS = 12

interface SpriteData {
  palette: string[]  // index 0 = unused (transparent), 1–6 = colors
  pixels:  string[]  // ROWS strings of COLS digit chars (0=transparent, 1–6=palette)
}

// ── Sprite definitions ────────────────────────────────────────────────────────

const SPRITES: Record<string, SpriteData> = {

  // ════════════════════════════════════════════════════════════════════════════
  // SATIVA VARIANTS (8)
  // ════════════════════════════════════════════════════════════════════════════

  // #1 Sativa — bright kiwi green, classic narrow bud
  sativa_green: {
    palette: ['', '#182c06', '#2a4e0a', '#4a8a20', '#6ab832', '#96d840', '#e07010'],
    pixels: [
      '00245200',
      '02456420',
      '24563534',
      '42356245',
      '24563534',
      '42356245',
      '02456420',
      '02345320',
      '00345400',
      '00245300',
      '00024200',
      '00012100',
    ],
  },

  // #9 Sativa — pale blue-grey fluffy cloud-like bud
  sativa_powder: {
    palette: ['', '#303848', '#506070', '#7a98a8', '#a8c4d0', '#cce0ea', '#eef6fa'],
    pixels: [
      '00455400',
      '04554540',
      '54455445',
      '45544554',
      '54455445',
      '45544554',
      '04554540',
      '04445440',
      '00454400',
      '00354400',
      '00054000',
      '00034000',
    ],
  },

  // #8 Sativa — orange-green autumn mix
  sativa_autumn: {
    palette: ['', '#1a380a', '#2a5a10', '#d45810', '#6ab832', '#f08030', '#9cd840'],
    pixels: [
      '00453400',
      '04534340',
      '34453534',
      '54354345',
      '34453534',
      '54354345',
      '04534340',
      '04453340',
      '00453400',
      '00343400',
      '00043000',
      '00023000',
    ],
  },

  // #12 Lemon — yellow-lime bright
  lemon_green: {
    palette: ['', '#2a3400', '#4a5800', '#8a9c10', '#c0d020', '#e0f040', '#cc2808'],
    pixels: [
      '00446400',
      '04564440',
      '45444564',
      '54446445',
      '45444564',
      '54446445',
      '04564440',
      '04444540',
      '00445400',
      '00344400',
      '00044000',
      '00023000',
    ],
  },

  // #21 Long Pistil Sativa — lime green with prominent red hairs
  long_pistil: {
    palette: ['', '#1a3804', '#2d5a0a', '#5a9010', '#7ac820', '#9ae840', '#cc2808'],
    pixels: [
      '00456400',
      '04566450',
      '54466454',
      '45644545',
      '54466454',
      '45644545',
      '04566450',
      '04446440',
      '00446400',
      '00344400',
      '00044000',
      '00024000',
    ],
  },

  // #23 Fluffy Landrace — airy tall sage-green, open structure
  fluffy_landrace: {
    palette: ['', '#141e0c', '#283820', '#4e6a38', '#7a9a58', '#9aba78', '#c0d0a0'],
    pixels: [
      '00434400',
      '03434340',
      '24343432',
      '43234323',
      '24343432',
      '43234323',
      '03434340',
      '03343330',
      '00234400',
      '00343200',
      '00024200',
      '00012100',
    ],
  },

  // #10 Ultra-crystalline — icy trichome-heavy, almost white
  crystal_white: {
    palette: ['', '#4070a0', '#80a8c8', '#b0d0e8', '#d8ecf8', '#f8fcff', '#c0e8ff'],
    pixels: [
      '00555500',
      '05555550',
      '55455545',
      '45554555',
      '55455545',
      '45554555',
      '05555550',
      '05554550',
      '00555400',
      '00454500',
      '00045000',
      '00025000',
    ],
  },

  // Haze — golden amber-green sativa (invented)
  golden_haze: {
    palette: ['', '#2a1a00', '#4a3010', '#907828', '#c8b040', '#e8d068', '#fff080'],
    pixels: [
      '00445400',
      '04554640',
      '44546454',
      '54446544',
      '44546454',
      '54446544',
      '04554540',
      '04445440',
      '00445400',
      '00344400',
      '00044000',
      '00023000',
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // INDICA VARIANTS (8)
  // ════════════════════════════════════════════════════════════════════════════

  // #2 Indica — muted sage grey-green, rounded
  indica_sage: {
    palette: ['', '#141e0c', '#283820', '#4a6838', '#6a8a52', '#8aaa72', '#c8d8b0'],
    pixels: [
      '00244500',
      '02434360',
      '24343432',
      '43234323',
      '24343432',
      '43234323',
      '02434340',
      '02343420',
      '00234400',
      '00343200',
      '00024200',
      '00012100',
    ],
  },

  // #7 Indica — rich purple, medium dense
  purple_indica: {
    palette: ['', '#1a0430', '#3a1058', '#5a2088', '#7830a8', '#9848c8', '#d090f0'],
    pixels: [
      '00465400',
      '04554640',
      '54465445',
      '45644554',
      '54465445',
      '45644554',
      '04554540',
      '04445440',
      '00454400',
      '00354400',
      '00054000',
      '00034000',
    ],
  },

  // #19 Purple Rock — very dense deep purple clusters
  purple_rock: {
    palette: ['', '#10021e', '#200840', '#401068', '#6018a0', '#8028c8', '#b040e8'],
    pixels: [
      '00565500',
      '05655650',
      '56565656',
      '65656565',
      '56565656',
      '65656565',
      '05655650',
      '05565550',
      '00565500',
      '00465500',
      '00065000',
      '00035000',
    ],
  },

  // #24 Black Afghani — very dark navy-black
  dark_navy: {
    palette: ['', '#040810', '#0a1428', '#141c40', '#1e2850', '#283870', '#4050a0'],
    pixels: [
      '00344300',
      '03434330',
      '34334334',
      '43343443',
      '34334334',
      '43343443',
      '03434330',
      '03334330',
      '00334300',
      '00243300',
      '00023200',
      '00012100',
    ],
  },

  // OG Kush — dark olive/forest green indica (invented)
  og_kush: {
    palette: ['', '#0c1808', '#1e3010', '#3a5020', '#5a7038', '#7a9050', '#a0b878'],
    pixels: [
      '00344300',
      '03434430',
      '34343434',
      '43234323',
      '34343434',
      '43234323',
      '03434430',
      '03344330',
      '00344300',
      '00243300',
      '00024200',
      '00012100',
    ],
  },

  // Blueberry — blue-violet indica (invented)
  blueberry: {
    palette: ['', '#0c0820', '#1a1840', '#302870', '#4840a8', '#6860c8', '#9888e8'],
    pixels: [
      '00455400',
      '04554640',
      '54465645',
      '46564456',
      '54465645',
      '46564456',
      '04554640',
      '04445440',
      '00454400',
      '00354400',
      '00054000',
      '00034000',
    ],
  },

  // Cheese — creamy yellow-green heavy indica (invented)
  cheese: {
    palette: ['', '#302010', '#503820', '#886830', '#c0a040', '#e8c860', '#f8e890'],
    pixels: [
      '00455400',
      '04554540',
      '54455445',
      '45544554',
      '54455445',
      '45544554',
      '04554540',
      '04445440',
      '00454400',
      '00354400',
      '00054000',
      '00034000',
    ],
  },

  // Hindu Afghani — very dense grey-green indica (invented)
  hindu_afghani: {
    palette: ['', '#0c1408', '#1a2410', '#2c3c20', '#405530', '#546840', '#708060'],
    pixels: [
      '00234200',
      '02324320',
      '23232323',
      '32323232',
      '23232323',
      '32323232',
      '02324320',
      '02234220',
      '00234200',
      '00233200',
      '00022000',
      '00012000',
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // HYBRID VARIANTS (8)
  // ════════════════════════════════════════════════════════════════════════════

  // #6 design 1 — classic amber-orange round clusters
  orange_clusters: {
    palette: ['', '#401000', '#8a3000', '#d45010', '#f07820', '#ffaa50', '#ffffff'],
    pixels: [
      '00455400',
      '04554540',
      '54455445',
      '45544554',
      '54455445',
      '45544554',
      '04554540',
      '04445440',
      '00454400',
      '00354400',
      '00054000',
      '00034000',
    ],
  },

  // #6 design 2 — denser orange, more uniform
  orange_dense: {
    palette: ['', '#3c1000', '#7a2800', '#bc4800', '#e06000', '#f89040', '#ffc080'],
    pixels: [
      '00355400',
      '03554530',
      '35544554',
      '55355355',
      '35544554',
      '55355355',
      '03554530',
      '03554430',
      '00354400',
      '00355300',
      '00053000',
      '00033000',
    ],
  },

  // #8 Hybrid — teal blue-green
  teal_hybrid: {
    palette: ['', '#041818', '#082c2c', '#105050', '#208080', '#30aaaa', '#80e0e0'],
    pixels: [
      '00344300',
      '03456430',
      '34343634',
      '43436343',
      '34343634',
      '43436343',
      '03454430',
      '03344330',
      '00344300',
      '00243300',
      '00024200',
      '00012100',
    ],
  },

  // #9 Hybrid — very dark midnight blue
  midnight_hybrid: {
    palette: ['', '#040818', '#0a1028', '#101838', '#181e50', '#202860', '#303878'],
    pixels: [
      '00345300',
      '03454430',
      '34343434',
      '43434343',
      '34343434',
      '43434343',
      '03454430',
      '03344330',
      '00344300',
      '00243300',
      '00024200',
      '00012100',
    ],
  },

  // #11 Lavemon — pink lavender
  lavender_pink: {
    palette: ['', '#300838', '#581858', '#8840a0', '#c878c8', '#e8a8e8', '#ffd0ff'],
    pixels: [
      '00456400',
      '04554560',
      '54455445',
      '45644554',
      '54455445',
      '45644554',
      '04554540',
      '04445440',
      '00454400',
      '00354400',
      '00054000',
      '00034000',
    ],
  },

  // #20 Gelato — warm multicolor green-amber-gold
  gelato: {
    palette: ['', '#1a1a08', '#486018', '#e09040', '#6a9820', '#f0c860', '#c8a060'],
    pixels: [
      '00354300',
      '03543430',
      '54354354',
      '43534345',
      '35453454',
      '43534345',
      '03543430',
      '03453340',
      '00345300',
      '00354400',
      '00045000',
      '00023000',
    ],
  },

  // #22 Popcorn Bud — small compact single round cluster
  popcorn_bud: {
    palette: ['', '#1a3808', '#2a5a10', '#4a8a20', '#6ab832', '#9cd840', '#ffffff'],
    pixels: [
      '00000000',
      '00344300',
      '03453430',
      '34534543',
      '45345354',
      '34534543',
      '03453430',
      '00344300',
      '00000000',
      '00024200',
      '00024200',
      '00012100',
    ],
  },

  // Fire OG — red-orange fiery hybrid (invented)
  fire_og: {
    palette: ['', '#3c0800', '#780800', '#d41808', '#f04818', '#ff7030', '#ffa060'],
    pixels: [
      '00456400',
      '04564560',
      '54456545',
      '45664456',
      '54456545',
      '45664456',
      '04564560',
      '04556450',
      '00456400',
      '00354500',
      '00054000',
      '00034000',
    ],
  },

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

  // Score each design
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
  if (override && SPRITES[override]) return override

  const h = nameHash(name)

  // If we have any descriptive text, let keywords drive the choice (ignores type entirely)
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
  const sprite = SPRITES[design]
  if (!sprite) return null

  const naturalW = COLS * PX
  const naturalH = ROWS * PX
  const scale    = size / naturalH
  const displayW = Math.round(naturalW * scale)

  const rects: React.ReactElement[] = []

  sprite.pixels.forEach((row, rowIdx) => {
    for (let col = 0; col < COLS; col++) {
      const colorIdx = parseInt(row[col] ?? '0', 10)
      if (colorIdx === 0) continue
      const color = sprite.palette[colorIdx]
      if (!color) continue
      rects.push(
        <rect
          key={`${rowIdx}-${col}`}
          x={col * PX}
          y={rowIdx * PX}
          width={PX}
          height={PX}
          fill={color}
        />,
      )
    }
  })

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${naturalW} ${naturalH}`}
      width={displayW}
      height={size}
      style={{ imageRendering: 'pixelated', display: 'block', flexShrink: 0, transform: 'scaleY(-1)' }}
    >
      {rects}
    </svg>
  )
}
