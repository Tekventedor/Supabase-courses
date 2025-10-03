import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).end();
  const { id } = req.query;
  const cookie = req.headers.cookie || '';
  const tokenMatch = cookie.match(/token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
    if (decoded.username !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) return res.status(500).json({ error: 'Failed to delete user' });
    res.status(200).json({ message: 'User deleted' });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
