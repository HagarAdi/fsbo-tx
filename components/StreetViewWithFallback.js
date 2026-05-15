import { useState } from 'react'

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

function streetViewUrl(lat, lng, size) {
  return `https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${lat},${lng}&fov=90&source=outdoor&key=${KEY}`
}

function staticMapUrl(lat, lng, size) {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=18&size=${size}&maptype=satellite&key=${KEY}`
}

export default function StreetViewWithFallback({ lat, lng, size = '640x360' }) {
  const [useFallback, setUseFallback] = useState(false)

  if (!KEY || !lat || !lng) return <span className="text-xl">📍</span>

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={useFallback ? staticMapUrl(lat, lng, size) : streetViewUrl(lat, lng, size)}
      alt="Street view"
      className="w-full h-full object-cover"
      onError={() => { if (!useFallback) setUseFallback(true) }}
    />
  )
}
