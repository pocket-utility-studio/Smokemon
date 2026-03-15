#!/usr/bin/env node
/**
 * Enrich public/strains.json with terpenes and medical uses from Kushy dataset.
 * Run once: node scripts/enrich-strains.js
 *
 * THC/CBD is NOT pulled from Kushy — their CSV has encoding issues causing
 * column misalignment for many rows. Use Cannlytics API (live fallback in app)
 * for cannabinoid data instead.
 */

import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const STRAINS_PATH = path.join(__dirname, '..', 'public', 'strains.json')
const KUSHY_CSV_URL =
  'https://raw.githubusercontent.com/kushyapp/cannabis-dataset/master/Dataset/Strains/strains-kushy_api.2017-11-14.csv'

function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function fetchUrl(url, redirectCount = 0) {
  if (redirectCount > 5) return Promise.reject(new Error('Too many redirects'))
  const lib = url.startsWith('https') ? https : http
  return new Promise((resolve, reject) => {
    lib
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return fetchUrl(res.headers.location, redirectCount + 1).then(resolve).catch(reject)
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
        }
        const chunks = []
        res.on('data', (c) => chunks.push(c))
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
        res.on('error', reject)
      })
      .on('error', reject)
  })
}

/**
 * Robust CSV tokeniser — handles quoted fields with embedded commas and quotes.
 * Returns array of string values for a single CSV line.
 */
function tokeniseLine(line) {
  const values = []
  let i = 0
  while (i < line.length) {
    if (line[i] === '"') {
      // Quoted field
      i++ // skip opening quote
      let val = ''
      while (i < line.length) {
        if (line[i] === '"') {
          if (line[i + 1] === '"') { val += '"'; i += 2 } // escaped quote
          else { i++; break } // closing quote
        } else {
          val += line[i++]
        }
      }
      values.push(val.trim())
      if (line[i] === ',') i++ // skip comma after field
    } else {
      // Unquoted field
      const end = line.indexOf(',', i)
      if (end === -1) {
        values.push(line.slice(i).trim())
        break
      }
      values.push(line.slice(i, end).trim())
      i = end + 1
    }
  }
  return values
}

function parseCSV(text) {
  // Split on newlines, but preserve quoted newlines by reassembling
  const rawLines = text.split('\n')
  const fullLines = []
  let current = ''
  let inQuote = false
  for (const raw of rawLines) {
    for (const ch of raw) {
      if (ch === '"') inQuote = !inQuote
    }
    current += (current ? '\n' : '') + raw
    if (!inQuote) {
      fullLines.push(current)
      current = ''
    }
  }
  if (current) fullLines.push(current)

  const headers = tokeniseLine(fullLines[0])
  console.log('All CSV columns:', headers.join(', '))

  const rows = []
  for (let i = 1; i < fullLines.length; i++) {
    const line = fullLines[i].trim()
    if (!line) continue
    const values = tokeniseLine(line)
    const row = {}
    headers.forEach((h, idx) => {
      const v = values[idx] ?? ''
      row[h] = v === 'NULL' ? '' : v
    })
    rows.push(row)
  }
  return rows
}

async function main() {
  console.log('Loading strains.json...')
  const strains = JSON.parse(fs.readFileSync(STRAINS_PATH, 'utf8'))
  console.log(`Loaded ${strains.length} strains.`)

  console.log('Downloading Kushy dataset...')
  let csv
  try {
    csv = await fetchUrl(KUSHY_CSV_URL)
  } catch (e) {
    console.error('Failed to download Kushy CSV:', e.message)
    process.exit(1)
  }

  console.log('Parsing CSV...')
  const kushyRows = parseCSV(csv)
  console.log(`Parsed ${kushyRows.length} Kushy rows.`)

  // Build lookup map: normalizedName -> row
  const kushyMap = new Map()
  for (const row of kushyRows) {
    const name = row['name'] || ''
    if (name && typeof name === 'string' && name.length > 0) {
      const key = normalizeName(name)
      if (!kushyMap.has(key)) kushyMap.set(key, row)
    }
  }

  // Clear any previous enrichment
  for (const strain of strains) {
    delete strain.terpenes
    delete strain.thc
    delete strain.cbd
    delete strain.medical
  }

  // Merge
  let matchCount = 0
  for (const strain of strains) {
    if (!strain.Strain || typeof strain.Strain !== 'string') continue
    const key = normalizeName(strain.Strain)
    const kushy = kushyMap.get(key)
    if (!kushy) continue
    matchCount++

    // Terpenes
    const terpenes = (kushy['terpenes'] || '').trim()
    if (terpenes && terpenes.toLowerCase() !== 'null' && terpenes !== '-') {
      strain.terpenes = terpenes
    }

    // THC/CBD — stored as mg/g in Kushy CSV, divide by 10 to get %
    const thcRaw = parseFloat(kushy['thc'] || '')
    if (!isNaN(thcRaw) && thcRaw > 0) {
      const thc = Math.round((thcRaw / 10) * 10) / 10
      if (thc > 0 && thc <= 40) strain.thc = thc
    }

    const cbdRaw = parseFloat(kushy['cbd'] || '')
    if (!isNaN(cbdRaw) && cbdRaw > 0) {
      const cbd = Math.round((cbdRaw / 10) * 10) / 10
      if (cbd > 0 && cbd <= 30) strain.cbd = cbd
    }

    // Medical / ailment
    const medical = (kushy['ailment'] || '').trim()
    if (medical && medical.toLowerCase() !== 'null' && medical !== '-') {
      strain.medical = medical
    }
  }

  console.log(`Matched ${matchCount} / ${strains.length} strains.`)

  fs.writeFileSync(STRAINS_PATH, JSON.stringify(strains))
  console.log('Wrote enriched strains.json')

  const withTerpenes = strains.filter((s) => s.terpenes).length
  const withTHC = strains.filter((s) => s.thc != null).length
  const withCBD = strains.filter((s) => s.cbd != null).length
  const withMedical = strains.filter((s) => s.medical).length
  console.log(`  terpenes: ${withTerpenes} | thc: ${withTHC} | cbd: ${withCBD} | medical: ${withMedical}`)

  const sample = strains.find((s) => s.medical)
  if (sample) {
    console.log('\nSample enriched strain:')
    console.log(
      `  ${sample.Strain}: terpenes="${sample.terpenes ?? 'none'}" thc=${sample.thc ?? 'none'} cbd=${sample.cbd ?? 'none'} medical="${sample.medical}"`
    )
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
