/**
 * Accuracy test for Gemini strain lookups.
 * Compares AI output against published reference values for 10 famous strains.
 *
 * Usage:
 *   GEMINI_API_KEY=your_key node scripts/test_accuracy.mjs
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

const KEY = process.env.GEMINI_API_KEY
if (!KEY) {
  console.error('Set GEMINI_API_KEY environment variable first.')
  process.exit(1)
}

// ── Reference values from Leafly / published lab data ─────────────────────────
// These are well-documented strains with widely agreed-upon profiles.

const REFERENCE = [
  { name: 'OG Kush',       type: 'hybrid',  thc: [19, 26], cbd: [0, 1],   terpenes: ['Myrcene', 'Limonene', 'Caryophyllene'] },
  { name: 'Blue Dream',    type: 'hybrid',  thc: [17, 24], cbd: [0, 2],   terpenes: ['Myrcene', 'Caryophyllene', 'Pinene'] },
  { name: 'White Widow',   type: 'hybrid',  thc: [18, 25], cbd: [0, 1],   terpenes: ['Myrcene', 'Caryophyllene', 'Pinene'] },
  { name: 'Northern Lights', type: 'indica', thc: [16, 21], cbd: [0, 1],  terpenes: ['Myrcene', 'Caryophyllene', 'Limonene'] },
  { name: 'Sour Diesel',   type: 'sativa',  thc: [19, 25], cbd: [0, 1],   terpenes: ['Caryophyllene', 'Myrcene', 'Limonene'] },
  { name: 'Granddaddy Purple', type: 'indica', thc: [17, 23], cbd: [0, 1], terpenes: ['Myrcene', 'Caryophyllene', 'Pinene'] },
  { name: 'Girl Scout Cookies', type: 'hybrid', thc: [19, 28], cbd: [0, 1], terpenes: ['Caryophyllene', 'Limonene', 'Myrcene'] },
  { name: 'Jack Herer',    type: 'sativa',  thc: [18, 23], cbd: [0, 1],   terpenes: ['Terpinolene', 'Ocimene', 'Myrcene'] },
  { name: 'Pineapple Express', type: 'hybrid', thc: [19, 26], cbd: [0, 1], terpenes: ['Ocimene', 'Myrcene', 'Caryophyllene'] },
  { name: 'Wedding Cake',  type: 'hybrid',  thc: [22, 30], cbd: [0, 1],   terpenes: ['Caryophyllene', 'Limonene', 'Myrcene'] },
]

const SYSTEM = `You are a cannabis strain encyclopedia with expert-level knowledge of genetics, chemotypes, and terpene profiles. Only state what is genuinely known about the strain — do not fabricate lineage or breeder details. For THC, provide the typical range midpoint based on documented test results.`

const PROMPT = (name) =>
  `Provide accurate data for the cannabis strain "${name}".
Respond ONLY with a single valid JSON object. Use null for any unknown fields EXCEPT thc.
{
  "thc": <typical THC % as number>,
  "cbd": <typical CBD % as number|null>,
  "type": <"sativa"|"indica"|"hybrid"|null>,
  "terpenes": <"comma-separated dominant terpenes"|null>
}`

// ── Run tests ─────────────────────────────────────────────────────────────────

const client = new GoogleGenerativeAI(KEY)
const model = client.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: SYSTEM,
  generationConfig: { temperature: 0.1 },
})

let passType = 0, passTHC = 0, passTerpene = 0, total = REFERENCE.length

console.log('\n═══════════════════════════════════════════════════════════════')
console.log('  GEMINI STRAIN ACCURACY TEST')
console.log('═══════════════════════════════════════════════════════════════\n')

for (const ref of REFERENCE) {
  process.stdout.write(`Testing: ${ref.name}... `)

  let result
  try {
    const r = await model.generateContent(PROMPT(ref.name))
    const text = r.response.text().trim()
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in response')
    result = JSON.parse(match[0])
  } catch (e) {
    console.log(`ERROR: ${e.message}`)
    continue
  }

  const typeOk  = result.type === ref.type
  const thcOk   = typeof result.thc === 'number' && result.thc >= ref.thc[0] - 2 && result.thc <= ref.thc[1] + 2
  const aiTerms = (result.terpenes ?? '').toLowerCase()
  const topTerpMatch = ref.terpenes.slice(0, 2).filter(t => aiTerms.includes(t.toLowerCase())).length
  const terpOk  = topTerpMatch >= 1

  if (typeOk)  passType++
  if (thcOk)   passTHC++
  if (terpOk)  passTerpene++

  console.log(`\n  Strain : ${ref.name}`)
  console.log(`  Type   : AI=${result.type ?? 'null'}  REF=${ref.type}  ${typeOk ? '✓ PASS' : '✗ FAIL'}`)
  console.log(`  THC    : AI=${result.thc ?? 'null'}%  REF=${ref.thc[0]}–${ref.thc[1]}%  ${thcOk ? '✓ PASS' : '✗ FAIL'}`)
  console.log(`  Terpenes: AI="${result.terpenes ?? 'null'}"`)
  console.log(`           REF top-2: ${ref.terpenes.slice(0,2).join(', ')}  ${terpOk ? '✓ PASS' : '✗ FAIL'}`)
  console.log()

  // Small delay to avoid rate limiting
  await new Promise(r => setTimeout(r, 1500))
}

console.log('═══════════════════════════════════════════════════════════════')
console.log('  RESULTS')
console.log('═══════════════════════════════════════════════════════════════')
console.log(`  Type accuracy   : ${passType}/${total}  (${Math.round(100*passType/total)}%)`)
console.log(`  THC accuracy    : ${passTHC}/${total}  (${Math.round(100*passTHC/total)}%)`)
console.log(`  Terpene accuracy: ${passTerpene}/${total}  (${Math.round(100*passTerpene/total)}%)`)
console.log(`  Overall         : ${Math.round(100*(passType+passTHC+passTerpene)/(total*3))}%`)
console.log('═══════════════════════════════════════════════════════════════\n')
