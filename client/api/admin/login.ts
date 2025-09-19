import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createSessionToken, verifySessionToken, getSessionMaxAgeMs } from '../_utils/auth';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    // 兼容字段名 password / pwd
    const password = String((body?.password ?? body?.pwd ?? '')).trim();
    // 兼容环境变量 ADMIN_PASSWORD / ADMIN_PWD
    const expected = String((process.env.ADMIN_PASSWORD || process.env.ADMIN_PWD || 'Dreammore123')).trim();

    if (password !== expected) {
      return res.status(401).json({ ok: false, error: 'INVALID_PASSWORD' });
    }

    // 已有未过期会话则复用
    const existing = (req.cookies as any)?.admin_session as string | undefined;
    if (verifySessionToken(existing)) {
      res.setHeader('Set-Cookie', `admin_session=${existing}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(getSessionMaxAgeMs()/1000)}`);
      return res.status(200).json({ ok: true });
    }

    const token = createSessionToken();
    res.setHeader('Set-Cookie', `admin_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(getSessionMaxAgeMs()/1000)}`);
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'INTERNAL_ERROR' });
  }
}


