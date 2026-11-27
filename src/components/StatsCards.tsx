import type { Stats } from '../utils/stats'

export function StatsCards({ stats }: { stats: Stats }) {
  return (
    <section className="stats">
      <div className="card stat">
        <span className="label">Total Lamaran</span>
        <strong>{stats.total}</strong>
        <span className="muted small">{stats.submitted} sudah dikirim</span>
      </div>
      <div className="card stat">
        <span className="label">Response Rate</span>
        <strong>{stats.responseRate}%</strong>
        <span className="muted small">
          {stats.responded} dari {stats.submitted} diproses
        </span>
      </div>
      <div className="card stat">
        <span className="label">Interview Rate</span>
        <strong>{stats.interviewRate}%</strong>
        <span className="muted small">{stats.interviewed} masuk wawancara</span>
      </div>
      <div className="card stat">
        <span className="label">Rawan Ghosting</span>
        <strong className={stats.ghostingRisk > 0 ? 'text-red' : ''}>{stats.ghostingRisk}</strong>
        <span className="muted small">&gt;14 hari tanpa kabar</span>
      </div>
      <div className="card stat">
        <span className="label">Total Offer</span>
        <strong className="text-green">{stats.offers}</strong>
        <span className="muted small">Siap dibandingkan</span>
      </div>
    </section>
  )
}
