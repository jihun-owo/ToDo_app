import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const data = await kv.get(`data:${userId}`);
    
    return res.status(200).json({ data: data || { recentCalendars: [], dayData: {}, aiUsageData: { count: 0, resetTime: null } } });
  } catch (error) {
    console.error('Get data error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
