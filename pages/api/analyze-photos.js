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
              text: `You are a friendly real estate expert helping a Texas homeowner prepare their home for sale.
              Look at these photos and identify what should be fixed before listing.
              Be specific but encouraging — most issues are easy to fix.
              Return ONLY a valid JSON array with no other text, markdown, or explanation.
              Each item must have exactly these fields:
              - issue: short name of the problem (string)
              - priority: exactly one of "Must Fix", "Recommended", or "Optional" (string)
              - costRange: estimated cost range e.g. "$20-50 DIY" (string)
              - whyItMatters: one friendly sentence explaining why buyers care (string)
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
