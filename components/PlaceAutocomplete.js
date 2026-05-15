import { useState, useEffect, useRef, useCallback } from 'react'
import { loadGoogleMaps } from '../lib/googleMaps'

const DEBOUNCE_MS = 300
const MIN_CHARS = 3
const FREETEXT_MIN = 10

export default function PlaceAutocomplete({ onSelect }) {
  const [inputValue, setInputValue] = useState('')
  const [predictions, setPredictions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  // null = loading, true = Maps ready, false = no key / load failed → freetext mode
  const [apiReady, setApiReady] = useState(null)
  const [apiError, setApiError] = useState(null)

  const autocompleteService = useRef(null)
  const placesService = useRef(null)
  const sessionToken = useRef(null)
  const debounceTimer = useRef(null)
  const attributionEl = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY) {
      setApiReady(false)
      setApiError('no-key')
      return
    }
    loadGoogleMaps()
      .then((google) => {
        autocompleteService.current = new google.maps.places.AutocompleteService()
        placesService.current = new google.maps.places.PlacesService(attributionEl.current)
        setApiReady(true)
      })
      .catch((err) => {
        setApiReady(false)
        setApiError(err?.message || 'load-failed')
      })
  }, [])

  // In freetext mode, emit a place-shaped object whenever input is long enough
  useEffect(() => {
    if (apiReady === false) {
      if (inputValue.trim().length >= FREETEXT_MIN) {
        onSelect({ formattedAddress: inputValue.trim(), lat: null, lng: null, components: null })
      } else {
        onSelect(null)
      }
    }
  }, [apiReady, inputValue, onSelect])

  const refreshSessionToken = useCallback(() => {
    if (window.google?.maps?.places) {
      sessionToken.current = new window.google.maps.places.AutocompleteSessionToken()
    }
  }, [])

  const fetchPredictions = useCallback((value) => {
    if (!autocompleteService.current || value.length < MIN_CHARS) {
      setPredictions([])
      setIsOpen(false)
      return
    }
    autocompleteService.current.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: 'us' },
        sessionToken: sessionToken.current,
      },
      (results, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          results?.length
        ) {
          setPredictions(results)
          setIsOpen(true)
        } else {
          setPredictions([])
          setIsOpen(false)
        }
      }
    )
  }, [])

  const handleFocus = () => {
    if (apiReady && !sessionToken.current) refreshSessionToken()
  }

  const handleChange = (e) => {
    const value = e.target.value
    setInputValue(value)

    if (apiReady !== true) return // freetext effect handles onSelect

    onSelect(null)

    if (!value) {
      refreshSessionToken()
      setPredictions([])
      setIsOpen(false)
      clearTimeout(debounceTimer.current)
      return
    }

    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => fetchPredictions(value), DEBOUNCE_MS)
  }

  const handleSelect = (prediction) => {
    if (!placesService.current) return

    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['geometry', 'address_components', 'formatted_address'],
        sessionToken: sessionToken.current,
      },
      (place, status) => {
        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !place) return

        setInputValue(place.formatted_address)
        setPredictions([])
        setIsOpen(false)
        sessionToken.current = null

        onSelect({
          formattedAddress: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          components: place.address_components,
        })
      }
    )
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

      {apiReady === true && isOpen && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {predictions.map((p) => (
            <button
              key={p.place_id}
              type="button"
              onMouseDown={() => handleSelect(p)}
              className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-green-50
                         transition-colors border-b border-gray-100 last:border-0"
            >
              <span className="font-medium">{p.structured_formatting.main_text}</span>
              <span className="text-gray-400 ml-1">{p.structured_formatting.secondary_text}</span>
            </button>
          ))}
          <div className="px-4 py-2 flex justify-end bg-gray-50">
            <span className="text-[10px] text-gray-400">Powered by Google</span>
          </div>
        </div>
      )}

      {apiError && (
        <p className="mt-1 text-[11px] text-amber-600">
          {apiError === 'no-key'
            ? 'Autocomplete unavailable — API key not detected in this build'
            : `Autocomplete unavailable — ${apiError}`}
        </p>
      )}

      {/* Required by PlacesService constructor — must be in DOM */}
      <div ref={attributionEl} className="hidden" />
    </div>
  )
}
