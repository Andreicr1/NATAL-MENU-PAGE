# Script de Deploy Completo - Sweet Bar
# Windows PowerShell

Write-Host "Iniciando deploy completo..." -ForegroundColor Cyan
Write-Host ""

# Deploy App Principal
Write-Host "1/2 - Deployando aplicacao principal..." -ForegroundColor Magenta
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO no build!" -ForegroundColor Red
    exit 1
}

aws s3 sync dist/ s3://natal-menu-683373797860/ --delete --region us-east-1
aws cloudfront create-invalidation --distribution-id E3VP7VX4XVPPIO --paths "/*"
Write-Host "App principal deployado!" -ForegroundColor Green
Write-Host ""

# Deploy Admin
Write-Host "2/2 - Deployando painel admin..." -ForegroundColor Magenta
aws s3 cp admin.html s3://admin-sweetbar-683373797860/ --region us-east-1
aws cloudfront create-invalidation --distribution-id EOK8HGF3GINRD --paths "/*"
Write-Host "Admin deployado!" -ForegroundColor Green
Write-Host ""

Write-Host "Deploy completo finalizado!" -ForegroundColor Green
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "   App:   https://menunatal.sweetbarchocolates.com.br"
Write-Host "   Admin: https://admin.sweetbarchocolates.com.br"
Write-Host ""
Write-Host "Aguarde 2-5 minutos para o cache ser invalidado." -ForegroundColor Gray
