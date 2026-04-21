import { steps, phases } from '../data/steps'

const ACCENT = '#16a34a'

function PhaseGroup({ phase, steps, selectedId, onSelect }) {
  return (
    <div className="mb-4">
      <p className="px-4 mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {phase}
      </p>
      {steps.map((step) => {
        const isSelected = step.id === selectedId
        return (
          <button
            key={step.id}
            onClick={() => onSelect(step.id)}
            className="w-full flex items-center px-4 py-2.5 text-left hover:bg-gray-100 transition-colors relative"
            style={isSelected ? { borderLeft: `3px solid ${ACCENT}`, paddingLeft: '13px' } : { borderLeft: '3px solid transparent' }}
          >
            <span className="w-5 h-5 flex items-center justify-center text-xs font-semibold text-gray-400 mr-3 shrink-0">
              {step.id}
            </span>
            <span className={`flex-1 text-sm ${isSelected ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
              {step.title}
            </span>
            <span className="ml-2 shrink-0">
              {step.complete ? (
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" fill={ACCENT} />
                  <path d="M5 8l2.5 2.5L11 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span className="block w-2.5 h-2.5 rounded-full bg-gray-300" />
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default function Sidebar({ selectedId, onSelect }) {
  const completed = steps.filter((s) => s.complete).length
  const total = steps.length
  const pct = Math.round((completed / total) * 100)

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#f9fafb', borderRight: '1px solid #e5e7eb' }}>
      {/* Header */}
      <div className="px-4 py-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill={ACCENT}>
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h3a1 1 0 001-1v-3h2v3a1 1 0 001 1h3a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span className="font-bold text-gray-900 text-base leading-tight">FSBO Texas Guide</span>
        </div>
      </div>

      {/* Steps */}
      <nav className="flex-1 overflow-y-auto py-4">
        {phases.map((phase) => (
          <PhaseGroup
            key={phase}
            phase={phase}
            steps={steps.filter((s) => s.phase === phase)}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </nav>

      {/* Progress bar */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Progress</span>
          <span>{completed}/{total} steps complete</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, backgroundColor: ACCENT }}
          />
        </div>
      </div>
    </div>
  )
}
