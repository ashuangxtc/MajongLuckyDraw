#!/bin/bash

echo "🚀 开始 Vercel 部署..."

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装 Vercel CLI..."
    npm install -g vercel
fi

# 进入项目目录
cd "$(dirname "$0")"

echo "📁 当前目录: $(pwd)"

# 检查 client 目录
if [ ! -d "client" ]; then
    echo "❌ 错误: 找不到 client 目录"
    exit 1
fi

# 检查构建
echo "🔨 测试本地构建..."
cd client
if npm run build; then
    echo "✅ 本地构建成功"
    cd ..
else
    echo "❌ 本地构建失败"
    exit 1
fi

# 部署到 Vercel
echo "🚀 开始部署到 Vercel..."
vercel --prod

echo "✅ 部署完成！"
