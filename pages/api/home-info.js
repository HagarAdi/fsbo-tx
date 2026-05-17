export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { address } = req.query
  if (!address) return res.status(400).json({ error: 'address is required' })

  const apiKey = process.env.Rapid_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'RapidAPI key not configured' })

  let raw
  try {
    const response = await fetch(
      `https://private-zillow.p.rapidapi.com/pro/byaddress?propertyaddress=${encodeURIComponent(address)}`,
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

  const pd = raw?.propertyDetails ?? {}
  const facts = pd.resoFacts ?? {}
  const result = {}

  const HOME_TYPE_MAP = { SINGLE_FAMILY: 'single', TOWNHOUSE: 'town', CONDO: 'condo', MULTI_FAMILY: 'multi' }

  if (pd.livingArea != null) result.sqft = String(Math.round(Number(pd.livingArea)))
  if (facts.bedrooms != null) result.bedrooms = String(facts.bedrooms)
  if (facts.bathroomsFloat != null) result.bathrooms = String(facts.bathroomsFloat)
  if (facts.yearBuilt != null) result.yearBuilt = String(facts.yearBuilt)
  if (pd.homeType && HOME_TYPE_MAP[pd.homeType]) result.propertyType = HOME_TYPE_MAP[pd.homeType]
  if (pd.lotAreaValue != null) {
    const units = (pd.lotAreaUnits || '').toLowerCase()
    if (units.includes('acre')) {
      result.lotAcres = String(pd.lotAreaValue)
    } else if (units.includes('square') || units.includes('sq')) {
      result.lotAcres = (pd.lotAreaValue / 43560).toFixed(4)
    }
  }

  return res.status(200).json(result)
}
