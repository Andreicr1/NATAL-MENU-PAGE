$ErrorActionPreference = "Stop"

Write-Host "Limpeza do Repositorio" -ForegroundColor Cyan
Write-Host ""

$removed = 0

# Screenshots
if (Test-Path ".playwright-mcp") {
    Remove-Item -Recurse -Force ".playwright-mcp"
    $removed += 12
    Write-Host "Screenshots removidos" -ForegroundColor Green
}

# Documentacao obsoleta
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
Write-Host "Documentacao removida" -ForegroundColor Green

# Componentes nao usados
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

$folders = @("src/supabase", "src/utils/supabase", "supabase", "src/imports", "src/components/figma", "src/guidelines")
foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Remove-Item -Recurse -Force $folder
        $removed += 5
    }
}
Write-Host "Componentes removidos" -ForegroundColor Green

# UI components nao usados
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
Write-Host "UI components removidos" -ForegroundColor Green

# Scripts duplicados
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
Write-Host "Scripts removidos" -ForegroundColor Green

# Configs duplicados
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
Write-Host "Configs removidos" -ForegroundColor Green

Write-Host ""
Write-Host "Limpeza concluida! Arquivos removidos: $removed" -ForegroundColor Cyan
