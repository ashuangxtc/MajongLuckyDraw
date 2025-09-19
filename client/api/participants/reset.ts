import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resetOne } from '../_utils/adminStore';
import { verifySessionToken } from '../_utils/auth';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return res.status(405).end('Method Not Allowed'); }
  if (!verifySessionToken((req.cookies as any)?.admin_session)) { return res.status(401).json({ ok:false, error:'ADMIN_REQUIRED' }); }
  const body = typeof req.body==='string' ? JSON.parse(req.body) : (req.body||{});
  const pid = Number(body?.pid);
  if (!Number.isFinite(pid)) return res.status(400).json({ ok:false, error:'INVALID_PID' });
  resetOne(pid);
  return res.status(200).json({ ok:true });
}


