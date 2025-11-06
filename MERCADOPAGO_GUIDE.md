# Guia Mercado Pago - Integração AWS

## 🎯 Estrutura Criada

### Lambda Functions de Pagamento
```
aws/lambda/payments/
├── create-preference.js    # POST /payments/preference
├── webhook.js             # POST /payments/webhook
├── get-payment.js         # GET /payments/{paymentId}
└── package.json
```

### Frontend
```
src/
├── utils/awsApi.ts                    # Funções MP integradas
└── components/MercadoPagoCheckout.tsx # Componente checkout
```

## 🚀 Setup Rápido

### 1. Obter Credenciais Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers
2. Crie uma aplicação
3. Copie o **Access Token** (produção ou teste)

### 2. Deploy com Mercado Pago

```bash
cd aws
./deploy.sh APP_USR-seu-access-token-aqui
```

### 3. Configurar Frontend

```bash
# .env.local
VITE_AWS_API_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
```

## 💳 Fluxo de Pagamento

### 1. Cliente finaliza pedido
```typescript
import { MercadoPagoCheckout } from './components/MercadoPagoCheckout';

<MercadoPagoCheckout
  cartItems={[
    { id: 'prod-1', name: 'Panetone', priceValue: 89, quantity: 2 }
  ]}
  onSuccess={() => console.log('Pedido criado!')}
/>
```

### 2. Sistema cria pedido + preferência MP
```typescript
// 1. Cria pedido no DynamoDB
const { order } = await createOrder({
  items: cartItems,
  customerEmail: 'cliente@email.com',
  customerName: 'João Silva',
  shippingAddress: { ... }
});

// 2. Cria preferência de pagamento
const { initPoint } = await createPaymentPreference({
  items: cartItems,
  payer: { name: 'João Silva', email: 'cliente@email.com' }
});

// 3. Redireciona para Mercado Pago
window.location.href = initPoint;
```

### 3. Cliente paga no Mercado Pago
- Cartão de crédito
- PIX
- Boleto
- Saldo Mercado Pago

### 4. Webhook atualiza status
```javascript
// Mercado Pago notifica: POST /payments/webhook
// Lambda atualiza pedido automaticamente
{
  "orderId": "order-123",
  "paymentStatus": "approved", // ou "pending", "rejected"
  "paymentId": "12345678"
}
```

## 📊 Status de Pagamento

| Status MP | Descrição |
|-----------|-----------|
| `approved` | Pagamento aprovado |
| `pending` | Aguardando pagamento (PIX/Boleto) |
| `in_process` | Em análise |
| `rejected` | Rejeitado |
| `cancelled` | Cancelado |
| `refunded` | Estornado |

## 🔍 Consultar Pagamento

```typescript
import { getPaymentStatus } from './utils/awsApi';

const payment = await getPaymentStatus('12345678');
console.log(payment.status); // approved, pending, etc
```

## 🧪 Testar com Sandbox

### Credenciais de Teste
```
Access Token: TEST-xxxxx (começa com TEST-)
```

### Cartões de Teste
```
Aprovado:
  Número: 5031 4332 1540 6351
  CVV: 123
  Validade: 11/25

Rejeitado:
  Número: 5031 4332 1540 6351
  CVV: 123
  Validade: 11/25
  (usar nome "APRO" para aprovar, "OTHE" para rejeitar)
```

### PIX de Teste
- Use CPF: 12345678909
- Simule pagamento no painel do Mercado Pago

## 🔔 Configurar Webhook

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Vá em "Webhooks"
3. Adicione URL: `https://sua-api.amazonaws.com/prod/payments/webhook`
4. Selecione eventos: `payment`

## 💰 Taxas Mercado Pago

### Cartão de Crédito
- À vista: 4,99% + R$ 0,39
- Parcelado: 5,99% + R$ 0,39

### PIX
- 0,99% (sem taxa fixa)

### Boleto
- R$ 3,49 por boleto

## 🎨 Personalizar Checkout

```typescript
const { initPoint } = await createPaymentPreference({
  items: cartItems,
  payer: { name: 'João', email: 'joao@email.com' },
  backUrls: {
    success: 'https://seusite.com/sucesso',
    failure: 'https://seusite.com/erro',
    pending: 'https://seusite.com/pendente'
  }
});
```

## 📱 Páginas de Retorno

### Success Page
```typescript
// src/pages/Success.tsx
import { useSearchParams } from 'react-router-dom';
import { getPaymentStatus } from '../utils/awsApi';

export function Success() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');
  const paymentId = params.get('payment_id');
  
  // Verificar status do pagamento
  const payment = await getPaymentStatus(paymentId);
  
  return (
    <div>
      <h1>Pedido #{orderId}</h1>
      <p>Status: {payment.status}</p>
    </div>
  );
}
```

## 🔐 Segurança

### Validar Webhook
```javascript
// Lambda webhook.js já valida automaticamente
// Mercado Pago envia header x-signature
```

### Variáveis de Ambiente
```bash
# Nunca commitar access token!
# Usar AWS Secrets Manager em produção
aws secretsmanager create-secret \
  --name mercadopago-token \
  --secret-string "APP_USR-xxxxx"
```

## 📈 Monitoramento

### Ver logs do webhook
```bash
aws logs tail /aws/lambda/natal-menu-backend-PaymentWebhookFunction --follow
```

### Verificar pagamentos no painel
https://www.mercadopago.com.br/activities

## 🆘 Troubleshooting

**Webhook não recebe notificações**
- Verifique URL no painel MP
- Confirme que API está pública
- Veja logs: `aws logs tail /aws/lambda/...`

**Pagamento aprovado mas pedido não atualiza**
- Verifique webhook configurado
- Veja logs da Lambda webhook
- Confirme external_reference no pedido

**Erro ao criar preferência**
- Valide Access Token
- Confirme que items têm priceValue numérico
- Veja logs: `npm run aws:logs`

## 🔄 Migração Stripe → Mercado Pago

| Stripe | Mercado Pago |
|--------|--------------|
| Payment Intent | Preference |
| Client Secret | Init Point |
| Webhook Events | Notifications |
| confirmCardPayment() | Redirect to initPoint |

## 📚 Documentação Oficial

- API: https://www.mercadopago.com.br/developers/pt/reference
- Webhooks: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
- Checkout Pro: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/landing

---

**Pronto para receber pagamentos! 💚💛**
