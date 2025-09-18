// api/lottery/draw.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { 
  getState, 
  getClientIdFromHeaders, 
  buildDeck, 
  shuffle 
} from '../_utils/store';

type Face = 'RED' | 'WHITE';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // 只允许 POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  const state = getState();

  // 活动未开始/不可抽
  if (state.phase !== 'ready') {
    return res.status(403).json({ ok: false, message: 'not ready' });
  }

  // 设备去重（从请求头读取 X-Client-Id）
  const cid = getClientIdFromHeaders(req.headers as any);
  if (!cid) return res.status(400).json({ ok: false, message: 'missing client id' });
  if (state.participants.has(cid)) {
    return res.status(409).json({ ok: false, message: 'already participated' });
  }

  // 读取 pick 参数（0、1、2）
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const pick = Number(body?.pick);
  if (![0, 1, 2].includes(pick)) {
    return res.status(400).json({ ok: false, message: 'invalid pick' });
  }

  // 按当前 pattern 生成三张牌并洗牌，如 ['RED','WHITE','WHITE']
  const deck: Face[] = shuffle(buildDeck(state.pattern));

  // 标记本设备已参与
  state.participants.add(cid);

  // 命中判定：用户选择的位置是否为红中
  const win = deck[pick] === 'RED';

  // 返回整副牌，方便前端动画；以及本次是否命中
  return res.status(200).json({
    ok: true,
    deck,        // 例如 ['WHITE','RED','WHITE']
    pick,        // 用户点了哪一张
    win          // 是否抽中红中
  });
}
