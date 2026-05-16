const HOME_TYPE_MAP = {
  SINGLE_FAMILY: 'single',
  CONDO: 'condo',
  TOWNHOUSE: 'town',
  MULTI_FAMILY: 'multi',
  MULTI_FAMILY_5_PLUS: 'multi',
}

function pick(...vals) {
  for (const v of vals) {
    if (v !== undefined && v !== null && v !== '') return v
  }
  return undefined
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
  } catch {
    return res.status(502).json({ error: 'Failed to reach Zillow API' })
  }

  // Unwrap common envelope shapes
  const d = raw?.data ?? raw?.property ?? raw?.result ?? raw
  const facts = d?.resoFacts ?? d?.facts ?? d?.resoFacts ?? {}

  const result = {}

  // sqft — try every common field name
  const sqftRaw = pick(
    d.livingArea, d.sqFt, d.sqft, d.finishedSqFt, d.livingAreaValue,
    d.floorSize, d.area, d.totalArea, facts.livingArea, facts.sqFt
  )
  if (sqftRaw) result.sqft = String(Math.round(Number(sqftRaw)))

  // bedrooms
  const bedsRaw = pick(d.bedrooms, d.beds, d.numBedrooms, d.bedroomsTotal, facts.bedrooms, facts.beds)
  if (bedsRaw != null) result.bedrooms = String(bedsRaw)

  // bathrooms
  const bathsRaw = pick(
    d.bathrooms, d.baths, d.numBathrooms, d.bathroomsTotal,
    d.totalBathrooms, facts.bathrooms, facts.baths
  )
  if (bathsRaw != null) result.bathrooms = String(bathsRaw)

  // yearBuilt
  const yearBuiltRaw = pick(d.yearBuilt, d.builtYear, facts.yearBuilt)
  if (yearBuiltRaw) result.yearBuilt = String(yearBuiltRaw)

  // propertyType
  const homeTypeRaw = pick(d.homeType, d.propertyType, d.homeSubType, d.propertySubType)
  if (homeTypeRaw && HOME_TYPE_MAP[homeTypeRaw]) result.propertyType = HOME_TYPE_MAP[homeTypeRaw]

  // pool
  const hasPoolRaw = pick(facts.hasPool, d.hasPool, d.pool)
  if (hasPoolRaw != null) result.pool = hasPoolRaw === true || hasPoolRaw === 'Yes' || hasPoolRaw === 'yes'

  // garage
  const garageRaw = pick(
    facts.parkingCapacity, facts.garageSpaces, facts.numGarageSpaces,
    d.garageSpaces, d.numGarageSpaces, d.parkingCapacity
  )
  if (garageRaw != null) {
    const cars = parseInt(garageRaw)
    if (!isNaN(cars)) result.garageCars = cars >= 3 ? '3' : String(Math.max(0, cars))
  }

  // stories
  const storiesRaw = pick(facts.stories, facts.numFloors, d.stories, d.numFloors, d.numStories)
  if (storiesRaw != null) {
    const s = parseInt(storiesRaw)
    if (s === 1) result.stories = 'one'
    else if (s >= 2) result.stories = 'two'
  }

  // lot size
  const lotValueRaw = pick(
    d.lotAreaValue, d.lotSize, d.lotSqFt, d.lotSizeSquareFeet, d.lotSizeSqFt, facts.lotSize
  )
  if (lotValueRaw) {
    const lotNum = parseFloat(lotValueRaw)
    const lotUnitRaw = (pick(d.lotAreaUnit, d.lotSizeUnit) ?? '').toLowerCase()
    if (lotUnitRaw === 'acres' || lotUnitRaw === 'acre') {
      result.lotAcres = lotNum.toFixed(6)
    } else {
      result.lotAcres = (lotNum / 43560).toFixed(6)
    }
  }

  // Temporary: return raw payload so field-name mismatches can be diagnosed from the network tab
  result._raw = { raw, d, facts }

  return res.status(200).json(result)
}
