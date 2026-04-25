import { useState, useEffect } from 'react'

export default function PasswordGate({ children }) {
  const [authenticated, setAuthenticated] = useState(null)
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [checkboxError, setCheckboxError] = useState('')

  useEffect(() => {
    const auth = localStorage.getItem('fsbo_authenticated')
    const disclaimer = localStorage.getItem('fsbo_disclaimer_agreed')
    setAuthenticated(!!(auth && disclaimer))
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    let valid = true

    if (password !== 'fsbo2024') {
      setPasswordError('Incorrect password')
      valid = false
    } else {
      setPasswordError('')
    }

    if (!agreed) {
      setCheckboxError('You must agree to the disclaimer to continue')
      valid = false
    } else {
      setCheckboxError('')
    }

    if (valid) {
      localStorage.setItem('fsbo_authenticated', 'true')
      localStorage.setItem('fsbo_disclaimer_agreed', 'true')
      setAuthenticated(true)
    }
  }

  if (authenticated === null) return null
  if (authenticated) return children

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-8 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">🏠 FSBO Texas Guide</h1>
          <p className="text-gray-500 text-sm">Your step-by-step guide to selling your Texas home without a realtor</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <div className="flex gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError('') }}
                placeholder="Enter password"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl text-white font-semibold bg-green-600 hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                Enter →
              </button>
            </div>
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>

          <hr className="border-gray-200" />

          <div className="bg-gray-50 rounded-xl p-4 max-h-36 overflow-y-auto">
            <p className="text-xs text-gray-500 leading-relaxed">
              This tool is for informational purposes only and is provided &ldquo;as-is&rdquo; without any warranties.
              It does not constitute legal, financial, or real estate advice. Real estate laws vary by location.
              Always consult a licensed real estate attorney, agent, or financial advisor before making any decisions.
              The creator of this tool is not a licensed real estate broker in the state of Texas.
              By using this tool, you acknowledge and agree to these terms.
            </p>
          </div>

          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => { setAgreed(e.target.checked); setCheckboxError('') }}
                className="mt-0.5 w-4 h-4 accent-green-600 flex-shrink-0"
              />
              <span className="text-sm text-gray-600">I have read and agree to the disclaimer above</span>
            </label>
            {checkboxError && <p className="text-red-500 text-sm mt-1">{checkboxError}</p>}
          </div>
        </form>
      </div>
    </div>
  )
}
