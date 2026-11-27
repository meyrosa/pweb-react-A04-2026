import type { Application } from '../types'
import { isGhostingRisk } from './applications'

export interface Stats {
  total: number
  submitted: number
  responded: number
  interviewed: number
  responseRate: number
  interviewRate: number
  ghostingRisk: number
  offers: number
}

const pct = (n: number, d: number): number => (d === 0 ? 0 : Math.round((n / d) * 100))

// Semua angka dihitung langsung dari applications (derived state).
export function computeStats(apps: Application[], now: number = Date.now()): Stats {
  const submitted = apps.filter((a) => a.status !== 'WISHLIST').length
  const interviewed = apps.filter(
    (a) => a.interviewDateTime !== undefined || a.status === 'INTERVIEW' || a.status === 'OFFER',
  ).length
  const responded = apps.filter(
    (a) =>
      a.interviewDateTime !== undefined ||
      ['SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED'].includes(a.status),
  ).length
  return {
    total: apps.length,
    submitted,
    responded,
    interviewed,
    responseRate: pct(responded, submitted),
    interviewRate: pct(interviewed, submitted),
    ghostingRisk: apps.filter((a) => isGhostingRisk(a, now)).length,
    offers: apps.filter((a) => a.status === 'OFFER').length,
  }
}
