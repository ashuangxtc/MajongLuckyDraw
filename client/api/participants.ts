import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getParticipants, resetOne, resetAll } from './_utils/adminStore';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // 获取路径参数，支持查询参数方式
  const { pathname, searchParams } = new URL(req.url!, `http://${req.headers.host}`);
  let path = searchParams.get('path') || pathname.replace('/api/participants', '');

  if (path === '' && req.method === 'GET') {
    // 获取参与者列表
    const participants = getParticipants();
    return res.status(200).json(participants);
  }

  if (path === '/reset-all' && req.method === 'POST') {
    // 重置所有参与者
    resetAll();
    return res.status(200).json({ ok: true });
  }

  if (path.startsWith('/reset/') && req.method === 'POST') {
    // 重置单个参与者
    const pid = Number(path.replace('/reset/', ''));
    if (!Number.isFinite(pid)) {
      return res.status(400).json({ ok: false, error: 'INVALID_PID' });
    }
    resetOne(pid);
    return res.status(200).json({ ok: true });
  }

  return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
}
