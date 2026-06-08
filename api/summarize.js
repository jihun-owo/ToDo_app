export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { routines } = req.body;
    if (!routines) {
      return res.status(400).json({ error: 'Routines are required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key is not configured' });
    }

    const prompt = `다음은 사용자의 오늘 하루 일과입니다. 이 일과들을 바탕으로 오늘 하루를 따뜻하고 긍정적인 어조로 3줄로 요약해 주세요. 일과: ${routines}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error:', errorData);
      return res.status(response.status).json({ error: 'Failed to generate summary' });
    }

    const data = await response.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || '요약을 생성할 수 없습니다.';

    return res.status(200).json({ summary });
  } catch (error) {
    console.error('Summarize error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
