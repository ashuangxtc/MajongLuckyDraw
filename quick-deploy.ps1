Write-Host "正在提交修复..."
git add .
git commit -m "fix: 修复Vercel部署配置，删除重定向文件，直接使用client/api"
git push
Write-Host "部署触发完成！"
