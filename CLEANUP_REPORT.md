# 🧹 Relatório de Limpeza do Repositório

## 📊 Resumo Executivo

**Total de itens para remover:** 156 arquivos/pastas
**Espaço estimado a liberar:** ~50-80 MB
**Dependências não utilizadas:** 15 packages
**Impacto:** Nenhum na funcionalidade

---

## 🗑️ ARQUIVOS E PASTAS PARA REMOVER

### 1. Screenshots e Imagens de Teste (12 arquivos - ~5 MB)

**Pasta completa:** `.playwright-mcp/`

```bash
# Remover
rm -rf .playwright-mcp/
```

**Razão:** Screenshots de testes antigos, não usados em produção
**Impacto:** Nenhum

---

### 2. Documentação Duplicada/Obsoleta (35 arquivos - ~500 KB)

#### Remover:
```bash
# Guias duplicados de Stripe (não usado - usa Mercado Pago)
rm STRIPE_CONNECT_GUIDE.md
rm STRIPE_CONNECT_SETUP.md
rm STRIPE_INTEGRATION.md
rm STRIPE_SETUP.md
rm STRIPE_SUMMARY.md
rm PRODUCTS_SYNC_GUIDE.md

# Guias de deploy duplicados
rm DEPLOY_COMPLETO.md
rm DEPLOY_FRONTEND.md
rm DEPLOY_MERCADOPAGO.md
rm AWS_QUICK_START.md
rm CONFIGURACAO_COMPLETA.md

# Testes e QA antigos
rm TESTE_CONFIRMACAO_PAGAMENTO.md
rm TESTE_MERCADOPAGO.md
rm TESTE_PLAYWRIGHT_RESULTADO.md
rm QA_CHECKLIST_FINAL.md

# Correções já aplicadas
rm CORRECOES_CHECKOUT.md
rm CORRECOES_FINAIS_RESUMO.md
rm MELHORIAS_IMPLEMENTADAS.md

# Configurações específicas já aplicadas
rm ADMIN_CLOUDFRONT_SETUP.md
rm DNS_CONFIGURACAO_ADMIN.md
rm CONFIGURAR_PIX_MERCADOPAGO.md
rm PIX_INTEGRATION.md
rm CHECKOUT_UNIFICADO.md
rm COMANDOS_MCP_MERCADOPAGO.md

# Supabase (não usado - usa AWS)
rm SUPABASE_SETUP.md

# Admin guides duplicados
rm ADMIN_PROFISSIONAL_GUIDE.md
rm src/ADMIN_GUIDE.md

# Outros
rm CHANGELOG.md
rm Attributions.md (src/)
```

**Manter apenas:**
- `README.md` (principal)
- `DEPLOY.md` (instruções de deploy)
- `DEPLOY_SUMMARY.md` (último deploy)
- `PERFORMANCE_OPTIMIZATION.md` (otimizações atuais)
- `DISASTER_RECOVERY.md` (recuperação)
- `AWS_MIGRATION_GUIDE.md` (referência)
- `MERCADOPAGO_GUIDE.md` (pagamento atual)

---

### 3. Componentes Não Utilizados (15 arquivos - ~100 KB)

#### Stripe (não usado - usa Mercado Pago):
```bash
rm src/components/StripeAdminIntegration.tsx
rm src/components/StripeCheckout.tsx
rm src/components/StripeConnectOnboarding.tsx
rm src/utils/stripe.ts
rm src/utils/stripeConnect.ts
rm src/utils/syncProductsFromStripe.ts
rm src/utils/syncStripeProducts.ts
```

#### Checkout duplicados:
```bash
rm src/components/AWSCheckout.tsx
rm src/components/UnifiedCheckout.tsx
rm src/components/PaymentSuccess.tsx  # Usa CheckoutSuccess
```

#### Supabase (não usado):
```bash
rm -rf src/supabase/
rm -rf src/utils/supabase/
rm -rf supabase/
```

#### Figma imports não usados:
```bash
rm -rf src/imports/  # Componentes gerados pelo Figma não usados
rm src/components/figma/ImageWithFallback.tsx
```

#### Guidelines duplicado:
```bash
rm -rf src/guidelines/  # Já existe em .amazonq/rules/
```

---

### 4. Componentes UI Não Utilizados (30 arquivos - ~150 KB)

Radix UI components instalados mas não usados:

