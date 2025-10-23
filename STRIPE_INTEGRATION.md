# 🎄 Natal Menu Page - Integração Stripe

Este projeto possui integração completa com Stripe para processamento de pagamentos seguros.

## 📦 O que foi implementado

### 1. Backend (Supabase Edge Function)
- **Arquivo**: `supabase/functions/stripe-payment/index.tsx`
- Sincronização de produtos com Stripe
- Criação de checkout sessions
- Gerenciamento de payment intents
- Processamento de webhooks
- Sistema de reembolsos

### 2. Frontend (React)
- **Componente de Checkout**: `src/components/StripeCheckout.tsx`
  - Checkout hospedado (Stripe Checkout)
  - Checkout personalizado (Stripe Elements)
- **Página de Sucesso**: `src/components/PaymentSuccess.tsx`
- **Integração no Carrinho**: `src/components/CartSheet.tsx`

### 3. Utilitários
- **API Stripe**: `src/utils/stripe.ts`
  - Funções para criar pagamentos
  - Sincronização de produtos
  - Consulta de sessões
- **Sync Script**: `src/utils/syncStripeProducts.ts`
  - Script para sincronizar produtos em lote

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
npm install
```

Pacotes instalados:
- `@stripe/stripe-js` - SDK Stripe para frontend
- `@stripe/react-stripe-js` - Componentes React Stripe
- `stripe` - SDK Stripe para backend

### 2. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env.local` e adicione suas chaves:

```bash
cp .env.example .env.local
```

Edite `.env.local`:
```bash
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_aqui
STRIPE_SECRET_KEY=sk_test_sua_chave_aqui
STRIPE_WEBHOOK_SECRET=whsec_sua_chave_aqui

# Supabase (já configurado)
VITE_SUPABASE_URL=https://mypdmnucmkigqshafrwx.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

### 3. Deploy da Edge Function

```bash
# Configurar secrets no Supabase
supabase secrets set STRIPE_SECRET_KEY=sk_test_sua_chave_aqui
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_sua_chave_aqui

# Deploy da função
supabase functions deploy stripe-payment
```

### 4. Sincronizar Produtos

Use o script de sincronização para enviar produtos para Stripe:

```typescript
import { syncAllProducts } from './src/utils/syncStripeProducts';

// Em um componente ou script
await syncAllProducts();
```

## 💳 Como Usar

### No Carrinho de Compras

O botão "Finalizar com Stripe" já está integrado no `CartSheet`:

```tsx
// Clique automaticamente redireciona para checkout Stripe
<button onClick={handleCheckout}>
  Finalizar com Stripe
</button>
```

### Checkout Personalizado

Para usar o checkout personalizado em outro lugar:

```tsx
import { StripeCheckout } from './components/StripeCheckout';

<StripeCheckout
  amount={totalAmount}
  items={[
    { id: '1', name: 'Produto', quantity: 1, price: 10.00 }
  ]}
  customerEmail="cliente@email.com"
  onSuccess={() => console.log('Pago!')}
  onCancel={() => console.log('Cancelado')}
/>
```

### Checkout Hospedado (Recomendado)

Redireciona para página de checkout do Stripe:

```tsx
import { StripeCheckoutSession } from './components/StripeCheckout';

<StripeCheckoutSession
  items={cartItems}
  customerEmail="cliente@email.com"
  onSuccess={() => window.location.href = '/success'}
  onCancel={() => console.log('Cancelado')}
/>
```

## 🧪 Testes

### Cartões de Teste

Use estes números em modo de teste:

| Cartão | Resultado |
|--------|-----------|
| `4242 4242 4242 4242` | ✅ Sucesso |
| `4000 0000 0000 0002` | ❌ Recusado |
| `4000 0025 0000 3155` | 🔐 Requer autenticação |

**Data**: Qualquer data futura  
**CVC**: Qualquer 3 dígitos  
**CEP**: Qualquer 5 dígitos

### Webhooks Locais

```bash
# Instalar Stripe CLI
scoop install stripe

# Autenticar
stripe login

# Escutar webhooks
stripe listen --forward-to https://mypdmnucmkigqshafrwx.supabase.co/functions/v1/stripe-c42493b2/webhook

# Testar eventos
stripe trigger payment_intent.succeeded
```

## 📚 Documentação Completa

Para documentação detalhada, veja:
- **[STRIPE_SETUP.md](./STRIPE_SETUP.md)** - Guia completo de configuração
- **[Stripe Docs](https://stripe.com/docs)** - Documentação oficial
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Setup do Supabase

## 🔗 Endpoints da API

### Produtos
```
POST /stripe-c42493b2/sync-product
GET  /stripe-c42493b2/products
```

### Pagamentos
```
POST /stripe-c42493b2/create-checkout-session
POST /stripe-c42493b2/create-payment-intent
GET  /stripe-c42493b2/session/:sessionId
```

### Webhooks
```
POST /stripe-c42493b2/webhook
```

### Reembolsos
```
POST /stripe-c42493b2/refund
```

## 🛠️ Estrutura de Arquivos

```
├── supabase/
│   └── functions/
│       └── stripe-payment/
│           └── index.tsx          # Edge Function principal
├── src/
│   ├── components/
│   │   ├── StripeCheckout.tsx    # Componentes de checkout
│   │   ├── PaymentSuccess.tsx    # Página de sucesso
│   │   └── CartSheet.tsx         # Carrinho integrado
│   └── utils/
│       ├── stripe.ts             # API Stripe
│       └── syncStripeProducts.ts # Script de sync
├── STRIPE_SETUP.md               # Documentação completa
└── .env.local                    # Variáveis de ambiente
```

## ⚠️ Importante

1. **Nunca commite** o arquivo `.env.local`
2. Use **chaves de teste** em desenvolvimento
3. Configure **webhooks** antes de produção
4. Sincronize **produtos** antes do primeiro uso
5. Teste com **cartões de teste** do Stripe

## 🔒 Segurança

- ✅ Chaves secretas apenas no backend
- ✅ Validação de webhooks com assinatura
- ✅ HTTPS obrigatório em produção
- ✅ Tokens seguros do Stripe Elements
- ✅ PCI compliance automático

## 📞 Suporte

- **Stripe**: [support.stripe.com](https://support.stripe.com)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Issues**: Abra uma issue no repositório

---

**Status**: ✅ Pronto para uso  
**Versão**: 1.0.0  
**Última atualização**: Outubro 2025
