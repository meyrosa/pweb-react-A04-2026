# Aku Mw Magang — pweb-react-A04-2026

Aplikasi React 19 + TypeScript (strict) + Vite untuk mengelola proses lamaran magang.
Tanpa library state management / form eksternal — hanya React Hooks bawaan + custom hooks.

## Jalankan
```bash
npm install
npm run dev          # dev server
npx tsc --noEmit     # cek tipe
npm run build        # build produksi
```

## Struktur
- `src/types/` — interface (Application, JobListing, dll.)
- `src/utils/` — fungsi murni: `stateMachine`, `skillMatch`, `conflicts`, `offer`, `stats`, `applications`
- `src/hooks/` — `useLocalStorage<T>`, `useDebounce<T>`
- `src/services/jobService.ts` — fetch Remotive API + fallback `public/magang-fallback.json`
- `src/components/` — UI per fitur

## Peta fitur → file 
| Fitur | File utama |
|---|---|
| 1. Profil skill & eksplorasi (fetch, AbortController, debounce) | `SkillProfile`, `JobExplorer`, `JobCard` |
| 2. Form manual (controlled, validasi, auto-focus useRef) | `ApplicationForm` |
| 3. Pipeline, ghosting, bentrok | `Pipeline`, `ConflictBanner`, `utils/conflicts`, `utils/applications` |
| 4. State machine, checklist immutable, activity log | `StatusTransition`, `Checklist`, `ActivityLog`, `utils/stateMachine` |
| 5. Interview timer + cleanup | `InterviewPrep` |
| 6. Undo delete (useRef timer) & localStorage | `App.tsx` (deleteApplication / undoDelete), `UndoToast`, `useLocalStorage` |
| 7. Statistik & Offer Comparator | `StatsCards`, `utils/stats`, `OfferComparator`, `utils/offer` |

Bonus: tekan `/` untuk fokus ke search lowongan, tombol Export JSON di Pipeline.
