# Deletar TODOS os pedidos de teste - Sweet Bar
# USO: .\delete-all-orders.ps1

Write-Host "`nDELETANDO PEDIDOS DE TESTE..." -ForegroundColor Yellow

$TABLE = "natal-orders"

# Scan para pegar todos os IDs
$scan = aws dynamodb scan --table-name $TABLE --projection-expression orderId | ConvertFrom-Json

$total = $scan.Items.Count
Write-Host "Total de pedidos: $total`n"

if ($total -eq 0) {
    Write-Host "Nenhum pedido para deletar.`n" -ForegroundColor Green
    exit 0
}

$count = 0
foreach ($item in $scan.Items) {
    $id = $item.orderId.S
    aws dynamodb delete-item --table-name $TABLE --key "{`"orderId`":{`"S`":`"$id`"}}" 2>&1 | Out-Null
    $count++
    if ($count % 10 -eq 0) {
        Write-Host "  Progresso: $count/$total" -ForegroundColor Gray
    }
}

Write-Host "`n✅ Deletados: $count pedidos" -ForegroundColor Green

# Verificar
$final = (aws dynamodb scan --table-name $TABLE --select COUNT | ConvertFrom-Json).Count
Write-Host "Restantes: $final`n" -ForegroundColor White

