const phaseColors = {
  Prepare: { bg: '#dcfce7', text: '#15803d' },
  Market:  { bg: '#dbeafe', text: '#1d4ed8' },
  Close:   { bg: '#fef9c3', text: '#a16207' },
}

const ACCENT = '#16a34a'

export default function StepPlaceholder({ step, isComplete, onComplete, onUndo }) {
  const colors = phaseColors[step.phase] ?? { bg: '#f3f4f6', text: '#374151' }

  return (
    <div className="flex flex-col h-full px-10 py-12">
      {/* Phase tag */}
      <div className="mb-4">
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {step.phase}
        </span>
      </div>

      {/* Step number + title */}
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-3xl font-light text-gray-300">
          {String(step.id).padStart(2, '0')}
        </span>
        <h2 className="text-3xl font-bold text-gray-900 leading-tight">
          {step.title}
        </h2>
      </div>

      <div className="mt-10 border-t border-gray-100 pt-10">
        <p className="text-sm text-gray-400 italic">
          Step content coming soon.
        </p>
      </div>

      <div className="mt-auto pt-10">
        {isComplete ? (
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: ACCENT }}>
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" fill={ACCENT} />
                <path d="M5 8l2.5 2.5L11 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Completed
            </span>
            <button
              onClick={onUndo}
              className="text-sm text-gray-400 underline hover:text-gray-600 transition-colors"
            >
              Undo
            </button>
          </div>
        ) : (
          <button
            onClick={onComplete}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: ACCENT }}
          >
            Mark complete
          </button>
        )}
      </div>
    </div>
  )
}
