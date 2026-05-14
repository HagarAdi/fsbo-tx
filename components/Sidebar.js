import Link from 'next/link'
import { useRouter } from 'next/router'
import { steps, phases } from '../data/steps'
import { useAppStateContext } from '../hooks/AppStateContext'

const ACCENT = '#16a34a'

function StepStatusIcon({ status }) {
  if (status === 'complete') {
    return (
      <svg className="w-5 h-5 drop-shadow-sm" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7.5" fill={ACCENT} />
        <path d="M5 8l2.5 2.5L11 5.5" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (status === 'partial') {
    return (
      <svg className="w-5 h-5 drop-shadow-sm" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7.5" fill="#facc15" />
        <path d="M5 8l2.5 2.5L11 5.5" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return <span className="block w-4 h-4 rounded-full border-2 border-gray-300" />
}

function PhaseGroup({ phase, steps, activeId, stepStatuses, onClose }) {
  return (
    <div className="mb-4">
      <p className="px-4 pt-2 pb-1.5 text-xs font-semibold uppercase" style={{ color: '#9ca3af', letterSpacing: '0.18em' }}>
        {phase}
      </p>
      {steps.map((step) => {
        const isSelected = step.id === activeId
        const status = stepStatuses[step.id] ?? 'none'
        return (
          <div key={step.id} className="relative flex items-stretch">
            <Link
              href={`/step/${step.id}`}
              onClick={onClose}
              className="flex-1 flex items-center px-4 py-3 text-left hover:bg-gray-100 transition-colors min-h-[44px]"
              style={isSelected ? { borderLeft: `4px solid ${ACCENT}`, paddingLeft: '12px', backgroundColor: '#f0fdf4' } : { borderLeft: '4px solid transparent' }}
            >
              <span className="w-5 h-5 flex items-center justify-center text-xs font-semibold text-gray-400 mr-3 shrink-0">
                {step.id}
              </span>
              <span className={`flex-1 text-sm ${isSelected ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                {step.title}
              </span>
              <span className="ml-2 shrink-0">
                <StepStatusIcon status={status} />
              </span>
            </Link>
            {step.id === 5 && (
              <Link
                href="/step/5#log"
                onClick={onClose}
                title="Jump to Showing Log"
                aria-label="Jump to Showing Log"
                className="flex items-center justify-center w-9 mr-2 my-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="3.5" width="10" height="13" rx="1.5" />
                  <path d="M8 3.5v-.5a1 1 0 011-1h2a1 1 0 011 1v.5" />
                  <path d="M7.5 8h5M7.5 11h5M7.5 14h3" />
                </svg>
              </Link>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function Sidebar({ onClose, onCollapse }) {
  const router = useRouter()
  const { stepStatuses } = useAppStateContext()
  const activeId = router.query.id ? parseInt(router.query.id, 10) : null

  const statuses = stepStatuses || {}
  const completedCount = Object.values(statuses).filter(s => s === 'complete').length
  const total = steps.length
  const pct = Math.round((completedCount / total) * 100)

  return (
    <div className="flex flex-col h-full w-full" style={{ backgroundColor: '#f9fafb', borderRight: '1px solid #e5e7eb' }}>
      {/* Header */}
      <div className="px-4 py-5 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2 hover:opacity-75 transition-opacity min-h-[44px]"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill={ACCENT}>
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h3a1 1 0 001-1v-3h2v3a1 1 0 001 1h3a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="font-bold text-gray-900 text-base leading-tight">FSBO Texas Guide</span>
          </Link>

          {/* Desktop collapse button */}
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              title="Collapse sidebar"
              className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-200 transition-colors text-gray-400 text-sm font-bold ml-2"
              aria-label="Collapse sidebar"
            >
              ‹‹
            </button>
          )}
          {/* Mobile close button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center w-11 h-11 rounded-lg hover:bg-gray-200 transition-colors text-gray-500 text-xl ml-2"
              aria-label="Close menu"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Steps */}
      <nav className="flex-1 overflow-y-auto py-4">
        {phases.map((phase) => (
          <PhaseGroup
            key={phase}
            phase={phase}
            steps={steps.filter((s) => s.phase === phase)}
            activeId={activeId}
            stepStatuses={statuses}
            onClose={onClose}
          />
        ))}
      </nav>

      {/* Progress bar */}
      <div className="px-4 py-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Progress</span>
          <span>{completedCount}/{total} steps complete</span>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: '8px', backgroundColor: '#e5e7eb' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: ACCENT }}
          />
        </div>
      </div>
    </div>
  )
}
