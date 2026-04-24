export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Reads from Vercel Environment Variables securely
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not configured in Vercel.' });
  }

  const modelEndpoint = req.query.model || "gemini-2.5-flash:generateContent";

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelEndpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Vercel Function Error:", error);
    return res.status(500).json({ error: 'Internal Server Error fetching AI response' });
  }
}
