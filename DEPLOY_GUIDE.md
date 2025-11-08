# 🚀 Guia de Deploy - Sweet Bar Menu de Natal

## 📋 Índice Rápido

1. [Comandos Rápidos](#comandos-rápidos)
2. [Infraestrutura AWS](#infraestrutura-aws)
3. [Deploy Manual](#deploy-manual)
4. [Troubleshooting](#troubleshooting)

---

## ⚡ Comandos Rápidos

### Deploy da Aplicação Principal:
```bash
npm run deploy:app
```

### Deploy do Painel Admin:
```bash
npm run deploy:admin
```

### Deploy Completo (App + Admin):
```bash
npm run deploy:all
```

---

## 🏗️ Infraestrutura AWS

### 📦 Buckets S3

| Sistema | Bucket | Conteúdo |
|---------|--------|----------|
| **App Principal** | `natal-menu-683373797860` | Build React (`dist/`) |
| **Painel Admin** | `admin-sweetbar-683373797860` | `admin.html` |
| **Imagens** | `natal-menu-products-images` | Fotos dos produtos |

### 🌐 CloudFront Distributions

| Sistema | ID | URL Produção |
|---------|-----|-------------|
| **App Principal** | `E3VP7VX4XVPPIO` | https://menunatal.sweetbarchocolates.com.br |
| **Painel Admin** | `EOK8HGF3GINRD` | https://admin.sweetbarchocolates.com.br |

---

## 📝 Deploy Manual

### Aplicação Principal (React):

```bash
# 1. Build
npm run build

# 2. Upload para S3
aws s3 sync dist/ s3://natal-menu-683373797860/ --delete --region us-east-1

# 3. Invalidar cache CloudFront
aws cloudfront create-invalidation --distribution-id E3VP7VX4XVPPIO --paths "/*"
```

### Painel Admin (HTML):

```bash
# 1. Upload para S3
aws s3 cp admin.html s3://admin-sweetbar-683373797860/ --region us-east-1

# 2. Invalidar cache CloudFront
aws cloudfront create-invalidation --distribution-id EOK8HGF3GINRD --paths "/*"
```

---

## 🔧 Scripts Disponíveis

### Windows PowerShell:
- `deploy-app.ps1` - Deploy só do app
- `deploy-admin.ps1` - Deploy só do admin
- `deploy-all.ps1` - Deploy completo

### Linux/Mac Bash:
- `deploy-app.sh` - Deploy só do app
- `deploy-admin.sh` - Deploy só do admin
- `deploy-all.sh` - Deploy completo

---

## ⚠️ REGRAS IMPORTANTES

### ❌ NUNCA FAÇA:
1. Deploy de `admin.html` no bucket `natal-menu-683373797860`
2. Sync de `dist/` no bucket `admin-sweetbar-683373797860`
3. Usar IDs de distribuição errados
4. Esquecer de invalidar o cache

### ✅ SEMPRE FAÇA:
1. Verifique qual arquivo está deployando
2. Confirme o bucket de destino
3. Use o ID de distribuição correto
4. Invalide o cache após deploy
5. Aguarde 2-5 minutos para propagação

---

## 🔍 Verificações

### Verificar conteúdo dos buckets:
```bash
# App principal
aws s3 ls s3://natal-menu-683373797860/

# Admin
aws s3 ls s3://admin-sweetbar-683373797860/

# Imagens
aws s3 ls s3://natal-menu-products-images/products/ --recursive
```

### Verificar status das invalidações:
```bash
# App
aws cloudfront list-invalidations --distribution-id E3VP7VX4XVPPIO

# Admin
aws cloudfront list-invalidations --distribution-id EOK8HGF3GINRD
```

---

## 🐛 Troubleshooting

### Problema: Mudanças não aparecem

**Solução:**
1. Aguarde 2-5 minutos para invalidação concluir
2. Limpe o cache do navegador (Ctrl + Shift + R)
3. Teste em aba anônima
4. Verifique se a invalidação foi criada:
   ```bash
   aws cloudfront list-invalidations --distribution-id [ID]
   ```

### Problema: Arquivo no bucket errado

**Solução:**
```bash
# Remover do bucket errado
aws s3 rm s3://natal-menu-683373797860/admin.html

# Fazer upload no correto
aws s3 cp admin.html s3://admin-sweetbar-683373797860/

# Invalidar ambos
aws cloudfront create-invalidation --distribution-id E3VP7VX4XVPPIO --paths "/*"
aws cloudfront create-invalidation --distribution-id EOK8HGF3GINRD --paths "/*"
```

### Problema: Erro de permissão S3

**Solução:**
Verificar credenciais AWS CLI:
```bash
aws sts get-caller-identity
```

---

## 📚 Documentação Adicional

- **Configuração completa:** `AWS_CONFIG.md`
- **Configuração JSON:** `.aws-config.json`
- **Sistema de notificações:** `NOTIFICACOES_IMPLEMENTACAO_COMPLETA.md`
- **Mercado Pago mobile:** `aws/MERCADOPAGO_MOBILE_BEST_PRACTICES.md`

---

## 🎯 URLs de Acesso

### Produção:
- **Aplicação:** https://menunatal.sweetbarchocolates.com.br
- **Admin:** https://admin.sweetbarchocolates.com.br

### CloudFront Direto:
- **Aplicação:** https://d3c3no9shu6bly.cloudfront.net
- **Admin:** https://d30ejg446hfliv.cloudfront.net

### Credenciais:
- **Senha Admin:** `sweetbar2025`

---

**Última atualização:** 07/11/2025
