import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getParticipants, resetOne, resetAll } from './_utils/adminStore';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // 从 URL 中提取路径
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const fullPath = url.pathname;
  
  // 提取 /api/participants 后面的路径
  let path = '';
  if (fullPath.startsWith('/api/participants/')) {
    path = '/' + fullPath.split('/api/participants/')[1];
  } else if (fullPath === '/api/participants') {
    path = '';
  }

  if (path === '' && req.method === 'GET') {
    // 获取参与者列表和活动状态
    const participants = getParticipants();
    const { getState } = require('./_utils/store');
    const st = getState();
    
    // 映射内部状态到前端期望的状态
    const stateMap: Record<string, string> = {
      'idle': 'waiting',
      'ready': 'open', 
      'paused': 'paused',
      'locked': 'closed'
    };
    
    return res.status(200).json({
      items: participants,
      participants: participants,
      state: stateMap[st.phase] || 'waiting',
      config: {
        hongzhongPercent: (st.redCountMode || 1) * 25 // 转换红中张数为百分比
      }
    });
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