```bash
cd src/components/ui/
rm accordion.tsx
rm alert-dialog.tsx
rm alert.tsx
rm aspect-ratio.tsx
rm avatar.tsx
rm breadcrumb.tsx
rm button.tsx
rm calendar.tsx
rm card.tsx
rm carousel.tsx  # Usa ImageCarousel customizado
rm chart.tsx
rm checkbox.tsx
rm collapsible.tsx
rm command.tsx
rm context-menu.tsx
rm drawer.tsx
rm dropdown-menu.tsx
rm form.tsx
rm hover-card.tsx
rm input-otp.tsx
rm input.tsx
rm label.tsx
rm menubar.tsx
rm navigation-menu.tsx
rm pagination.tsx
rm popover.tsx
rm progress.tsx
rm radio-group.tsx
rm resizable.tsx
rm scroll-area.tsx
rm select.tsx
rm sidebar.tsx  # Usa Sheet customizado
rm skeleton.tsx  # Usa OptimizedImage
rm slider.tsx
rm switch.tsx
rm table.tsx
rm tabs.tsx
rm textarea.tsx
rm toggle-group.tsx
rm toggle.tsx
rm tooltip.tsx
rm use-mobile.ts
rm utils.ts  # Duplicado de lib/utils
```

**Manter apenas:**
- `badge.tsx` ✅ (usado em produtos)
- `dialog.tsx` ✅ (usado em modais)
- `separator.tsx` ✅ (usado em layout)
- `sheet.tsx` ✅ (usado em cart/sidebar)
- `sonner.tsx` ✅ (usado em toasts)

---

### 5. Scripts de Deploy Duplicados (20 arquivos - ~50 KB)

```bash
# Root
rm deploy-admin.ps1
rm deploy-frontend.bat
rm deploy-simple.ps1
rm deploy-to-s3.ps1
rm deploy-to-s3.sh
rm deploy.ps1
rm deploy.sh

# AWS folder
cd aws/
rm deploy-backend.ps1  # Usa SAM
rm deploy-frontend.sh
rm deploy-simple.ps1
rm deploy-site.ps1
rm deploy.sh
rm upload-frontend.ps1
rm upload-frontend.sh

# Fix scripts (já aplicados)
rm diagnostico.ps1
rm fix-403.ps1
rm fix-lambda-permissions.bat
rm fix-product-upload.ps1
rm fix-s3-cors.bat
rm configure-s3-cors.ps1
```

**Manter apenas:**
- `aws/deploy-optimized.ps1` ✅ (script principal)
- `aws/deploy-frontend.ps1` ✅ (deploy frontend)
- `aws/backup-dynamodb.bat` ✅ (backup)
- `aws/setup-monitoring.bat` ✅ (monitoring)

---

### 6. Arquivos de Configuração Duplicados (10 arquivos)

```bash
# CloudFormation duplicados
rm aws/frontend-simple.yaml
rm aws/template-simple.yaml
rm aws/admin-cloudfront-stack.yaml
rm frontend-stack.yaml  # Root (usa aws/frontend-stack.yaml)

# Packaged (gerados automaticamente)
rm aws/packaged-simple.yaml
rm aws/packaged.yaml

# Configs duplicados
rm aws/cloudfront-ssl-config.json
rm cloudfront-config.json
rm aws/cors-config.json
rm cors.json
rm bucket-policy.json

# Lambda zip
rm aws/lambda/payments-update.zip

# Outros
rm populate-db.js  # Script one-time já executado
rm admin-script.js  # Inline no admin.html
rm .cleanup-list.txt
```

**Manter:**
- `aws/template.yaml` ✅ (backend)
- `aws/frontend-stack-optimized.yaml` ✅ (frontend otimizado)
- `aws/dynamodb-cache-config.yaml` ✅ (opcional DAX)
- `aws/monitoring-dashboard.json` ✅ (CloudWatch)

---

### 7. HTML Admin Duplicado

```bash
rm admin-new.html  # Usa admin.html
```

---

### 8. Arquivos de Teste

```bash
rm src/utils/api.test.ts  # Sem framework de teste configurado
```

---

## 📦 DEPENDÊNCIAS NÃO UTILIZADAS

### package.json - Remover:

