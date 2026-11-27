import { useEffect, useState } from 'react'

const QUESTIONS: string[] = [
  'Ceritakan tentang dirimu dan kenapa kamu tertarik magang di posisi ini.',
  'Ceritakan bug tersulit saat mengelola state di proyek React yang pernah kamu buat, dan bagaimana kamu memperbaikinya.',
  'Apa perbedaan useState dan useRef? Kapan kamu memilih salah satunya?',
  'Jelaskan kenapa useEffect perlu fungsi cleanup. Beri contoh kasus nyata.',
  'Bagaimana kamu mengatasi deadline ketat saat kerja kelompok dan ada anggota yang sulit dihubungi?',
  'Apa yang kamu harapkan dipelajari selama magang, dan apa pertanyaan balikmu untuk kami?',
]

const START_SECONDS = 120

const mmss = (s: number): string =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

export function InterviewPrep() {
  const [index, setIndex] = useState(0)
  const [seconds, setSeconds] = useState(START_SECONDS)
  const [running, setRunning] = useState(false)

  // Berhenti otomatis di 00:00 (derived), tanpa setState tambahan di dalam effect.
  const ticking = running && seconds > 0

  useEffect(() => {
    if (!ticking) return
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id) // cleanup: unmount / pause / reset
  }, [ticking])

  const reset = () => {
    setRunning(false)
    setSeconds(START_SECONDS)
  }

  const next = () => {
    setIndex((i) => (i + 1) % QUESTIONS.length)
    reset()
  }

  return (
    <div className="card prep">
      <div className="row between">
        <h4>Latihan Interview</h4>
        <span className="mono small muted">
          Soal {index + 1} / {QUESTIONS.length}
        </span>
      </div>
      <p className="question">“{QUESTIONS[index]}”</p>
      <div className="row between">
        <span className={seconds === 0 ? 'timer text-red' : 'timer'}>{mmss(seconds)}</span>
        <div className="row">
          <button
            className="btn btn-primary"
            onClick={() => setRunning(!ticking)}
            disabled={seconds === 0}
          >
            {ticking ? 'Jeda' : 'Start'}
          </button>
          <button className="btn" onClick={reset}>
            Reset
          </button>
          <button className="btn" onClick={next}>
            Soal Berikutnya
          </button>
        </div>
      </div>
      {seconds === 0 && <p className="error">Waktu habis! Lanjut ke soal berikutnya.</p>}
    </div>
  )
}
