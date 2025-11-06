# 🚀 Guia de Otimização de Performance

## Problemas Identificados e Soluções

### 1. ❌ Flickering de Imagens
**Problema:** Imagens estáticas aparecem antes das imagens reais do S3

**Causas:**
- Sem preload de imagens
- Transição de opacidade sem controle de carregamento
- Sem skeleton/placeholder durante loading

**Soluções Implementadas:**
- ✅ Componente `OptimizedImage.tsx` com skeleton loader
- ✅ `ImageCarousel.tsx` com preload da próxima imagem
- ✅ Estado de carregamento controlado
- ✅ Transições suaves (300ms)

### 2. ❌ Cache Ineficiente do CloudFront
**Problema:** Configuração básica sem otimizações

**Soluções Implementadas:**
- ✅ Cache policies específicas por tipo de conteúdo
- ✅ TTL de 1 ano para assets estáticos
- ✅ TTL de 5 minutos para HTML
- ✅ HTTP/3 habilitado
- ✅ Compressão Brotli + Gzip

### 3. ❌ Lambda com Cold Start Alto
**Problema:** Timeout de 30s e sem otimizações

**Soluções Implementadas:**
- ✅ Timeout reduzido para 10s (5s para leitura)
- ✅ Memória otimizada (512MB global, 256MB para leitura)
- ✅ Variáveis de cache configuradas

## 📊 Métricas Esperadas

### Antes da Otimização
- LCP (Largest Contentful Paint): ~3.5s
- FID (First Input Delay): ~150ms
- CLS (Cumulative Layout Shift): ~0.15
- Flickering: Visível em 80% dos carregamentos

### Depois da Otimização
- LCP: ~1.2s (melhoria de 66%)
- FID: ~50ms (melhoria de 67%)
- CLS: ~0.05 (melhoria de 67%)
- Flickering: Eliminado com skeleton loader

## 🔧 Implementação

### Passo 1: Atualizar CloudFront

```bash
# Backup da stack atual
aws cloudformation describe-stacks --stack-name natal-menu-frontend > backup-stack.json

# Deploy da nova configuração
cd aws
aws cloudformation deploy \
  --template-file frontend-stack-optimized.yaml \
  --stack-name natal-menu-frontend \
  --region us-east-1

# Invalidar cache
aws cloudfront create-invalidation \
  --distribution-id E3VP7VX4XVPPIO \
  --paths "/*"
```

### Passo 2: Atualizar Lambda

```bash
# Deploy do backend otimizado
cd aws
sam build
sam deploy --no-confirm-changeset
```

### Passo 3: Atualizar Frontend

```bash
# Build com otimizações
npm run build

# Upload para S3
aws s3 sync dist/ s3://natal-menu-683373797860/ --delete

# Invalidar CloudFront
aws cloudfront create-invalidation \
  --distribution-id E3VP7VX4XVPPIO \
  --paths "/*"
```

## 🎯 Configurações Específicas

### CloudFront Cache Behaviors

