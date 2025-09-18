import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getState, Pattern } from '../_utils/store';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { pattern } = body || {};
  const allow: Pattern[] = ['ALL_WHITE','ONE_RED','TWO_RED','ALL_RED'];

  if (!allow.includes(pattern)) {
    return res.status(400).json({ ok: false, message: `pattern must be one of ${allow.join(', ')}` });
  }
  const s = getState();
  s.pattern = pattern;
  res.status(200).json({ ok: true, pattern: s.pattern });
}
