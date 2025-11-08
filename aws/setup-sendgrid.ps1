# Setup SendGrid API Key no AWS Secrets Manager
# Sweet Bar E-commerce

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "CONFIGURAÇÃO SENDGRID" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Solicitar API Key
Write-Host "Cole sua API Key do SendGrid:" -ForegroundColor Yellow
Write-Host "(Formato: SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)" -ForegroundColor Gray
$sendGridApiKey = Read-Host "API Key"

if (-not $sendGridApiKey -or -not $sendGridApiKey.StartsWith("SG.")) {
    Write-Host "`n❌ ERRO: API Key inválida! Deve começar com 'SG.'" -ForegroundColor Red
    exit 1
}

Write-Host "`n[1/3] Buscando secret atual do Mercado Pago..." -ForegroundColor Yellow

try {
    $currentSecret = aws secretsmanager get-secret-value --secret-id natal-menu/mercadopago --query SecretString --output text | ConvertFrom-Json

    Write-Host "✅ Secret encontrado!" -ForegroundColor Green

    # Adicionar SendGrid API Key ao secret existente
    $currentSecret | Add-Member -NotePropertyName "sendgrid_api_key" -NotePropertyValue $sendGridApiKey -Force

    Write-Host "`n[2/3] Atualizando secret com SendGrid API Key..." -ForegroundColor Yellow

    $newSecretJson = $currentSecret | ConvertTo-Json -Compress

    aws secretsmanager update-secret `
        --secret-id natal-menu/mercadopago `
        --secret-string $newSecretJson

    Write-Host "✅ Secret atualizado com sucesso!" -ForegroundColor Green

} catch {
    Write-Host "❌ Erro ao atualizar secret: $_" -ForegroundColor Red
    Write-Host "`nTentando criar secret separado..." -ForegroundColor Yellow

    # Criar secret separado para SendGrid
    $sendGridSecret = @{
        api_key = $sendGridApiKey
        from_email = "noreply@sweetbarchocolates.com.br"
        from_name = "Sweet Bar Chocolates"
    } | ConvertTo-Json

    aws secretsmanager create-secret `
        --name natal-menu/sendgrid `
        --description "SendGrid API Key para emails" `
        --secret-string $sendGridSecret

    Write-Host "✅ Secret SendGrid criado!" -ForegroundColor Green
}

Write-Host "`n[3/3] Instalando dependências do SendGrid..." -ForegroundColor Yellow

Push-Location "lambda/notifications"
npm install @sendgrid/mail@^8.1.0
Pop-Location

Write-Host "✅ Dependências instaladas!" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nPróximos passos:" -ForegroundColor Yellow
Write-Host "1. Verificar email no SendGrid (Settings → Sender Authentication)" -ForegroundColor White
Write-Host "2. Executar: cd aws && sam build && sam deploy --stack-name natal-menu-backend-v2 --capabilities CAPABILITY_IAM --region us-east-1 --resolve-s3 --no-confirm-changeset" -ForegroundColor White
Write-Host "3. Testar envio de email fazendo um novo pedido`n" -ForegroundColor White

Write-Host "📧 Email configurado: noreply@sweetbarchocolates.com.br" -ForegroundColor Cyan
Write-Host "📊 Plano: FREE (100 emails/dia)" -ForegroundColor Cyan
Write-Host "🔗 Dashboard: https://app.sendgrid.com/`n" -ForegroundColor Cyan
