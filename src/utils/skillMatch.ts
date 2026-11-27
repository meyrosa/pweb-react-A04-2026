import type { SkillMatch } from '../types'

const norm = (s: string): string => s.trim().toLowerCase()

export function calcSkillMatch(required: string[], owned: string[]): SkillMatch {
  const ownedSet = new Set(owned.map(norm))
  const matched: string[] = []
  const missing: string[] = []
  for (const skill of required) {
    if (ownedSet.has(norm(skill))) matched.push(skill)
    else missing.push(skill)
  }
  const score = required.length === 0 ? 0 : Math.round((matched.length / required.length) * 100)
  return { score, matched, missing }
}

export type MatchTone = 'green' | 'yellow' | 'red'

export function matchTone(score: number): MatchTone {
  if (score >= 70) return 'green'
  if (score >= 40) return 'yellow'
  return 'red'
}

export function parseSkills(raw: string): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const part of raw.split(',')) {
    const s = part.trim()
    if (s && !seen.has(norm(s))) {
      seen.add(norm(s))
      result.push(s)
    }
  }
  return result
}
