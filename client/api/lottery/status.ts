import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getState, getClientIdFromHeaders } from '../_utils/store';
import { getStats } from '../_utils/adminStore';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const s = getState();
  const cid = getClientIdFromHeaders(req.headers as any);
  const joined = cid ? s.participants.has(cid) : false;
  const stats = getStats();

  res.status(200).json({
    ok: true,
    phase: s.phase,
    startedAt: s.startedAt ?? null,
    joined,
    pattern: s.pattern,
    stats,
  });
}
