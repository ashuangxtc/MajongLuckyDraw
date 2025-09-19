import type { VercelRequest, VercelResponse } from '@vercel/node';

// 简单的内存状态存储
let gameState: 'waiting' | 'open' | 'closed' = 'waiting';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const path = url.pathname.replace('/api/admin', '') || '/';

  console.log('Admin API called:', { path, method: req.method });

  // 设置状态
  if (path === '/set-state' && req.method === 'POST') {
    try {
      const { state } = req.body || {};
      
      if (!['waiting', 'open', 'closed'].includes(state)) {
        return res.status(400).json({ error: 'Invalid state' });
      }

      gameState = state;
      console.log('游戏状态已更新为:', state);
      
      return res.status(200).json({ 
        ok: true, 
        state: gameState,
        message: `状态已更新为 ${state}` 
      });
    } catch (error) {
      console.error('设置状态时出错:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 获取状态
  if (path === '/status' && req.method === 'GET') {
    return res.status(200).json({ 
      state: gameState,
      timestamp: Date.now() 
    });
  }

  // 其他路径返回404
  return res.status(404).json({ error: 'Not found' });
}