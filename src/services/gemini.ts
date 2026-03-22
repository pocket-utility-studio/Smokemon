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
The optimal vaporisation temperature in Celsius ONLY (never Fahrenheit). Explain what activates at that temperature and why — which terpenes boil off, which cannabinoids decarboxylate, and what the user will experience as a result.

STRAIN HISTORY
2 sentences only: where it came from, who bred it, and one standout fact about its lineage or name.

WHAT TO EXPECT
1-2 sentences: vaping onset, peak duration, and any key caution. Keep it brief.

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
  onChunk?: (chunk: string) => void,
): Promise<string> {
  if (party.length === 0) throw new Error('Party is empty')

  const client = getClient()
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: NURSE_JOY_SYSTEM,
    generationConfig: { temperature: 0.7 },
  })

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

  const prompt = `My party:\n${partyList}${notesBlock}${memoryBlock}\n\nWhat I want: ${desiredEffect}`

  if (onChunk) {
    const stream = await model.generateContentStream(prompt)
    let full = ''
    for await (const chunk of stream.stream) {
      const text = chunk.text()
      if (text) { full += text; onChunk(full) }
    }
    return full.trim()
  }

  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}

// ── Professor Toke ─────────────────────────────────────────────────────────────

const PROFESSOR_TOKE_SYSTEM = `You are Professor Toke, a Pokémon-style botany expert. The user will give you their 'party' of available cannabis strains and what effect they want. You MUST reply in short, punchy, 8-bit RPG dialogue (e.g., 'Hello there! Welcome to the world of Smokémon!'). Your response MUST include:
- Which specific strain from their party they should choose.
- The exact optimal vaping temperature in Celsius (never Fahrenheit) to achieve their desired effect.
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
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: PROFESSOR_TOKE_SYSTEM,
    generationConfig: { temperature: 0.8 },
  })

  const partyList = party
    .map((s) => {
      const parts = [`- ${s.name}`, `(${s.type ?? 'unknown type'}`]
      if (s.thc != null) parts.push(`THC: ${s.thc}%`)
      if (s.cbd != null) parts.push(`CBD: ${s.cbd}%`)
      if (s.notes)       parts.push(`notes: "${s.notes}"`)
      return parts[0] + ' ' + parts.slice(1).join(', ') + ')'
    })
    .join('\n')

  const prompt = `My party:\n${partyList}\n\nWhat I want: ${desiredEffect}`

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
One practical suggestion: ideal vaporiser temperature for this blend in Celsius (never Fahrenheit), a recommended ratio of strain A to strain B, or a timing note. Keep it to 1-2 sentences.

Keep Professor Oak's warm, enthusiastic tone throughout. Address the trainer directly.`

export interface MixSuggestion {
  strainA: string
  strainB: string
  flavourReason: string
  terpeneReason: string
}

/**
 * Generate up to 5 mix suggestions from the party that best match the trainer's goal.
 * Each suggestion includes flavour and terpene reasoning.
 */
export async function generateMixSuggestions(
  goal: string,
  party: EnrichedStrain[],
): Promise<MixSuggestion[]> {
  if (party.length < 2) throw new Error('Need at least 2 strains')
  const client = getClient()
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
  })

  const partyList = party
    .map((s) => {
      let line = `- ${s.name} (${s.type ?? 'unknown'}`
      if (s.thc != null) line += `, THC ${s.thc}%`
      if (s.terpenes)    line += `, terpenes: ${s.terpenes}`
      if (s.effects)     line += `, effects: ${s.effects}`
      line += ')'
      return line
    })
    .join('\n')

  const count = Math.min(party.length * (party.length - 1) / 2, 5)

  const prompt = `You are Professor T-Oak, cannabis terpene expert with the warm enthusiasm of Professor Oak from Pokémon.

The trainer wants: "${goal}"

From the party below, suggest ${count} DIFFERENT pairings that best match this goal. Rank them from best match to least. Each pairing must use a different combination of strains.

Base your pairings on actual terpene science — consider how the dominant terpenes in each strain interact with each other and with the cannabinoid profiles to produce the desired effect.

Respond with ONLY a valid JSON array:
[
  {
    "strainA": "<exact name from the list>",
    "strainB": "<exact name from the list>",
    "flavourReason": "<1-2 sentences: describe the combined taste/aroma and why it suits the goal>",
    "terpeneReason": "<1-2 sentences: name the key terpenes and how their synergy delivers the desired effect>"
  }
]

Party:
${partyList}`

  const result = await model.generateContent(prompt)
  const data: Array<Record<string, string>> = JSON.parse(result.response.text())
  return data
    .filter((d) => d.strainA && d.strainB)
    .map((d) => ({
      strainA:       d.strainA,
      strainB:       d.strainB,
      flavourReason: d.flavourReason ?? '',
      terpeneReason: d.terpeneReason ?? '',
    }))
    .slice(0, 5)
}

