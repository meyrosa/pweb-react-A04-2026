import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ChecklistItem } from '../types'

interface Props {
  items: ChecklistItem[]
  onAdd: (text: string) => void
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}

export function Checklist({ items, onAdd, onToggle, onRemove }: Props) {
  const [draft, setDraft] = useState('')
  const done = items.filter((i) => i.done).length
  const percent = items.length === 0 ? 0 : Math.round((done / items.length) * 100)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    onAdd(draft.trim())
    setDraft('')
  }

  return (
    <div>
      <div className="row between">
        <h4>Daftar Persiapan</h4>
        <span className="mono small text-blue">
          {done} / {items.length} selesai
        </span>
      </div>
      <div className="progress">
        <div className="progress-bar" style={{ width: `${percent}%` }} />
      </div>
      <ul className="checklist">
        {items.map((item) => (
          <li key={item.id}>
            <label className={item.done ? 'done grow' : 'grow'}>
              <input type="checkbox" checked={item.done} onChange={() => onToggle(item.id)} />
              {item.text}
            </label>
            <button className="btn btn-ghost" onClick={() => onRemove(item.id)} aria-label="Hapus tugas">
              ✕
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="muted small">Belum ada tugas persiapan.</li>}
      </ul>
      <form className="row" onSubmit={handleSubmit}>
        <input
          className="grow"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Tambah tugas persiapan baru..."
        />
        <button type="submit" className="btn btn-dark">
          Tambah
        </button>
      </form>
    </div>
  )
}
