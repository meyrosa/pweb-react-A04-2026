import type { JobListing } from '../types'

const REMOTIVE_URL = 'https://remotive.com/api/remote-jobs?category=software-dev&limit=30'
const LOCAL_URL = `${import.meta.env.BASE_URL}magang-fallback.json`

interface JobsPayload {
  jobs: JobListing[]
}

function normalize(raw: JobListing): JobListing {
  return {
    id: raw.id,
    title: raw.title ?? '',
    company_name: raw.company_name ?? '',
    category: raw.category ?? 'Lainnya',
    candidate_required_location: raw.candidate_required_location ?? '',
    salary: raw.salary ?? '',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
  }
}

async function request(url: string, signal: AbortSignal): Promise<JobListing[]> {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Server membalas ${res.status} ${res.statusText}`)
  const data = (await res.json()) as JobsPayload | JobListing[]
  const jobs = Array.isArray(data) ? data : data.jobs
  return jobs.map(normalize)
}

export const fetchRemotiveJobs = (signal: AbortSignal): Promise<JobListing[]> =>
  request(REMOTIVE_URL, signal)

export const fetchLocalJobs = (signal: AbortSignal): Promise<JobListing[]> =>
  request(LOCAL_URL, signal)
