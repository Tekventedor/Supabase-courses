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

function normalizeUsername(input: string): string {
  const trimmed = input.trim();
  // Already in username format
  if (trimmed.includes('.')) {
    return trimmed.toLowerCase();
  }
  // Convert "First Last" -> "first.last"
  const parts = trimmed
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]}.${parts[1]}`;
  }
  return trimmed.toLowerCase();
}

function normalizePassword(input: string): string {
  const raw = input.trim();
  // If 6 digits: DDMMYY -> YYYY-MM-DD (century rule: YY >= 50 => 19YY else 20YY)
  if (/^\d{6}$/.test(raw)) {
    const dd = raw.slice(0, 2);
    const mm = raw.slice(2, 4);
    const yy = raw.slice(4, 6);
    const yyNum = parseInt(yy, 10);
    const century = yyNum >= 50 ? '19' : '20';
    return `${century}${yy}-${mm}-${dd}`; // YYYY-MM-DD
  }
  return raw; // assume already ISO or other agreed format
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });

  const normalizedUsername = normalizeUsername(username);
  const candidatePassword = normalizePassword(password);

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', normalizedUsername)
    .single();

  if (error || !user) return res.status(401).json({ error: 'Invalid username or password' });

  const valid = await bcrypt.compare(candidatePassword, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid username or password' });

  const token = jwt.sign(
    { userId: user.id, username: user.username, course: user.course },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=7200; SameSite=Strict`);

  res.status(200).json({ message: 'Login successful' });
}
