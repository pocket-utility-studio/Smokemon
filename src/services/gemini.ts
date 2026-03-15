/**
 * gemini.ts
 * AI recommendation service powered by Google Gemini.
 *
 * Usage:
 *   Add VITE_GEMINI_API_KEY=your_key to .env.local
 *   Get a free key at https://aistudio.google.com/app/apikey
 */

import { GoogleGenerativeAI, type GenerateContentResult } from '@google/generative-ai'
import type { StrainRecord } from '../hooks/useStrainDb'

// ── Client ────────────────────────────────────────────────────────────────────

function getClient(): GoogleGenerativeAI {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (!key) throw new Error('VITE_GEMINI_API_KEY is not set in .env.local')
  return new GoogleGenerativeAI(key)
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StrainRecommendation {
  strainName: string
  reason: string
  matchScore: number   // 0–100
}

export interface AIRecommendationResult {
  recommendations: StrainRecommendation[]
  summary: string      // short overall advice paragraph
  tips: string[]       // 2-3 practical usage tips
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Serialise top-N strains into a compact string for the prompt. */
function formatStrainContext(strains: StrainRecord[], limit = 80): string {
  return strains
    .slice(0, limit)
    .map((s) => {
      const parts = [
        `NAME: ${s.Strain}`,
        `TYPE: ${s.Type}`,
        `EFFECTS: ${s.Effects}`,
      ]
      if (s.Flavor)   parts.push(`FLAVOR: ${s.Flavor}`)
      if (s.terpenes) parts.push(`TERPENES: ${s.terpenes}`)
      if (s.thc)      parts.push(`THC: ${s.thc}%`)
      if (s.cbd)      parts.push(`CBD: ${s.cbd}%`)
      if (s.medical)  parts.push(`MEDICAL: ${s.medical}`)
      return parts.join(' | ')
    })
    .join('\n')
}

function parseJSON<T>(text: string): T {
  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```$/m, '').trim()
  return JSON.parse(cleaned) as T
}

// ── Core recommendation function ──────────────────────────────────────────────

/**
 * Ask Gemini to pick the best strains from a pre-filtered candidate list,
 * given the user's freetext query and optional symptom tags.
 *
 * @param query       - user's natural-language description ("I want to sleep better")
 * @param candidates  - pre-filtered StrainRecord list (max ~80, pass your top matches)
 * @param symptoms    - optional symptom/situation tags already selected in the UI
 */
export async function getStrainRecommendations(
  query: string,
  candidates: StrainRecord[],
  symptoms: string[] = [],
): Promise<AIRecommendationResult> {
  const client = getClient()
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const strainContext = formatStrainContext(candidates)
  const symptomLine = symptoms.length ? `Selected tags: ${symptoms.join(', ')}.` : ''

  const prompt = `
You are Smokémon, a knowledgeable cannabis companion app. The user has asked for a strain recommendation.

User's request: "${query}"
${symptomLine}

Below are candidate strains from the database. Choose the 3 best matches.

STRAINS:
${strainContext}

Respond ONLY with valid JSON matching this exact shape — no markdown, no explanation outside the JSON:
{
  "recommendations": [
    { "strainName": "<exact name from list>", "reason": "<1-2 sentences why>", "matchScore": <0-100> }
  ],
  "summary": "<2-3 sentence plain-English overview of what the user should look for>",
  "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}
`.trim()

  const result: GenerateContentResult = await model.generateContent(prompt)
  const text = result.response.text()
  return parseJSON<AIRecommendationResult>(text)
}

// ── General chat / advice ─────────────────────────────────────────────────────

/**
 * Open-ended cannabis Q&A — answers questions about effects, terpenes,
 * dosage, methods of consumption, etc.
 *
 * @param question - user's question
 * @param context  - optional extra context (e.g. strains they've logged)
 */
export async function askCannabisQuestion(
  question: string,
  context?: string,
): Promise<string> {
  const client = getClient()
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const contextLine = context ? `\nUser context: ${context}` : ''

  const prompt = `
You are Smokémon, a knowledgeable, friendly cannabis companion app. Answer the user's question clearly and helpfully.
Keep your response concise (3-5 sentences max). Only discuss cannabis-related topics.
If asked about medical advice, remind the user to consult a doctor.
${contextLine}

Question: ${question}
`.trim()

  const result: GenerateContentResult = await model.generateContent(prompt)
  return result.response.text().trim()
}

// ── Stash analyser ────────────────────────────────────────────────────────────

export interface StashInsight {
  preferredType: string        // e.g. "indica-leaning hybrid"
  commonEffects: string[]      // top 3 effects across their stash
  suggestion: string           // what to try next
  personalityNote: string      // fun 1-liner about their taste
}

/**
 * Analyses a user's logged stash and returns personalised insights.
 *
 * @param stashedStrains - StrainRecord entries for strains the user has logged
 */
export async function analyseStash(stashedStrains: StrainRecord[]): Promise<StashInsight> {
  if (stashedStrains.length === 0) throw new Error('Stash is empty')

  const client = getClient()
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const stashContext = formatStrainContext(stashedStrains, 30)

  const prompt = `
You are Smokémon. A user has logged the following strains in their Smokédex stash.
Analyse their preferences and return personalised insights.

STASH:
${stashContext}

Respond ONLY with valid JSON matching this exact shape:
{
  "preferredType": "<string>",
  "commonEffects": ["<effect>", "<effect>", "<effect>"],
  "suggestion": "<1-2 sentences on what they might enjoy next>",
  "personalityNote": "<fun 1-liner about their cannabis personality>"
}
`.trim()

  const result: GenerateContentResult = await model.generateContent(prompt)
  const text = result.response.text()
  return parseJSON<StashInsight>(text)
}
