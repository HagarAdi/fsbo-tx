import { steps } from '../data/steps'

const ACCENT = '#16a34a'

const phases = ['Prepare', 'Market', 'Close']

const HomeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
)

export default function WelcomeScreen({ homeAddress = '', onShowOnboarding, priceEstimate, completedSteps = [], onSelectStep }) {
  const total = steps.length

  const nextStep = steps.find((s) => !completedSteps.includes(s.id))
  const allComplete = !nextStep
  const isStart = completedSteps.length === 0

  const lastAdjustment = priceEstimate?.adjustments?.length
    ? priceEstimate.adjustments[priceEstimate.adjustments.length - 1]
    : null
  const lastStepTitle = lastAdjustment ? steps.find((s) => s.id === lastAdjustment.step)?.title : null

  const handleReset = () => {
    if (!window.confirm('Are you sure? This will clear all your progress, saved address, and price estimate. This cannot be undone.')) return
    Object.keys(localStorage)
      .filter((k) => k.startsWith('fsbo_'))
      .forEach((k) => localStorage.removeItem(k))
    window.location.reload()
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
        Let&apos;s sell your home.
      </h1>

      {/* Savings banner */}
      {(() => {
        const estimate = priceEstimate?.currentEstimate
        const savings = estimate ? Math.round(estimate * 0.03).toLocaleString() : null
        const estFormatted = estimate ? `$${Math.round(estimate).toLocaleString()}` : null
        return (
          <div
            className="w-full max-w-md rounded-2xl px-6 py-5 mb-8 text-center"
            style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac' }}
          >
            <p className="text-xs font-bold uppercase mb-3 text-green-600" style={{ letterSpacing: '0.12em' }}>
              Your FSBO Savings
            </p>
            {savings ? (
              <>
                <p className="text-5xl font-extrabold leading-none mb-2" style={{ color: ACCENT }}>
                  ${savings}
                </p>
                <p className="text-sm text-gray-500">
                  kept vs. paying a 3% commission on your {estFormatted} estimate
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 py-1">
                <svg className="w-6 h-6 text-green-300" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M12 1a4 4 0 00-4 4v3H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2h-2V5a4 4 0 00-4-4zm2 7V5a2 2 0 10-4 0v3h4z" clipRule="evenodd" />
                </svg>
                <p className="text-base font-medium text-green-700">
                  Complete Step 1 to reveal your potential savings
                </p>
              </div>
            )}
          </div>
        )
      })()}

      {/* Price estimate banner */}
      {priceEstimate?.currentEstimate && (
        <div
          className="w-full max-w-md rounded-2xl px-6 py-5 mb-8 text-left"
          style={{ backgroundColor: '#ffffff', border: '1.5px solid #e5e7eb', boxShadow: '0 1px 4px 0 rgba(0,0,0,0.05)' }}
        >
          <p className="text-xs font-bold uppercase mb-2 text-gray-400" style={{ letterSpacing: '0.12em' }}>
            Your Calculated Estimate
          </p>
          <p className="text-4xl font-extrabold leading-none text-gray-900">
            ${priceEstimate.currentEstimate.toLocaleString()}
          </p>
          {lastAdjustment && (
            <p className="text-xs text-gray-400 mt-2">
              Last updated: Step {lastAdjustment.step}{lastStepTitle ? ` — ${lastStepTitle}` : ''}
            </p>
          )}
        </div>
      )}

      {/* Address card */}
      <div
        className="w-full max-w-md rounded-2xl px-6 py-5 mb-8 text-left"
        style={{ backgroundColor: '#ffffff', border: '1.5px solid #e5e7eb', boxShadow: '0 1px 4px 0 rgba(0,0,0,0.05)' }}
      >
        <div className="flex items-start gap-3">
          <HomeIcon className="w-7 h-7 flex-shrink-0 mt-0.5" style={{ color: ACCENT }} />
          <div>
            <p className="text-xs font-bold uppercase mb-0.5 text-gray-400" style={{ letterSpacing: '0.1em' }}>Your home</p>
            <p className="font-semibold text-gray-900 text-base">{homeAddress}</p>
          </div>
        </div>
        <button
          onClick={onShowOnboarding}
          className="mt-3 ml-9 text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
        >
          Change
        </button>
      </div>

      {/* Street View placeholder */}
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-gray-50 mb-8 overflow-hidden">
        <div className="flex flex-col items-center justify-center gap-2 py-8 px-6">
          <span className="text-3xl">📍</span>
          <p className="text-sm font-medium text-gray-700 text-center">{homeAddress}</p>
          <p className="text-xs text-gray-400">Street view coming soon</p>
        </div>
      </div>

      {/* Next step button */}
      <div className="w-full max-w-md mb-8">
        {allComplete ? (
          <p className="text-center text-lg font-semibold" style={{ color: ACCENT }}>
            🎉 You&apos;re ready to list your home!
          </p>
        ) : (
          <>
            <button
              onClick={() => onSelectStep && onSelectStep(nextStep.id)}
              className="w-full py-4 px-6 rounded-xl text-white font-semibold text-base flex items-center justify-between transition-opacity hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: ACCENT }}
            >
              <span>
                {isStart
                  ? `Start with Step 1: ${nextStep.title}`
                  : `Next: Step ${nextStep.id} — ${nextStep.title}`}
              </span>
              <span className="ml-3">→</span>
            </button>
            <p className="text-center text-sm text-gray-400 mt-2">or select any step on the left</p>
          </>
        )}
      </div>

      {/* Progress summary */}
      <p className="text-gray-500 text-base mb-8">
        {completedSteps.length} of {total} steps complete
      </p>

      {/* Phase pills */}
      <div className="flex items-center gap-3 mb-10">
        {phases.map((phase, i) => (
          <div key={phase} className="flex items-center gap-3">
            <span
              className="px-4 py-1.5 rounded-full text-sm font-medium border"
              style={{ borderColor: ACCENT, color: ACCENT }}
            >
              {phase}
            </span>
            {i < phases.length - 1 && (
              <svg className="w-4 h-4 text-gray-300" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                <path d="M6 4l4 4-4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        ))}
      </div>

      <p className="text-gray-400 text-sm">
        Select a step on the left to get started
      </p>

      <button
        onClick={handleReset}
        className="mt-8 text-xs text-red-300 hover:text-red-500 transition-colors"
      >
        ↺ Reset all data
      </button>
    </div>
  )
}
