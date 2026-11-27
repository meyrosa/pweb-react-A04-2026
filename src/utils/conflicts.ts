import type { Application } from '../types'

export interface InterviewConflict {
  a: Application
  b: Application
  diffMinutes: number
}

// Cek dari SELURUH data (bukan data yang ter-filter).
export function findInterviewConflicts(apps: Application[]): InterviewConflict[] {
  const interviews = apps.filter((a) => a.status === 'INTERVIEW' && a.interviewDateTime)
  const result: InterviewConflict[] = []
  for (let i = 0; i < interviews.length; i++) {
    for (let j = i + 1; j < interviews.length; j++) {
      const ta = Date.parse(interviews[i].interviewDateTime ?? '')
      const tb = Date.parse(interviews[j].interviewDateTime ?? '')
      if (Number.isNaN(ta) || Number.isNaN(tb)) continue
      const diffMinutes = Math.abs(ta - tb) / 60000
      if (diffMinutes < 60) result.push({ a: interviews[i], b: interviews[j], diffMinutes })
    }
  }
  return result
}
