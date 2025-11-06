# 🚀 Guia de Deploy - Sweet Bar

## Pré-requisitos
- Node.js 18+
- AWS CLI configurado
- Credenciais AWS com permissões necessárias

## Variáveis de Ambiente

Copie `.env.example` para `.env.local` e configure:

```bash
VITE_AWS_API_URL=https://963pa03698.execute-api.us-east-1.amazonaws.com
VITE_ADMIN_PASSWORD=sua_senha_segura
MERCADOPAGO_ACCESS_TOKEN=seu_token
```

## Deploy Frontend

### Opção 1: Script Automático (Recomendado)
```bash
.\deploy-frontend.bat
```

### Opção 2: Manual
```bash
# Build
npm run build

# Upload para S3 (sem --delete para preservar imagens)
aws s3 sync dist/ s3://natal-menu-683373797860/

# Upload admin
aws s3 cp admin.html s3://natal-menu-683373797860/admin.html

# Invalidar cache CloudFront
aws cloudfront create-invalidation --distribution-id E3VP7VX4XVPPIO --paths "/*"
```

## URLs de Produção

- **Frontend**: https://d3c3no9shu6bly.cloudfront.net
- **Admin**: https://d3c3no9shu6bly.cloudfront.net/admin.html
- **API**: https://963pa03698.execute-api.us-east-1.amazonaws.com

## Buckets S3

- **Frontend**: `natal-menu-683373797860`
- **Imagens de Produtos**: `natal-menu-products-images`

## Troubleshooting

### Imagens não aparecem
- Verificar se Lambda usa bucket correto: `natal-menu-products-images`
- Verificar política pública do bucket

### Cache não atualiza
- Aguardar 1-2 minutos após invalidação
- Limpar cache do navegador (Ctrl+Shift+R)

### Erro 403
- Verificar política do bucket S3
- Verificar configuração do CloudFront

## Monitoramento

```bash
# Logs da Lambda
aws logs tail /aws/lambda/natal-menu-backend-v2-GetProductsFunction --follow

# Status do CloudFront
aws cloudfront get-distribution --id E3VP7VX4XVPPIO
```
