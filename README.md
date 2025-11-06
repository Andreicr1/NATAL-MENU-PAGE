# 🍫 Sweet Bar - Menu de Natal 2025

Aplicação web de menu digital com sistema de pedidos integrado ao Mercado Pago e backend AWS.

## 🚀 Links Rápidos

- **Site**: https://d3c3no9shu6bly.cloudfront.net
- **Admin**: https://d3c3no9shu6bly.cloudfront.net/admin.html
- **API**: https://963pa03698.execute-api.us-east-1.amazonaws.com

## 📋 Funcionalidades

- ✅ Menu digital responsivo
- ✅ Carrinho persistente (localStorage)
- ✅ Produtos em destaque na home
- ✅ Busca de produtos por categoria
- ✅ Painel administrativo para gerenciar produtos
- ✅ Upload de imagens com compressão automática
- ✅ Integração com Mercado Pago
- ✅ Backend AWS (Lambda + DynamoDB + S3)

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Radix UI + Tailwind CSS
- **Backend**: AWS Lambda (Node.js)
- **Database**: DynamoDB
- **Storage**: S3 + CloudFront
- **Pagamentos**: Mercado Pago

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais

# Desenvolvimento
npm run dev

# Build
npm run build
```

## 🚢 Deploy

```bash
# Deploy automático
.\deploy-frontend.bat

# Ou manual
npm run build
aws s3 sync dist/ s3://natal-menu-683373797860/
aws cloudfront create-invalidation --distribution-id E3VP7VX4XVPPIO --paths "/*"
```

Ver [DEPLOY.md](./DEPLOY.md) para instruções completas.

## 🔐 Admin

Acesse `/admin.html` e use a senha configurada em `VITE_ADMIN_PASSWORD`.

Funcionalidades:
- Adicionar/editar/excluir produtos
- Upload de imagens
- Marcar produtos em destaque
- Gerenciar categorias

## 📊 Monitoramento

```bash
# Configurar alarmes
.\aws\setup-monitoring.bat

# Ver logs
aws logs tail /aws/lambda/natal-menu-backend-v2-GetProductsFunction --follow

# Dashboard
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=natal-menu-dashboard
```

## 💾 Backup

```bash
# Backup manual
.\aws\backup-dynamodb.bat

# Configurar backup automático (diário às 3h)
schtasks /create /tn "DynamoDB Backup" /tr "D:\Natal Menu Page\aws\backup-dynamodb.bat" /sc daily /st 03:00
```

## 🆘 Troubleshooting

Ver [DISASTER_RECOVERY.md](./DISASTER_RECOVERY.md) para plano completo.

**Problemas comuns:**

- **Site não atualiza**: Limpar cache (Ctrl+Shift+R) e aguardar invalidação CloudFront
- **Imagens não aparecem**: Verificar bucket `natal-menu-products-images`
- **API não responde**: Verificar logs da Lambda no CloudWatch

## 📁 Estrutura

```
├── src/
│   ├── components/     # Componentes React
│   ├── utils/          # Utilitários e API
│   └── App.tsx         # Componente principal
├── aws/
│   ├── lambda/         # Funções Lambda
│   └── *.bat           # Scripts de deploy/backup
├── admin.html          # Painel administrativo
└── DEPLOY.md           # Guia de deploy
```

## 🧪 Testes

```bash
npm test
```

## 📝 Licença

Propriedade de Sweet Bar Chocolates.

## 🤝 Suporte

Para suporte, entre em contato através do Instagram: @sweetbarchocolates
