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

    const existingUser = await kv.get(`user:${userId}`);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hash = crypto.createHash('sha256').update(password).digest('hex');
    
    await kv.set(`user:${userId}`, { hash });

    return res.status(201).json({ message: 'User created successfully', userId });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
