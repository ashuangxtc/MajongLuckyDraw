@echo off
echo 正在提交构建修复...
git add .
git commit -m "fix: 清理client/package.json，移除后端依赖，简化构建配置"
git push
echo 部署触发完成！
pause
