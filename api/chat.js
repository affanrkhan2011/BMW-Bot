export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Reads from Vercel Environment Variables securely
  const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API_KEY environment variable is not configured in Vercel.' });
  }

  const isGroq = apiKey.startsWith('gsk_');

  try {
    let fetchUrl, fetchBody;
    
    if (isGroq) {
      fetchUrl = 'https://api.groq.com/openai/v1/chat/completions';
      fetchBody = JSON.stringify({
        model: req.query.model || "llama3-70b-8192",
        messages: req.body.messages || [],
        max_tokens: req.body.maxTokens || req.body.max_tokens || 500
      });
    } else {
      const modelEndpoint = req.query.model || "gemini-2.5-flash:generateContent";
      fetchUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelEndpoint}?key=${apiKey}`;
      fetchBody = JSON.stringify(req.body);
    }

    const fetchHeaders = {
      'Content-Type': 'application/json'
    };

    if (isGroq) {
      fetchHeaders['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: fetchHeaders,
      body: fetchBody
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Vercel Function Error:", error);
    return res.status(500).json({ error: 'Internal Server Error fetching AI response' });
  }
}
