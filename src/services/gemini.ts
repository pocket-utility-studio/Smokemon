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

export interface EnrichedStrain {
  name: string
  type?: string
  thc?: number
  cbd?: number
  terpenes?: string
  effects?: string
  medical?: string
  notes?: string
}

const NURSE_JOY_SYSTEM = `You are Nurse Joy from the Pokémon games — warm, caring, and highly knowledgeable. The user gives you their party of cannabis strains with detailed botanical data. Reply in Nurse Joy's signature style (calm, reassuring, professional) BUT provide rich, substantive information. Use her phrases adapted to context ("Welcome!", "Your party is in good hands!", etc.).

Structure your response with these exact section headers followed by the content:

RECOMMENDATION
Which strain you recommend and precisely why it matches their request. Reference the specific THC/CBD ratio and how it fits their needs.

TERPENE SCIENCE
For each of the 2-3 dominant terpenes in the recommended strain: name, its aroma, how it binds in the body, and exactly why it contributes to the desired effect. Explain the entourage effect between terpenes and cannabinoids.

TEMPERATURE GUIDE
The optimal vaporisation temperature in Celsius. Explain what activates at that temperature and why — which terpenes boil off, which cannabinoids decarboxylate, and what the user will experience as a result.

STRAIN HISTORY
The origin story: genetics and lineage, who bred it and where, how it got its name, and what makes it distinctive. 2-4 sentences.

WHAT TO EXPECT
Vaping onset (typically 1-3 min), how effects develop, peak duration, and any cautions. What makes this strain's experience unique.

Keep Nurse Joy's tone warm and caring throughout. Be genuinely informative — this is a patient asking for healthcare guidance.`

export interface ConsultationFeedback {
  strainName: string
  rating: 'up' | 'down'
  note: string
  date: string
}

/**
 * Ask Nurse Joy to recommend a strain from the user's party.
 *
 * @param desiredEffect  - what the user wants to feel / do
 * @param party          - enriched strain data including terpenes, effects, medical
 * @param feedbackHistory - past consultation notes injected as context
 * @returns Nurse Joy's detailed dialogue string
 */
export async function askNurseJoy(
  desiredEffect: string,
  party: EnrichedStrain[],
  feedbackHistory?: ConsultationFeedback[],
  patientNotes?: string,
): Promise<string> {
  if (party.length === 0) throw new Error('Party is empty')

  const client = getClient()
  const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const partyList = party
    .map((s) => {
      const parts: string[] = [`- ${s.name} (${s.type ?? 'unknown type'}`]
      if (s.thc != null)    parts[0] += `, THC: ${s.thc}%`
      if (s.cbd != null)    parts[0] += `, CBD: ${s.cbd}%`
      if (s.terpenes)       parts[0] += `, terpenes: ${s.terpenes}`
      if (s.effects)        parts[0] += `, effects: ${s.effects}`
      if (s.medical)        parts[0] += `, medical uses: ${s.medical}`
      if (s.notes)          parts[0] += `, notes: "${s.notes}"`
      parts[0] += ')'
      return parts[0]
    })
    .join('\n')

  const notesBlock = patientNotes?.trim()
    ? `\n\nPATIENT NOTES (written by the patient — always prioritise this information):\n${patientNotes.trim()}`
    : ''

  const memoryBlock = feedbackHistory && feedbackHistory.length > 0
    ? `\n\nPATIENT HISTORY (past consultations):\n` +
      feedbackHistory.map((f) =>
        `- ${f.strainName}: ${f.rating === 'up' ? 'POSITIVE' : 'NEGATIVE'} — "${f.note}"`
      ).join('\n') +
      `\n\nUse the patient history to personalise your recommendation. Avoid strains that had negative reactions unless specifically asked. Reference relevant history when appropriate.`
    : ''

  const prompt = `${NURSE_JOY_SYSTEM}${notesBlock}${memoryBlock}\n\nMy party:\n${partyList}\n\nWhat I want: ${desiredEffect}`

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

// ── Mixed Salad / Entourage Calculator ────────────────────────────────────────

const MIXED_SALAD_SYSTEM = `You are Professor T-Oak — the world's leading botanist specialising in cannabis terpene science, spoken in the warm, enthusiastic tone of Professor Oak from Pokémon. A trainer is combining two strains in a vaporiser. Predict the combined result of their terpene and cannabinoid profiles.

Respond using EXACTLY these four section headers, each on its own line, followed by the content:

COMBINED EFFECT
What the trainer will experience from this blend. Identify 2-3 key terpene/cannabinoid synergies by name. Cover onset speed, peak character, and how long it lasts. Be specific about whether the effect is energising, sedating, focused, social, etc.

FLAVOUR PROFILE
What the blend tastes and smells like. Name the dominant terpenes driving the flavour. Describe inhale, exhale, and aftertaste — sensory and vivid.

BEST FOR
List 3 specific use cases or moments this combination is ideal for. Be practical and concrete (e.g. "Evening wind-down before bed", "Creative work without anxiety", "Social situations where you want to stay present").

MIXING TIP
One practical suggestion: ideal vaporiser temperature for this blend, a recommended ratio of strain A to strain B, or a timing note. Keep it to 1-2 sentences.

Keep Professor Oak's warm, enthusiastic tone throughout. Address the trainer directly.`

/**
 * Mix two strains and predict their combined entourage effect.
 */
export async function mixStrains(
  strainA: EnrichedStrain,
  strainB: EnrichedStrain,
): Promise<string> {
  const client = getClient()
  const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const fmt = (s: EnrichedStrain) => {
    const parts = [`${s.name} (${s.type ?? 'hybrid'}`]
    if (s.thc != null)  parts[0] += `, THC ${s.thc}%`
    if (s.cbd != null)  parts[0] += `, CBD ${s.cbd}%`
    if (s.terpenes)     parts[0] += `, terpenes: ${s.terpenes}`
    if (s.effects)      parts[0] += `, effects: ${s.effects}`
    parts[0] += ')'
    return parts[0]
  }

  const prompt = `${MIXED_SALAD_SYSTEM}\n\nStrain A: ${fmt(strainA)}\nStrain B: ${fmt(strainB)}`
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