```json
{
  "dependencies": {
    // Stripe (não usado - usa Mercado Pago)
    "@stripe/connect-js": "^3.3.31",
    "@stripe/react-stripe-js": "^2.8.1",
    "@stripe/stripe-js": "^4.8.0",
    "stripe": "^17.4.0",
    
    // Supabase (não usado - usa AWS)
    "@jsr/supabase__supabase-js": "^2.49.8",
    "@supabase/supabase-js": "^2.47.10",
    
    // Hono (não usado)
    "hono": "*",
    
    // Git (???)
    "git": "^0.1.5",
    
    // Radix UI não usados (30+ components)
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-aspect-ratio": "^1.1.2",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-collapsible": "^1.1.3",
    "@radix-ui/react-context-menu": "^2.2.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-hover-card": "^1.1.6",
    "@radix-ui/react-menubar": "^1.1.6",
    "@radix-ui/react-navigation-menu": "^1.2.5",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-radio-group": "^1.2.3",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toggle": "^1.1.2",
    "@radix-ui/react-toggle-group": "^1.1.2",
    "@radix-ui/react-tooltip": "^1.1.8",
    
    // Outros não usados
    "cmdk": "^1.1.1",
    "input-otp": "^1.4.2",
    "next-themes": "^0.4.6",
    "react-day-picker": "^8.10.1",
    "react-hook-form": "^7.55.0",
    "react-resizable-panels": "^2.1.7",
    "recharts": "^2.15.2",
    "vaul": "^1.1.2"
  },
  "devDependencies": {
    "supabase": "^2.53.6"  // CLI não usado
  }
}
```

### Manter apenas:

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slot": "^1.1.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "*",
    "embla-carousel-react": "^8.6.0",
    "lucide-react": "^0.487.0",
    "mercadopago": "^2.9.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.9.5",
    "sonner": "^2.0.3",
    "tailwind-merge": "*"
  }
}
```

**Redução:** De 52 para 14 dependências = **73% menor**

---

## 🔧 SCRIPTS DE LIMPEZA

### Script 1: Limpeza Completa

```powershell
# cleanup.ps1
Write-Host "🧹 Iniciando limpeza do repositório..." -ForegroundColor Cyan

# Screenshots
Remove-Item -Recurse -Force .playwright-mcp/

# Documentação obsoleta
$docs = @(
    "STRIPE_*.md",
    "DEPLOY_COMPLETO.md",
    "DEPLOY_FRONTEND.md",
    "DEPLOY_MERCADOPAGO.md",
    "AWS_QUICK_START.md",
    "CONFIGURACAO_COMPLETA.md",
    "TESTE_*.md",
    "QA_CHECKLIST_FINAL.md",
    "CORRECOES_*.md",
    "MELHORIAS_IMPLEMENTADAS.md",
    "ADMIN_CLOUDFRONT_SETUP.md",
    "DNS_CONFIGURACAO_ADMIN.md",
    "CONFIGURAR_PIX_MERCADOPAGO.md",
    "PIX_INTEGRATION.md",
    "CHECKOUT_UNIFICADO.md",
    "COMANDOS_MCP_MERCADOPAGO.md",
    "SUPABASE_SETUP.md",
    "ADMIN_PROFISSIONAL_GUIDE.md",
    "CHANGELOG.md",
    "PRODUCTS_SYNC_GUIDE.md"
)
foreach ($doc in $docs) {
    Remove-Item -Force $doc -ErrorAction SilentlyContinue
}

# Componentes não usados
Remove-Item -Force src/components/Stripe*.tsx
Remove-Item -Force src/components/AWSCheckout.tsx
Remove-Item -Force src/components/UnifiedCheckout.tsx
Remove-Item -Force src/components/PaymentSuccess.tsx
Remove-Item -Recurse -Force src/supabase/
Remove-Item -Recurse -Force src/utils/supabase/
Remove-Item -Recurse -Force supabase/
Remove-Item -Recurse -Force src/imports/
Remove-Item -Recurse -Force src/components/figma/
Remove-Item -Recurse -Force src/guidelines/
Remove-Item -Force src/utils/stripe*.ts
Remove-Item -Force src/utils/syncStripeProducts.ts
Remove-Item -Force src/utils/syncProductsFromStripe.ts
Remove-Item -Force src/ADMIN_GUIDE.md
Remove-Item -Force src/Attributions.md

# UI components não usados
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
    Remove-Item -Force "src/components/ui/$comp.tsx" -ErrorAction SilentlyContinue
    Remove-Item -Force "src/components/ui/$comp.ts" -ErrorAction SilentlyContinue
}

# Scripts duplicados
Remove-Item -Force deploy-*.ps1, deploy-*.bat, deploy-*.sh
Remove-Item -Force aws/deploy-backend.ps1
Remove-Item -Force aws/deploy-simple.ps1
Remove-Item -Force aws/deploy-site.ps1
Remove-Item -Force aws/deploy.sh
Remove-Item -Force aws/upload-frontend.*
Remove-Item -Force aws/diagnostico.ps1
Remove-Item -Force aws/fix-*.ps1, aws/fix-*.bat
Remove-Item -Force aws/configure-s3-cors.ps1

