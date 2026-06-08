import { kv } from '@vercel/kv';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userId, password } = req.body;
    
    if (!userId || !password) {
      return res.status(400).json({ error: 'User ID and password are required' });
    }

    const user = await kv.get(`user:${userId}`);
    if (!user) {
      return res.status(401).json({ error: 'Invalid user ID or password' });
    }

    const hash = crypto.createHash('sha256').update(password).digest('hex');
    
    if (user.hash !== hash) {
      return res.status(401).json({ error: 'Invalid user ID or password' });
    }

    return res.status(200).json({ message: 'Login successful', userId });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
