@echo off
echo 正在提交构建修复...
git add .
git commit -m "fix: 升级Node.js版本到22.x，修复Vercel构建失败"
git push
echo 部署触发完成！
pause
