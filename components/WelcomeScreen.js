import { steps } from '../data/steps'

const ACCENT = '#16a34a'

const phases = ['Prepare', 'Market', 'Close']

export default function WelcomeScreen() {
  const completed = steps.filter((s) => s.complete).length
  const total = steps.length

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
        Let&apos;s sell your home.
      </h1>

      {/* Savings banner */}
      <div
        className="flex items-center gap-3 px-6 py-3 rounded-full mb-8 text-white font-semibold text-sm"
        style={{ backgroundColor: ACCENT }}
      >
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        $18,000 saved by going FSBO
        <span className="opacity-75 font-normal">($600K × 3%)</span>
      </div>

      {/* Progress summary */}
      <p className="text-gray-500 text-base mb-8">
        {completed} of {total} steps complete
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
    </div>
  )
}
