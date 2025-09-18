import { apiFetch } from "../utils/request";

// 查询当前状态
export async function getStatus() {
  const res = await apiFetch("/api/lottery/status");
  return res.json();
}

// 开始抽奖
export async function startLottery() {
  const res = await apiFetch("/api/lottery/start", { method: "POST" });
  return res.json();
}

// 暂停抽奖
export async function pauseLottery() {
  const res = await apiFetch("/api/lottery/pause", { method: "POST" });
  return res.json();
}

// 结束抽奖
export async function endLottery() {
  const res = await apiFetch("/api/lottery/end", { method: "POST" });
  return res.json();
}

// 重置抽奖
export async function resetLottery() {
  const res = await apiFetch("/api/lottery/reset", { method: "POST" });
  return res.json();
}

// 设置中奖模式（ALL_WHITE / ONE_RED / TWO_RED / ALL_RED）
export async function setPattern(pattern: string) {
  const res = await apiFetch("/api/lottery/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pattern }),
  });
  return res.json();
}

// 🔥 新增：加入/初始化（对应 /api/lottery/join）
export async function joinLottery() {
  const res = await apiFetch("/api/lottery/join", {
    method: "POST",
  });
  return res.json();
}

// 🔥 修改：抽牌（需要传 pick 0/1/2）
export async function drawCard(pick: number) {
  const res = await apiFetch("/api/lottery/draw", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pick }),
  });
  return res.json();
}
