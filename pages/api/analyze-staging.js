export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { images, mode } = req.body;

  const analyzePrompt = `You are a professional home stager helping a Texas homeowner prepare their home for sale.
    Look at these photos and give specific staging suggestions to attract more buyers.
    Do NOT look for defects or repairs — focus only on staging: furniture layout, clutter, decor, lighting, color, and curb presence.
    Be encouraging and specific about what to move, remove, or add.
    Return ONLY a valid JSON array with no other text, markdown, or explanation.
    Each item must have exactly these fields:
    - room: exactly one of "Living Room", "Kitchen", "Bedroom", "Bathroom", "Exterior", "Other" (string)
    - suggestion: specific actionable staging suggestion (string)
    - effort: exactly one of "Easy", "Medium", "Hard" (string)
    - impact: exactly one of "High", "Medium", "Low" (string)`;

  const verifyPrompt = `You are a real estate staging expert reviewing photos of a home that has already been staged for sale.
    Evaluate each room and tell the seller what looks show-ready and what still needs improvement.
    Return ONLY a valid JSON array with no other text, markdown, or explanation.
    Each item must have exactly these fields:
    - room: the room name (string)
    - suggestion: specific feedback about this room (string)
    - effort: exactly one of "Done", "Easy", "Medium", "Hard" (string)
    - impact: exactly one of "Looks Good", "Still Needed" (string)`;

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
                data: img,
              },
            })),
            { text: mode === 'verify' ? verifyPrompt : analyzePrompt },
          ],
        }],
      }),
    }
  );

  const data = await response.json();

  try {
    const text = data.candidates[0].content.parts[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const findings = JSON.parse(clean);
    res.status(200).json({ findings });
  } catch (e) {
    res.status(200).json({ findings: [], error: 'Could not parse response' });
  }
}
