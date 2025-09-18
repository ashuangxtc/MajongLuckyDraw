import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getState } from '../_utils/store';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const s = getState();
  s.phase = 'paused';
  res.status(200).json({ ok: true, phase: s.phase });
}
