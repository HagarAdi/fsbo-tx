function parseCity(addr) {
  if (!addr) return ''
  const parts = String(addr).split(',').map(p => p.trim()).filter(Boolean)
  return parts.length >= 2 ? parts[parts.length - 2] : ''
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  if (!process.env.RUNWARE_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  const { specs = {}, vibe = '', features = [], neighborhood = '', notes = '', homeAddress = '' } = req.body

  const city = parseCity(homeAddress) || 'Texas'
  const beds = specs.bedrooms || ''
  const baths = specs.bathrooms || ''
  const sqftN = parseFloat(specs.sqft)
  const sqft = !isNaN(sqftN) && sqftN > 0 ? `${sqftN.toLocaleString()} sqft` : ''
  const year = specs.yearBuilt || ''
  const specLine = [beds && `${beds}BR`, baths && `${baths}BA`, sqft, year && `Built ${year}`].filter(Boolean).join(', ')
  const feats = features.map(f => (f || '').trim()).filter(Boolean)

  const prompt = `You are a professional real estate copywriter helping a Texas FSBO seller write their listing.

Home details:
- Location: ${homeAddress || city}
- Specs: ${specLine || 'not provided'}
- Vibe: ${vibe || 'welcoming'}
- Top features: ${feats.length ? feats.join(', ') : 'not specified'}
- Neighborhood: ${neighborhood || 'not specified'}
${notes ? `- Seller notes: ${notes}` : ''}

Write listing copy for all 4 platforms below. Return ONLY a valid JSON object — no markdown, no explanation, no code fences.

{
  "zillow": "Professional MLS-style listing. Open with a compelling sentence about the lifestyle. Write 2–3 short paragraphs. If features were provided, add a bullet list under 'Key features:'. Close with the neighborhood context (if provided) and 'Contact owner directly to schedule a showing.' Under 350 words.",
  "facebook": "Warm, conversational post. Lead with '🏡' and a headline that includes the spec line. Write naturally about the home as if telling a friend. Weave in features. Close with 'DM to schedule a viewing! 📩'. Under 180 words.",
  "instagram": "Two parts separated by a blank line. Part 1: one punchy opening sentence + the spec line on the next line. Part 2: 8–10 hashtags starting with #fsbo #texasrealestate, then location and feature tags. No links. No more than 100 words before the hashtags.",
  "craigslist": "Plain text only — no emoji. Lead with the spec line. Write a practical, honest description. List features with dashes if provided. Add neighborhood context if provided. Close with 'Contact owner. No agents please.' Under 280 words."
}

Write in a genuine seller voice — personal, not corporate. Make each version feel native to its platform.`

  const response = await fetch(
    'https://api.runware.ai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RUNWARE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google:gemini@3.1-pro',
        messages: [{ role: 'user', content: prompt }],
        max_completion_tokens: 2048,
      }),
    }
  )

  const data = await response.json()

  try {
    const text = data.choices[0].message.content
    const clean = text.replace(/```json|```/g, '').trim()
    const drafts = JSON.parse(clean)
    res.status(200).json({ drafts })
  } catch {
    res.status(200).json({ drafts: null, error: 'Could not parse response' })
  }
}
