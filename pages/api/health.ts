import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const jwtSecret = process.env.JWT_SECRET;

  const envStatus = {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(url),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(anon),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(service),
    JWT_SECRET: Boolean(jwtSecret),
  };

  let dbOk = false;
  let dbError: string | undefined;

  try {
    if (url && anon) {
      const supabase = createClient(url, anon);
      // Lightweight head request to check connectivity
      const { error } = await supabase.from('users').select('id', { count: 'exact', head: true });
      if (!error) dbOk = true; else dbError = error.message;
    } else {
      dbError = 'Missing URL or anon key';
    }
  } catch (e: any) {
    dbError = e?.message || 'Unknown error';
  }

  res.status(200).json({ env: envStatus, supabase: { ok: dbOk, error: dbError } });
}
