# 项目状态快照（2025-09-18）

本文记录当前可用且已验证的前后端行为，用于后续快速还原。

## 前端（client/src）
- 页面：`pages/Draw.tsx`
  - 状态机 Phase：`idle → staging → ready → revealing → locked`
  - 开始按钮：仅在 `status==='start' && phase==='idle'` 可点；文案：
    - start+idle: 开始抽奖；start+locked/!canDraw: 已参与；start+其它: 进行中…；pause/end: 暂停/结束
  - 开始序列（onStart）：
    1) 预演一红两白，正面 600ms → 盖回 400ms
    2) 重叠 → 槽位洗牌 12 步 → 回位
    3) 开门：`canClick:true, state:'breathing', flipped:false`，`phase='ready'`
  - 点击牌（onCardClick/handleReveal）：
    - 仅在 `status==='start' && phase==='ready' && canClick===true` 执行抽奖
    - 以服务端 `deck`/`win` 规范化为“一红两白”，三张同步翻面（3D 翻牌），z=1
    - 弹网页 Modal 显示中奖/未中；关闭后不再洗牌，仅回背面并禁点
  - 已参与/未开放时点击牌：
    - 已参与：弹 Modal“本设备已参与，请管理员重置”；不出现洗牌提示
    - 未开放/暂停/结束：点击牌无动作（不提示）
    - 仅“未参与且未开始洗牌”时：底部透明上升提示“请先点击开始抽奖进行洗牌”（1s自动消失）
  - 透明提示（Toast）：`toast-wrap`/`toast` 样式，1.2s 上升淡出

- 动画与布局：`utils/useMahjongAnim.ts`
  - 初始：state='back', flipped=false, canClick=false
  - 计算与回位均使用“保留字段写法”，不再丢失 `canClick/flipped/face/state`
  - 洗牌：`shuffleWithinBounds` 每步仅 `canClick:false` 与交换坐标
  - 回位开门：统一在回位/展开阶段一次性设 `canClick:true`
  - 竞态规避：动画期间关闭 `relayout`，回位完成再开启

- 样式：
  - 真·3D 翻牌：`.card{perspective}; .card-inner{preserve-3d + transition}; .card-inner.is-flipped{rotateY(180deg)}; .card-face{backface-visibility:hidden}`
  - 呼吸只作用在 `.card-inner`，并在 `is-flipped` 时禁用动画，避免与翻转竞争
  - 毛玻璃 Modal 与底部 Toast 样式已就绪

- 请求：`utils/request.ts`
  - 统一自动拼接 `import.meta.env.VITE_API_BASE`，携带 `X-Client-Id` 与 `credentials:'include'`

- 状态钩子：`utils/useActivityStatus.ts`
  - 每 1s 轮询 `/api/lottery/status` 与 `/api/lottery/join`（获取 participated）
  - 映射：open/started→start；waiting/pause/paused→pause；closed/end/ended→end
  - 当 start 且 participated=false：按钮即时可用；当 start 且 participated=true：`phase='locked'`

## 后端（server/index.ts）
- 状态接口：`GET /api/lottery/status` 返回 `state: 'waiting'|'open'|'closed'` 与统计
- 抽奖：`POST /api/lottery/draw`
  - 支持 `pick`；返回 `{ ok, win, deck:['hongzhong'|'baiban'][], winIndex }`
  - 已参与返回 409 `{ ok:false, error:'ALREADY_PARTICIPATED' }`
  - 未开放返回 403 `{ error:'ACTIVITY_NOT_OPEN' }`
- 参与：`POST /api/lottery/join`
  - clientId 优先；cookie pid 回写；返回 `{ pid, participated }`
  - `reset-all` 时清空 `clientIdToPid`，失效映射自动修复

## 行为要点
- 只有开始按钮触发洗牌；点击牌不再触发洗牌
- 已参与点击牌：仅弹“管理员重置”Modal；不出现洗牌提示
- 暂停/结束点击牌：无任何提示与动作
- 未参与且未开始洗牌：仅底部透明提示（1s）

此快照用于后续对比与回滚参考。


