# 🎄 Sweet Bar - Menu de Natal 2025

E-commerce de chocolates artesanais premium com sistema completo de checkout e pagamento via Mercado Pago.

---

## 🚀 Deploy Rápido

```bash
# Aplicação principal
npm run deploy:app

# Painel administrativo
npm run deploy:admin

# Deploy completo (ambos)
npm run deploy:all
```

## 🔧 Correção de Upload de Imagens

Se houver erro ao fazer upload de imagens no painel admin:

```powershell
# 1. Corrigir configuração do bucket S3
cd aws
.\fix-s3-bucket.ps1

# 2. Re-deployar admin
cd ..
npm run deploy:admin
```

Veja [FIX_UPLOAD_IMAGES.md](FIX_UPLOAD_IMAGES.md) para detalhes.

---

## 🌐 URLs de Produção

- **Loja:** https://menunatal.sweetbarchocolates.com.br
- **Admin:** https://admin.sweetbarchocolates.com.br
- **Senha Admin:** `sweetbar2025`

---

## 📦 Infraestrutura AWS

### S3 Buckets:
| Sistema | Bucket | Conteúdo |
|---------|--------|----------|
| App | `natal-menu-683373797860` | Build React |
| Admin | `admin-sweetbar-683373797860` | admin.html |
| Imagens | `natal-menu-products-images` | Fotos |

### CloudFront Distributions:
| Sistema | ID | URL |
|---------|-----|-----|
| App | `E3VP7VX4XVPPIO` | menunatal.sweetbarchocolates.com.br |
| Admin | `EOK8HGF3GINRD` | admin.sweetbarchocolates.com.br |

---

## 🛠️ Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em dev
npm run dev

# Build para produção
npm run build
```

---

## 📚 Documentação Completa

- **[QUICK_DEPLOY.txt](QUICK_DEPLOY.txt)** - Referência visual rápida
- **[DEPLOY_GUIDE.md](DEPLOY_GUIDE.md)** - Guia completo de deploy
- **[AWS_CONFIG.md](AWS_CONFIG.md)** - Configuração detalhada AWS
- **[NOTIFICACOES_IMPLEMENTACAO_COMPLETA.md](NOTIFICACOES_IMPLEMENTACAO_COMPLETA.md)** - Sistema de notificações

---

## ⚡ Funcionalidades

- ✅ Carrossel de imagens (até 10 por produto)
- ✅ Carrinho de compras com persistência
- ✅ Cálculo de frete por CEP
- ✅ Checkout integrado com Mercado Pago
- ✅ Notificações por email e WhatsApp
- ✅ Painel admin responsivo
- ✅ Sistema de pedidos e analytics
- ✅ Totalmente responsivo (mobile-first)

---

## 🔐 Credenciais

### Admin:
- **URL:** https://admin.sweetbarchocolates.com.br
- **Senha:** `sweetbar2025`

### Mercado Pago:
- **Access Token:** Configurado via AWS Secrets Manager
- **Webhook:** Configurado via Lambda

---

## 📱 Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- TailwindCSS
- Shadcn/ui
- Lucide Icons

**Backend:**
- AWS Lambda (Node.js)
- DynamoDB
- API Gateway
- S3 + CloudFront
- AWS SES
- Mercado Pago API

**Deploy:**
- AWS SAM
- AWS CLI
- PowerShell Scripts

---

## 🎯 Estrutura do Projeto

```
D:\Natal Menu Page\
├── src/                      # Código React
│   ├── components/          # Componentes React
│   ├── utils/              # Utilidades e APIs
│   └── data/               # Dados estáticos
├── aws/                     # Backend AWS
│   ├── lambda/             # Funções Lambda
│   └── template.yaml       # SAM template
├── admin.html              # Painel admin standalone
├── deploy-*.ps1            # Scripts de deploy
└── AWS_CONFIG.md           # Documentação AWS

```

---

## ⚠️ Importante

**NÃO confundir os buckets!**
- `admin.html` → `admin-sweetbar-683373797860` ✅
- Build React → `natal-menu-683373797860` ✅
- Imagens → `natal-menu-products-images` ✅

Use sempre os scripts de deploy (`npm run deploy:*`) para evitar erros.

**Troubleshooting:**
- Upload de imagens falhando? → Execute `aws\fix-s3-bucket.ps1`
- Admin não carrega? → Verifique se deployou no bucket correto
- API não responde? → Verifique logs: `aws logs tail /aws/lambda/[FUNCTION_NAME] --follow`

---

**Desenvolvido por:** Sweet Bar Team
**Última atualização:** 07/11/2025
