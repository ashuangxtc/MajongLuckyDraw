@echo off
echo 正在提交修复...
git add .
git commit -m "fix: 修复Vercel部署配置，删除重定向文件"
git push
echo 部署触发完成！
pause
