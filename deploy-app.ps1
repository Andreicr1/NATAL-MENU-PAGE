# Script de Deploy - Aplicacao Principal Sweet Bar
# Windows PowerShell

Write-Host "Iniciando deploy da aplicacao principal..." -ForegroundColor Cyan
Write-Host ""

# Build
Write-Host "Fazendo build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO no build!" -ForegroundColor Red
    exit 1
}

# Upload para S3
Write-Host "Sincronizando com S3..." -ForegroundColor Yellow
aws s3 sync dist/ s3://natal-menu-683373797860/ --delete --region us-east-1

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO no upload!" -ForegroundColor Red
    exit 1
}

# Invalidar cache CloudFront
Write-Host "Invalidando cache do CloudFront..." -ForegroundColor Yellow
aws cloudfront create-invalidation --distribution-id E3VP7VX4XVPPIO --paths "/*"

Write-Host ""
Write-Host "Deploy da aplicacao concluido!" -ForegroundColor Green
Write-Host "URL: https://menunatal.sweetbarchocolates.com.br" -ForegroundColor Cyan
Write-Host "Aguarde 2-5 minutos para o cache ser invalidado." -ForegroundColor Gray
