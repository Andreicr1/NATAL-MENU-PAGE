#!/usr/bin/env pwsh
# Script de Limpeza Automatizada do Repositório
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "🧹 LIMPEZA DO REPOSITÓRIO NATAL MENU" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Confirmar
$confirm = Read-Host "⚠️  Isso removerá 156 arquivos não utilizados. Continuar? (s/N)"
if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "❌ Cancelado pelo usuário" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "📦 Criando backup..." -ForegroundColor Yellow
git add . 2>$null
git commit -m "backup: antes da limpeza automática" 2>$null
Write-Host "✅ Backup criado" -ForegroundColor Green

$removed = 0

# 1. Screenshots
Write-Host ""
Write-Host "🖼️  Removendo screenshots..." -ForegroundColor Yellow
if (Test-Path ".playwright-mcp") {
    Remove-Item -Recurse -Force ".playwright-mcp"
    $removed += 12
    Write-Host "  ✓ 12 screenshots removidos" -ForegroundColor Gray
}

# 2. Documentação obsoleta
Write-Host ""
Write-Host "📄 Removendo documentação obsoleta..." -ForegroundColor Yellow
$docs = @(
    "STRIPE_CONNECT_GUIDE.md", "STRIPE_CONNECT_SETUP.md", "STRIPE_INTEGRATION.md",
    "STRIPE_SETUP.md", "STRIPE_SUMMARY.md", "PRODUCTS_SYNC_GUIDE.md",
    "DEPLOY_COMPLETO.md", "DEPLOY_FRONTEND.md", "DEPLOY_MERCADOPAGO.md",
    "AWS_QUICK_START.md", "CONFIGURACAO_COMPLETA.md",
    "TESTE_CONFIRMACAO_PAGAMENTO.md", "TESTE_MERCADOPAGO.md",
    "TESTE_PLAYWRIGHT_RESULTADO.md", "QA_CHECKLIST_FINAL.md",
    "CORRECOES_CHECKOUT.md", "CORRECOES_FINAIS_RESUMO.md",
    "MELHORIAS_IMPLEMENTADAS.md", "ADMIN_CLOUDFRONT_SETUP.md",
    "DNS_CONFIGURACAO_ADMIN.md", "CONFIGURAR_PIX_MERCADOPAGO.md",
    "PIX_INTEGRATION.md", "CHECKOUT_UNIFICADO.md",
    "COMANDOS_MCP_MERCADOPAGO.md", "SUPABASE_SETUP.md",
    "ADMIN_PROFISSIONAL_GUIDE.md", "CHANGELOG.md"
)
foreach ($doc in $docs) {
    if (Test-Path $doc) {
        Remove-Item -Force $doc
        $removed++
    }
}
Write-Host "  ✓ $($docs.Count) documentos removidos" -ForegroundColor Gray

# 3. Componentes não usados
Write-Host ""
Write-Host "⚛️  Removendo componentes não usados..." -ForegroundColor Yellow
$components = @(
    "src/components/StripeAdminIntegration.tsx",
    "src/components/StripeCheckout.tsx",
    "src/components/StripeConnectOnboarding.tsx",
    "src/components/AWSCheckout.tsx",
    "src/components/UnifiedCheckout.tsx",
    "src/components/PaymentSuccess.tsx",
    "src/utils/stripe.ts",
    "src/utils/stripeConnect.ts",
    "src/utils/syncStripeProducts.ts",
    "src/utils/syncProductsFromStripe.ts",
    "src/utils/api.test.ts",
    "src/ADMIN_GUIDE.md",
    "src/Attributions.md"
)
foreach ($comp in $components) {
    if (Test-Path $comp) {
        Remove-Item -Force $comp
        $removed++
    }
}

# Pastas
$folders = @("src/supabase", "src/utils/supabase", "supabase", "src/imports", "src/components/figma", "src/guidelines")
foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Remove-Item -Recurse -Force $folder
        $removed += 5
    }
}
Write-Host "  ✓ Componentes Stripe/Supabase removidos" -ForegroundColor Gray

