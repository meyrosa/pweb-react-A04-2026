import { useState } from 'react'
import type { Application } from '../types'
import { scoreOffers } from '../utils/offer'
import type { OfferScore } from '../utils/offer'
import { formatRupiah } from '../utils/format'

interface Props {
  applications: Application[]
  kaptenSkills: string[]
}

const f1 = (n: number): string => n.toFixed(1)

function OfferCard({ s, best }: { s: OfferScore; best: boolean }) {
  return (
    <div className={best ? 'card offer best' : 'card offer'}>
      <div className="row between">
        <div>
          <h3>{s.app.company}</h3>
          <p className="muted small">{s.app.role}</p>
        </div>
        {best && <span className="badge badge-best">Rekomendasi Terbaik</span>}
      </div>
      <div className="offer-row">
        <span>Uang Saku / Bulan</span>
        <span className="mono">{formatRupiah(s.salary)}</span>
        <span className="mono">{f1(s.salaryPoints)} / 50</span>
      </div>
      <div className="offer-row">
        <span>Mode Kerja</span>
        <span>
          {s.app.workMode} ({s.modePoints * 4})
        </span>
        <span className="mono">{f1(s.modePoints)} / 25</span>
      </div>
      <div className="offer-row">
        <span>Kecocokan Skill</span>
        <span>{s.skillScore}%</span>
        <span className="mono">{f1(s.skillPoints)} / 25</span>
      </div>
      <div className="offer-total">
        <span>TOTAL SKOR BERBOBOT</span>
        <strong className="mono">{f1(s.total)}</strong>
      </div>
    </div>
  )
}

export function OfferComparator({ applications, kaptenSkills }: Props) {
  const offers = applications.filter((a) => a.status === 'OFFER')
  const [idA, setIdA] = useState('')
  const [idB, setIdB] = useState('')

  if (offers.length < 2) {
    return (
      <section className="card main-panel">
        <div className="state-box">
          <p>
            <strong>Offer Comparator belum bisa dipakai.</strong> Kamu butuh minimal 2 lamaran
            berstatus OFFER (saat ini: {offers.length}).
          </p>
        </div>
      </section>
    )
  }

  // Pilihan tersimpan sebagai id; jika id tak valid (mis. offer dihapus) pakai default.
  const a = offers.find((o) => o.id === idA) ?? offers[0]
  const b = offers.find((o) => o.id === idB) ?? offers.find((o) => o.id !== a.id) ?? offers[1]
  const same = a.id === b.id
  const [sa, sb] = scoreOffers(a, b, kaptenSkills)
  const tie = Math.abs(sa.total - sb.total) < 0.05

  return (
    <section className="card main-panel">
      <div className="row between wrap">
        <div>
          <h2>Bandingkan Offer Magang</h2>
          <p className="muted small">Bobot penilaian: Uang Saku 50% • Mode Kerja 25% • Kecocokan Skill 25%</p>
        </div>
        <div className="row">
          <select value={a.id} onChange={(e) => setIdA(e.target.value)} aria-label="Offer A">
            {offers.map((o) => (
              <option key={o.id} value={o.id}>
                Offer A: {o.company}
              </option>
            ))}
          </select>
          <span className="muted">vs</span>
          <select value={b.id} onChange={(e) => setIdB(e.target.value)} aria-label="Offer B">
            {offers.map((o) => (
              <option key={o.id} value={o.id}>
                Offer B: {o.company}
              </option>
            ))}
          </select>
        </div>
      </div>
      {same ? (
        <div className="state-box">
          <p>Pilih dua offer yang berbeda untuk dibandingkan.</p>
        </div>
      ) : (
        <>
          <div className="grid-2">
            <OfferCard s={sa} best={!tie && sa.total > sb.total} />
            <OfferCard s={sb} best={!tie && sb.total > sa.total} />
          </div>
          {tie && <p className="muted center-text">Skor kedua offer seimbang (seri).</p>}
        </>
      )}
    </section>
  )
}
