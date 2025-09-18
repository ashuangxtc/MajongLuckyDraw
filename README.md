# 麻将抽奖系统 (MajongLuckyDraw)

一个基于 React + Express 的麻将抽奖系统，支持活动管理、抽奖逻辑和统计功能。

## 技术栈

- **前端**: React 18 + TypeScript + Vite + Tailwind CSS
- **后端**: Express + TypeScript + Node.js
- **数据库**: 支持 PostgreSQL (可选)
- **包管理**: pnpm (推荐) 或 npm

## 快速开始

### 环境要求

- Node.js 18+ 
- pnpm (推荐) 或 npm

### Windows 环境特别说明

在 Windows 环境下，推荐使用以下方式：

1. **安装 Node.js**: 从 [nodejs.org](https://nodejs.org/) 下载并安装
2. **安装 pnpm**: 
   ```bash
   npm install -g pnpm
   ```
3. **使用 PowerShell 或 CMD**: 确保在项目根目录下运行命令

### 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

### 环境配置

1. 复制环境变量模板文件：
```bash
cp .env.example .env
```

2. 根据需要修改 `.env` 文件中的配置：
```env
# 前端环境变量
VITE_API_BASE=http://localhost:8080

# 后端环境变量
PORT=8080
NODE_ENV=development

# 管理员配置
ADMIN_PASSWORD=admin123
```

### 启动开发服务器

```bash
# 使用 pnpm (推荐)
pnpm dev

# 或使用 npm
npm run dev
```

这将同时启动：
- **前端开发服务器**: http://localhost:5173
- **后端 API 服务器**: http://localhost:8080

### 验证安装

1. 访问前端: http://localhost:5173
2. 检查后端健康状态: http://localhost:8080/api/health

## 项目结构

```
├── client/                 # 前端 React 应用
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── pages/         # 页面组件
│   │   ├── hooks/         # 自定义 Hooks
│   │   └── lib/           # 工具库
│   └── index.html
├── server/                # 后端 Express 应用
│   ├── index.ts          # 服务器入口
│   ├── routes.ts         # API 路由
│   ├── storage.ts        # 数据存储
│   └── vite.ts           # Vite 集成
├── shared/               # 共享类型和模式
│   └── schema.ts
└── attached_assets/      # 静态资源
```

## API 接口

### 健康检查
- `GET /api/health` - 服务器健康状态

### 抽奖相关
- `GET /api/status` - 获取活动状态
- `POST /api/draw` - 执行抽奖（旧接口）
- `POST /api/lottery/draw` - 新的所见即所得抽奖接口
- `GET /api/lottery/config` - 获取抽签配置

### 管理员接口
- `POST /api/admin/set-status` - 设置活动状态
- `POST /api/admin/set-window` - 设置活动时间窗口
- `GET /api/admin/stats` - 获取统计数据
- `GET /api/admin/export` - 导出 CSV 数据
- `POST /api/admin/config` - 更新配置
- `GET /api/admin/participants` - 获取参与者列表
- `POST /api/admin/reset-user` - 重置用户状态
- `POST /api/admin/reset-all` - 批量重置所有用户

### 新抽签管理接口
- `GET /api/lottery/played` - 获取抽签记录
- `POST /api/lottery/admin/reset` - 重置抽签记录
- `POST /api/lottery/admin/config` - 更新抽签配置

## 开发脚本

```bash
# 开发模式 (同时启动前后端)
pnpm dev

# 仅启动后端
pnpm run dev:server

# 仅启动前端
pnpm run dev:client

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 类型检查
pnpm check

# 数据库迁移
pnpm run db:push
```

## 部署

### 构建生产版本

```bash
pnpm build
```

### 启动生产服务器

```bash
pnpm start
```

## 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_API_BASE` | 前端 API 基础地址 | `http://localhost:8080` |
| `PORT` | 后端服务端口 | `8080` |
| `NODE_ENV` | 运行环境 | `development` |
| `ADMIN_PASSWORD` | 管理员密码 | `admin123` |
| `ADMIN_TOKEN` | 管理员令牌 | `admin123` |
| `LOTTERY_WEIGHT_HONGZHONG` | 红中权重 | `2` |
| `LOTTERY_WEIGHT_BAIBAN` | 白板权重 | `1` |

## 管理后台使用

### 访问管理后台
1. 在浏览器中访问 `http://localhost:5173/admin`
2. 输入管理员密码（默认：`admin123`）
3. 登录成功后即可使用管理功能

### 管理功能
- **活动控制**: 开始/结束抽奖活动
- **参与记录**: 查看实时参与列表，支持导出CSV
- **高级设置**: 调整红中/白板权重比例
- **重置功能**: 清空本轮抽签记录

### 所见即所得抽奖
- 用户看到的牌面与最终结果完全一致
- 固定牌面组合：['红中', '白板', '红中']
- 洗牌动画只改变位置，不改变牌面内容
- 防止偷梁换柱，确保公平性

## 注意事项

1. 确保 `.env` 文件不被提交到版本控制
2. 生产环境请修改默认的管理员密码和令牌
3. 如需使用数据库，请配置 `DATABASE_URL` 环境变量
4. 前端通过 `import.meta.env.VITE_API_BASE` 访问后端地址
5. 管理后台支持免重复登录，登录状态保存在 sessionStorage

## 小程序（Taro Weapp）启动与发布

### 启动开发
```bash
# 进入小程序目录并启动
cd miniapp && pnpm install && pnpm dev:weapp
```

在微信开发者工具中：
1. 导入 `miniapp/dist` 目录作为项目根目录
2. 编译并预览

### 环境变量配置

#### 小程序环境配置
在 `miniapp` 根目录创建 `.env` 文件，配置API基础地址：

```bash
# .env 文件内容

# 开发环境（微信开发者工具）
TARO_APP_API_BASE=http://127.0.0.1:8080

# 或者使用局域网IP（真机预览时）
# TARO_APP_API_BASE=http://192.168.1.100:8080

# 或者使用ngrok临时域名（测试用）
# TARO_APP_API_BASE=https://your-ngrok-id.ngrok.io

# 生产环境（正式部署）
# TARO_APP_API_BASE=https://your-production-domain.com
```

#### 环境自动识别
- **微信开发者工具**：自动使用 `http://127.0.0.1:8080`
- **真机/体验版**：使用 `TARO_APP_API_BASE` 环境变量，如未设置则默认使用本地地址

#### 网络请求特性
- 自动重试：失败时指数退避重试（500ms, 1000ms），最多3次
- 超时设置：8秒超时
- 健康检查：`ping()` 函数检测后端连通性
- 错误处理：友好的UI提示和重试按钮

小程序端的所有接口均以 `/api/lottery/*` 为前缀，并通过配置的基础地址拼接。

### 发布准备
1. 配置检查：
   - 检查 `miniapp/src/app.config.ts` 页面配置
   - 确认图片资源路径
   - 确认 `TARO_APP_API_BASE` 指向生产后端
2. 构建生产版本：
```bash
pnpm build:weapp
```

### 注意事项
- 确保所有图片资源已正确放置
- 检查 API 接口的域名白名单配置
- 测试真机环境下的功能完整性
- 注意小程序的包大小限制

## 故障排除

### 端口冲突
如果 8080 或 5173 端口被占用，可以修改 `.env` 文件中的 `PORT` 变量。

### 依赖安装问题
```bash
# 清除缓存重新安装
# Windows (PowerShell)
Remove-Item -Recurse -Force node_modules, package-lock.json
pnpm install

# 或使用 npm
npm install
```

### Windows 环境问题
1. **PowerShell 执行策略**: 如果遇到执行策略问题，运行：
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **路径问题**: 确保在项目根目录 `D:\code\MajongLuckyDraw` 下运行命令

3. **端口占用**: 使用以下命令检查端口占用：
   ```powershell
   netstat -ano | findstr :8080
   netstat -ano | findstr :5173
   ```

4. **Socket 错误**: 如果遇到 `ENOTSUP: operation not supported on socket` 错误，这通常是因为 Windows 不支持 `reusePort` 选项。项目已修复此问题。

5. **进程冲突**: 如果启动失败，先清理所有 Node.js 进程：
   ```powershell
   taskkill /F /IM node.exe
   ```

### 小程序开发问题

1. **页面空白/连接失败**:
   ```bash
   # 检查后端是否启动
   curl http://127.0.0.1:8080/api/health
   
   # 检查小程序环境配置
   cat miniapp/.env
   
   # 重新编译小程序
   cd miniapp && pnpm dev:weapp
   ```

2. **ERR_CONNECTION_REFUSED 错误**:
   
   **在微信开发者工具中**:
   - 确保后端服务器已启动（`pnpm dev:server`）
   - 勾选"详情 → 本地设置 → 不校验合法域名、web-view、TLS版本以及HTTPS证书"
   - 确认控制台显示的API地址是 `http://127.0.0.1:8080`
   
   **在真机预览中**:
   - 使用局域网IP替代127.0.0.1，例如：
     ```bash
     # 获取本机IP（Windows）
     ipconfig | findstr "IPv4"
     
     # 获取本机IP（macOS/Linux）
     ifconfig | grep "inet " | grep -v 127.0.0.1
     
     # 配置环境变量
     echo "TARO_APP_API_BASE=http://192.168.1.100:8080" > miniapp/.env
     ```
   - 或使用ngrok提供外网访问：
     ```bash
     # 安装ngrok后运行
     ngrok http 8080
     
     # 将生成的https地址配置到环境变量
     echo "TARO_APP_API_BASE=https://abc123.ngrok.io" > miniapp/.env
     ```

3. **编译错误**: 检查 TypeScript 类型定义和导入路径

4. **样式问题**: 确保 SCSS 文件正确编译

5. **API 调用**: 检查网络请求的域名配置

6. **图片加载**: 确认图片资源路径正确

7. **真机预览连接问题**:
   - 使用局域网IP替代127.0.0.1
   - 确保手机和开发机在同一网络
   - 使用ngrok等工具提供外网访问

### 类型错误
```bash
# 运行类型检查
pnpm check
```



