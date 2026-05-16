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

  const result = {}

  // Actual field names returned by this API
  if (raw['Area(sqft)']) result.sqft = String(Math.round(Number(raw['Area(sqft)'])))
  if (raw.Bedrooms != null) result.bedrooms = String(raw.Bedrooms)
  if (raw.Bathrooms != null) result.bathrooms = String(raw.Bathrooms)
  if (raw.yearBuilt) result.yearBuilt = String(raw.yearBuilt)

  // propertyType, stories, pool, garageCars, lotAcres are not returned by this endpoint

  return res.status(200).json(result)
}
