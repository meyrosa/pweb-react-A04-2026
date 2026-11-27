import type { Application, ApplicationStatus, TransitionInput } from '../types'
import { STATUS_LABEL } from '../utils/stateMachine'
import { calcSkillMatch } from '../utils/skillMatch'
import { isGhostingRisk, makeId, makeLog } from '../utils/applications'
import { formatDateTime, formatRupiah } from '../utils/format'
import { MatchBadge, StatusBadge } from './Badges'
import { Modal } from './Modal'
import { StatusTransition } from './StatusTransition'
import { Checklist } from './Checklist'
import { ActivityLog } from './ActivityLog'
import { InterviewPrep } from './InterviewPrep'

const STEPS: ApplicationStatus[] = ['WISHLIST', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER']

interface Props {
  app: Application
  kaptenSkills: string[]
  onUpdate: (updater: (a: Application) => Application) => void
  onDelete: () => void
  onSimulate: () => void
  onClose: () => void
}

function transitionMessage(from: ApplicationStatus, to: ApplicationStatus, input: TransitionInput): string {
  switch (to) {
    case 'APPLIED':
      return `Lamaran dikirim (CV: ${input.cvVersion?.trim()})`
    case 'SCREENING':
      return from === 'GHOSTED' ? 'Kembali ke tahap Screening (HRD merespons)' : 'Lolos tahap Screening'
    case 'INTERVIEW':
      return `Pindah ke Interview (jadwal ${formatDateTime(input.interviewDateTime ?? '')})`
    case 'OFFER':
      return `Mendapat Offer ${formatRupiah(input.salaryOffer ?? 0)} (${input.workMode})`
    default:
      return `Status diubah ke ${STATUS_LABEL[to]}`
  }
}

export function ApplicationDetail({ app, kaptenSkills, onUpdate, onDelete, onSimulate, onClose }: Props) {
  const match = calcSkillMatch(app.requiredSkills, kaptenSkills)
  const stepIndex = STEPS.indexOf(app.status)
  const canSimulate = app.status === 'APPLIED' || app.status === 'SCREENING'

  // Semua update immutable: spread + map/filter, tidak ada push() / mutasi langsung.
  const handleTransition = (to: ApplicationStatus, input: TransitionInput) => {
    onUpdate((a) => ({
      ...a,
      status: to,
      lastUpdatedAt: new Date().toISOString(),
      ...(to === 'APPLIED' ? { cvVersion: input.cvVersion?.trim(), appliedDate: input.appliedDate } : {}),
      ...(to === 'INTERVIEW' ? { interviewDateTime: input.interviewDateTime } : {}),
      ...(to === 'OFFER' ? { salaryOffer: input.salaryOffer, workMode: input.workMode ?? a.workMode } : {}),
      activityLogs: [...a.activityLogs, makeLog(transitionMessage(a.status, to, input))],
    }))
  }

  return (
    <Modal title={`${app.role} — ${app.company}`} onClose={onClose} wide>
      <div className="row between wrap">
        <div className="row wrap">
          <StatusBadge status={app.status} />
          <MatchBadge score={match.score} />
          {isGhostingRisk(app) && <span className="badge badge-ghost">👻 Rawan Ghosting</span>}
        </div>
        <div className="row">
          {canSimulate && (
            <button className="btn" onClick={onSimulate}>
              Simulasi +15 Hari
            </button>
          )}
          <button className="btn btn-danger" onClick={onDelete}>
            Hapus
          </button>
        </div>
      </div>
      <p className="muted small">
        {app.workMode} • CV: {app.cvVersion ?? '—'}
        {app.appliedDate ? ` • Dilamar: ${app.appliedDate}` : ''}
        {app.status === 'INTERVIEW' && app.interviewDateTime
          ? ` • Jadwal Interview: ${formatDateTime(app.interviewDateTime)}`
          : ''}
        {app.salaryOffer !== undefined && app.status === 'OFFER'
          ? ` • Offer: ${formatRupiah(app.salaryOffer)}`
          : ''}
      </p>
      {match.missing.length > 0 && (
        <p className="small">
          Missing skill: {match.missing.map((m) => <span key={m} className="tag tag-missing">{m}</span>)}
        </p>
      )}

      <div className="detail-grid">
        <div className="stack">
          <h4>Tahap Seleksi</h4>
          <div className="stepper">
            {STEPS.map((s, i) => (
              <div key={s} className={i <= stepIndex ? 'step step-on' : 'step'}>
                {i + 1}. {STATUS_LABEL[s]}
              </div>
            ))}
          </div>
          <StatusTransition key={app.status} app={app} onTransition={handleTransition} />
          <Checklist
            items={app.checklist}
            onAdd={(text) =>
              onUpdate((a) => ({ ...a, checklist: [...a.checklist, { id: makeId(), text, done: false }] }))
            }
            onToggle={(id) =>
              onUpdate((a) => ({
                ...a,
                checklist: a.checklist.map((c) => (c.id === id ? { ...c, done: !c.done } : c)),
              }))
            }
            onRemove={(id) =>
              onUpdate((a) => ({ ...a, checklist: a.checklist.filter((c) => c.id !== id) }))
            }
          />
        </div>
        <div className="stack">
          <InterviewPrep />
          <ActivityLog
            logs={app.activityLogs}
            onAddNote={(text) =>
              onUpdate((a) => ({ ...a, activityLogs: [...a.activityLogs, makeLog(`Catatan: ${text}`)] }))
            }
          />
        </div>
      </div>
    </Modal>
  )
}
