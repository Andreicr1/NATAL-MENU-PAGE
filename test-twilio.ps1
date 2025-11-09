# Script de Teste - Twilio WhatsApp
# Windows PowerShell

Write-Host "Testando sistema de notificacoes com WhatsApp..." -ForegroundColor Cyan
Write-Host ""

# Criar pedido de teste no DynamoDB
Write-Host "1. Criando pedido de teste no DynamoDB..." -ForegroundColor Yellow

$testOrder = @"
{
  "orderId": {"S": "test-twilio-$(Get-Date -Format 'yyyyMMddHHmmss')"},
  "customerName": {"S": "Teste Twilio WhatsApp"},
  "customerEmail": {"S": "contato@sweetbarchocolates.com.br"},
  "customerPhone": {"S": "48991960811"},
  "paymentStatus": {"S": "approved"},
  "createdAt": {"N": "$(([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()).ToString())"},
  "total": {"N": "150"},
  "subtotal": {"N": "130"},
  "shippingCost": {"N": "20"},
  "items": {
    "L": [
      {
        "M": {
          "name": {"S": "Panetone Artesanal Recheado"},
          "quantity": {"N": "1"},
          "priceValue": {"N": "130"}
        }
      }
    ]
  },
  "shippingAddress": {
    "M": {
      "street": {"S": "Rua das Flores"},
      "number": {"S": "456"},
      "neighborhood": {"S": "Centro"},
      "city": {"S": "Florianopolis"},
      "state": {"S": "SC"},
      "zipCode": {"S": "88010100"}
    }
  }
}
"@

$testOrder | Out-File -FilePath "test-order-temp.json" -Encoding UTF8

aws dynamodb put-item --table-name natal-orders --item file://test-order-temp.json --region us-east-1

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO ao criar pedido!" -ForegroundColor Red
    Remove-Item "test-order-temp.json" -ErrorAction SilentlyContinue
    exit 1
}

# Extrair orderId
$orderData = $testOrder | ConvertFrom-Json
$orderId = $orderData.orderId.S

Write-Host "Pedido criado: $orderId" -ForegroundColor Green
Write-Host ""

# Invocar Lambda
Write-Host "2. Invocando Lambda de notificacoes..." -ForegroundColor Yellow

$payload = "{`"orderId`":`"$orderId`"}"
$payloadBytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
$payloadBase64 = [System.Convert]::ToBase64String($payloadBytes)

aws lambda invoke `
  --function-name natal-menu-backend-v2-SendConfirmationFunction-ianCzRc8F1yk `
  --payload $payloadBase64 `
  --region us-east-1 `
  response-temp.json

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Lambda invocada com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Resposta:" -ForegroundColor Yellow
    $response = Get-Content response-temp.json | ConvertFrom-Json
    $body = $response.body | ConvertFrom-Json

    Write-Host ""
    Write-Host "EMAIL:" -ForegroundColor Cyan
    if ($body.email.sent) {
        Write-Host "  Status: ENVIADO" -ForegroundColor Green
    } else {
        Write-Host "  Status: FALHOU" -ForegroundColor Red
        Write-Host "  Erro: $($body.email.error)" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "WHATSAPP:" -ForegroundColor Cyan
    if ($body.whatsapp.sent) {
        Write-Host "  Status: ENVIADO" -ForegroundColor Green
        Write-Host "  Para: (48) 99196-0811" -ForegroundColor Green
    } else {
        Write-Host "  Status: FALHOU" -ForegroundColor Red
        Write-Host "  Erro: $($body.whatsapp.error)" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "VERIFIQUE:" -ForegroundColor Cyan
    Write-Host "  Email: contato@sweetbarchocolates.com.br" -ForegroundColor White
    Write-Host "  WhatsApp: (48) 99196-0811" -ForegroundColor White

} else {
    Write-Host "ERRO ao invocar Lambda!" -ForegroundColor Red
}

# Cleanup
Write-Host ""
Write-Host "Limpando arquivos temporarios..." -ForegroundColor Gray
Remove-Item "test-order-temp.json" -ErrorAction SilentlyContinue
Remove-Item "response-temp.json" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Ver logs detalhados:" -ForegroundColor Yellow
Write-Host "  aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction-ianCzRc8F1yk --since 5m --region us-east-1" -ForegroundColor Gray





