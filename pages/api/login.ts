import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error('Supabase URL is missing. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL');
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase service role key is missing. Set SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !user) return res.status(401).json({ error: 'Invalid username or password' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid username or password' });

  const token = jwt.sign(
    { userId: user.id, username: user.username, course: user.course },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=7200; SameSite=Strict`);

  res.status(200).json({ message: 'Login successful' });
}
