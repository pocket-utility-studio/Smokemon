/**
 * gemini.ts
 * AI services powered by Google Gemini.
 *
 * Requires VITE_GEMINI_API_KEY in .env.local
 * Get a free key at https://aistudio.google.com/app/apikey
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { StrainEntry } from '../context/StashContext'

// ── Client ────────────────────────────────────────────────────────────────────

function getClient(): GoogleGenerativeAI {
  const key = localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY
  if (!key) throw new Error('NO_KEY')
  return new GoogleGenerativeAI(key)
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
  const model = client.getGenerativeModel(
    { model: 'gemini-1.5-flash-8b' },
    { apiVersion: 'v1' },
  )

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
