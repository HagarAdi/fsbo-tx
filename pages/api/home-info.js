const HOME_TYPE_MAP = {
  SINGLE_FAMILY: 'single',
  CONDO: 'condo',
  TOWNHOUSE: 'town',
  MULTI_FAMILY: 'multi',
  MULTI_FAMILY_5_PLUS: 'multi',
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { address } = req.query
  if (!address) return res.status(400).json({ error: 'address is required' })

  const apiKey = process.env.Rapid_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'RapidAPI key not configured' })

  let raw
  try {
    const response = await fetch(
      `https://private-zillow.p.rapidapi.com/byaddress?propertyaddress=${encodeURIComponent(address)}`,
      {
        headers: {
          'x-rapidapi-host': 'private-zillow.p.rapidapi.com',
          'x-rapidapi-key': apiKey,
        },
      }
    )
    if (!response.ok) {
      return res.status(response.status).json({ error: `Zillow API error: ${response.status}` })
    }
    raw = await response.json()
  } catch (err) {
    return res.status(502).json({ error: 'Failed to reach Zillow API' })
  }

  // Some wrappers nest the payload under .data
  const d = raw?.data ?? raw
  const facts = d?.resoFacts ?? {}
  const result = {}

  const livingArea = d.livingArea ?? facts.livingArea
  if (livingArea) result.sqft = String(Math.round(livingArea))

  if (d.bedrooms != null) result.bedrooms = String(d.bedrooms)
  if (d.bathrooms != null) result.bathrooms = String(d.bathrooms)
  if (d.yearBuilt != null) result.yearBuilt = String(d.yearBuilt)

  const homeType = d.homeType ?? d.propertyType
  if (homeType && HOME_TYPE_MAP[homeType]) result.propertyType = HOME_TYPE_MAP[homeType]

  const hasPool = facts.hasPool ?? d.hasPool
  if (hasPool != null) result.pool = Boolean(hasPool)

  const parkingRaw = facts.parkingCapacity ?? facts.garageSpaces ?? d.garageSpaces
  if (parkingRaw != null) {
    const cars = parseInt(parkingRaw)
    if (!isNaN(cars)) result.garageCars = cars >= 3 ? '3' : String(Math.max(0, cars))
  }

  const storiesRaw = facts.stories ?? d.stories
  if (storiesRaw != null) {
    const s = parseInt(storiesRaw)
    if (s === 1) result.stories = 'one'
    else if (s >= 2) result.stories = 'two'
  }

  const lotValue = d.lotAreaValue
  const lotUnit = (d.lotAreaUnit ?? '').toLowerCase()
  if (lotValue) {
    if (lotUnit === 'acres') {
      result.lotAcres = String(parseFloat(lotValue).toFixed(6))
    } else {
      // Default: treat as sqft
      result.lotAcres = (parseFloat(lotValue) / 43560).toFixed(6)
    }
  }

  return res.status(200).json(result)
}
