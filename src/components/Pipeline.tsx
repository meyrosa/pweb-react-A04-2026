import { useMemo, useState } from 'react'
import type { Application, ApplicationStatus } from '../types'
import { ALL_STATUSES, STATUS_LABEL } from '../utils/stateMachine'
import { calcSkillMatch } from '../utils/skillMatch'
import { isGhostingRisk } from '../utils/applications'
import { formatDateTime, formatRupiah } from '../utils/format'
import { MatchBadge, StatusBadge } from './Badges'

type SortKey = 'newest' | 'interview' | 'offer'

interface Props {
  applications: Application[]
  kaptenSkills: string[]
  onOpen: (id: string) => void
  onSimulate: (id: string) => void
  onExport: () => void
}

export function Pipeline({ applications, kaptenSkills, onOpen, onSimulate, onExport }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL')
  const [ghostOnly, setGhostOnly] = useState(false)
  const [sortBy, setSortBy] = useState<SortKey>('newest')

  const now = Date.now()

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = applications.filter((a) => {
      if (q && !a.company.toLowerCase().includes(q) && !a.role.toLowerCase().includes(q)) return false
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false
      if (ghostOnly && !isGhostingRisk(a)) return false
      return true
    })
    const sorted = [...list]
    if (sortBy === 'interview') {
      const t = (a: Application) =>
        a.interviewDateTime ? Date.parse(a.interviewDateTime) : Number.POSITIVE_INFINITY
      sorted.sort((a, b) => t(a) - t(b))
    } else if (sortBy === 'offer') {
      sorted.sort((a, b) => (b.salaryOffer ?? -1) - (a.salaryOffer ?? -1))
    }
    return sorted
  }, [applications, search, statusFilter, ghostOnly, sortBy])

  return (
    <section className="card main-panel">
      <div className="toolbar">
        <input
          className="grow"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari perusahaan atau posisi..."
          aria-label="Cari lamaran"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'ALL')}
          aria-label="Filter status"
        >
          <option value="ALL">Semua Status</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} aria-label="Urutkan">
          <option value="newest">Terbaru</option>
          <option value="interview">Jadwal Interview Terdekat</option>
          <option value="offer">Offer Tertinggi</option>
        </select>
        <label className="radio">
          <input type="checkbox" checked={ghostOnly} onChange={(e) => setGhostOnly(e.target.checked)} />
          Hanya Rawan Ghosting
        </label>
        <button className="btn" onClick={onExport} disabled={applications.length === 0}>
          Export JSON
        </button>
      </div>

      {applications.length === 0 && (
        <div className="state-box">
          <p>Belum ada lamaran. Simpan lowongan dari katalog atau klik “+ Catat Lamaran”.</p>
        </div>
      )}
      {applications.length > 0 && rows.length === 0 && (
        <div className="state-box">
          <p>Tidak ada lamaran yang cocok dengan filter.</p>
        </div>
      )}

      <div className="grid-2">
        {rows.map((a) => {
          const done = a.checklist.filter((c) => c.done).length
          const ghost = isGhostingRisk(a, now)
          const canSimulate = a.status === 'APPLIED' || a.status === 'SCREENING'
          return (
            <article key={a.id} className="card job-card">
              <div className="job-head">
                <div className="grow">
                  <div className="strong">{a.company}</div>
                  <div className="muted small">{a.role}</div>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div className="meta small">
                <span>{a.workMode}</span>
                <span>CV: {a.cvVersion ?? '—'}</span>
                <span>
                  Checklist: {done}/{a.checklist.length}
                </span>
                {a.interviewDateTime && a.status === 'INTERVIEW' && (
                  <span>Interview: {formatDateTime(a.interviewDateTime)}</span>
                )}
                {a.salaryOffer !== undefined && a.status === 'OFFER' && (
                  <span>Offer: {formatRupiah(a.salaryOffer)}</span>
                )}
              </div>
              <div className="row">
                <MatchBadge score={calcSkillMatch(a.requiredSkills, kaptenSkills).score} />
                {ghost && <span className="badge badge-ghost">👻 Rawan Ghosting</span>}
              </div>
              <div className="row end">
                {canSimulate && (
                  <button className="btn" onClick={() => onSimulate(a.id)}>
                    Simulasi +15 Hari
                  </button>
                )}
                <button className="btn btn-primary" onClick={() => onOpen(a.id)}>
                  Detail
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
