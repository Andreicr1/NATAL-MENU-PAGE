# Script de Teste - Fluxo de Pagamento Completo
# Sweet Bar E-commerce

$API_URL = "https://963pa03698.execute-api.us-east-1.amazonaws.com"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTE DE FLUXO DE PAGAMENTO COMPLETO" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Teste 1: Criar Pedido
Write-Host "[1/4] Criando pedido de teste..." -ForegroundColor Yellow

$orderData = @{
    items = @(
        @{
            id = "bar-1"
            name = "Barra 70% Cacau"
            priceValue = 28.00
            quantity = 2
        }
    )
    customerEmail = "teste@sweetbarchocolates.com.br"
    customerName = "Cliente Teste Sweet Bar"
    customerPhone = "48991960811"
    shippingAddress = @{
        street = "Rua Teste"
        number = "123"
        complement = "Apto 45"
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
    $orderNumber = $response.order.orderNumber

    Write-Host "✅ Pedido criado com sucesso!" -ForegroundColor Green
    Write-Host "   Order ID: $orderId" -ForegroundColor White
    Write-Host "   Order Number: $orderNumber" -ForegroundColor White
    Write-Host "   Customer Email: $($response.order.customerEmail)" -ForegroundColor White
    Write-Host "   Customer Name: $($response.order.customerName)" -ForegroundColor White
    Write-Host "   Total: R$ $($response.order.total)" -ForegroundColor White

    # Verificar se dados foram salvos corretamente
    if (-not $response.order.customerEmail) {
        Write-Host "❌ ERRO: customerEmail não foi salvo!" -ForegroundColor Red
        exit 1
    }
    if (-not $response.order.customerName) {
        Write-Host "❌ ERRO: customerName não foi salvo!" -ForegroundColor Red
        exit 1
    }

} catch {
    Write-Host "❌ Erro ao criar pedido: $_" -ForegroundColor Red
    exit 1
}

# Teste 2: Verificar Pedido no DynamoDB
Write-Host "`n[2/4] Verificando pedido no DynamoDB..." -ForegroundColor Yellow

try {
    $dbItem = aws dynamodb get-item --table-name natal-orders --key "{`"orderId`":{`"S`":`"$orderId`"}}" --output json | ConvertFrom-Json

    if ($dbItem.Item.customerEmail) {
        Write-Host "✅ Customer Email encontrado no DynamoDB: $($dbItem.Item.customerEmail.S)" -ForegroundColor Green
    } else {
        Write-Host "❌ ERRO: Customer Email NÃO encontrado no DynamoDB!" -ForegroundColor Red
    }

    if ($dbItem.Item.customerName) {
        Write-Host "✅ Customer Name encontrado no DynamoDB: $($dbItem.Item.customerName.S)" -ForegroundColor Green
    } else {
        Write-Host "❌ ERRO: Customer Name NÃO encontrado no DynamoDB!" -ForegroundColor Red
    }

    if ($dbItem.Item.items) {
        Write-Host "✅ Items encontrados no DynamoDB" -ForegroundColor Green
    } else {
        Write-Host "❌ ERRO: Items NÃO encontrados no DynamoDB!" -ForegroundColor Red
    }

} catch {
    Write-Host "❌ Erro ao verificar DynamoDB: $_" -ForegroundColor Red
}

# Teste 3: Buscar Pedido
Write-Host "`n[3/4] Testando busca por número de transação..." -ForegroundColor Yellow

try {
    $searchResponse = Invoke-RestMethod -Uri "$API_URL/orders/search?q=$orderNumber" -Method Get

    if ($searchResponse.count -gt 0) {
        Write-Host "✅ Busca funcionando! Encontrados $($searchResponse.count) pedido(s)" -ForegroundColor Green
        Write-Host "   Order Number retornado: $($searchResponse.orders[0].orderNumber)" -ForegroundColor White
    } else {
        Write-Host "⚠️  Busca não encontrou resultados (pode ser esperado para pedidos novos)" -ForegroundColor Yellow
    }

} catch {
    Write-Host "❌ Erro na busca: $_" -ForegroundColor Red
}

# Teste 4: Verificar Status
Write-Host "`n[4/4] Verificando status do pedido..." -ForegroundColor Yellow

try {
    $statusResponse = Invoke-RestMethod -Uri "$API_URL/orders/$orderId/status" -Method Get

    Write-Host "✅ Status obtido com sucesso!" -ForegroundColor Green
    Write-Host "   Payment Status: $($statusResponse.paymentStatus)" -ForegroundColor White
    Write-Host "   Order Status: $($statusResponse.status)" -ForegroundColor White

} catch {
    Write-Host "❌ Erro ao verificar status: $_" -ForegroundColor Red
}

# Resumo
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "RESUMO DOS TESTES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Order ID: $orderId" -ForegroundColor White
Write-Host "Order Number: $orderNumber" -ForegroundColor White
Write-Host "`nPróximos passos:" -ForegroundColor Yellow
Write-Host "1. Realizar um pagamento real pelo Mercado Pago" -ForegroundColor White
Write-Host "2. Verificar logs do webhook em tempo real" -ForegroundColor White
Write-Host "3. Confirmar recebimento de email" -ForegroundColor White
Write-Host "4. Verificar atualização rápida na página de confirmação`n" -ForegroundColor White

Write-Host "Para monitorar webhook em tempo real:" -ForegroundColor Cyan
Write-Host "aws logs tail /aws/lambda/natal-menu-backend-v2-PaymentWebhookFunction-Lhl44CEmbVNO --follow`n" -ForegroundColor Gray
