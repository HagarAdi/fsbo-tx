export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { images, mode } = req.body;

  const analyzePrompt = `You are advising a Texas FSBO seller on TIME-COST staging fixes — things they can do themselves on a Saturday afternoon WITHOUT buying or replacing anything.
    Look at these photos and identify clutter, personal items, poor furniture arrangement, dirty or dingy surfaces, dim lighting (open blinds, swap a bulb), and styling issues that buyers see in listing photos.
    DO NOT suggest purchases, replacements, or contractor work — those belong in the upgrade step. Only suggest things the homeowner can do themselves with what they already have, plus their own time.
    Be specific and honest. If a room already looks great, return fewer items rather than padding the list.
    Return ONLY a valid JSON array with no other text, markdown, or explanation.
    Each item must have exactly these fields:
    - room: exactly one of "Living Room", "Kitchen", "Bedroom", "Bathroom", "Exterior", "Other" (string)
    - suggestion: specific actionable staging task the seller can do themselves (string)
    - effort: rough time estimate as a short string (e.g. "15 min", "1 hr", "an afternoon", "30 min")
    - impact: exactly one of "High", "Medium", "Low" (string)`;

  const verifyPrompt = `You are reviewing photos of a Texas home that has already been staged for listing.
    Evaluate each room and tell the seller what looks show-ready and what still needs a time-cost touch-up (declutter, rearrange, clean, open blinds — nothing that costs money).
    Return ONLY a valid JSON array with no other text, markdown, or explanation.
    Each item must have exactly these fields:
    - room: the room name (string)
    - suggestion: specific feedback about this room (string)
    - effort: rough time estimate or "Done" if already show-ready (e.g. "Done", "15 min", "1 hr")
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
