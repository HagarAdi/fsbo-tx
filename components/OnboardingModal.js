import { useState } from 'react'
import PlaceAutocomplete from './PlaceAutocomplete'

const ACCENT = '#16a34a'

export default function OnboardingModal({ onAddressSave }) {
  const [place, setPlace] = useState(null)

  const handleSubmit = () => {
    if (!place) return
    localStorage.setItem('fsbo_homeAddressMeta', JSON.stringify({
      lat: place.lat,
      lng: place.lng,
      components: place.components,
    }))
    onAddressSave(place.formattedAddress)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <p className="text-2xl font-bold text-gray-900">🏠 FSBO Texas Guide</p>
          <h2 className="text-xl font-bold text-gray-900 mt-5 mb-2">Let&apos;s get started</h2>
          <p className="text-gray-500 text-sm">What&apos;s the address of the home you&apos;re selling?</p>
        </div>

        <PlaceAutocomplete onSelect={setPlace} />

        <button
          onClick={handleSubmit}
          disabled={!place}
          className="w-full mt-4 py-3 rounded-xl text-white text-base font-semibold transition-opacity disabled:opacity-40"
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
