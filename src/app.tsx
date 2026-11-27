import { useEffect, useRef, useState } from 'react'
import type { Application, JobListing, JobSource } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'
import { applicationFromJob, isDuplicate, shiftBack15Days } from './utils/applications'
import { findInterviewConflicts } from './utils/conflicts'
import { computeStats } from './utils/stats'
import { ConflictBanner } from './components/ConflictBanner'
import { StatsCards } from './components/StatsCards'
import { SkillProfile } from './components/SkillProfile'
import { JobExplorer } from './components/JobExplorer'
import { Pipeline } from './components/Pipeline'
import { OfferComparator } from './components/OfferComparator'
import { ApplicationForm } from './components/ApplicationForm'
import { ApplicationDetail } from './components/ApplicationDetail'
import { UndoToast } from './components/UndoToast'

type View = 'explore' | 'pipeline' | 'offers'

interface PendingDelete {
  app: Application
  index: number
}

const UNDO_MS = 5000
const DEFAULT_SKILLS = ['React', 'TypeScript', 'CSS']

export default function App() {
  // State utama + persistensi lewat custom hook useLocalStorage<T>
  const [applications, setApplications] = useLocalStorage<Application[]>('amm.applications', [])
  const [kaptenSkills, setKaptenSkills] = useLocalStorage<string[]>('amm.kaptenSkills', DEFAULT_SKILLS)

  const [view, setView] = useState<View>('explore')
  const [source, setSource] = useState<JobSource>('remotive')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [pending, setPending] = useState<PendingDelete | null>(null)
  const undoTimer = useRef<number | undefined>(undefined)

  // Derived state: dihitung dari seluruh data, bukan disimpan terpisah.
  const conflicts = findInterviewConflicts(applications)
  const stats = computeStats(applications)
  const selected = applications.find((a) => a.id === selectedId) ?? null

  useEffect(() => {
    return () => window.clearTimeout(undoTimer.current)
  }, [])

  const updateApplication = (id: string, updater: (a: Application) => Application) =>
    setApplications((prev) => prev.map((a) => (a.id === id ? updater(a) : a)))

  const saveJob = (job: JobListing) => {
    if (isDuplicate(applications, job.company_name, job.title)) return
    setApplications((prev) => [applicationFromJob(job), ...prev])
  }

  const addApplication = (app: Application) => {
    setApplications((prev) => [app, ...prev])
    setShowForm(false)
    setView('pipeline')
  }

  const deleteApplication = (id: string) => {
    const index = applications.findIndex((a) => a.id === id)
    if (index < 0) return
    // Hapus 2x berturut-turut: timer lama WAJIB dibersihkan dulu.
    window.clearTimeout(undoTimer.current)
    setPending({ app: applications[index], index })
    setApplications((prev) => prev.filter((a) => a.id !== id))
    setSelectedId(null)
    undoTimer.current = window.setTimeout(() => {
      setPending(null)
      undoTimer.current = undefined
    }, UNDO_MS)
  }

  const undoDelete = () => {
    if (!pending) return
    window.clearTimeout(undoTimer.current)
    undoTimer.current = undefined
    const { app, index } = pending
    setApplications((prev) => {
      const next = [...prev]
      next.splice(Math.min(index, next.length), 0, app)
      return next
    })
    setPending(null)
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ applications, kaptenSkills }, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'aku-mw-magang-backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-logo">AM</span> Aku Mw Magang
        </div>
        <nav className="tabs">
          <button className={view === 'explore' ? 'tab on' : 'tab'} onClick={() => setView('explore')}>
            Eksplorasi Lowongan
          </button>
          <button className={view === 'pipeline' ? 'tab on' : 'tab'} onClick={() => setView('pipeline')}>
            Pipeline Lamaran ({applications.length})
          </button>
          <button className={view === 'offers' ? 'tab on' : 'tab'} onClick={() => setView('offers')}>
            Bandingkan Offer ({stats.offers})
          </button>
        </nav>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Catat Lamaran
        </button>
      </header>

      <main className="container">
        <ConflictBanner conflicts={conflicts} />
        <StatsCards stats={stats} />

        {view === 'explore' && (
          <div className="explore">
            <SkillProfile
              skills={kaptenSkills}
              setSkills={setKaptenSkills}
              source={source}
              onSourceChange={setSource}
            />
            <JobExplorer
              source={source}
              onSourceChange={setSource}
              kaptenSkills={kaptenSkills}
              applications={applications}
              onSave={saveJob}
            />
          </div>
        )}
        {view === 'pipeline' && (
          <Pipeline
            applications={applications}
            kaptenSkills={kaptenSkills}
            onOpen={setSelectedId}
            onSimulate={(id) => updateApplication(id, shiftBack15Days)}
            onExport={exportJson}
          />
        )}
        {view === 'offers' && <OfferComparator applications={applications} kaptenSkills={kaptenSkills} />}
      </main>

      {showForm && (
        <ApplicationForm
          applications={applications}
          onSubmit={addApplication}
          onClose={() => setShowForm(false)}
        />
      )}

      {selected && (
        <ApplicationDetail
          app={selected}
          kaptenSkills={kaptenSkills}
          onUpdate={(updater) => updateApplication(selected.id, updater)}
          onDelete={() => deleteApplication(selected.id)}
          onSimulate={() => updateApplication(selected.id, shiftBack15Days)}
          onClose={() => setSelectedId(null)}
        />
      )}

      {pending && <UndoToast key={pending.app.id} company={pending.app.company} onUndo={undoDelete} />}
    </div>
  )
}
