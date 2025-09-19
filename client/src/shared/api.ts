// shared/api.ts - 共享的API调用逻辑
export type JoinResp = { pid: number; participated: boolean }
export type DrawResp = { pid: number; win: boolean; isWinner: boolean; label: string }
export type Participant = {
  pid: number
  participated: boolean
  win?: boolean
  joinedAt: number
  drawAt?: number
}

function withBase(path: string, base?: string) {
  // 简化的基础URL处理，避免构建时的环境变量问题
  const b = (base || '').replace(/\/+$/, '');
  if (!path.startsWith('/')) path = '/' + path;
  return b ? `${b}${path}` : path;
}

export async function join(base = ''): Promise<JoinResp> {
  const r = await fetch(withBase('/api/lottery/join', base), { 
    method: 'POST', 
    credentials: 'include' 
  })
  if (!r.ok) throw new Error('join failed')
  return r.json()
}

export async function draw(choice: number, base = ''): Promise<DrawResp> {
  const r = await fetch(withBase('/api/lottery/draw', base), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ choice })
  })
  if (!r.ok) throw new Error('draw failed')
  return r.json()
}

export async function getParticipants(base = '') {
  const r = await fetch(withBase('/api/admin/participants', base), { 
    credentials: 'include' 
  })
  if (!r.ok) throw new Error('get participants failed')
  return r.json()
}

export async function resetParticipant(pid: number, base = '') {
  const r = await fetch(withBase(`/api/admin/reset/${pid}`, base), { 
    method: 'POST', 
    credentials: 'include' 
  })
  if (!r.ok) throw new Error('reset participant failed')
  return r.json()
}

export async function resetAll(base = '') {
  const r = await fetch(withBase('/api/admin/reset-all', base), { 
    method: 'POST', 
    credentials: 'include' 
  })
  if (!r.ok) throw new Error('reset all failed')
  return r.json()
}

export async function health(base = '') {
  const r = await fetch(withBase('/api/health', base), { credentials: 'include' })
  if (!r.ok) throw new Error('health check failed')
  return r.json()
}

export async function getGameStatus(base = '') {
  const r = await fetch(withBase('/api/lottery/status', base), { credentials: 'include' })
  if (!r.ok) throw new Error('get game status failed')
  return r.json()
}

// 新API: 发牌
export async function deal(base = ''): Promise<{ roundId: string; faces: ('zhong'|'blank')[] }> {
  const r = await fetch(withBase('/api/lottery/deal', base), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  })
  if (!r.ok) throw new Error('deal failed')
  return r.json()
}

// 新API: 选牌
export async function pick(roundId: string, index: number, base = ''): Promise<{ win: boolean; face: 'zhong'|'blank'; faces: ('zhong'|'blank')[] }> {
  const r = await fetch(withBase('/api/lottery/pick', base), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ roundId, index })
  })
  if (!r.ok) throw new Error('pick failed')
  return r.json()
}

// 新API: 设置概率 (0-1)
export async function setWinRate(winRate: number, base = ''): Promise<{ ok: boolean; winRate: number }> {
  const r = await fetch(withBase('/api/lottery/config', base), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ winRate })
  })
  if (!r.ok) throw new Error('set win rate failed')
  return r.json()
}

// 兼容旧API: 获取牌面排列 (现在调用 deal)
export async function getArrangement(base = '') {
  return await deal(base);
}

export async function setGameState(state: 'waiting' | 'open' | 'closed', base = '') {
  const r = await fetch(withBase('/api/admin/set-state', base), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ state })
  })
  if (!r.ok) throw new Error('set game state failed')
  return r.json()
}
