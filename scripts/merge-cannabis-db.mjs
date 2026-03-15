/**
 * Merges the Cannabis Intelligence Database (15,768 strains) into strains.json.
 * Only adds strains that have effects + description and aren't already present.
 *
 * Usage: node scripts/merge-cannabis-db.mjs
 */

import { readFileSync, writeFileSync } from 'fs'
import { createRequire } from 'module'
import https from 'https'
import { parse } from 'csv-parse/sync'

const CSV_URL =
  'https://raw.githubusercontent.com/Shannon-Goddard/cannabis-intelligence-database/main/data/Cannabis_Intelligence_Database_15768_Strains_Final.csv'

const STRAINS_PATH = new URL('../public/strains.json', import.meta.url).pathname

// ── helpers ────────────────────────────────────────────────────────────────

const normalise = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]/g, '')

/** Parse a Python list string like "['earthy', 'citrus']" → ["Earthy","Citrus"] */
function parsePyList(str) {
  if (!str || str === '[]') return []
  const matches = str.match(/'([^']+)'/g) || []
  return matches.map((m) => m.replace(/'/g, '').trim())
}

/** sativa% / indica% → type string */
function deriveType(row) {
  const s = parseFloat(row.sativa_percentage)
  const i = parseFloat(row.indica_percentage)
  if (!isNaN(s) && !isNaN(i)) {
    if (s >= 60) return 'sativa'
    if (i >= 60) return 'indica'
    return 'hybrid'
  }
  return 'hybrid'
}

function fetch(url) {
  return new Promise((resolve, reject) => {
    const chunks = []
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetch(res.headers.location).then(resolve, reject)
        return
      }
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
      res.on('error', reject)
    }).on('error', reject)
  })
}

// ── main ───────────────────────────────────────────────────────────────────

console.log('Loading existing strains.json …')
const existing = JSON.parse(readFileSync(STRAINS_PATH, 'utf8'))
const existingKeys = new Set(existing.map((s) => normalise(s.Strain)))
console.log(`  ${existing.length} strains loaded`)

console.log('Downloading Cannabis Intelligence Database CSV …')
const csv = await fetch(CSV_URL)
console.log(`  Downloaded ${(csv.length / 1024 / 1024).toFixed(1)} MB`)

const rows = parse(csv, { columns: true, skip_empty_lines: true, relax_column_count: true })
console.log(`  ${rows.length} rows parsed`)

let added = 0
let skipped_duplicate = 0
let skipped_no_data = 0

for (const row of rows) {
  const name = (row.strain_name || '').trim()
  if (!name) continue

  const effects = parsePyList(row.effects)
  const desc = (row.about_info || '').trim()

  if (!effects.length || !desc) {
    skipped_no_data++
    continue
  }

  if (existingKeys.has(normalise(name))) {
    skipped_duplicate++
    continue
  }

  const flavors = parsePyList(row.flavors)
  const terpenesList = parsePyList(row.terpenes)

  const thcMax = parseFloat(row.thc_max)
  const cbdMax = parseFloat(row.cbd_max)

  existing.push({
    Strain: name,
    Type: deriveType(row),
    Rating: null,
    Effects: effects.map((e) => e.charAt(0).toUpperCase() + e.slice(1)).join(','),
    Flavor: flavors.map((f) => f.charAt(0).toUpperCase() + f.slice(1)).join(','),
    Description: desc,
    terpenes: terpenesList.join(', ') || null,
    thc: isNaN(thcMax) ? null : thcMax,
    cbd: isNaN(cbdMax) ? null : cbdMax,
    medical: null,
  })

  existingKeys.add(normalise(name))
  added++
}

console.log(`\nResults:`)
console.log(`  Added:              ${added}`)
console.log(`  Skipped (dupe):     ${skipped_duplicate}`)
console.log(`  Skipped (no data):  ${skipped_no_data}`)
console.log(`  Total strains now:  ${existing.length}`)

writeFileSync(STRAINS_PATH, JSON.stringify(existing))
console.log(`\nWritten to ${STRAINS_PATH}`)
console.log(`File size: ${(JSON.stringify(existing).length / 1024 / 1024).toFixed(2)} MB`)
