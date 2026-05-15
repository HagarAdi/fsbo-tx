import { useState, useEffect, useRef, useCallback } from 'react'
import { loadGoogleMaps } from '../lib/googleMaps'

const DEBOUNCE_MS = 300
const MIN_CHARS = 3
const FREETEXT_MIN = 10
const LOAD_TIMEOUT_MS = 8000

export default function PlaceAutocomplete({ onSelect }) {
  const [inputValue, setInputValue] = useState('')
  const [predictions, setPredictions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  // null = loading, true = new Places API ready, false = freetext fallback
  const [apiReady, setApiReady] = useState(null)
  const [apiError, setApiError] = useState(null)

  const googleRef = useRef(null)
  const sessionToken = useRef(null)
  const debounceTimer = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY) {
      setApiReady(false)
      setApiError('no-key')
      return
    }

    const timeout = setTimeout(() => {
      setApiReady(false)
      setApiError('load-timeout — check key restrictions and enabled APIs in Google Cloud')
    }, LOAD_TIMEOUT_MS)

    loadGoogleMaps()
      .then((g) => {
        clearTimeout(timeout)
        if (!g?.maps?.places?.AutocompleteSuggestion) {
          throw new Error('Places API (New) not available — enable it in Google Cloud Console')
        }
        googleRef.current = g
        setApiReady(true)
      })
      .catch((err) => {
        clearTimeout(timeout)
        setApiReady(false)
        setApiError(err?.message || 'load-failed')
      })

    return () => clearTimeout(timeout)
  }, [])

  // Freetext fallback — emit a valid place-shaped object when long enough
  useEffect(() => {
    if (apiReady !== false) return
    if (inputValue.trim().length >= FREETEXT_MIN) {
      onSelect({ formattedAddress: inputValue.trim(), lat: null, lng: null, components: null })
    } else {
      onSelect(null)
    }
  }, [apiReady, inputValue, onSelect])

  const refreshSessionToken = useCallback(() => {
    const g = googleRef.current
    if (g?.maps?.places) {
      sessionToken.current = new g.maps.places.AutocompleteSessionToken()
    }
  }, [])

  const fetchPredictions = useCallback(async (value) => {
    const g = googleRef.current
    if (!g || value.length < MIN_CHARS) {
      setPredictions([])
      setIsOpen(false)
      return
    }
    try {
      const { suggestions } = await g.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: value,
        sessionToken: sessionToken.current,
        includedRegionCodes: ['us'],
      })
      if (suggestions?.length) {
        setPredictions(suggestions)
        setIsOpen(true)
      } else {
        setPredictions([])
        setIsOpen(false)
      }
    } catch {
      setPredictions([])
      setIsOpen(false)
    }
  }, [])

  const handleFocus = () => {
    if (apiReady === true && !sessionToken.current) refreshSessionToken()
  }

  const handleChange = (e) => {
    const value = e.target.value
    setInputValue(value)

    if (apiReady !== true) return

    onSelect(null)
    clearTimeout(debounceTimer.current)

    if (!value) {
      refreshSessionToken()
      setPredictions([])
      setIsOpen(false)
      return
    }

    debounceTimer.current = setTimeout(() => fetchPredictions(value), DEBOUNCE_MS)
  }

  const handleSelect = async (suggestion) => {
    try {
      const place = suggestion.placePrediction.toPlace()
      await place.fetchFields({ fields: ['location', 'addressComponents', 'formattedAddress'] })

      setInputValue(place.formattedAddress)
      setPredictions([])
      setIsOpen(false)
      sessionToken.current = null

      onSelect({
        formattedAddress: place.formattedAddress,
        lat: place.location.lat(),
        lng: place.location.lng(),
        components: place.addressComponents,
      })
    } catch {
      // selection failed silently — user can try again
    }
  }

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder="123 Elm St, Round Rock TX 78664"
        autoComplete="off"
        autoFocus
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800
                   placeholder-gray-300 focus:outline-none focus:border-green-500 focus:ring-2
                   focus:ring-green-100"
      />

      {apiError && (
        <p className="mt-1 text-[11px] text-amber-600">
          {apiError === 'no-key'
            ? 'Autocomplete unavailable — API key not detected in this build'
            : `Autocomplete unavailable — ${apiError}`}
        </p>
      )}

      {apiReady === true && isOpen && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {predictions.map((s) => {
            const p = s.placePrediction
            return (
              <button
                key={p.placeId}
                type="button"
                onMouseDown={() => handleSelect(s)}
                className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-green-50
                           transition-colors border-b border-gray-100 last:border-0"
              >
                <span className="font-medium">{p.mainText?.toString()}</span>
                <span className="text-gray-400 ml-1">{p.secondaryText?.toString()}</span>
              </button>
            )
          })}
          <div className="px-4 py-2 flex justify-end bg-gray-50">
            <span className="text-[10px] text-gray-400">Powered by Google</span>
          </div>
        </div>
      )}
    </div>
  )
}
