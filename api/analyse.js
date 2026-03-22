
export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username } = req.body || {};
  if (!username) return res.status(400).json({ error: 'Username is required' });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server not configured.' });

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

  const prompt = `You are an expert career consultant. Based on the X (Twitter) username @${username}, search your knowledge for anything you know about this person's online presence, content, and personality.

If you know who they are, use that. If you don't recognise them, make reasonable assumptions based on the username itself.

Pick 3 side hustles from this list that would fit them: ${SIDE_HUSTLES.join(', ')}

Assign a 1-word VIBE (e.g. ELITE, CREATIVE, TECHY, HUSTLER, VISIONARY, BUILDER).

Return ONLY valid JSON, no markdown, no explanation:
{
  "displayName": "Their name or @${username} if unknown",
  "handle": "${username}",
  "profileImageUrl": "",
  "vibe": "ONE_WORD",
  "sideHustles": [
    {
      "title": "Hustle name from the list",
      "whyItFits": "Max 15 words specific reason",
      "firstStep": "Max 10 words concrete first action"
    }
  ]
}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://xsidehustle.vercel.app',
        'X-Title': 'X Side Hustle Finder'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }

    let raw = data.choices?.[0]?.message?.content?.trim() || '';
    raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Could not parse response. Try again.' });

    return res.status(200).json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
