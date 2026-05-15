import { useState } from 'react'

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

function streetViewUrl(lat, lng) {
  return `https://maps.googleapis.com/maps/api/streetview?size=128x80&location=${lat},${lng}&fov=90&source=outdoor&key=${KEY}`
}

function staticMapUrl(lat, lng) {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=18&size=128x80&maptype=satellite&key=${KEY}`
}

export default function StreetViewWithFallback({ lat, lng }) {
  const [useFallback, setUseFallback] = useState(false)

  if (!KEY || !lat || !lng) return <span className="text-xl">📍</span>

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={useFallback ? staticMapUrl(lat, lng) : streetViewUrl(lat, lng)}
      alt="Street view"
      className="w-full h-full object-cover"
      onError={() => { if (!useFallback) setUseFallback(true) }}
    />
  )
}
