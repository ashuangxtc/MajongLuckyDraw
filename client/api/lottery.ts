import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getState, setState } from './_utils/store';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // 获取路径参数，支持查询参数方式
  const { pathname, searchParams } = new URL(req.url!, `http://${req.headers.host}`);
  let path = searchParams.get('path') || pathname.replace('/api/lottery', '');

  if (path === '/status' && req.method === 'GET') {
    // 获取抽奖状态
    const st = getState();
    return res.status(200).json({
      open: st.phase === 'ready',
      redCountMode: st.redCountMode || 1
    });
  }

  if (path === '/config' && req.method === 'POST') {
    // 设置红中张数
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const redCountMode = Number(body?.redCountMode);
      
      if (![0, 1, 2, 3].includes(redCountMode)) {
        return res.status(400).json({ ok: false, error: 'INVALID_RED_COUNT_MODE' });
      }

      const st = getState();
      (st as any).redCountMode = redCountMode;
      setState(st);
      
      return res.status(200).json({ ok: true, redCountMode });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: e?.message || 'INTERNAL_ERROR' });
    }
  }

  if (path === '/draw' && req.method === 'POST') {
    // 抽奖功能 - 这里需要你的具体实现
    // 临时返回成功
    return res.status(200).json({ ok: true });
  }

  if (path === '/start' && req.method === 'POST') {
    // 开始抽奖
    const st = getState();
    (st as any).phase = 'ready';
    (st as any).startedAt = Date.now();
    setState(st);
    return res.status(200).json({ ok: true });
  }

  if (path === '/pause' && req.method === 'POST') {
    // 暂停抽奖
    const st = getState();
    (st as any).phase = 'paused';
    setState(st);
    return res.status(200).json({ ok: true });
  }

  if (path === '/end' && req.method === 'POST') {
    // 结束抽奖
    const st = getState();
    (st as any).phase = 'locked';
    setState(st);
    return res.status(200).json({ ok: true });
  }

  if (path === '/reset' && req.method === 'POST') {
    // 重置抽奖
    const st = getState();
    (st as any).phase = 'idle';
    (st as any).startedAt = undefined;
    setState(st);
    return res.status(200).json({ ok: true });
  }

  return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
}
