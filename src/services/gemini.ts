/**
 * gemini.ts
 * AI services powered by Google Gemini.
 *
 * Requires VITE_GEMINI_API_KEY in .env.local
 * Get a free key at https://aistudio.google.com/app/apikey
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { StrainEntry } from '../context/StashContext'

export interface StrainLookupResult {
  thc?: number
  cbd?: number
  type?: 'sativa' | 'indica' | 'hybrid'
  terpenes?: string
  effects?: string
  history?: string
}

// ── Client ────────────────────────────────────────────────────────────────────

function getClient(): GoogleGenerativeAI {
  const key = localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY
  if (!key) throw new Error('NO_KEY')
  return new GoogleGenerativeAI(key)
}

// ── Nurse Joy ──────────────────────────────────────────────────────────────────

const NURSE_JOY_SYSTEM = `You are Nurse Joy from the Pokémon games — warm, caring, and professional. The user will give you their 'party' of available cannabis strains and what effect they want. You MUST reply in the style of Nurse Joy's in-game dialogue: calm, reassuring, and knowledgeable, as if treating a patient at the Pokémon Center. Use her signature phrases ("Welcome to the Pokémon Center!", "We hope to see you again!", "Your party has been healed!") adapted to the context. Your response MUST include:
- Which specific strain from their party you recommend and why.
- The exact optimal vaping temperature to achieve their desired effect.
- The specific dominant terpenes in that strain that will help them.
- A brief caring explanation of WHY that temperature activates those terpenes.
Keep the tone gentle, reassuring, and in-character as Nurse Joy throughout.`

/**
 * Ask Nurse Joy to recommend a strain from the user's party.
 *
 * @param desiredEffect - what the user wants to feel / do
 * @param party         - the user's in-stock stash strains
 * @returns Nurse Joy's RPG-style dialogue string
 */
export async function askNurseJoy(
  desiredEffect: string,
  party: StrainEntry[],
): Promise<string> {
  if (party.length === 0) throw new Error('Party is empty')

  const client = getClient()
  const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const partyList = party
    .map((s) => {
      const parts = [`- ${s.name}`, `(${s.type ?? 'unknown type'}`]
      if (s.thc != null) parts.push(`THC: ${s.thc}%`)
      if (s.cbd != null) parts.push(`CBD: ${s.cbd}%`)
      if (s.notes)       parts.push(`notes: "${s.notes}"`)
      return parts[0] + ' ' + parts.slice(1).join(', ') + ')'
    })
    .join('\n')

  const prompt = `${NURSE_JOY_SYSTEM}\n\nMy party:\n${partyList}\n\nWhat I want: ${desiredEffect}`

  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}

// ── Professor Toke ─────────────────────────────────────────────────────────────

const PROFESSOR_TOKE_SYSTEM = `You are Professor Toke, a Pokémon-style botany expert. The user will give you their 'party' of available cannabis strains and what effect they want. You MUST reply in short, punchy, 8-bit RPG dialogue (e.g., 'Hello there! Welcome to the world of Smokémon!'). Your response MUST include:
- Which specific strain from their party they should choose.
- The exact optimal vaping temperature to achieve their desired effect.
- The specific dominant terpenes in that strain that will help them.
- A brief explanation of WHY that temperature activates those specific terpenes.`

/**
 * Ask Professor Toke to recommend a strain from the user's party.
 *
 * @param desiredEffect - what the user wants to feel / do
 * @param party         - the user's in-stock stash strains
 * @returns Professor Toke's RPG-style dialogue string
 */
export async function askProfessorToke(
  desiredEffect: string,
  party: StrainEntry[],
): Promise<string> {
  if (party.length === 0) throw new Error('Party is empty')

  const client = getClient()
  const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const partyList = party
    .map((s) => {
      const parts = [`- ${s.name}`, `(${s.type ?? 'unknown type'}`]
      if (s.thc != null) parts.push(`THC: ${s.thc}%`)
      if (s.cbd != null) parts.push(`CBD: ${s.cbd}%`)
      if (s.notes)       parts.push(`notes: "${s.notes}"`)
      return parts[0] + ' ' + parts.slice(1).join(', ') + ')'
    })
    .join('\n')

  const prompt = `${PROFESSOR_TOKE_SYSTEM}\n\nMy party:\n${partyList}\n\nWhat I want: ${desiredEffect}`

  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}

// ── Strain lookup ──────────────────────────────────────────────────────────────

const STRAIN_LOOKUP_PROMPT = (name: string) =>
  `You are a cannabis strain encyclopedia. Provide accurate data for the strain "${name}".
Respond ONLY with a single valid JSON object. Use null for any unknown fields.
{
  "thc": <typical THC % as number|null>,
  "cbd": <typical CBD % as number|null>,
  "type": <"sativa"|"indica"|"hybrid"|null>,
  "terpenes": <"comma-separated dominant terpenes, e.g. Myrcene, Limonene, Caryophyllene"|null>,
  "effects": <"short comma-separated list of typical effects"|null>,
  "history": <"2-4 sentences covering the strain's origin, breeder, genetics/lineage, and any notable facts about how it was developed"|null>
}`

export async function lookupStrainData(name: string): Promise<StrainLookupResult> {
  const client = getClient()
  const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const result = await model.generateContent(STRAIN_LOOKUP_PROMPT(name))
  const text = result.response.text().trim()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Unexpected response from AI')
  const data = JSON.parse(jsonMatch[0])
  const out: StrainLookupResult = {}
  if (typeof data.thc === 'number')   out.thc = data.thc
  if (typeof data.cbd === 'number')   out.cbd = data.cbd
  if (data.type === 'sativa' || data.type === 'indica' || data.type === 'hybrid') out.type = data.type
  if (typeof data.terpenes === 'string' && data.terpenes) out.terpenes = data.terpenes
  if (typeof data.effects  === 'string' && data.effects)  out.effects  = data.effects
  if (typeof data.history  === 'string' && data.history)  out.history  = data.history
  return out
}
