import { useRef, useState } from 'react'
import type { FormEvent, RefObject } from 'react'
import type { Application, WorkMode } from '../types'
import { createApplication, isDuplicate } from '../utils/applications'
import { parseSkills } from '../utils/skillMatch'
import { Modal } from './Modal'

type FieldKey = 'company' | 'role' | 'skills' | 'cv' | 'date'
const FIELD_ORDER: FieldKey[] = ['company', 'role', 'skills', 'cv', 'date']

interface Props {
  applications: Application[]
  onSubmit: (app: Application) => void
  onClose: () => void
}

export function ApplicationForm({ applications, onSubmit, onClose }: Props) {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [workMode, setWorkMode] = useState<WorkMode>('Remote')
  const [status, setStatus] = useState<'WISHLIST' | 'APPLIED'>('WISHLIST')
  const [skillsRaw, setSkillsRaw] = useState('')
  const [cvVersion, setCvVersion] = useState('')
  const [appliedDate, setAppliedDate] = useState('')
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({})

  const companyRef = useRef<HTMLInputElement>(null)
  const roleRef = useRef<HTMLInputElement>(null)
  const skillsRef = useRef<HTMLInputElement>(null)
  const cvRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const refs: Record<FieldKey, RefObject<HTMLInputElement | null>> = {
    company: companyRef,
    role: roleRef,
    skills: skillsRef,
    cv: cvRef,
    date: dateRef,
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const skills = parseSkills(skillsRaw)
    const errs: Partial<Record<FieldKey, string>> = {}
    if (!company.trim()) errs.company = 'Perusahaan wajib diisi.'
    if (!role.trim()) errs.role = 'Posisi / role wajib diisi.'
    if (company.trim() && role.trim() && isDuplicate(applications, company, role)) {
      errs.company = 'Lamaran dengan company + role yang sama sudah ada.'
    }
    if (skills.length === 0) errs.skills = 'Isi minimal 1 skill (pisahkan dengan koma).'
    if (status === 'APPLIED') {
      if (!cvVersion.trim()) errs.cv = 'Versi CV wajib diisi.'
      if (!appliedDate) errs.date = 'Tanggal melamar wajib diisi.'
    }
    setErrors(errs)

    const firstError = FIELD_ORDER.find((k) => errs[k])
    if (firstError) {
      refs[firstError].current?.focus()
      return
    }

    onSubmit(
      createApplication({
        company,
        role,
        workMode,
        status,
        requiredSkills: skills,
        cvVersion,
        appliedDate,
        logMessage:
          status === 'APPLIED'
            ? `Lamaran dikirim (CV: ${cvVersion.trim()})`
            : 'Lamaran dicatat manual ke Wishlist',
      }),
    )
  }

  return (
    <Modal title="Catat Lamaran Baru" onClose={onClose}>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <label>
          Perusahaan
          <input ref={companyRef} value={company} onChange={(e) => setCompany(e.target.value)} />
          {errors.company && <span className="error">{errors.company}</span>}
        </label>
        <label>
          Posisi / Role
          <input ref={roleRef} value={role} onChange={(e) => setRole(e.target.value)} />
          {errors.role && <span className="error">{errors.role}</span>}
        </label>
        <div className="row">
          <label className="grow">
            Mode Kerja
            <select value={workMode} onChange={(e) => setWorkMode(e.target.value as WorkMode)}>
              <option>Remote</option>
              <option>Hybrid</option>
              <option>Onsite</option>
            </select>
          </label>
          <label className="grow">
            Status Awal
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value === 'APPLIED' ? 'APPLIED' : 'WISHLIST')}
            >
              <option value="WISHLIST">WISHLIST</option>
              <option value="APPLIED">APPLIED</option>
            </select>
          </label>
        </div>
        <label>
          Required Skills (pisahkan dengan koma)
          <input
            ref={skillsRef}
            value={skillsRaw}
            onChange={(e) => setSkillsRaw(e.target.value)}
            placeholder="React, TypeScript, Docker"
          />
          {errors.skills && <span className="error">{errors.skills}</span>}
        </label>
        {status === 'APPLIED' && (
          <div className="row">
            <label className="grow">
              Versi CV
              <input
                ref={cvRef}
                value={cvVersion}
                onChange={(e) => setCvVersion(e.target.value)}
                placeholder="Kapten-CV-v2.pdf"
              />
              {errors.cv && <span className="error">{errors.cv}</span>}
            </label>
            <label className="grow">
              Tanggal Melamar
              <input
                ref={dateRef}
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
              />
              {errors.date && <span className="error">{errors.date}</span>}
            </label>
          </div>
        )}
        <div className="row end">
          <button type="button" className="btn" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary">
            Simpan Lamaran
          </button>
        </div>
      </form>
    </Modal>
  )
}
