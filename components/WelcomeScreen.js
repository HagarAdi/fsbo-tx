import { useState, useEffect } from 'react'
import { steps } from '../data/steps'

// ─── Constants ───────────────────────────────────────────────────────────────

const EM = '#16a34a'
const PHASE_STEPS = {
  Prepare: [1, 2, 3],
  Market:  [4, 5],
  Close:   [6, 7, 8, 9],
}

// ─── Data Layer ──────────────────────────────────────────────────────────────

function useShowingData() {
  const [data, setData] = useState({ showings: [], contacts: [] })
  useEffect(() => {
    try {
      const raw = localStorage.getItem('fsbo_stepData')
      const parsed = raw ? JSON.parse(raw) : {}
      setData({
        showings: parsed.step5?.showings  ?? [],
        contacts: parsed.step5?.contacts  ?? [],
      })
    } catch {}
  }, [])
  return data
}

function deriveStats(showings) {
  const active = showings.filter(
    (s) => s.status === 'Scheduled' || s.status === 'Completed'
  )
  const uniqueDays = new Set(active.map((s) => s.date)).size
  return { showingCount: showings.length, activeDays: uniqueDays }
}

function derivePhaseProgress(completedSteps) {
  const result = {}
  for (const [phase, ids] of Object.entries(PHASE_STEPS)) {
    const done = ids.filter((id) => completedSteps.includes(id)).length
    result[phase] = { done, total: ids.length }
  }
  return result
}

function streetViewUrl(address) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
  if (!key || !address) return null
  return `https://maps.googleapis.com/maps/api/streetview?size=320x180&location=${encodeURIComponent(address)}&key=${key}`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepRow({ step, isComplete, onClick }) {
  return (
    <button
      onClick={() => onClick(step.id)}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left
                 hover:bg-slate-50 active:scale-[0.98] transition-all duration-100"
    >
      <span className="w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full shrink-0"
        style={{
          backgroundColor: isComplete ? EM : 'transparent',
          border: isComplete ? 'none' : '2px solid #cbd5e1',
          color: isComplete ? '#fff' : '#94a3b8',
        }}
      >
        {isComplete ? '✓' : step.id}
      </span>
      <span className={`text-xs leading-snug ${isComplete ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
        {step.title}
      </span>
    </button>
  )
}

function StatBadge({ label, value, dim }) {
  return (
    <div className="flex flex-col items-center px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
      <span className={`text-xl font-extrabold ${dim ? 'text-slate-300' : 'text-emerald-600'}`}>
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-slate-400 mt-0.5">{label}</span>
    </div>
  )
}

function PhaseCard({ phase, completedSteps, showStats, activeDays, showingCount, onSelectStep }) {
  const ids    = PHASE_STEPS[phase]
  const phaseSteps = steps.filter((s) => ids.includes(s.id))
  const done   = ids.filter((id) => completedSteps.includes(id)).length
  const total  = ids.length
  const pct    = Math.round((done / total) * 100)
  const locked = phase === 'Close' && !completedSteps.includes(5)

  const phaseColor = {
    Prepare: { bar: '#16a34a', badge: 'bg-emerald-100 text-emerald-700' },
    Market:  { bar: '#0891b2', badge: 'bg-cyan-100 text-cyan-700' },
    Close:   { bar: '#7c3aed', badge: 'bg-violet-100 text-violet-700' },
  }[phase]

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3
                     hover:shadow-md transition-shadow duration-200 ${locked ? 'opacity-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${phaseColor.badge}`}>
          {phase}
        </span>
        <span className="text-xs text-slate-400 font-semibold">{done}/{total}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: phaseColor.bar }}
        />
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-0.5">
        {phaseSteps.map((s) => (
          <StepRow
            key={s.id}
            step={s}
            isComplete={completedSteps.includes(s.id)}
            onClick={onSelectStep}
          />
        ))}
      </div>

      {/* Market Pulse (Market phase only) */}
      {showStats && (
        <div className="mt-1 pt-3 border-t border-slate-100">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Market Pulse</p>
          <div className="grid grid-cols-2 gap-2">
            <StatBadge label="Showings" value={showingCount} dim={showingCount === 0} />
            <StatBadge label="Active Days" value={activeDays} dim={activeDays === 0} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Stage 2 (default export) placeholder — replaced in next message ─────────
export default function WelcomeScreen() { return null }
