@echo off
echo 正在提交构建修复...
git add .
git commit -m "fix: 解决shared目录跨目录引用问题，复制到client内部"
git push
echo 部署触发完成！
pause