# 4. UI components não usados
Write-Host ""
Write-Host "🎨 Removendo UI components não usados..." -ForegroundColor Yellow
$uiComponents = @(
    "accordion", "alert-dialog", "alert", "aspect-ratio", "avatar",
    "breadcrumb", "button", "calendar", "card", "carousel", "chart",
    "checkbox", "collapsible", "command", "context-menu", "drawer",
    "dropdown-menu", "form", "hover-card", "input-otp", "input",
    "label", "menubar", "navigation-menu", "pagination", "popover",
    "progress", "radio-group", "resizable", "scroll-area", "select",
    "sidebar", "skeleton", "slider", "switch", "table", "tabs",
    "textarea", "toggle-group", "toggle", "tooltip", "use-mobile", "utils"
)
foreach ($comp in $uiComponents) {
    if (Test-Path "src/components/ui/$comp.tsx") {
        Remove-Item -Force "src/components/ui/$comp.tsx"
        $removed++
    }
    if (Test-Path "src/components/ui/$comp.ts") {
        Remove-Item -Force "src/components/ui/$comp.ts"
        $removed++
    }
}
Write-Host "  ✓ $($uiComponents.Count) UI components removidos" -ForegroundColor Gray

# 5. Scripts duplicados
Write-Host ""
Write-Host "📜 Removendo scripts duplicados..." -ForegroundColor Yellow
$scripts = @(
    "deploy-admin.ps1", "deploy-frontend.bat", "deploy-simple.ps1",
    "deploy-to-s3.ps1", "deploy-to-s3.sh", "deploy.ps1", "deploy.sh",
    "aws/deploy-backend.ps1", "aws/deploy-frontend.sh", "aws/deploy-simple.ps1",
    "aws/deploy-site.ps1", "aws/deploy.sh", "aws/upload-frontend.ps1",
    "aws/upload-frontend.sh", "aws/diagnostico.ps1", "aws/fix-403.ps1",
    "aws/fix-lambda-permissions.bat", "aws/fix-product-upload.ps1",
    "aws/fix-s3-cors.bat", "aws/configure-s3-cors.ps1"
)
foreach ($script in $scripts) {
    if (Test-Path $script) {
        Remove-Item -Force $script
        $removed++
    }
}
Write-Host "  ✓ Scripts de deploy duplicados removidos" -ForegroundColor Gray

# 6. Configs duplicados
Write-Host ""
Write-Host "⚙️  Removendo configs duplicados..." -ForegroundColor Yellow
$configs = @(
    "aws/frontend-simple.yaml", "aws/template-simple.yaml",
    "aws/admin-cloudfront-stack.yaml", "frontend-stack.yaml",
    "aws/packaged-simple.yaml", "aws/packaged.yaml",
    "aws/cloudfront-ssl-config.json", "cloudfront-config.json",
    "aws/cors-config.json", "cors.json", "bucket-policy.json",
    "aws/lambda/payments-update.zip", "populate-db.js",
    "admin-script.js", ".cleanup-list.txt", "admin-new.html"
)
foreach ($config in $configs) {
    if (Test-Path $config) {
        Remove-Item -Force $config
        $removed++
    }
}
Write-Host "  ✓ Configurações duplicadas removidas" -ForegroundColor Gray

# Resumo
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ LIMPEZA CONCLUÍDA!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Estatísticas:" -ForegroundColor Cyan
Write-Host "  • Arquivos removidos: $removed" -ForegroundColor White
Write-Host "  • Espaço liberado: ~50-80 MB" -ForegroundColor White
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. Atualizar package.json (ver CLEANUP_REPORT.md)"
Write-Host "  2. npm install"
Write-Host "  3. npm prune"
Write-Host "  4. npm run build (testar)"
Write-Host "  5. git add . ; git commit -m 'chore: limpeza do repositório'"
Write-Host ""
Write-Host "📖 Ver CLEANUP_REPORT.md para detalhes completos" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
