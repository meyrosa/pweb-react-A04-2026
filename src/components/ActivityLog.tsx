import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ActivityLog as Log } from '../types'
import { formatDateTime } from '../utils/format'

interface Props {
  logs: Log[]
  onAddNote: (text: string) => void
}

export function ActivityLog({ logs, onAddNote }: Props) {
  const [note, setNote] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!note.trim()) return
    onAddNote(note.trim())
    setNote('')
  }

  return (
    <div>
      <h4>Riwayat Aktivitas</h4>
      <form className="row" onSubmit={handleSubmit}>
        <input
          className="grow"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Tambah catatan manual..."
        />
        <button type="submit" className="btn">
          Catat
        </button>
      </form>
      <ul className="timeline">
        {[...logs].reverse().map((log) => (
          <li key={log.id}>
            <span className="mono small muted">{formatDateTime(log.timestamp)}</span>
            <div>{log.message}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
