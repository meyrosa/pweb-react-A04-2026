import { useState } from 'react'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type { JobSource } from '../types'

interface Props {
  skills: string[]
  setSkills: Dispatch<SetStateAction<string[]>>
  source: JobSource
  onSourceChange: (s: JobSource) => void
}

export function SkillProfile({ skills, setSkills, source, onSourceChange }: Props) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    const value = draft.trim()
    if (!value) {
      setError('Skill tidak boleh kosong.')
      return
    }
    if (skills.some((s) => s.toLowerCase() === value.toLowerCase())) {
      setError(`Skill "${value}" sudah ada.`)
      return
    }
    setSkills((prev) => [...prev, value])
    setDraft('')
    setError('')
  }

  const handleRemove = (skill: string) => setSkills((prev) => prev.filter((s) => s !== skill))

  return (
    <aside className="card side">
      <h3>Profil Skill Kapten</h3>
      <p className="muted small">Digunakan untuk menghitung persentase kecocokan tiap lowongan.</p>
      <form className="row" onSubmit={handleAdd}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Tambah skill..."
          aria-label="Tambah skill"
        />
        <button type="submit" className="btn btn-dark">
          Tambah
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <div className="tags">
        {skills.map((s) => (
          <span key={s} className="tag">
            {s}
            <button className="tag-x" onClick={() => handleRemove(s)} aria-label={`Hapus ${s}`}>
              ✕
            </button>
          </span>
        ))}
        {skills.length === 0 && <span className="muted small">Belum ada skill.</span>}
      </div>
      <hr />
      <h4>Sumber Data Lowongan</h4>
      <label className="radio">
        <input
          type="radio"
          name="source"
          checked={source === 'remotive'}
          onChange={() => onSourceChange('remotive')}
        />
        Remotive API (Live)
      </label>
      <label className="radio">
        <input
          type="radio"
          name="source"
          checked={source === 'local'}
          onChange={() => onSourceChange('local')}
        />
        Dataset Magang ID (Lokal)
      </label>
    </aside>
  )
}
