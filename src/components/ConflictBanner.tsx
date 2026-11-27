import type { InterviewConflict } from '../utils/conflicts'
import { formatDateTime } from '../utils/format'

export function ConflictBanner({ conflicts }: { conflicts: InterviewConflict[] }) {
  if (conflicts.length === 0) return null
  return (
    <div className="banner-danger" role="alert">
      {conflicts.map(({ a, b, diffMinutes }) => (
        <div key={`${a.id}-${b.id}`}>
          ⚠ <strong>Jadwal Interview Bentrok:</strong> {a.company} (
          {formatDateTime(a.interviewDateTime ?? '')}) dan {b.company} (
          {formatDateTime(b.interviewDateTime ?? '')}) berselisih {Math.round(diffMinutes)} menit
          (kurang dari 60 menit).
        </div>
      ))}
    </div>
  )
}
