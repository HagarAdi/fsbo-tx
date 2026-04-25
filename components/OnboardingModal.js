import { useState } from 'react'

const ACCENT = '#16a34a'

export default function OnboardingModal({ onAddressSave }) {
  const [value, setValue] = useState('')
  const isValid = value.trim().length >= 10

  const handleSubmit = () => {
    if (!isValid) return
    onAddressSave(value.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <p className="text-2xl font-bold text-gray-900">🏠 FSBO Texas Guide</p>
          <h2 className="text-xl font-bold text-gray-900 mt-5 mb-2">Let&apos;s get started</h2>
          <p className="text-gray-500 text-sm">What&apos;s the address of the home you&apos;re selling?</p>
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="123 Elm St, Round Rock TX 78664"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800 placeholder-gray-300 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 mb-4"
          autoFocus
        />

        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full py-3 rounded-xl text-white text-base font-semibold transition-opacity disabled:opacity-40"
          style={{ backgroundColor: ACCENT }}
        >
          Let&apos;s get started →
        </button>

        <p className="text-center text-xs text-gray-400 mt-3">
          You can update this anytime in Step 1
        </p>
      </div>
    </div>
  )
}
