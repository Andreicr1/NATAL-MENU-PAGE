# Teste de Envio de Email via SendGrid
# Sweet Bar E-commerce

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTE DE EMAIL SENDGRID" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$API_URL = "https://963pa03698.execute-api.us-east-1.amazonaws.com"

# Criar pedido de teste
Write-Host "[1/2] Criando pedido de teste..." -ForegroundColor Yellow

$orderData = @{
    items = @(
        @{
            id = "bar-1"
            name = "Barra 70% Cacau - TESTE"
            priceValue = 28.00
            quantity = 1
        }
    )
    customerEmail = "andrei.rachadel@outlook.com"
    customerName = "Andrei Teste SendGrid"
    customerPhone = "48991960811"
    shippingAddress = @{
        street = "Rua Teste SendGrid"
        number = "123"
        complement = "Apto SendGrid"
        neighborhood = "Centro"
        city = "Florianópolis"
        state = "SC"
        zipCode = "88010000"
    }
    shippingCost = 15.00
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$API_URL/orders" -Method Post -Body $orderData -ContentType "application/json"
    $orderId = $response.order.orderId

    Write-Host "✅ Pedido criado: $orderId" -ForegroundColor Green

    # Simular pagamento aprovado (chamar função de notificação diretamente)
    Write-Host "`n[2/2] Simulando pagamento aprovado e enviando email..." -ForegroundColor Yellow

    # Atualizar status do pedido para approved
    aws dynamodb update-item `
        --table-name natal-orders `
        --key "{`"orderId`":{`"S`":`"$orderId`"}}" `
        --update-expression "SET paymentStatus = :status, #st = :st" `
        --expression-attribute-names '{\"#st\":\"status\"}' `
        --expression-attribute-values '{\":status\":{\"S\":\"approved\"},\":st\":{\"S\":\"confirmed\"}}'

    Write-Host "✅ Status atualizado para approved" -ForegroundColor Green

    # Invocar função de notificação
    Write-Host "`n📧 Invocando função de envio de email..." -ForegroundColor Yellow

    $payload = @{
        orderId = $orderId
    } | ConvertTo-Json

    aws lambda invoke `
        --function-name natal-menu-backend-v2-SendConfirmationFunction-ianCzRc8F1yk `
        --payload $payload `
        --cli-binary-format raw-in-base64-out `
        response.json

    Write-Host "`n📬 Resposta da função:" -ForegroundColor Cyan
    Get-Content response.json | ConvertFrom-Json | ConvertTo-Json -Depth 10

    Remove-Item response.json -ErrorAction SilentlyContinue

    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "TESTE CONCLUÍDO!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "`n✅ Verifique seu email: andrei.rachadel@outlook.com" -ForegroundColor Yellow
    Write-Host "✅ Verifique os logs:" -ForegroundColor Yellow
    Write-Host "   aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction-ianCzRc8F1yk --since 5m`n" -ForegroundColor Gray

} catch {
    Write-Host "`n❌ Erro: $_" -ForegroundColor Red
}
