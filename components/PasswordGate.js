import { useState, useEffect } from 'react'

export default function PasswordGate({ children }) {
  const [authenticated, setAuthenticated] = useState(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    setAuthenticated(!!localStorage.getItem('fsbo_authenticated'))
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === 'fsbo2024') {
      localStorage.setItem('fsbo_authenticated', 'true')
      setAuthenticated(true)
    } else {
      setError(true)
    }
  }

  if (authenticated === null) return null

  if (authenticated) return children

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">FSBO Texas Guide</h1>
        <p className="text-gray-400 text-sm mb-8">Enter password to continue</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false) }}
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm">Incorrect password</p>}
          <button
            type="submit"
            className="w-full py-3 px-6 rounded-xl text-white font-semibold bg-green-600 hover:bg-green-700 transition-colors"
          >
            Enter →
          </button>
        </form>
      </div>
    </div>
  )
}
