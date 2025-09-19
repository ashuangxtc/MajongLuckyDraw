import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resetAll } from '../_utils/adminStore';
import { verifySessionToken } from '../_utils/auth';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return res.status(405).end('Method Not Allowed'); }
  if (!verifySessionToken((req.cookies as any)?.admin_session)) { return res.status(401).json({ ok:false, error:'ADMIN_REQUIRED' }); }
  resetAll();
  return res.status(200).json({ ok:true });
}


