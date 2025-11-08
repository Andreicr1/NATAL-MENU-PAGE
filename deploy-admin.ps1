# Script de Deploy - Painel Administrativo Sweet Bar
# Windows PowerShell

Write-Host "Iniciando deploy do painel admin..." -ForegroundColor Cyan
Write-Host ""

# Upload para S3
Write-Host "Enviando admin.html para S3..." -ForegroundColor Yellow
aws s3 cp admin.html s3://admin-sweetbar-683373797860/ --region us-east-1

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO no upload!" -ForegroundColor Red
    exit 1
}

# Invalidar cache CloudFront
Write-Host "Invalidando cache do CloudFront..." -ForegroundColor Yellow
aws cloudfront create-invalidation --distribution-id EOK8HGF3GINRD --paths "/*"

Write-Host ""
Write-Host "Deploy do admin concluido!" -ForegroundColor Green
Write-Host "URL: https://admin.sweetbarchocolates.com.br" -ForegroundColor Cyan
Write-Host "Senha: sweetbar2025" -ForegroundColor Gray
Write-Host "Aguarde 2-5 minutos para o cache ser invalidado." -ForegroundColor Gray
