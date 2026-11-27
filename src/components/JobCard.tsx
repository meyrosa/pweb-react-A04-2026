import type { JobListing, SkillMatch } from '../types'
import { MatchBadge } from './Badges'
import { initials } from '../utils/format'

interface Props {
  job: JobListing
  match: SkillMatch
  applied: boolean
  onSave: (job: JobListing) => void
}

export function JobCard({ job, match, applied, onSave }: Props) {
  const missing = new Set(match.missing)
  return (
    <article className="card job-card">
      <div className="job-head">
        <div className="logo">{initials(job.company_name)}</div>
        <div className="grow">
          <div className="strong">{job.company_name}</div>
          <div className="muted small">{job.candidate_required_location || 'Lokasi tidak disebut'}</div>
        </div>
        <MatchBadge score={match.score} />
      </div>
      <h3>{job.title}</h3>
      <div className="tags">
        {job.tags.map((t, i) => (
          <span key={`${t}-${i}`} className={missing.has(t) ? 'tag tag-missing' : 'tag'}>
            {t}
          </span>
        ))}
      </div>
      <div className="job-foot">
        <span className="salary">{job.salary || 'Gaji tidak disebut'}</span>
        <button className="btn btn-primary" disabled={applied} onClick={() => onSave(job)}>
          {applied ? 'Sudah Dilamar' : 'Simpan ke Wishlist'}
        </button>
      </div>
    </article>
  )
}
