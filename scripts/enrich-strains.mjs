import { GoogleGenerativeAI } from '@google/generative-ai'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FILE = join(__dirname, '..', 'public', 'strains.json')

// ── Parse args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const limitArg = args.find((a) => a.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity

const apiKey = args.find((a) => !a.startsWith('--')) ?? process.env.GEMINI_API_KEY
if (!apiKey) {
  console.error('Error: provide Gemini API key as first argument or GEMINI_API_KEY env var')
  process.exit(1)
}

// ── Load data ─────────────────────────────────────────────────────────────────

const data = JSON.parse(readFileSync(FILE, 'utf8'))

// ── First pass: fix outliers ──────────────────────────────────────────────────

let outliersFix = 0
for (const s of data) {
  if (s.thc != null && s.thc > 40) {
    console.log(`Outlier fixed: ${s.Strain} (thc=${s.thc})`)
    delete s.thc
    outliersFix++
  }
}

// ── Find strains needing enrichment ──────────────────────────────────────────

const normalize = (s) => String(s).toLowerCase().replace(/[-_\s]+/g, '')

let needsEnrichment = data
  .filter((s) => s.thc == null || !s.terpenes)
  .sort((a, b) => (b.Rating ?? 0) - (a.Rating ?? 0))

if (limit !== Infinity) {
  needsEnrichment = needsEnrichment.slice(0, limit)
}

// ── Banner ────────────────────────────────────────────────────────────────────

console.log('Smokemon strain enrichment script')
console.log(`Processing up to ${needsEnrichment.length} strains in batches of 30`)
console.log(`Estimated time: ~${Math.ceil(needsEnrichment.length / 30)} batches × 3.5s = ~${Math.round(Math.ceil(needsEnrichment.length / 30) * 3.5 / 60)} min`)
if (dryRun) console.log('MODE: DRY RUN')
console.log('')

// ── Setup Gemini ──────────────────────────────────────────────────────────────

const genAI = new GoogleGenerativeAI(apiKey)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

// ── Process batches ───────────────────────────────────────────────────────────

const BATCH_SIZE = 30
const BATCH_DELAY = 3500
const totalBatches = Math.ceil(needsEnrichment.length / BATCH_SIZE)

let thcFilled = 0
let cbdFilled = 0
let terpenesFilled = 0
let batchErrors = 0
let processed = 0

for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
  const batchNum = batchIdx + 1
  const batch = needsEnrichment.slice(batchIdx * BATCH_SIZE, (batchIdx + 1) * BATCH_SIZE)

  process.stdout.write(`\rBatch ${batchNum}/${totalBatches} (${processed}/${needsEnrichment.length})...`)

  const strainList = batch
    .map((s, i) => `${i + 1}. ${String(s.Strain).replace(/-/g, ' ')}`)
    .join('\n')

  const prompt = `You are a cannabis strain database. For each strain below, provide typical values from published lab data or commonly cited averages.
Return ONLY a valid JSON array — no markdown, no extra text.
Schema: [{"name":"<strain name>","thc":<number|null>,"cbd":<number|null>,"terpenes":"<comma-separated dominant terpenes, max 5|null>"}]
Rules:
- thc/cbd must be realistic (THC 0-40, CBD 0-25). Use null if genuinely unknown.
- Return exactly ${batch.length} objects in the same order as the input.
- Name field must match the input name exactly.
Strains:
${strainList}`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    const match = text.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('No JSON array found in response')

    const results = JSON.parse(match[0])

    for (const r of results) {
      const normName = normalize(r.name)
      const strain = data.find((s) => normalize(String(s.Strain).replace(/-/g, ' ')) === normName)
      if (!strain) continue

      if (strain.thc == null && typeof r.thc === 'number' && r.thc > 0 && r.thc <= 40) {
        strain.thc = Math.round(r.thc * 10) / 10
        thcFilled++
      }
      if (strain.cbd == null && typeof r.cbd === 'number' && r.cbd >= 0 && r.cbd <= 25) {
        strain.cbd = Math.round(r.cbd * 10) / 10
        cbdFilled++
      }
      if (!strain.terpenes && typeof r.terpenes === 'string' && r.terpenes.trim()) {
        strain.terpenes = r.terpenes.trim()
        terpenesFilled++
      }
    }
  } catch (err) {
    console.error(`\nBatch ${batchNum} error: ${err.message}`)
    batchErrors++
  }

  processed += batch.length

  if (batchIdx < totalBatches - 1) {
    await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY))
  }
}

process.stdout.write('\n')

// ── Summary ───────────────────────────────────────────────────────────────────

console.log('─────────────────────────────────')
console.log(`THC filled:      ${thcFilled}`)
console.log(`CBD filled:      ${cbdFilled}`)
console.log(`Terpenes filled: ${terpenesFilled}`)
console.log(`Batch errors:    ${batchErrors}`)
console.log(`Outliers fixed:  ${outliersFix}`)
console.log('─────────────────────────────────')

if (!dryRun) {
  writeFileSync(FILE, JSON.stringify(data))
  console.log(`Written: ${FILE}`)
} else {
  console.log('DRY RUN complete — nothing written')
}
