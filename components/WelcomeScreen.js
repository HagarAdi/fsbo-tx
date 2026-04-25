import { useState } from 'react'
import { steps } from '../data/steps'

const ACCENT = '#16a34a'

const phases = ['Prepare', 'Market', 'Close']

const HomeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
)

export default function WelcomeScreen({ priceEstimate, completedSteps = [], onSelectStep }) {
  const total = steps.length

  const nextStep = steps.find((s) => !completedSteps.includes(s.id))
  const allComplete = !nextStep
  const isStart = completedSteps.length === 0

  const lastAdjustment = priceEstimate?.adjustments?.length
    ? priceEstimate.adjustments[priceEstimate.adjustments.length - 1]
    : null
  const lastStepTitle = lastAdjustment ? steps.find((s) => s.id === lastAdjustment.step)?.title : null

  const [address, setAddress] = useState(() => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('fsbo_homeAddress') || ''
  })
  const [inputValue, setInputValue] = useState('')

  const handleSave = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    localStorage.setItem('fsbo_homeAddress', trimmed)
    setAddress(trimmed)
    setInputValue('')
  }

  const handleChange = () => {
    setAddress('')
    setInputValue('')
  }

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
            className="flex items-center gap-3 px-6 py-3 rounded-full mb-8 text-white font-semibold text-sm"
            style={{ backgroundColor: ACCENT }}
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            {savings
              ? <>${savings} saved by going FSBO<span className="opacity-75 font-normal ml-1">(based on your {estFormatted} estimate at 3%)</span></>
              : <>${'18,000'} saved by going FSBO<span className="opacity-75 font-normal ml-1">($600K × 3%)</span></>
            }
          </div>
        )
      })()}

      {/* Price estimate banner */}
      {priceEstimate ? (
        <div
          className="w-full max-w-md rounded-2xl px-6 py-5 mb-8 text-left"
          style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #bbf7d0' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#15803d' }}>
            Your estimated list price
          </p>
          <p className="text-3xl font-bold text-gray-900">
            ${priceEstimate.currentEstimate.toLocaleString()}
          </p>
          {lastAdjustment && (
            <p className="text-xs text-gray-400 mt-2">
              Last updated: Step {lastAdjustment.step}{lastStepTitle ? ` — ${lastStepTitle}` : ''}
            </p>
          )}
        </div>
      ) : (
        <div className="w-full max-w-md rounded-2xl px-6 py-4 mb-8 bg-gray-50 border border-gray-200 flex items-center gap-3">
          <svg className="w-5 h-5 text-gray-300 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <p className="text-sm text-gray-400 flex-1">Complete Step 1 to get your estimated list price</p>
          <svg className="w-4 h-4 text-gray-300 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor">
            <path d="M10 4l-4 4 4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {/* Address card */}
      {address ? (
        <div
          className="w-full max-w-md rounded-2xl px-6 py-5 mb-8 text-left"
          style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #bbf7d0' }}
        >
          <div className="flex items-start gap-3">
            <HomeIcon className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: ACCENT }} />
            <div>
              <p className="text-sm font-medium mb-0.5" style={{ color: '#15803d' }}>Selling:</p>
              <p className="font-bold text-gray-900 text-base">{address}</p>
            </div>
          </div>
          <button
            onClick={handleChange}
            className="mt-3 ml-9 text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
          >
            Change address
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-sm px-6 py-5 mb-8 text-left">
          <div className="flex items-center gap-2 mb-3">
            <HomeIcon className="w-5 h-5 text-gray-400" />
            <label className="text-sm font-medium text-gray-600">What home are you selling?</label>
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="123 Elm St, Round Rock TX 78664"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 mb-3"
          />
          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-80"
            style={{ backgroundColor: ACCENT }}
          >
            Save my home
          </button>
        </div>
      )}

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
        className="mt-8 text-xs text-gray-300 hover:text-gray-500 transition-colors"
      >
        ↺ Reset all data
      </button>
    </div>
  )
}
