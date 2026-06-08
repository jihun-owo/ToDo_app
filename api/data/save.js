import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userId, data } = req.body;
    
    if (!userId || !data) {
      return res.status(400).json({ error: 'User ID and data are required' });
    }

    await kv.set(`data:${userId}`, data);

    return res.status(200).json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error('Save data error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
