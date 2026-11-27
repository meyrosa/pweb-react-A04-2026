import type { ApplicationStatus } from '../types'
import { STATUS_LABEL } from '../utils/stateMachine'
import { matchTone } from '../utils/skillMatch'

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <span className={`badge status-${status}`}>● {STATUS_LABEL[status]}</span>
}

export function MatchBadge({ score }: { score: number }) {
  return <span className={`match match-${matchTone(score)}`}>● {score}% Match</span>
}
