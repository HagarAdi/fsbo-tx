export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { images } = req.body;
  console.log('Images received:', images?.length);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            ...images.map(img => ({
              inline_data: {
                mime_type: 'image/jpeg',
                data: img
              }
            })),
            {
              text: `You are advising a Texas FSBO seller on COSMETIC UPGRADES worth a checkbook before listing.
              Look at these photos and identify dated, worn, or visually unappealing elements that money can fix:
              dated cooktops/appliances, beige or scuffed walls, brass/dated fixtures, worn carpet, dated tile,
              old caulking, dingy grout, dated cabinet hardware, builder-grade light fixtures, etc.
              IGNORE anything mechanical, structural, electrical, plumbing, HVAC, roof, or foundation —
              you cannot see those from photos and a pre-listing inspector covers that territory.
              Be specific and honest. If a room looks great, return fewer items rather than padding.
              Return ONLY a valid JSON array with no other text, markdown, or explanation.
              Each item must have exactly these fields:
              - issue: short name of the cosmetic problem (string, e.g. "Dated brass bathroom fixtures")
              - priority: exactly one of "Must Fix", "Recommended", or "Optional" (string)
              - costRange: rough $ estimate range as a short string (e.g. "$50–150", "$300–800", "$1,500+")
              - whyItMatters: one friendly sentence explaining how this affects buyer perception or offer price (string)
              - room: exactly one of "Bathroom", "Kitchen", "Exterior", "Interior", "Other" (string)`
            }
          ]
        }]
      })
    }
  );

  const data = await response.json();
  console.log('Gemini status:', response.status);
  console.log('Gemini response:', JSON.stringify(data).slice(0, 500));

  try {
    const text = data.candidates[0].content.parts[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const issues = JSON.parse(clean);
    res.status(200).json({ issues });
  } catch (e) {
    res.status(200).json({ issues: [], error: 'Could not parse response' });
  }
}
