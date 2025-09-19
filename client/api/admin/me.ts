import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifySessionToken, getSessionMaxAgeMs } from '../_utils/auth';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const token = (req.cookies as any)?.admin_session as string | undefined;
  if (!verifySessionToken(token)) {
    return res.status(401).json({ ok: false, error: 'ADMIN_REQUIRED' });
  }
  res.setHeader('Set-Cookie', `admin_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(getSessionMaxAgeMs()/1000)}`);
  return res.status(200).json({ ok: true });
}


