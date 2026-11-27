import type { Application, WorkMode } from '../types'
import { calcSkillMatch } from './skillMatch'

export const MODE_SCORE: Record<WorkMode, number> = { Remote: 100, Hybrid: 75, Onsite: 50 }

export interface OfferScore {
  app: Application
  salary: number
  salaryNorm: number
  salaryPoints: number
  modePoints: number
  skillScore: number
  skillPoints: number
  total: number
}

// Normalisasi gaji = gaji / gaji tertinggi di antara kedua offer * 100.
export function scoreOffers(
  a: Application,
  b: Application,
  kaptenSkills: string[],
): [OfferScore, OfferScore] {
  const maxSalary = Math.max(a.salaryOffer ?? 0, b.salaryOffer ?? 0)
  const build = (app: Application): OfferScore => {
    const salary = app.salaryOffer ?? 0
    const salaryNorm = maxSalary > 0 ? (salary / maxSalary) * 100 : 0
    const skillScore = calcSkillMatch(app.requiredSkills, kaptenSkills).score
    const salaryPoints = salaryNorm * 0.5
    const modePoints = MODE_SCORE[app.workMode] * 0.25
    const skillPoints = skillScore * 0.25
    return {
      app,
      salary,
      salaryNorm,
      salaryPoints,
      modePoints,
      skillScore,
      skillPoints,
      total: salaryPoints + modePoints + skillPoints,
    }
  }
  return [build(a), build(b)]
}
