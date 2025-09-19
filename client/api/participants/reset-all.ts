import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resetAll } from '../_utils/adminStore';
import { verifySessionToken } from '../_utils/auth';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return res.status(405).end('Method Not Allowed'); }
  // 移除会话验证 - 直接通过
  resetAll();
  return res.status(200).json({ ok:true });
}


