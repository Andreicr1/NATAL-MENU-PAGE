# 🔧 Configuração AWS - Sweet Bar Natal Menu

## 📦 S3 Buckets

### Bucket Principal (Aplicação Frontend)
- **Nome:** `natal-menu-683373797860`
- **Região:** `us-east-1`
- **Conteúdo:** Build da aplicação React (`dist/`)
- **Arquivos:** `index.html`, `assets/`, imagens estáticas

### Bucket Admin (Painel Administrativo)
- **Nome:** `admin-sweetbar-683373797860`
- **Região:** `us-east-1`
- **Conteúdo:** `admin.html` (standalone)
- **Arquivos:** Apenas `admin.html`

### Bucket de Imagens de Produtos
- **Nome:** `natal-menu-products-images`
- **Região:** `us-east-1`
- **Conteúdo:** Fotos dos produtos
- **Estrutura:** `products/[timestamp]-[nome-arquivo]`

---

## 🌐 CloudFront Distributions

### Distribuição Principal
- **ID:** `E3VP7VX4XVPPIO`
- **Domain:** `d3c3no9shu6bly.cloudfront.net`
- **Alias:** `menunatal.sweetbarchocolates.com.br`
- **Origem:** `natal-menu-683373797860.s3.amazonaws.com`
- **Default Root:** `index.html`

### Distribuição Admin
- **ID:** `EOK8HGF3GINRD`
- **Domain:** `d30ejg446hfliv.cloudfront.net`
- **Alias:** `admin.sweetbarchocolates.com.br`
- **Origem:** `admin-sweetbar-683373797860.s3.us-east-1.amazonaws.com`
- **Default Root:** `admin.html`

---

## 🚀 Scripts de Deploy

### Deploy da Aplicação Principal:
```bash
# Build
npm run build

# Upload para S3
aws s3 sync dist/ s3://natal-menu-683373797860/ --delete

# Invalidar cache CloudFront
aws cloudfront create-invalidation --distribution-id E3VP7VX4XVPPIO --paths "/*"
```

### Deploy do Painel Admin:
```bash
# Upload do admin.html
aws s3 cp admin.html s3://admin-sweetbar-683373797860/

# Invalidar cache CloudFront
aws cloudfront create-invalidation --distribution-id EOK8HGF3GINRD --paths "/*"
```

### Deploy Completo (Ambos):
```bash
# App principal
npm run build
aws s3 sync dist/ s3://natal-menu-683373797860/ --delete
aws cloudfront create-invalidation --distribution-id E3VP7VX4XVPPIO --paths "/*"

# Admin
aws s3 cp admin.html s3://admin-sweetbar-683373797860/
aws cloudfront create-invalidation --distribution-id EOK8HGF3GINRD --paths "/*"
```

---

## 📝 Checklist de Deploy

- [ ] Verificar alterações no código
- [ ] Fazer build (`npm run build`)
- [ ] Deploy no bucket correto:
  - **App React → `natal-menu-683373797860`**
  - **Admin HTML → `admin-sweetbar-683373797860`**
- [ ] Invalidar cache da distribuição correta:
  - **App → `E3VP7VX4XVPPIO`**
  - **Admin → `EOK8HGF3GINRD`**
- [ ] Aguardar invalidação concluir (~2-5 min)
- [ ] Testar nos URLs:
  - https://menunatal.sweetbarchocolates.com.br
  - https://admin.sweetbarchocolates.com.br

---

## ⚠️ IMPORTANTE - Evitar Erros Comuns

### ❌ NÃO FAÇA:
1. **NÃO** fazer deploy de `admin.html` no bucket principal
2. **NÃO** fazer sync de `dist/` no bucket admin
3. **NÃO** usar IDs de distribuição errados
4. **NÃO** esquecer de invalidar o cache

### ✅ SEMPRE FAÇA:
1. **VERIFIQUE** qual arquivo está deployando
2. **CONFIRME** o bucket de destino
3. **USE** o ID de distribuição correto
4. **INVALIDE** o cache após deploy

---

## 🔐 Credenciais e Acessos

### Senha do Admin
- **Senha:** `sweetbar2025`
- **Configurada em:** `admin.html` (linha 559)

### AWS CLI
- **Região padrão:** `us-east-1`
- **Profile:** default

---

## 📊 Monitoramento

### Verificar Status dos Buckets:
```bash
aws s3 ls s3://natal-menu-683373797860/
aws s3 ls s3://admin-sweetbar-683373797860/
aws s3 ls s3://natal-menu-products-images/products/ --recursive
```

### Verificar Status das Distribuições:
```bash
aws cloudfront get-distribution --id E3VP7VX4XVPPIO --query "Distribution.Status"
aws cloudfront get-distribution --id EOK8HGF3GINRD --query "Distribution.Status"
```

### Verificar Invalidações em Andamento:
```bash
aws cloudfront list-invalidations --distribution-id E3VP7VX4XVPPIO
aws cloudfront list-invalidations --distribution-id EOK8HGF3GINRD
```

---

## 🛠️ Manutenção

### Limpar Invalidações Antigas:
As invalidações expiram automaticamente após 24h.

### Backup:
Sempre faça commit no Git antes de deploy em produção.

### Rollback:
Use versioning do S3 ou reverta via Git + redeploy.

---

**Última atualização:** 07/11/2025
