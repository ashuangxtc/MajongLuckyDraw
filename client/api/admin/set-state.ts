import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getState } from '../_utils/store';
import { verifySessionToken } from '../_utils/auth';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  // 移除会话验证 - 直接通过

  const st = getState();
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const next = String(body?.state || '');
    if (!['waiting','open','closed','ready','paused','locked'].includes(next)) {
      return res.status(400).json({ ok: false, error: 'INVALID_STATE' });
    }
    // 兼容你的前后端命名：waiting->idle, open->ready, closed->locked
    const map: Record<string,string> = { waiting:'idle', open:'ready', paused:'paused', closed:'locked' };
    (st as any).phase = (map[next] || next) as any;
    if ((st as any).phase === 'idle') (st as any).startedAt = undefined;
    if ((st as any).phase === 'ready') (st as any).startedAt = Date.now();
    return res.status(200).json({ ok: true, phase: st.phase });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'INTERNAL_ERROR' });
  }
}


