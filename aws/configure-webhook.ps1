# Script para configurar webhook do Mercado Pago
# Garante que o webhook está apontando para a Lambda correta

$API_URL = "https://963pa03698.execute-api.us-east-1.amazonaws.com"
$WEBHOOK_URL = "$API_URL/payments/webhook"

Write-Host "Configurando webhook do Mercado Pago..." -ForegroundColor Cyan
Write-Host "URL do webhook: $WEBHOOK_URL" -ForegroundColor Yellow

# Obter access token do Secrets Manager
Write-Host "`nObtendo access token..." -ForegroundColor Yellow
$secretJson = aws secretsmanager get-secret-value --secret-id natal-menu/mercadopago --query SecretString --output text
$secret = $secretJson | ConvertFrom-Json
$ACCESS_TOKEN = $secret.access_token

if (-not $ACCESS_TOKEN) {
    Write-Host "Erro: Access token nao encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "Access token obtido com sucesso" -ForegroundColor Green

# Listar webhooks existentes
Write-Host "`nListando webhooks existentes..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $ACCESS_TOKEN"
    "Content-Type" = "application/json"
}

try {
    $webhooks = Invoke-RestMethod -Uri "https://api.mercadopago.com/v1/webhooks" -Headers $headers -Method Get
    Write-Host "Webhooks encontrados:" -ForegroundColor Cyan
    $webhooks | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Erro ao listar webhooks: $_" -ForegroundColor Red
}

# Criar novo webhook
Write-Host "`nCriando webhook..." -ForegroundColor Yellow
$webhookBody = @{
    url = $WEBHOOK_URL
    events = @(
        @{ topic = "payment" }
    )
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.mercadopago.com/v1/webhooks" -Headers $headers -Method Post -Body $webhookBody
    Write-Host "Webhook criado com sucesso!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    $errorDetails = $_.ErrorDetails.Message
    if ($errorDetails -like "*already exists*") {
        Write-Host "Webhook ja existe (OK)" -ForegroundColor Yellow
    } else {
        Write-Host "Erro ao criar webhook: $errorDetails" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "CONFIGURACAO DO WEBHOOK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "URL: $WEBHOOK_URL" -ForegroundColor White
Write-Host "Eventos: payment" -ForegroundColor White
Write-Host "`nPara testar manualmente:" -ForegroundColor Yellow
Write-Host "curl -X POST $WEBHOOK_URL -H 'Content-Type: application/json' -d '{\"type\":\"payment\",\"data\":{\"id\":\"123\"}}'" -ForegroundColor Gray
