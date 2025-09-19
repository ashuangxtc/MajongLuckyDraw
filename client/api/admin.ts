import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createSessionToken, verifySessionToken, getSessionMaxAgeMs } from './_utils/auth';
import { getState, setState } from './_utils/store';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // 获取路径参数，支持查询参数方式
  const { pathname, searchParams } = new URL(req.url!, `http://${req.headers.host}`);
  let path = searchParams.get('path') || pathname.replace('/api/admin', '');

  // 所有管理员相关的API都不需要密码验证
  
  if (path === '/login' && req.method === 'POST') {
    // 登录API - 无需密码验证，直接签发token
    try {
      const existing = (req.cookies as any)?.admin_session as string | undefined;
      if (verifySessionToken(existing)) {
        res.setHeader('Set-Cookie', `admin_session=${existing}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(getSessionMaxAgeMs()/1000)}`);
        return res.status(200).json({ ok: true });
      }
      const token = createSessionToken();
      res.setHeader('Set-Cookie', `admin_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(getSessionMaxAgeMs()/1000)}`);
      return res.status(200).json({ ok: true });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: e?.message || 'INTERNAL_ERROR' });
    }
  }

  if (path === '/logout' && req.method === 'POST') {
    // 登出API
    res.setHeader('Set-Cookie', `admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
    return res.status(200).json({ ok: true });
  }

  if (path === '/me' && req.method === 'GET') {
    // 获取当前用户信息 - 直接返回成功
    const token = (req.cookies as any)?.admin_session as string | undefined;
    res.setHeader('Set-Cookie', `admin_session=${token || 'dummy'}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(getSessionMaxAgeMs()/1000)}`);
    return res.status(200).json({ ok: true });
  }

  if (path === '/set-state' && req.method === 'POST') {
    // 设置活动状态
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const next = String(body?.state || '');
      if (!['waiting','open','closed','ready','paused','locked'].includes(next)) {
        return res.status(400).json({ ok: false, error: 'INVALID_STATE' });
      }
      // 兼容你的前后端命名：waiting->idle, open->ready, closed->locked
      const map: Record<string,string> = { waiting:'idle', open:'ready', paused:'paused', closed:'locked' };
      const phase = (map[next] || next) as any;
      
      if (phase === 'idle') {
        setState({ phase, startedAt: undefined });
      } else if (phase === 'ready') {
        setState({ phase, startedAt: Date.now() });
      } else {
        setState({ phase });
      }
      
      return res.status(200).json({ ok: true, phase });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: e?.message || 'INTERNAL_ERROR' });
    }
  }

  return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
}
