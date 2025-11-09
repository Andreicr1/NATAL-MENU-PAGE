# Script de Limpeza de Pedidos de Teste
# Sweet Bar E-commerce - Preparacao para Producao

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "LIMPEZA DE PEDIDOS DE TESTE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$TABLE_NAME = "natal-orders"

# Verificar quantidade atual
Write-Host "[1/3] Verificando pedidos existentes..." -ForegroundColor Yellow
$count = aws dynamodb scan --table-name $TABLE_NAME --select COUNT | ConvertFrom-Json
Write-Host "Total de pedidos encontrados: $($count.Count)" -ForegroundColor White

if ($count.Count -eq 0) {
    Write-Host "`n✅ Tabela ja esta vazia!" -ForegroundColor Green
    exit 0
}

# Confirmar limpeza
Write-Host "`n⚠️  ATENCAO: Esta acao ira deletar TODOS os $($count.Count) pedidos!" -ForegroundColor Yellow
Write-Host "Isso inclui todos os pedidos de teste realizados ate agora." -ForegroundColor Yellow
$confirmation = Read-Host "`nTem certeza que deseja continuar? (digite 'SIM' para confirmar)"

if ($confirmation -ne "SIM") {
    Write-Host "`n❌ Operacao cancelada pelo usuario." -ForegroundColor Red
    exit 0
}

# Buscar todos os pedidos
Write-Host "`n[2/3] Buscando todos os pedidos..." -ForegroundColor Yellow
$scanResult = aws dynamodb scan --table-name $TABLE_NAME --attributes-to-get orderId | ConvertFrom-Json

$orderIds = $scanResult.Items | ForEach-Object { $_.orderId.S }
Write-Host "Pedidos a deletar: $($orderIds.Count)" -ForegroundColor White

# Deletar cada pedido
Write-Host "`n[3/3] Deletando pedidos..." -ForegroundColor Yellow
$deleted = 0
$failed = 0

foreach ($orderId in $orderIds) {
    try {
        $result = aws dynamodb delete-item --table-name $TABLE_NAME --key "{`"orderId`":{`"S`":`"$orderId`"}}" 2>&1
        if ($LASTEXITCODE -eq 0) {
            $deleted++
            Write-Host "  ✓ Deletado: $orderId" -ForegroundColor Gray
        } else {
            $failed++
            Write-Host "  ✗ Erro ao deletar: $orderId" -ForegroundColor Red
        }
    } catch {
        $failed++
        Write-Host "  ✗ Erro ao deletar: $orderId - $_" -ForegroundColor Red
    }
}

# Verificar resultado final
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "LIMPEZA CONCLUIDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Pedidos deletados: $deleted" -ForegroundColor Green
Write-Host "Falhas: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })

# Verificar contagem final
$finalCount = aws dynamodb scan --table-name $TABLE_NAME --select COUNT | ConvertFrom-Json
Write-Host "Pedidos restantes: $($finalCount.Count)" -ForegroundColor White

Write-Host "`n✅ Sistema pronto para receber pedidos reais de clientes!" -ForegroundColor Green
Write-Host "📊 Dashboard admin: https://admin.sweetbarchocolates.com.br" -ForegroundColor Cyan
Write-Host "🛍️  Site: https://menunatal.sweetbarchocolates.com.br`n" -ForegroundColor Cyan
