import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createSessionToken, verifySessionToken, getSessionMaxAgeMs } from '../_utils/auth';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    // 临时关闭密码校验：无论输入什么都直接签发会话

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