export interface DualBlendResult {
  taste:   MixSuggestion
  medical: MixSuggestion
}

export interface BlendCard {
  label: string
  strainA: string
  strainB: string
  reason: string
}

export interface FourBlendResult {
  taste:    BlendCard
  euphoric: BlendCard
  relax:    BlendCard
  wildcard: BlendCard
}

/**
 * Always returns exactly four blend suggestions from the party — no goal input needed.
 * TASTE, AWARE & EUPHORIC, RELAX (EVENING), WILD CARD.
 */
export async function generateFourBlends(party: EnrichedStrain[]): Promise<FourBlendResult> {
  if (party.length < 2) throw new Error('Need at least 2 strains')
  const client = getClient()
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { temperature: 0.6, responseMimeType: 'application/json' },
  })

  const partyList = party
    .map((s) => {
      let line = `- ${s.name} (${s.type ?? 'unknown'}`
      if (s.thc != null)  line += `, THC ${s.thc}%`
      if (s.terpenes)     line += `, terpenes: ${s.terpenes}`
      if (s.effects)      line += `, effects: ${s.effects}`
      if (s.medical)      line += `, medical: ${s.medical}`
      line += ')'
      return line
    })
    .join('\n')

  const prompt = `You are Professor T-Oak, cannabis terpene expert. The trainer has the following strains in their party:

${partyList}

Suggest exactly FOUR pairings from the party above — one for each of these specific goals. Each pairing must use two DIFFERENT strains from the list, and the same strain can appear in multiple pairings.

Goals:
1. "taste" — the pairing with the most interesting or enjoyable combined flavour/aroma
2. "euphoric" — the pairing best for feeling aware, uplifted, and euphoric
3. "relax" — the pairing best for relaxing in the evening, winding down
4. "wildcard" — a surprising or unusual pairing the trainer might not have considered — explain why it works

For each pairing, write 2-3 sentences explaining WHY this combination works — reference actual terpenes, cannabinoid ratios, or strain characteristics.

Respond with valid JSON:
{
  "taste":    { "strainA": "<name>", "strainB": "<name>", "reason": "<2-3 sentences>" },
  "euphoric": { "strainA": "<name>", "strainB": "<name>", "reason": "<2-3 sentences>" },
  "relax":    { "strainA": "<name>", "strainB": "<name>", "reason": "<2-3 sentences>" },
  "wildcard": { "strainA": "<name>", "strainB": "<name>", "reason": "<2-3 sentences>" }
}`

  const result = await model.generateContent(prompt)
  const data = JSON.parse(result.response.text()) as Record<string, Record<string, string>>

  const parse = (key: string, label: string): BlendCard => ({
    label,
    strainA: data[key]?.strainA ?? '',
    strainB: data[key]?.strainB ?? '',
    reason:  data[key]?.reason  ?? '',
  })

  return {
    taste:    parse('taste',    'TASTE'),
    euphoric: parse('euphoric', 'AWARE & EUPHORIC'),
    relax:    parse('relax',    'RELAX'),
    wildcard: parse('wildcard', 'WILD CARD'),
  }
}

/**
 * Always returns exactly two blend suggestions from the party:
 * one optimised for taste/flavour, one for medical/therapeutic effect.
 */
export async function generateDualBlend(
  goal: string,
  party: EnrichedStrain[],
): Promise<DualBlendResult> {
  if (party.length < 2) throw new Error('Need at least 2 strains')
  const client = getClient()
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
  })

  const partyList = party
    .map((s) => {
      let line = `- ${s.name} (${s.type ?? 'unknown'}`
      if (s.thc != null)  line += `, THC ${s.thc}%`
      if (s.terpenes)     line += `, terpenes: ${s.terpenes}`
      if (s.effects)      line += `, effects: ${s.effects}`
      if (s.medical)      line += `, medical: ${s.medical}`
      line += ')'
      return line
    })
    .join('\n')

  const prompt = `You are Professor T-Oak, cannabis terpene expert.

The trainer's goal: "${goal || 'balanced relaxation'}"

From the party below, give exactly TWO blend suggestions:
1. "taste" — the pairing with the best combined flavour/aroma profile
2. "medical" — the pairing best suited for therapeutic/medical effect

Each pairing must use two DIFFERENT strains from the list.

Respond with valid JSON:
{
  "taste": {
    "strainA": "<exact name>",
    "strainB": "<exact name>",
    "flavourReason": "<1-2 sentences on combined aroma/taste>",
    "terpeneReason": "<1-2 sentences on terpene synergy for flavour>"
  },
  "medical": {
    "strainA": "<exact name>",
    "strainB": "<exact name>",
    "flavourReason": "<1-2 sentences on combined effect profile>",
    "terpeneReason": "<1-2 sentences on terpene synergy for therapeutic benefit>"
  }
}

Party:
${partyList}`

  const result = await model.generateContent(prompt)
  const data = JSON.parse(result.response.text()) as Record<string, Record<string, string>>
  const parse = (d: Record<string, string>): MixSuggestion => ({
    strainA:       d.strainA       ?? '',
    strainB:       d.strainB       ?? '',
    flavourReason: d.flavourReason ?? '',
    terpeneReason: d.terpeneReason ?? '',
  })
  return { taste: parse(data.taste), medical: parse(data.medical) }
}

