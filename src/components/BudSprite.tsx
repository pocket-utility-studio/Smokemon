/**
 * BudSprite.tsx
 * Pixel art cannabis bud sprites — 16×24 grid, rendered as SVG.
 *
 * 24 designs based on the 32-bit strain selector reference:
 *  - 8 sativa variants  (#1, #9s, #8s, #12, #21, #23, crystal, haze)
 *  - 8 indica variants  (#2, #7, #19, #24, kush, blueberry, cheese, afghani)
 *  - 8 hybrid variants  (#6d1, #6d2, #8h, #9h, #11, #20, #22, fire)
 *
 * Variant chosen deterministically from strain name hash.
 */

import React from 'react'

const PX   = 1    // SVG units per pixel
const COLS = 32   // Scale2x from 16
const ROWS = 48   // Scale2x from 24

// Scale2x from string[] source
function scale2xFromStrings(pixels: string[]): number[][] {
  const srcRows = pixels.length
  const srcCols = pixels[0]?.length ?? 0
  const src: number[][] = pixels.map((row) =>
    Array.from({ length: srcCols }, (_, i) => parseInt(row[i] ?? '0', 16)),
  )
  return scale2xFromNumbers(src, srcRows, srcCols)
}

// Scale2x from number[][] source
function scale2xFromNumbers(src: number[][], srcRows: number, srcCols: number): number[][] {
  const out: number[][] = Array.from({ length: srcRows * 2 }, () => new Array(srcCols * 2).fill(0))
  for (let r = 0; r < srcRows; r++) {
    for (let c = 0; c < srcCols; c++) {
      const E = src[r][c]
      const B = r > 0 ? src[r - 1][c] : 0
      const D = c > 0 ? src[r][c - 1] : 0
      const F = c < srcCols - 1 ? src[r][c + 1] : 0
      const H = r < srcRows - 1 ? src[r + 1][c] : 0
      out[r * 2    ][c * 2    ] = (D === B && B !== F && D !== H) ? D : E
      out[r * 2    ][c * 2 + 1] = (B === F && B !== D && F !== H) ? F : E
      out[r * 2 + 1][c * 2    ] = (D === H && D !== B && H !== F) ? D : E
      out[r * 2 + 1][c * 2 + 1] = (H === F && D !== H && B !== F) ? F : E
    }
  }
  return out
}

interface SpriteData {
  palette: string[]  // index 0 = transparent, 1–7 = colors (7 = accent/pistil)
  pixels:  string[]  // 24 strings of 16 hex-digit chars (0=transparent, 1–7=palette)
}

// ── Sprite definitions ────────────────────────────────────────────────────────
// Palette slots: 1=darkest, 2=dark, 3=mid-dark, 4=mid, 5=mid-light, 6=light, 7=accent
// Pixels are 16 chars wide × 24 rows tall

