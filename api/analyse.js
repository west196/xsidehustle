export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username } = req.body || {};
  if (!username) return res.status(400).json({ error: 'Username is required' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server not configured. Add ANTHROPIC_API_KEY to Vercel environment variables.' });

  const SIDE_HUSTLES = [
    "Ghostwriting","Newsletter","Consulting","Digital Products","Coaching",
    "Affiliate Marketing","Freelance Design","Video Editing","No-Code Development",
    "Course Creation","Social Media Management","Copywriting","Web Development",
    "UGC Content","Podcast","Dropshipping","Notion Templates","Thread Writing",
    "Brand Deals","SEO Writing","Resume Writing","Ebook Publishing","Community Building",
    "Stock Photography","Voiceover Work","Transcription","Translation",
    "Online Tutoring","Virtual Assistant","Bookkeeping","Prompt Engineering",
    "AI Art Selling","App Development","Chrome Extensions","SaaS Products"
  ];

  const prompt = `You are an expert career consultant and social media analyst.

Your task: Analyse the X (Twitter) profile @${username} and recommend side hustles.

STEP 1 — USE WEB SEARCH:
- Search for "@${username} twitter" or "@${username} X profile" to find their current public profile.
- Extract their REAL display name (often different from the handle).
- Find their profile image URL (usually from pbs.twimg.com). If not found, return empty string.
- Read their bio and recent tweets to understand their personality, skills, and interests.

STEP 2 — ANALYSE & MATCH:
- Pick 3 side hustles from this list that best fit them: ${SIDE_HUSTLES.join(', ')}
- Assign a 1-word VIBE (e.g. ELITE, CREATIVE, TECHY, HUSTLER, VISIONARY, BUILDER).

STEP 3 — OUTPUT:
Return ONLY valid JSON, no markdown, no explanation:
{
  "displayName": "Their real display name",
  "handle": "${username}",
  "profileImageUrl": "https://pbs.twimg.com/... or empty string",
  "vibe": "ONE_WORD",
  "sideHustles": [
    {
      "title": "Hustle name from the list",
      "whyItFits": "Max 15 words — specific reason based on their actual content",
      "firstStep": "Max 10 words — concrete first action to start"
    }
  ]
}`;

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      return res.status(anthropicRes.status).json({ error: data.error?.message || 'Anthropic API error' });
    }

    const textBlock = data.content?.find(b => b.type === 'text');
    if (!textBlock?.text) return res.status(500).json({ error: 'No response from Claude' });

    let raw = textBlock.text.trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Could not parse Claude response' });

    return res.status(200).json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
