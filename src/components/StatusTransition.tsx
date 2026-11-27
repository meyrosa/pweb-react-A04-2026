import { useState } from 'react'
import type { Application, ApplicationStatus, TransitionInput, WorkMode } from '../types'
import { STATUS_LABEL, getNextStatuses, validateTransition } from '../utils/stateMachine'

interface Props {
  app: Application
  onTransition: (to: ApplicationStatus, input: TransitionInput) => void
}

export function StatusTransition({ app, onTransition }: Props) {
  const options = getNextStatuses(app.status)
  const [target, setTarget] = useState<ApplicationStatus | null>(null)
  const [cvVersion, setCvVersion] = useState('')
  const [appliedDate, setAppliedDate] = useState('')
  const [interviewDateTime, setInterviewDateTime] = useState('')
  const [salary, setSalary] = useState('')
  const [workMode, setWorkMode] = useState<WorkMode>(app.workMode)
  const [error, setError] = useState('')

  if (options.length === 0) {
    return (
      <div className="panel-soft">
        Status <strong>{STATUS_LABEL[app.status]}</strong> bersifat final — tidak bisa dipindah lagi.
      </div>
    )
  }

  const handleConfirm = () => {
    if (!target) return
    const input: TransitionInput = {
      cvVersion,
      appliedDate,
      interviewDateTime,
      salaryOffer: salary === '' ? undefined : Number(salary),
      workMode,
    }
    const err = validateTransition(app, target, input)
    if (err) {
      setError(err)
      return
    }
    onTransition(target, input)
  }

  return (
    <div className="panel-soft">
      <div className="row between">
        <span className="strong">Pindahkan status ke:</span>
        <div className="row">
          {options.map((s) => (
            <button
              key={s}
              className={target === s ? 'btn btn-dark' : 'btn'}
              onClick={() => {
                setTarget(s)
                setError('')
              }}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {target && (
        <div className="row wrap">
          {target === 'APPLIED' && (
            <>
              <input
                className="grow"
                placeholder="Versi CV (mis. Kapten-CV-v2.pdf)"
                value={cvVersion}
                onChange={(e) => setCvVersion(e.target.value)}
              />
              <input type="date" value={appliedDate} onChange={(e) => setAppliedDate(e.target.value)} />
            </>
          )}
          {target === 'INTERVIEW' && (
            <input
              type="datetime-local"
              value={interviewDateTime}
              onChange={(e) => setInterviewDateTime(e.target.value)}
            />
          )}
          {target === 'OFFER' && (
            <>
              <input
                className="grow"
                type="number"
                min={0}
                placeholder="Uang saku / gaji (Rp)"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              />
              <select value={workMode} onChange={(e) => setWorkMode(e.target.value as WorkMode)}>
                <option>Remote</option>
                <option>Hybrid</option>
                <option>Onsite</option>
              </select>
            </>
          )}
          <button className="btn btn-primary" onClick={handleConfirm}>
            Konfirmasi
          </button>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  )
}
