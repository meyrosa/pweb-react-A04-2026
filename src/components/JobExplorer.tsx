import { useEffect, useMemo, useRef, useState } from 'react'
import type { Application, JobListing, JobSource } from '../types'
import { fetchLocalJobs, fetchRemotiveJobs } from '../services/jobService'
import { useDebounce } from '../hooks/useDebounce'
import { calcSkillMatch } from '../utils/skillMatch'
import { isDuplicate } from '../utils/applications'
import { JobCard } from './JobCard'

type FetchState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; jobs: JobListing[] }

interface Props {
  source: JobSource
  onSourceChange: (s: JobSource) => void
  kaptenSkills: string[]
  applications: Application[]
  onSave: (job: JobListing) => void
}

export function JobExplorer({ source, onSourceChange, kaptenSkills, applications, onSave }: Props) {
  const [state, setState] = useState<FetchState>({ status: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('ALL')
  const [sortBy, setSortBy] = useState<'match' | 'default'>('match')
  const searchRef = useRef<HTMLInputElement>(null)
  const debouncedKeyword = useDebounce(keyword, 400)

  // Fetch + AbortController (dibatalkan saat source berubah / unmount)
  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })
    const load = source === 'remotive' ? fetchRemotiveJobs : fetchLocalJobs
    load(controller.signal)
      .then((jobs) => setState({ status: 'success', jobs }))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : 'Terjadi kesalahan tidak dikenal.',
        })
      })
    return () => controller.abort()
  }, [source, reloadKey])

  // Bonus: tekan "/" untuk fokus ke search bar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement
      if (e.key === '/' && !typing) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const jobs = state.status === 'success' ? state.jobs : []
  const categories = useMemo(() => Array.from(new Set(jobs.map((j) => j.category))).sort(), [jobs])

  const visible = useMemo(() => {
    const q = debouncedKeyword.trim().toLowerCase()
    const rows = jobs
      .filter((j) => category === 'ALL' || j.category === category)
      .filter(
        (j) => !q || j.title.toLowerCase().includes(q) || j.company_name.toLowerCase().includes(q),
      )
      .map((job) => ({ job, match: calcSkillMatch(job.tags, kaptenSkills) }))
    if (sortBy === 'match') rows.sort((a, b) => b.match.score - a.match.score)
    return rows
  }, [jobs, category, debouncedKeyword, sortBy, kaptenSkills])

  return (
    <section className="card main-panel">
      <div className="toolbar">
        <input
          ref={searchRef}
          className="grow"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Cari posisi atau perusahaan...  (tekan / untuk fokus)"
          aria-label="Cari lowongan"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Kategori">
          <option value="ALL">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value === 'match' ? 'match' : 'default')}
          aria-label="Urutkan"
        >
          <option value="match">Match Tertinggi</option>
          <option value="default">Urutan Asli</option>
        </select>
      </div>
      {keyword !== debouncedKeyword && <p className="muted small">Mencari…</p>}

      {state.status === 'loading' && (
        <div className="state-box">
          <div className="spinner" aria-hidden="true" />
          <p>Memuat lowongan…</p>
        </div>
      )}

      {state.status === 'error' && (
        <div className="state-box state-error">
          <p>
            <strong>Gagal memuat lowongan.</strong> {state.message}
          </p>
          <div className="row center">
            <button className="btn btn-primary" onClick={() => setReloadKey((k) => k + 1)}>
              Coba Lagi
            </button>
            <button className="btn" onClick={() => onSourceChange('local')}>
              Pakai Dataset Lokal
            </button>
          </div>
        </div>
      )}

      {state.status === 'success' && visible.length === 0 && (
        <div className="state-box">
          <p>Tidak ada lowongan yang cocok dengan pencarian / filter.</p>
          <button
            className="btn"
            onClick={() => {
              setKeyword('')
              setCategory('ALL')
            }}
          >
            Reset Filter
          </button>
        </div>
      )}

      {state.status === 'success' && visible.length > 0 && (
        <div className="grid-2">
          {visible.map(({ job, match }) => (
            <JobCard
              key={job.id}
              job={job}
              match={match}
              applied={isDuplicate(applications, job.company_name, job.title)}
              onSave={onSave}
            />
          ))}
        </div>
      )}
    </section>
  )
}
