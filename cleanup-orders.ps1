# Limpeza de Pedidos de Teste - Sweet Bar

Write-Host "`nLIMPEZA DE PEDIDOS DE TESTE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Contar pedidos
$count = (aws dynamodb scan --table-name natal-orders --select COUNT | ConvertFrom-Json).Count
Write-Host "Total de pedidos: $count`n" -ForegroundColor White

if ($count -eq 0) {
    Write-Host "Tabela ja esta vazia!`n" -ForegroundColor Green
    exit 0
}

# Confirmar
$confirm = Read-Host "Deletar TODOS os $count pedidos? (digite SIM)"
if ($confirm -ne "SIM") {
    Write-Host "`nOperacao cancelada.`n" -ForegroundColor Yellow
    exit 0
}

# Buscar IDs
Write-Host "`nBuscando pedidos..." -ForegroundColor Yellow
$items = (aws dynamodb scan --table-name natal-orders --projection-expression orderId | ConvertFrom-Json).Items

# Deletar
Write-Host "Deletando pedidos...`n" -ForegroundColor Yellow
$deleted = 0

foreach ($item in $items) {
    $orderId = $item.orderId.S
    aws dynamodb delete-item --table-name natal-orders --key "{`"orderId`":{`"S`":`"$orderId`"}}" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $deleted++
        Write-Host "  Deletado: $orderId" -ForegroundColor Gray
    }
}

# Resultado
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "CONCLUIDO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deletados: $deleted pedidos`n" -ForegroundColor Green

# Verificar
$final = (aws dynamodb scan --table-name natal-orders --select COUNT | ConvertFrom-Json).Count
Write-Host "Pedidos restantes: $final`n" -ForegroundColor White

if ($final -eq 0) {
    Write-Host "✅ Sistema limpo e pronto para producao!`n" -ForegroundColor Green
}

