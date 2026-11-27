import type { Application, ApplicationStatus, TransitionInput } from '../types'

// Diagram State Machine (sumber tunggal kebenaran untuk perpindahan status).
// OFFER & REJECTED final. GHOSTED boleh kembali ke SCREENING.
export const TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  WISHLIST: ['APPLIED'],
  APPLIED: ['SCREENING', 'REJECTED', 'GHOSTED'],
  SCREENING: ['INTERVIEW', 'REJECTED', 'GHOSTED'],
  INTERVIEW: ['OFFER', 'REJECTED', 'GHOSTED'],
  OFFER: [],
  REJECTED: [],
  GHOSTED: ['SCREENING', 'REJECTED'],
}

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  WISHLIST: 'Wishlist',
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  GHOSTED: 'Ghosted',
}

export const ALL_STATUSES = Object.keys(TRANSITIONS) as ApplicationStatus[]

export function getNextStatuses(from: ApplicationStatus): ApplicationStatus[] {
  return TRANSITIONS[from]
}

export function canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return TRANSITIONS[from].includes(to)
}

// Mengembalikan pesan error, atau null jika transisi sah.
export function validateTransition(
  app: Application,
  to: ApplicationStatus,
  input: TransitionInput,
): string | null {
  if (!canTransition(app.status, to)) {
    return `Tidak bisa pindah dari ${STATUS_LABEL[app.status]} ke ${STATUS_LABEL[to]}.`
  }
  if (to === 'APPLIED') {
    if (!input.cvVersion?.trim()) return 'Versi CV wajib diisi.'
    if (!input.appliedDate) return 'Tanggal melamar wajib diisi.'
  }
  if (to === 'INTERVIEW' && !input.interviewDateTime) {
    return 'Jadwal interview wajib diisi.'
  }
  if (to === 'OFFER') {
    if (!input.salaryOffer || input.salaryOffer <= 0) return 'Gaji / uang saku harus lebih dari 0.'
    if (!input.workMode) return 'Mode kerja wajib dipilih.'
  }
  return null
}
