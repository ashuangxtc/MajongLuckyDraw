# 麻将抽奖系统 - Vercel 部署指南

## 🚀 快速部署步骤

### 方法1：从 GitHub 重新导入
1. 进入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 从 GitHub 选择 `ashuangxtc/MajongLuckyDraw` 仓库
4. **重要配置**：
   - Framework Preset: `Other`
   - Build and Output Settings:
     - Build Command: `cd client && npm install && npm run build`
     - Output Directory: `client/dist`
   - Node.js Version: `22.x`

### 方法2：使用 Vercel CLI
```bash
# 安装 Vercel CLI
npm i -g vercel

# 在项目根目录执行
vercel --prod
```

## 📁 项目结构说明
```
MajongLuckyDraw/
├── client/                 # 前端项目
│   ├── src/
│   ├── dist/              # 构建输出
│   ├── package.json       # 前端依赖
│   └── vite.config.ts     # Vite 配置
├── client/api/            # Vercel Serverless Functions
│   ├── admin.ts
│   ├── lottery.ts
│   └── participants.ts
├── vercel.json            # Vercel 配置
└── shared/                # 共享代码
```

## ✅ 构建要求
- Node.js 22.x
- 构建命令：`cd client && npm install && npm run build`
- 输出目录：`client/dist`
- API 函数：`client/api/`

### 构建失败排查（Rollup 原生依赖）
- 现象：`Cannot find module @rollup/rollup-linux-x64-gnu`
- 处理：已在 `client/package.json` 固定 `rollup` 与 `@rollup/rollup-linux-x64-gnu` 版本，并在 `vercel.json` 注入 `ROLLUP_SKIP_NODEJS_NATIVE=true`，避免 npm 可选依赖解析问题。

## 🔧 已修复的问题
- ✅ Node.js 版本升级到 22.x
- ✅ 清理了不必要的后端依赖
- ✅ 修复了 shared 模块路径问题
- ✅ 简化了 Vercel 配置
- ✅ 本地构建测试通过

## 🎯 部署后验证
1. 访问主页应该能看到麻将抽奖界面
2. 访问 `/admin` 应该能进入管理后台
3. API 路径：
   - `/api/lottery/status` - 获取游戏状态
   - `/api/admin/set-state` - 设置游戏状态
   - `/api/participants` - 获取参与者列表
