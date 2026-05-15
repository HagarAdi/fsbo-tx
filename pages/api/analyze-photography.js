export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (!process.env.RUNWARE_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { images, mode } = req.body;

  const analyzePrompt = `You are a professional real estate photographer reviewing practice shots a Texas FSBO seller took with their phone.
    Critique each photo on TECHNIQUE only: lighting (too dim, harsh shadows, mixed color temperature), framing (off-center, tilted, too tight, too wide), angle (chest height vs eye level, shot from the corner), time-of-day (interior shots need lights on AND blinds open, exterior shots need sunny conditions), and clutter visible in the shot.
    DO NOT critique the home itself, furniture choices, paint colors, or anything the homeowner would fix with money — only what they can fix by taking the shot again.
    Be direct and constructive. If a shot is already great, say so and move on.
    Return ONLY a valid JSON array with no other text, markdown, or explanation.
    Each item must have exactly these fields:
    - shot: short label identifying which photo (string, e.g. "Living room shot 1")
    - feedback: specific technique critique or praise (string)
    - severity: exactly one of "Reshoot", "Improve", "Looks Good" (string)
    - fix: one short concrete instruction to retake the shot better, or "" if Looks Good (string)`;

  const comparePrompt = `You are a professional real estate photographer comparing BEFORE and AFTER shots a Texas FSBO seller took of the same rooms.
    The seller's goal: did the second shot fix the technique issues from the first?
    Compare each before/after pair on photography technique: lighting, framing, angle, time-of-day, clutter visible in the shot. Ignore the underlying home — focus on whether the photo itself improved.
    Return ONLY a valid JSON array with no other text, markdown, or explanation.
    Each item must have exactly these fields:
    - room: short label for the room being compared (string)
    - verdict: exactly one of "Much Better", "Better", "Similar", "Worse" (string)
    - whatImproved: what got better in the after shot, or "" if nothing did (string)
    - stillNeedsWork: what to fix in a third attempt, or "" if the after is good enough (string)`;

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
        max_completion_tokens: 8000,
        reasoning_effort: 'low',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: mode === 'compare' ? comparePrompt : analyzePrompt },
            ...images.map(img => ({
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${img}` },
            })),
          ],
        }],
      }),
    }
  );

  const data = await response.json();

  try {
    const text = data.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    const findings = JSON.parse(clean);
    res.status(200).json({ findings });
  } catch (e) {
    res.status(200).json({ findings: [], error: 'Could not parse response' });
  }
}
