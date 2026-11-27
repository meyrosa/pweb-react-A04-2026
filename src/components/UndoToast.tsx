import { useEffect, useState } from 'react'

interface Props {
  company: string
  onUndo: () => void
}

const UNDO_SECONDS = 5

// Parent memberi key = id lamaran terhapus, jadi countdown otomatis mulai ulang.
export function UndoToast({ company, onUndo }: Props) {
  const [left, setLeft] = useState(UNDO_SECONDS)

  useEffect(() => {
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="toast" role="status">
      <span>
        Lamaran <strong>{company}</strong> telah dihapus.
      </span>
      <button className="link" onClick={onUndo}>
        Undo ({left}d)
      </button>
    </div>
  )
}