/**
 * Mix two strains and predict their combined entourage effect.
 */
export async function mixStrains(
  strainA: EnrichedStrain,
  strainB: EnrichedStrain,
): Promise<string> {
  const client = getClient()
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: MIXED_SALAD_SYSTEM,
    generationConfig: { temperature: 0.5 },
  })

  const fmt = (s: EnrichedStrain) => {
    const parts = [`${s.name} (${s.type ?? 'hybrid'}`]
    if (s.thc != null)  parts[0] += `, THC ${s.thc}%`
    if (s.cbd != null)  parts[0] += `, CBD ${s.cbd}%`
    if (s.terpenes)     parts[0] += `, terpenes: ${s.terpenes}`
    if (s.effects)      parts[0] += `, effects: ${s.effects}`
    parts[0] += ')'
    return parts[0]
  }

  const prompt = `Strain A: ${fmt(strainA)}\nStrain B: ${fmt(strainB)}`
  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}

// ── Strain lookup ──────────────────────────────────────────────────────────────

const STRAIN_LOOKUP_SYSTEM = `You are a cannabis strain encyclopedia with expert-level knowledge of genetics, chemotypes, and terpene profiles. Your job is to return accurate, well-researched data. Only state what is genuinely known about the strain — do not fabricate lineage or breeder details. For THC, provide the typical range midpoint based on documented test results.`

const STRAIN_LOOKUP_PROMPT = (name: string) =>
  `Provide accurate data for the cannabis strain "${name}".
Respond ONLY with a single valid JSON object. Use null for any unknown fields EXCEPT thc — always provide a best-estimate THC % as a number.
{
  "thc": <typical THC % as number — required, use best estimate if exact value unknown>,
  "cbd": <typical CBD % as number|null>,
  "type": <"sativa"|"indica"|"hybrid"|null>,
  "terpenes": <"comma-separated dominant terpenes, e.g. Myrcene, Limonene, Caryophyllene"|null>,
  "effects": <"short comma-separated list of typical effects"|null>,
  "history": <"2-4 sentences covering the strain's origin, breeder, genetics/lineage, and any notable facts about how it was developed"|null>
}`

export async function lookupStrainData(name: string): Promise<StrainLookupResult> {
  const client = getClient()
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: STRAIN_LOOKUP_SYSTEM,
    generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
  })
  const result = await model.generateContent(STRAIN_LOOKUP_PROMPT(name))
  const data = JSON.parse(result.response.text())
  const out: StrainLookupResult = {}
  out.thc = typeof data.thc === 'number' ? data.thc : 15
  if (typeof data.cbd === 'number')   out.cbd = data.cbd
  if (data.type === 'sativa' || data.type === 'indica' || data.type === 'hybrid') out.type = data.type
  if (typeof data.terpenes === 'string' && data.terpenes) out.terpenes = data.terpenes
  if (typeof data.effects  === 'string' && data.effects)  out.effects  = data.effects
  if (typeof data.history  === 'string' && data.history)  out.history  = data.history
  return out
}

// ── Cannabis Q&A ───────────────────────────────────────────────────────────────

const CANNABIS_QA_SYSTEM = `You are a knowledgeable cannabis encyclopedia. Answer questions about cannabis — strains, terpenes, cannabinoids, effects, consumption methods, botany, history, and harm reduction.

Rules:
- Only answer questions directly related to cannabis. If the question is not about cannabis, respond with exactly: OFF_TOPIC
- Be factual, concise, and non-judgmental
- Always mention harm reduction where relevant
- Keep answers to 3-5 sentences unless more detail is genuinely needed
- Never recommend illegal activity
- Use plain language, no excessive jargon`

export async function askCannabisQuestion(question: string): Promise<string> {
  const client = getClient()
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: CANNABIS_QA_SYSTEM,
    generationConfig: { temperature: 0.4 },
  })
  const result = await model.generateContent(question)
  return result.response.text().trim()
}
