@echo off
echo 🚀 开始 Vercel 部署...

REM 检查是否安装了 Vercel CLI
where vercel >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 📦 安装 Vercel CLI...
    npm install -g vercel
)

REM 检查 client 目录
if not exist "client" (
    echo ❌ 错误: 找不到 client 目录
    pause
    exit /b 1
)

REM 检查构建
echo 🔨 测试本地构建...
cd client
npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ 本地构建失败
    pause
    exit /b 1
)
cd ..

echo ✅ 本地构建成功

REM 部署到 Vercel
echo 🚀 开始部署到 Vercel...
vercel --prod

echo ✅ 部署完成！
pause
