// 简易内存态：阶段、参与去重、配置、随机工具
export type Phase = 'idle' | 'ready' | 'paused' | 'locked';
export type Pattern = 'ALL_WHITE' | 'ONE_RED' | 'TWO_RED' | 'ALL_RED';

export interface State {
  phase: Phase;
  startedAt?: number;
  // 只允许每个 clientId 抽一次
  participants: Set<string>;
  // 前端展示固定三张：两白一红等
  pattern: Pattern;
  // 红中张数模式：0-3张
  redCountMode: number;
}

const state: State = {
  phase: 'idle',
  participants: new Set(),
  pattern: 'ONE_RED',
  redCountMode: 1,
};

export function getState() { return state; }

export function resetState() {
  state.phase = 'idle';
  state.startedAt = undefined;
  state.participants.clear();
  state.pattern = 'ONE_RED';
  state.redCountMode = 1;
}

// 添加 setState 函数
export function setState(newState: Partial<State>) {
  Object.assign(state, newState);
}

// 将 pattern 映射为 3 张牌（不含位置信息，前端洗牌/位置自己处理）
export function buildDeck(pattern: Pattern): ('RED'|'WHITE')[] {
  switch (pattern) {
    case 'ALL_WHITE': return ['WHITE','WHITE','WHITE'];
    case 'ONE_RED':   return ['RED','WHITE','WHITE'];
    case 'TWO_RED':   return ['RED','RED','WHITE'];
    case 'ALL_RED':   return ['RED','RED','RED'];
  }
}

// Fisher–Yates 洗牌（前端也会洗，这里留一份以便服务器侧固定结果）
export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i=a.length-1;i>0;i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

// 统一取 clientId（你前端会传 X-Client-Id）
export function getClientIdFromHeaders(headers: Record<string, string | string[] | undefined>): string | null {
  const raw = headers['x-client-id'];
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] : raw;
}
