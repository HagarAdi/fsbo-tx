import { Loader } from '@googlemaps/js-api-loader'

let loaderPromise = null

export function loadGoogleMaps() {
  if (!loaderPromise) {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
      version: 'weekly',
      libraries: ['places'],
    })
    loaderPromise = loader.load()
  }
  return loaderPromise
}
