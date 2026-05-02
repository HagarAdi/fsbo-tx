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
  const [data, setData] = useState({ showings: [] })
  useEffect(() => {
    try {
      const raw = localStorage.getItem('fsbo_stepData')
      const parsed = raw ? JSON.parse(raw) : {}
      setData({ showings: parsed.step5?.showings ?? [] })
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
      <span
        className="w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full shrink-0"
        style={{
          backgroundColor: isComplete ? EM : 'transparent',
          border: isComplete ? 'none' : '2px solid #cbd5e1',
          color: isComplete ? '#fff' : '#94a3b8',
        }}
      >
        {isComplete ? '✓' : step.id}
      </span>
      <span className={`text-xs leading-snug ${isComplete ? 'text-slate-400 line-through' : 'text-slate-900 font-medium'}`}>
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
  const ids        = PHASE_STEPS[phase]
  const phaseSteps = steps.filter((s) => ids.includes(s.id))
  const done       = ids.filter((id) => completedSteps.includes(id)).length
  const total      = ids.length
  const pct        = Math.round((done / total) * 100)

  const phaseColor = {
    Prepare: { bar: '#16a34a', badge: 'bg-emerald-100 text-emerald-700' },
    Market:  { bar: '#0891b2', badge: 'bg-cyan-100 text-cyan-700' },
    Close:   { bar: '#7c3aed', badge: 'bg-violet-100 text-violet-700' },
  }[phase]

  return (
    <div className="bg-white rounded-xl border border-slate-300 p-4 flex flex-col gap-3
                    hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${phaseColor.badge}`}>
          {phase}
        </span>
        <span className="text-xs text-slate-400 font-semibold">{done}/{total}</span>
      </div>

      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: phaseColor.bar }}
        />
      </div>

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

function HeroCard({ allDone, nextStep, onSelectStep }) {
  if (allDone) {
    return (
      <div className="rounded-xl bg-emerald-600 p-6 text-center">
        <p className="text-3xl font-extrabold text-white mb-1">Your home is ready to list.</p>
        <p className="text-emerald-100 text-sm">All 9 steps complete — time to go live in Texas.</p>
      </div>
    )
  }
  return (
    <div className="rounded-xl bg-slate-900 border border-slate-700 p-6 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex-1">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Next Action</p>
        <div className="flex items-center gap-3 mb-2">
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ backgroundColor: EM, color: '#fff' }}
          >
            {nextStep.id}
          </span>
          <p className="text-white text-xl font-bold leading-snug">{nextStep.title}</p>
        </div>
        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
          {nextStep.phase}
        </span>
      </div>
      <button
        onClick={() => onSelectStep && onSelectStep(nextStep.id)}
        className="shrink-0 px-8 py-3 rounded-xl font-bold text-slate-900 text-base
                   bg-emerald-400 hover:bg-emerald-300 active:scale-95
                   transition-all duration-150 shadow-lg shadow-emerald-900/30"
      >
        Start Step {nextStep.id} →
      </button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WelcomeScreen({ homeAddress = '', onShowOnboarding, priceEstimate, completedSteps = [], onSelectStep }) {
  const { showings } = useShowingData()
  const { showingCount, activeDays } = deriveStats(showings)

  const nextStep = steps.find((s) => !completedSteps.includes(s.id))
  const allDone  = !nextStep
  const savings  = priceEstimate?.currentEstimate
    ? Math.round(priceEstimate.currentEstimate * 0.03).toLocaleString()
    : null
  const estimate = priceEstimate?.currentEstimate
    ? `$${Math.round(priceEstimate.currentEstimate).toLocaleString()}`
    : null
  const svUrl    = streetViewUrl(homeAddress)
  const inMarket = completedSteps.includes(4) || completedSteps.includes(5)

  const handleReset = () => {
    if (!window.confirm('Reset all progress? This cannot be undone.')) return
    Object.keys(localStorage).filter((k) => k.startsWith('fsbo_')).forEach((k) => localStorage.removeItem(k))
    window.location.reload()
  }

  return (
    <div className="min-h-full bg-slate-950 flex flex-col">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center gap-4">
        <div className="w-16 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-800 flex items-center justify-center">
          {svUrl
            ? <img src={svUrl} alt="Street view" className="w-full h-full object-cover" />
            : <span className="text-xl">📍</span>
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{homeAddress || 'Your Property'}</p>
          <button
            onClick={onShowOnboarding}
            className="text-slate-400 text-xs hover:text-emerald-400 transition-colors underline underline-offset-2"
          >
            Change address
          </button>
        </div>

        <div className="text-right shrink-0">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">FSBO Savings</p>
          {savings ? (
            <p className="text-2xl font-extrabold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
              ${savings}
            </p>
          ) : (
            <button
              onClick={() => onSelectStep && onSelectStep(1)}
              className="text-base font-bold text-emerald-400 hover:text-emerald-300
                         active:scale-95 transition-all duration-100 underline underline-offset-2"
            >
              Complete Step 1
            </button>
          )}
          {estimate && (
            <p className="text-[10px] text-slate-500">on {estimate} est.</p>
          )}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 p-4 md:p-6 flex flex-col gap-4 md:gap-6 max-w-7xl mx-auto w-full">

        {/* Mobile: Hero first — CTA is the first thing seen */}
        <div className="md:hidden">
          <HeroCard allDone={allDone} nextStep={nextStep} onSelectStep={onSelectStep} />
        </div>

        {/* Phase Cards — full width, 3-col on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PhaseCard
            phase="Prepare"
            completedSteps={completedSteps}
            showStats={false}
            activeDays={0}
            showingCount={0}
            onSelectStep={onSelectStep}
          />
          <PhaseCard
            phase="Market"
            completedSteps={completedSteps}
            showStats={inMarket}
            activeDays={activeDays}
            showingCount={showingCount}
            onSelectStep={onSelectStep}
          />
          <PhaseCard
            phase="Close"
            completedSteps={completedSteps}
            showStats={false}
            activeDays={0}
            showingCount={0}
            onSelectStep={onSelectStep}
          />
        </div>

        {/* Desktop: Hero below phase cards */}
        <div className="hidden md:block">
          <HeroCard allDone={allDone} nextStep={nextStep} onSelectStep={onSelectStep} />
        </div>

        <div className="flex justify-center pt-1 pb-2">
          <button onClick={handleReset} className="text-xs text-slate-600 hover:text-red-400 transition-colors">
            ↺ Reset all data
          </button>
        </div>
      </div>
    </div>
  )
}
