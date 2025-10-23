# Configuração do Stripe

Este projeto utiliza Stripe para processar pagamentos de forma segura.

## 📋 Pré-requisitos

1. **Criar conta no Stripe:**
   - Acesse [stripe.com](https://stripe.com)
   - Crie uma nova conta ou faça login
   - Complete o processo de verificação da conta

2. **Obter chaves da API:**
   - Acesse o [Dashboard do Stripe](https://dashboard.stripe.com/test/apikeys)
   - Na seção **Developers > API keys**, você encontrará:
     - **Publishable key** (começa com `pk_test_` ou `pk_live_`)
     - **Secret key** (começa com `sk_test_` ou `sk_live_`)

## 🔧 Configuração Local

### 1. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis ao arquivo `.env.local` na raiz do projeto:

```bash
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_seu_publishable_key_aqui
STRIPE_SECRET_KEY=sk_test_seu_secret_key_aqui
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_aqui

# Existing Supabase Config
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
VITE_APP_ENV=development
```

**⚠️ Importante:** 
- Use chaves de **teste** (`pk_test_` e `sk_test_`) para desenvolvimento
- **NUNCA** commite o arquivo `.env.local` no repositório
- A `VITE_STRIPE_PUBLISHABLE_KEY` é segura para uso no frontend
- A `STRIPE_SECRET_KEY` deve ser usada **APENAS** no backend

### 2. Configurar Secrets no Supabase

No dashboard do Supabase, vá para **Edge Functions > Secrets** e adicione:

```bash
STRIPE_SECRET_KEY=sk_test_seu_secret_key_aqui
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_aqui
```

### 3. Deploy da Edge Function Stripe

```bash
# Fazer deploy da função
supabase functions deploy stripe-payment --project-ref your-project-ref
```

## 🎯 Funcionalidades

### 1. Sincronização de Produtos

A integração sincroniza automaticamente seus produtos com o Stripe:

```typescript
import { syncProductToStripe } from './utils/stripe';

// Sincronizar um produto
const result = await syncProductToStripe({
  id: 'produto-1',
  name: 'Panetone Tradicional',
  description: 'Delicioso panetone artesanal',
  price: '45.90',
  priceValue: 45.90,
  image: 'https://...'
});
```

### 2. Checkout com Stripe

Dois modos de checkout disponíveis:

#### A) Checkout Hospedado (Recomendado)
Redireciona para a página de checkout do Stripe:

```typescript
import { StripeCheckoutSession } from './components/StripeCheckout';

<StripeCheckoutSession
  items={cartItems}
  customerEmail="cliente@email.com"
  onSuccess={() => console.log('Pagamento confirmado!')}
  onCancel={() => console.log('Checkout cancelado')}
/>
```

#### B) Checkout Personalizado
Checkout integrado na sua página com Stripe Elements:

```typescript
import { StripeCheckout } from './components/StripeCheckout';

<StripeCheckout
  amount={totalAmount}
  items={cartItems}
  customerEmail="cliente@email.com"
  onSuccess={() => console.log('Pagamento confirmado!')}
  onCancel={() => console.log('Checkout cancelado')}
/>
```

### 3. Webhooks do Stripe

Os webhooks processam eventos automaticamente:

- `checkout.session.completed` - Pagamento concluído
- `payment_intent.succeeded` - Pagamento bem-sucedido
- `payment_intent.payment_failed` - Pagamento falhou
- `charge.refunded` - Reembolso processado

## 🔗 Endpoints da API

A Edge Function cria os seguintes endpoints:

### Produtos
- `POST /stripe-c42493b2/sync-product` - Sincronizar produto com Stripe
- `GET /stripe-c42493b2/products` - Listar produtos do Stripe

### Pagamentos
- `POST /stripe-c42493b2/create-checkout-session` - Criar sessão de checkout
- `POST /stripe-c42493b2/create-payment-intent` - Criar intenção de pagamento
- `GET /stripe-c42493b2/session/:sessionId` - Detalhes da sessão

### Webhooks
- `POST /stripe-c42493b2/webhook` - Receber eventos do Stripe

### Reembolsos
- `POST /stripe-c42493b2/refund` - Criar reembolso

## 🧪 Testar Localmente com Webhooks

### 1. Instalar Stripe CLI

```bash
# Windows (usando Scoop)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# macOS (usando Homebrew)
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_X.X.X_linux_x86_64.tar.gz
tar -xvf stripe_X.X.X_linux_x86_64.tar.gz
```

### 2. Autenticar

```bash
stripe login
```

### 3. Escutar Webhooks Localmente

```bash
# Aponte para sua Edge Function local
stripe listen --forward-to https://mypdmnucmkigqshafrwx.supabase.co/functions/v1/stripe-c42493b2/webhook

# Ou para desenvolvimento local
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-c42493b2/webhook
```

O CLI fornecerá um **webhook signing secret** (começa com `whsec_`). Adicione-o às variáveis de ambiente.

### 4. Testar Eventos

```bash
# Simular pagamento bem-sucedido
stripe trigger payment_intent.succeeded

# Simular checkout completo
stripe trigger checkout.session.completed
```

## 💳 Cartões de Teste

Use estes cartões para testar no modo de teste:

| Número do Cartão | Resultado |
|-----------------|-----------|
| `4242 4242 4242 4242` | Pagamento bem-sucedido |
| `4000 0000 0000 0002` | Cartão recusado |
| `4000 0000 0000 9995` | Pagamento com SCA (autenticação 3D Secure) |
| `4000 0025 0000 3155` | Requer autenticação |

- **Data de validade**: Qualquer data futura
- **CVC**: Qualquer 3 dígitos
- **CEP**: Qualquer 5 dígitos

## 🚀 Deploy para Produção

### 1. Atualizar Variáveis de Ambiente

Substitua as chaves de teste pelas chaves de produção:

```bash
# Use chaves de produção (pk_live_ e sk_live_)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_sua_chave_de_producao
STRIPE_SECRET_KEY=sk_live_sua_chave_de_producao
```

### 2. Configurar Webhooks no Dashboard

1. Acesse **Developers > Webhooks** no Dashboard do Stripe
2. Clique em **Add endpoint**
3. URL do endpoint: `https://seu-dominio.com/functions/v1/stripe-c42493b2/webhook`
4. Selecione os eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copie o **Signing secret** e adicione ao Supabase Secrets

### 3. Atualizar Secrets no Supabase

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_sua_chave_de_producao
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_de_producao
```

## 📊 Monitoramento

### Dashboard do Stripe
- Visualize transações em tempo real
- Analise métricas de receita
- Monitore fraudes e disputas

### Logs do Supabase
```bash
# Ver logs das Edge Functions
supabase functions logs stripe-payment --project-ref your-project-ref
```

## 🔒 Segurança

1. **Nunca exponha a Secret Key** no frontend
2. **Valide sempre os webhooks** usando o webhook secret
3. **Use HTTPS** em produção
4. **Configure CSP headers** adequadamente
5. **Monitore transações suspeitas** no Dashboard

## 🐛 Troubleshooting

### Erro: "Invalid API Key"
- Verifique se a chave está correta no `.env.local`
- Confirme que está usando a chave correta (teste ou produção)

### Erro: "Webhook signature verification failed"
- Verifique se o `STRIPE_WEBHOOK_SECRET` está correto
- Certifique-se de que o corpo da requisição não foi modificado

### Checkout não redireciona
- Verifique a `VITE_STRIPE_PUBLISHABLE_KEY` no frontend
- Confirme que os produtos foram sincronizados com Stripe

## 📚 Recursos Adicionais

- [Documentação Oficial do Stripe](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Elements Documentation](https://stripe.com/docs/stripe-js)
- [Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices)

## 📞 Suporte

Para problemas com:
- **Stripe**: [Stripe Support](https://support.stripe.com)
- **Supabase**: [Supabase Documentation](https://supabase.com/docs)
- **Projeto**: Abra uma issue no repositório

---

**Nota**: Esta integração segue as melhores práticas recomendadas pela Stripe e está pronta para produção após a configuração adequada das chaves e webhooks.