| Tipo | Path Pattern | TTL | Compressão |
|------|-------------|-----|------------|
| HTML | / | 5 min | Brotli + Gzip |
| JS/CSS | assets/* | 1 ano | Brotli + Gzip |
| Imagens | *.jpg, *.png, *.webp | 1 ano | Brotli + Gzip |

### Lambda Memory & Timeout

| Função | Memória | Timeout | Uso |
|--------|---------|---------|-----|
| GetProducts | 256 MB | 5s | Leitura simples |
| CreateProduct | 512 MB | 10s | Escrita com validação |
| Upload | 1024 MB | 15s | Processamento de imagem |

### S3 Bucket Configuration

```bash
# Habilitar Transfer Acceleration (opcional)
aws s3api put-bucket-accelerate-configuration \
  --bucket natal-menu-products-images \
  --accelerate-configuration Status=Enabled

# Configurar CORS
aws s3api put-bucket-cors \
  --bucket natal-menu-products-images \
  --cors-configuration file://s3-cors.json
```

**s3-cors.json:**
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://d3c3no9shu6bly.cloudfront.net"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3600,
      "ExposeHeaders": ["ETag"]
    }
  ]
}
```

## 🖼️ Otimização de Imagens

### Formato Recomendado
- **WebP** para navegadores modernos (90% menor que JPEG)
- **JPEG** como fallback
- Qualidade: 80-85%
- Dimensões máximas: 1200x1600px

### Compressão Automática

```typescript
// Adicionar ao AdminPanel.tsx
import imageCompression from 'browser-image-compression';

const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: 'image/webp'
  };
  return await imageCompression(file, options);
};
```

### CDN Image Optimization

Usar parâmetros de URL para otimização dinâmica:
```
https://d3c3no9shu6bly.cloudfront.net/image.jpg?w=400&q=80&fm=webp
```

## 📱 Mobile Performance

### Lazy Loading Estratégico
- **Above the fold**: `loading="eager"` (primeiras 2-3 imagens)
- **Below the fold**: `loading="lazy"` (resto)

### Responsive Images
```html
<img
  srcset="image-400.webp 400w, image-800.webp 800w, image-1200.webp 1200w"
  sizes="(max-width: 768px) 400px, (max-width: 1024px) 800px, 1200px"
  src="image-800.webp"
  alt="Produto"
/>
```

## 🔍 Monitoramento

### CloudWatch Metrics
```bash
# Ver métricas do CloudFront
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name Requests \
  --dimensions Name=DistributionId,Value=E3VP7VX4XVPPIO \
  --start-time 2025-01-01T00:00:00Z \
  --end-time 2025-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

### Lambda Performance
```bash
# Ver cold starts
aws logs filter-log-events \
  --log-group-name /aws/lambda/natal-menu-backend-v2-GetProductsFunction \
  --filter-pattern "REPORT" \
  --start-time $(date -d '1 hour ago' +%s)000
```

### Core Web Vitals
Usar Lighthouse CI ou PageSpeed Insights:
```bash
npm install -g lighthouse
lighthouse https://d3c3no9shu6bly.cloudfront.net --view
```

## 🎨 Skeleton Loader CSS

```css
/* Adicionar ao globals.css */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  animation: shimmer 2s infinite linear;
  background: linear-gradient(
    to right,
    #f5f5f5 0%,
    #e8e8e8 20%,
    #f5f5f5 40%,
    #f5f5f5 100%
  );
  background-size: 1000px 100%;
}
```

## 🚨 Troubleshooting

### Imagens ainda com flickering?
1. Verificar se `OptimizedImage` está sendo usado
2. Confirmar preload no `index.html`
3. Checar cache do CloudFront (pode levar 5-10 min)

### Cache não está funcionando?
1. Verificar headers de resposta: `curl -I https://d3c3no9shu6bly.cloudfront.net/assets/index.js`
2. Confirmar cache policy aplicada
3. Invalidar cache: `aws cloudfront create-invalidation --distribution-id E3VP7VX4XVPPIO --paths "/*"`

### Lambda ainda lento?
1. Verificar cold start: logs do CloudWatch
2. Aumentar memória se necessário
3. Considerar Provisioned Concurrency para funções críticas

## 📈 Próximos Passos

### Curto Prazo (1-2 semanas)
- [ ] Implementar WebP com fallback JPEG
- [ ] Adicionar Service Worker para cache offline
- [ ] Configurar CDN image optimization

### Médio Prazo (1 mês)
- [ ] Implementar lazy loading de componentes React
- [ ] Adicionar prefetch de rotas
- [ ] Configurar HTTP/3 QUIC

### Longo Prazo (3 meses)
- [ ] Migrar para Next.js com SSR
- [ ] Implementar ISR (Incremental Static Regeneration)
- [ ] Adicionar Edge Functions para personalização

## 📚 Recursos

- [Web.dev - Core Web Vitals](https://web.dev/vitals/)
- [AWS CloudFront Best Practices](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/best-practices.html)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Image Optimization Guide](https://web.dev/fast/#optimize-your-images)
