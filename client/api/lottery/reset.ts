import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resetState, getState } from '../_utils/store';

export default function handler(req: VercelRequest, res: VercelResponse) {
  resetState();
  const s = getState();
  res.status(200).json({ ok: true, phase: s.phase });
}