const SPRITES: Record<string, SpriteData> = {

  // ════════════════════════════════════════════════════════════════════════════
  // SATIVA VARIANTS (8)
  // ════════════════════════════════════════════════════════════════════════════

  // #1 Sativa — bright kiwi green, tall narrow classic bud
  sativa_green: {
    palette: ['', '#182c06', '#2a4e0a', '#3d6e10', '#4a8a20', '#6ab832', '#96d840', '#e07010'],
    pixels: [
      '0000056500000000',
      '0000566560000000',
      '0005665654000000',
      '0056655645300000',
      '0565665634500000',
      '5654566356450000',
      '4565665345640000',
      '3456664356543000',
      '2345665456542000',
      '0234664556432000',
      '0023565665310000',
      '0002345654200000',
      '0000234543000000',
      '0000023432000000',
      '0000002321000000',
      '0000000210000000',
      '0000000200000000',
      '0000000100000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ],
  },

  // #9 Sativa — pale blue-grey powdery cloud bud
  sativa_powder: {
    palette: ['', '#2a3040', '#425060', '#5c7080', '#7a98a8', '#a8c4d0', '#cce0ea', '#eef6fa'],
    pixels: [
      '0000056600000000',
      '0005665650000000',
      '0056655654000000',
      '0566556645500000',
      '5665665654560000',
      '6556556556650000',
      '5665665645650000',
      '4556556556542000',
      '3445665645430000',
      '0334556644320000',
      '0023455543210000',
      '0002334432100000',
      '0000223321000000',
      '0000012210000000',
      '0000001100000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ],
  },

  // #8 Sativa — orange-green autumn two-tone
  sativa_autumn: {
    palette: ['', '#1a380a', '#2a5a10', '#3e7a18', '#6ab832', '#d45810', '#f08030', '#9cd840'],
    pixels: [
      '0000055500000000',
      '0005556560000000',
      '0054565645000000',
      '0545565543500000',
      '5655456453450000',
      '4564355345640000',
      '3453456434530000',
      '2345565456430000',
      '1235565635320000',
      '0123454544210000',
      '0012343433110000',
      '0001232332000000',
      '0000121221000000',
      '0000012110000000',
      '0000001100000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ],
  },

  // #12 Lemon — yellow-lime bright sativa
  lemon_green: {
    palette: ['', '#2a3400', '#4a5800', '#6a7c08', '#8a9c10', '#c0d020', '#e0f040', '#cc2808'],
    pixels: [
      '0000066700000000',
      '0006667660000000',
      '0066766654000000',
      '0666666643500000',
      '6667666645360000',
      '6666756456460000',
      '5666766346560000',
      '4556666456450000',
      '3445665645440000',
      '2344554534320000',
      '1234443423210000',
      '0123443322100000',
      '0012332211000000',
      '0001221100000000',
      '0000110000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ],
  },

  // #21 Long Pistil Sativa — lime green with red-orange pistils
  long_pistil: {
    palette: ['', '#1a3804', '#2d5a0a', '#426814', '#5a9010', '#7ac820', '#9ae840', '#cc2808'],
    pixels: [
      '0007056670000000',
      '0076567657000000',
      '0766567654700000',
      '7665677644670000',
      '6756667745670000',
      '5667566456560000',
      '4576756345450000',
      '3465665456340000',
      '2354554645230000',
      '1243443534120000',
      '0132432423010000',
      '0021321312000000',
      '0010210201000000',
      '0001100100000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ],
  },

  // #23 Fluffy Landrace — airy sage-green, open wispy structure
  fluffy_landrace: {
    palette: ['', '#141e0c', '#283820', '#3c5230', '#4e6a38', '#7a9a58', '#9aba78', '#c0d0a0'],
    pixels: [
      '0000045400000000',
      '0004454440000000',
      '0044343434000000',
      '0443434343400000',
      '4434343434340000',
      '3343234343330000',
      '2434343334320000',
      '1343343243210000',
      '0234334343200000',
      '0123343333100000',
      '0012233322000000',
      '0001223321000000',
      '0000122210000000',
      '0000011100000000',
      '0000001000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ],
  },

  // Crystal — icy trichome-heavy, almost white with blue tint
  crystal_white: {
    palette: ['', '#304860', '#507888', '#70a0b8', '#90c0d8', '#b8dff0', '#e0f4ff', '#ffffff'],
    pixels: [
      '0000076700000000',
      '0006777760000000',
      '0067776767000000',
      '0677677676700000',
      '6776777676760000',
      '7677676777670000',
      '6776767676760000',
      '5667676767650000',
      '4556567656540000',
      '3445456545430000',
      '2334345434320000',
      '1223234323210000',
      '0112123212100000',
      '0001012101000000',
      '0000001010000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ],
  },

  // Haze — golden amber-green sativa
  golden_haze: {
    palette: ['', '#2a1a00', '#4a3010', '#6a4c18', '#907828', '#c8b040', '#e8d068', '#fff080'],
    pixels: [
      '0000056600000000',
      '0005566650000000',
      '0055656543000000',
      '0556567543400000',
      '5566567654450000',
      '4556677564560000',
      '3455667456450000',
      '2345566345430000',
      '1234455234320000',
      '0123344133210000',
      '0012233022100000',
      '0001122011000000',
      '0000011000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // INDICA VARIANTS (8)
  // ════════════════════════════════════════════════════════════════════════════

  // #2 Indica — muted sage grey-green, dense rounded bud
  indica_sage: {
    palette: ['', '#141e0c', '#283820', '#3c5030', '#4a6838', '#6a8a52', '#8aaa72', '#c8d8b0'],
    pixels: [
      '0000056500000000',
      '0005666540000000',
      '0056566564000000',
      '0566565645500000',
      '5665665445650000',
      '6556554556650000',
      '5665665456650000',
      '4556565545640000',
      '3445565445530000',
      '2344554334420000',
      '1233443223310000',
      '0122332112200000',
      '0011221001100000',
      '0001110000000000',
      '0000100000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ],
  },

  // #7 Indica — rich purple, medium dense
  purple_indica: {
    palette: ['', '#1a0430', '#3a1058', '#54187c', '#6828a0', '#9848c8', '#c070e8', '#f0c0ff'],
    pixels: [
      '0000067600000000',
      '0006677660000000',
      '0066776766000000',
      '0667676656600000',
      '6676776656760000',
      '7666667767660000',
      '6677676656660000',
      '5566766665550000',
      '4455665554440000',
      '3344554443330000',
      '2233443332220000',
      '1122332221110000',
      '0011221110000000',
      '0001110000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ],
  },

  // #19 Purple Rock — very dense deep purple clusters
  purple_rock: {
    palette: ['', '#10021e', '#20083c', '#341260', '#501890', '#7028c0', '#9840e0', '#c060ff'],
    pixels: [
      '0000077700000000',
      '0007777770000000',
      '0077677677000000',
      '0776767766700000',
      '7767677767760000',
      '7677676767770000',
      '6777676676770000',
      '5677767767660000',
      '4567676657560000',
      '3456567546450000',
      '2345456435340000',
      '1234345324230000',
      '0123234213120000',
      '0012123102010000',
      '0001012001000000',
      '0000001000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ],
  },

  // #24 Black Afghani — very dark navy-black bud
  dark_navy: {
    palette: ['', '#040810', '#0a1428', '#121c3c', '#1e2850', '#283870', '#384890', '#5060b0'],
    pixels: [
      '0000045400000000',
      '0004455440000000',
      '0044554544000000',
      '0445454453400000',
      '4454544343450000',
      '5444534434540000',
      '4455443445440000',
      '3444534354430000',
      '2343443343320000',
      '1232332232210000',
      '0121221121100000',
      '0010110010000000',
      '0001001001000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ],
  },

  // OG Kush — dark olive/forest green dense indica
  og_kush: {
    palette: ['', '#0c1808', '#1e3010', '#2e4818', '#3a5020', '#5a7038', '#7a9050', '#a0b878'],
    pixels: [
      '0000055500000000',
      '0005556550000000',
      '0055456554000000',
      '0554554454500000',
      '5545455445540000',
      '4554554554450000',
      '3554455445430000',
      '2454554544320000',
      '1344455444210000',
      '0234345343200000',
      '0123234232100000',
      '0012123121000000',
      '0001012010000000',
      '0000001000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ],
  },

  // Blueberry — blue-violet indica with deep berry hues
  blueberry: {
    palette: ['', '#0c0820', '#1a1840', '#283060', '#384890', '#5868c8', '#7888e0', '#aab0ff'],
    pixels: [
      '0000067600000000',
      '0006677650000000',
      '0066677665000000',
      '0666766556600000',
      '6667676656670000',
      '6676776765660000',
      '5567667656560000',
      '4456566565450000',
      '3345455454340000',
      '2234344343230000',
      '1123233232120000',
      '0012122121010000',
      '0001011010000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ],
  },

  // Cheese — creamy yellow-green heavy indica
  cheese: {
    palette: ['', '#302010', '#503828', '#705040', '#886830', '#c0a040', '#e8c860', '#f8e890'],
    pixels: [
      '0000066600000000',
      '0006667660000000',
      '0066667665000000',
      '0666666556600000',
      '6666556556660000',
      '6655565665660000',
      '5566665556550000',
      '4455555665440000',
      '3344554554330000',
      '2233443443220000',
      '1122332332110000',
      '0011221221000000',
      '0001110110000000',
      '0000001000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ],
  },

  // Hindu Afghani — grey-green dense compressed hash-style indica
  hindu_afghani: {
    palette: ['', '#0c1408', '#1a2410', '#28341c', '#3c4c28', '#546840', '#6a8058', '#8a9870'],
    pixels: [
      '0000044400000000',
      '0004455440000000',
      '0044455444000000',
      '0444454444400000',
      '4444344443440000',
      '4443344444440000',
      '3444444343430000',
      '2344443344320000',
      '1234344234210000',
      '0123234123100000',
      '0012123012000000',
      '0001012001000000',
      '0000001000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // HYBRID VARIANTS (8)
  // ════════════════════════════════════════════════════════════════════════════

  // #6 design 1 — amber-orange round clusters, classic hybrid
  orange_clusters: {
    palette: ['', '#401000', '#702000', '#a03800', '#d45010', '#f07820', '#ffaa50', '#ffd090'],
    pixels: [
      '0000077700000000',
      '0007776760000000',
      '0077777677000000',
      '0777676767700000',
      '7777676767770000',
      '7677767677760000',
      '6677677676660000',
      '5566767567550000',
      '4455656456440000',
      '3344545345330000',
      '2233434234220000',
      '1122323123110000',
      '0011212012000000',
      '0001101001000000',
      '0000010000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ],
  },

  // #6 design 2 — denser burnt orange, more uniform chunky clusters
  orange_dense: {
    palette: ['', '#3c1000', '#6a2000', '#963400', '#bc4800', '#e06000', '#f89040', '#ffc080'],
    pixels: [
      '0000077700000000',
      '0007777770000000',
      '0077677677000000',
      '0776767766700000',
      '7767777767760000',
      '7677767776770000',
      '6777676777670000',
      '5677767767650000',
      '4567676657560000',
      '3456566546450000',
      '2345455435340000',
      '1234344324230000',
      '0123233213120000',
      '0012122102010000',
      '0001011001000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ],
  },

  // #8 Hybrid — teal blue-green cool bud
  teal_hybrid: {
    palette: ['', '#041818', '#083030', '#104848', '#207070', '#30a0a0', '#50caca', '#80eeee'],
    pixels: [
      '0000056500000000',
      '0005666560000000',
      '0056566565000000',
      '0565565656500000',
      '5656565655650000',
      '5565656655560000',
      '4556566545550000',
      '3445565445440000',
      '2344454334330000',
      '1233343223220000',
      '0122232112110000',
      '0011121001000000',
      '0001010000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ],
  },

  // #9 Hybrid — very dark midnight blue, barely visible depth
  midnight_hybrid: {
    palette: ['', '#040818', '#080f28', '#0e1538', '#181e50', '#202860', '#2c3478', '#404888'],
    pixels: [
      '0000044400000000',
      '0004445440000000',
      '0044445444000000',
      '0444454444400000',
      '4445444444450000',
      '4444545444440000',
      '3444454344430000',
      '2344444343320000',
      '1234344232210000',
      '0123233121100000',
      '0012122010000000',
      '0001011000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ],
  },

  // #11 Lavender Pink — pink lavender floral hybrid
  lavender_pink: {
    palette: ['', '#300838', '#501050', '#703070', '#9040a0', '#c060c8', '#e090e8', '#ffc8ff'],
    pixels: [
      '0000077600000000',
      '0007776760000000',
      '0077676677000000',
      '0776776677700000',
      '7767677677670000',
      '7677776776760000',
      '6677677667660000',
      '5566766657550000',
      '4455655546440000',
      '3344544435330000',
      '2233433324220000',
      '1122322213110000',
      '0011211102000000',
      '0001100011000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ],
  },

  // #20 Gelato — warm multi-tone green-amber-gold dessert hybrid
  gelato: {
    palette: ['', '#1a1a08', '#303818', '#506028', '#7a9030', '#c09040', '#e8b860', '#f8d888'],
    pixels: [
      '0000056500000000',
      '0005566560000000',
      '0055465564000000',
      '0554565654500000',
      '5545556545550000',
      '4554566455440000',
      '3455655354430000',
      '2345565345320000',
      '1234454234210000',
      '0123343123100000',
      '0012232012000000',
      '0001121001000000',
      '0000010000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ],
  },

  // #22 Popcorn Bud — small compact single round cluster on stem
  popcorn_bud: {
    palette: ['', '#1a3808', '#2a5a10', '#3c7018', '#4a8a20', '#6ab832', '#9cd840', '#ffffff'],
    pixels: [
      '0000000000000000',
      '0000066600000000',
      '0006677660000000',
      '0066766766000000',
      '0667676676600000',
      '6676776766760000',
      '6767676676670000',
      '5667676766560000',
      '4556766656440000',
      '3445655545330000',
      '2334544434220000',
      '1223433323110000',
      '0112322212000000',
      '0001211101000000',
      '0000100010000000',
      '0000000000000000',
      '0000033000000000',
      '0000034000000000',
      '0000023000000000',
      '0000012000000000',
      '0000001000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
    ],
  },

  // Fire OG — red-orange fiery hybrid with bright highlights
  fire_og: {
    palette: ['', '#3c0800', '#6a1000', '#982008', '#d42810', '#f05020', '#ff7840', '#ffa870'],
    pixels: [
      '0000077700000000',
      '0007776760000000',
      '0077677677000000',
      '0776767767700000',
      '7767677677770000',
      '7677767776760000',
      '6677676776660000',
      '5567766667550000',
      '4456655556440000',
      '3345544445330000',
      '2234433334220000',
      '1123322223110000',
      '0012211112000000',
      '0001100001000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
      '0000000000000000',
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

  // Apply Scale2x once: 16×24 → 32×48
  const upscaled = scale2xFromStrings(sprite.pixels)
  const naturalW = COLS * PX  // 32
  const naturalH = ROWS * PX  // 48
  const scale    = size / naturalH
  const displayW = Math.round(naturalW * scale)

  const rects: React.ReactElement[] = []

  upscaled.forEach((row, rowIdx) => {
    row.forEach((colorIdx, col) => {
      if (colorIdx === 0) return
      const color = sprite.palette[colorIdx]
      if (!color) return
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
    })
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
