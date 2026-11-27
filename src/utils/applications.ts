import type {
  ActivityLog,
  Application,
  ApplicationStatus,
  JobListing,
  WorkMode,
} from '../types'

export const makeId = (): string => crypto.randomUUID()

export function makeLog(message: string): ActivityLog {
  return { id: makeId(), timestamp: new Date().toISOString(), message }
}

export const normKey = (company: string, role: string): string =>
  `${company.trim().toLowerCase()}||${role.trim().toLowerCase()}`

export function isDuplicate(apps: Application[], company: string, role: string): boolean {
  const key = normKey(company, role)
  return apps.some((a) => normKey(a.company, a.role) === key)
}

export function inferWorkMode(location: string): WorkMode {
  const l = location.toLowerCase()
  if (l.includes('hybrid')) return 'Hybrid'
  if (l.includes('onsite') || l.includes('on-site') || l.includes('on site')) return 'Onsite'
  return 'Remote'
}

interface NewApplicationInput {
  company: string
  role: string
  workMode: WorkMode
  status: Extract<ApplicationStatus, 'WISHLIST' | 'APPLIED'>
  requiredSkills: string[]
  cvVersion?: string
  appliedDate?: string
  logMessage: string
}

export function createApplication(input: NewApplicationInput): Application {
  return {
    id: makeId(),
    company: input.company.trim(),
    role: input.role.trim(),
    workMode: input.workMode,
    status: input.status,
    requiredSkills: input.requiredSkills,
    cvVersion: input.cvVersion?.trim() || undefined,
    appliedDate: input.appliedDate || undefined,
    lastUpdatedAt: new Date().toISOString(),
    checklist: [],
    activityLogs: [makeLog(input.logMessage)],
  }
}

export function applicationFromJob(job: JobListing): Application {
  return createApplication({
    company: job.company_name,
    role: job.title,
    workMode: inferWorkMode(job.candidate_required_location),
    status: 'WISHLIST',
    requiredSkills: job.tags,
    logMessage: 'Disimpan ke Wishlist dari Katalog',
  })
}

export const DAY_MS = 24 * 60 * 60 * 1000

// Derived state: tidak disimpan, dihitung setiap render.
export function isGhostingRisk(app: Application, now: number = Date.now()): boolean {
  if (app.status !== 'APPLIED' && app.status !== 'SCREENING') return false
  return now - Date.parse(app.lastUpdatedAt) > 14 * DAY_MS
}

export function shiftBack15Days(app: Application): Application {
  return {
    ...app,
    lastUpdatedAt: new Date(Date.parse(app.lastUpdatedAt) - 15 * DAY_MS).toISOString(),
    activityLogs: [...app.activityLogs, makeLog('Simulasi +15 hari (untuk uji Rawan Ghosting)')],
  }
}