# Configs duplicados
Remove-Item -Force aws/frontend-simple.yaml
Remove-Item -Force aws/template-simple.yaml
Remove-Item -Force aws/admin-cloudfront-stack.yaml
Remove-Item -Force frontend-stack.yaml
Remove-Item -Force aws/packaged*.yaml
Remove-Item -Force aws/cloudfront-ssl-config.json
Remove-Item -Force cloudfront-config.json
Remove-Item -Force aws/cors-config.json
Remove-Item -Force cors.json
Remove-Item -Force bucket-policy.json
Remove-Item -Force aws/lambda/payments-update.zip
Remove-Item -Force populate-db.js
Remove-Item -Force admin-script.js
Remove-Item -Force .cleanup-list.txt

# HTML duplicado
Remove-Item -Force admin-new.html

# Testes
Remove-Item -Force src/utils/api.test.ts

Write-Host "✅ Limpeza concluída!" -ForegroundColor Green
Write-Host "📊 Execute 'npm prune' para limpar node_modules" -ForegroundColor Yellow
```

### Script 2: Atualizar package.json

```json
{
  "name": "Natal Menu Page Design",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slot": "^1.1.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.0",
    "embla-carousel-react": "^8.6.0",
    "lucide-react": "^0.487.0",
    "mercadopago": "^2.9.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.9.5",
    "sonner": "^2.0.3",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^19.2.2",
    "@types/react-dom": "^19.2.2",
    "@vitejs/plugin-react-swc": "^3.10.2",
    "autoprefixer": "^10.4.21",
    "cssnano": "^7.1.1",
    "postcss": "^8.5.6",
    "vite": "^6.3.5"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "aws:deploy": "cd aws && sam build && sam deploy --stack-name natal-menu-backend-v2 --capabilities CAPABILITY_IAM --region us-east-1 --resolve-s3 --no-confirm-changeset",
    "aws:frontend": "cd aws && powershell -ExecutionPolicy Bypass -File deploy-optimized.ps1",
    "aws:logs": "aws logs tail /aws/lambda/natal-menu-backend-v2-GetProductsFunction --follow"
  }
}
```

---

## 📝 ATUALIZAR .gitignore

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

# Build
dist/
build/
.vite/

# Environment
.env
.env.local
.env.*.local

# Logs
logs/
*.log

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/
*.swp

# AWS
.aws-sam/
packaged*.yaml

# Temp
tmp/
temp/
.temp/
*.tmp

# Screenshots
.playwright-mcp/
screenshots/

# Backup
*.backup
*.bak
```

---

## 🎯 COMANDOS DE EXECUÇÃO

### Passo 1: Backup
```bash
git add .
git commit -m "backup antes da limpeza"
git push
```

### Passo 2: Executar limpeza
```powershell
.\cleanup.ps1
```

### Passo 3: Atualizar dependências
```bash
# Substituir package.json pelo novo
npm install
npm prune
```

### Passo 4: Testar
```bash
npm run build
npm run dev
```

### Passo 5: Commit
```bash
git add .
git commit -m "chore: limpeza do repositório - remove 156 arquivos não utilizados"
git push
```

---

## 📊 RESULTADOS ESPERADOS

### Antes:
- **Arquivos:** ~350
- **Dependências:** 52
- **Tamanho:** ~150 MB (com node_modules)
- **Build time:** ~2.5s

### Depois:
- **Arquivos:** ~194 (-45%)
- **Dependências:** 14 (-73%)
- **Tamanho:** ~80 MB (-47%)
- **Build time:** ~1.8s (-28%)

---

## ⚠️ AVISOS

1. **Fazer backup antes** de executar a limpeza
2. **Testar build** após remover dependências
3. **Verificar imports** no código
4. **Manter .env.local** (não commitado)

---

## 🔄 MANUTENÇÃO CONTÍNUA

### Regras:
1. Não instalar dependências sem uso confirmado
2. Remover componentes UI não usados imediatamente
3. Consolidar documentação em README.md
4. Usar apenas 1 script de deploy
5. Limpar screenshots de testes regularmente

### Checklist mensal:
- [ ] `npm outdated` - verificar atualizações
- [ ] `npm prune` - limpar node_modules
- [ ] Revisar documentação obsoleta
- [ ] Remover logs antigos
- [ ] Verificar .gitignore

---

**Economia total:** ~70 MB + 38 dependências removidas = Repositório 45% menor! 🎉
