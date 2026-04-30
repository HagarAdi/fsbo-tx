import Link from 'next/link'
import { useRouter } from 'next/router'
import { steps, phases } from '../data/steps'
import { useAppStateContext } from '../hooks/AppStateContext'

const ACCENT = '#16a34a'

function PhaseGroup({ phase, steps, activeId, completed, onClose }) {
  return (
    <div className="mb-4">
      <p className="px-4 pt-2 pb-1.5 text-xs font-semibold uppercase" style={{ color: '#9ca3af', letterSpacing: '0.18em' }}>
        {phase}
      </p>
      {steps.map((step) => {
        const isSelected = step.id === activeId
        const isComplete = completed.has(step.id)
        return (
          <Link
            key={step.id}
            href={`/step/${step.id}`}
            onClick={onClose}
            className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 transition-colors relative min-h-[44px]"
            style={isSelected ? { borderLeft: `4px solid ${ACCENT}`, paddingLeft: '12px', backgroundColor: '#f0fdf4' } : { borderLeft: '4px solid transparent' }}
          >
            <span className="w-5 h-5 flex items-center justify-center text-xs font-semibold text-gray-400 mr-3 shrink-0">
              {step.id}
            </span>
            <span className={`flex-1 text-sm ${isSelected ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
              {step.title}
            </span>
            <span className="ml-2 shrink-0">
              {isComplete ? (
                <svg className="w-5 h-5 drop-shadow-sm" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7.5" fill={ACCENT} />
                  <path d="M5 8l2.5 2.5L11 5.5" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span className="block w-4 h-4 rounded-full border-2 border-gray-300" />
              )}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

export default function Sidebar({ onClose }) {
  const router = useRouter()
  const { completed, priceEstimate } = useAppStateContext()
  const activeId = router.query.id ? parseInt(router.query.id, 10) : null

  const completedCount = completed.size
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

          {/* Close button — only shown in mobile overlay */}
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
            completed={completed}
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
        {/* Estimated price */}
        {priceEstimate?.currentEstimate ? (
          <div className="mt-3 rounded-lg px-3 py-2" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <p className="text-xs text-gray-500 mb-0.5">Your Estimate</p>
            <p className="text-sm font-bold" style={{ color: ACCENT }}>
              ${priceEstimate.currentEstimate.toLocaleString()}
            </p>
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-2">Your Estimate: —</p>
        )}

        {priceEstimate?.protectedValue && (
          <div className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
            🛡️ ${priceEstimate.protectedValue.toLocaleString()} protected
          </div>
        )}
        {priceEstimate?.stagingValue && (
          <div className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
            🏠 ${priceEstimate.stagingValue.toLocaleString()} show-ready
          </div>
        )}
      </div>
    </div>
  )
}
