import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifySessionToken, getSessionMaxAgeMs } from '../_utils/auth';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // 移除会话验证 - 直接返回成功
  const token = (req.cookies as any)?.admin_session as string | undefined;
  res.setHeader('Set-Cookie', `admin_session=${token || 'dummy'}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(getSessionMaxAgeMs()/1000)}`);
  return res.status(200).json({ ok: true });
}


