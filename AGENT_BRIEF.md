# 项目简介
麻将抽签系统。需求：活动未开始前提示“请等待”；开始后展示麻将洗牌与翻牌放大动画；单设备单次抽签；前后端分离。

# 目录
- client/  前端（Vite + TS + Tailwind）
- server/  后端（Node/Express，或按仓库现状为准）
- shared/  共享类型与工具（如有）

# 目标接口（服务端）
- GET /api/lottery/status -> { open: boolean }
- POST /api/lottery/admin/open -> { ok: true }
- POST /api/lottery/admin/close -> { ok: true }
- POST /api/lottery/draw { deviceId } -> { label: string }，幂等（单设备仅一次）

# 前端需求
- /lottery 页面：
  - 初始调用 /api/lottery/status，open=false 显示“未开始请等待”。
  - open=true 显示 3 张牌（红中/白板/红中），先洗牌动画，再可翻牌；点击翻牌放大并展示结果。
  - 本地用 localStorage 做一次性限制；与后端幂等共同生效。
  - 结果/错误要有可见提示。
