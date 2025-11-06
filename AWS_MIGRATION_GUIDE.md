# Guia de Migração para AWS

Este guia explica como migrar do Supabase para a infraestrutura AWS serverless.

## Estrutura Criada

```
aws/
├── template.yaml              # CloudFormation/SAM template
├── deploy.sh                  # Script de deploy
├── README.md                  # Documentação completa
└── lambda/
    ├── products/
    │   ├── get.js            # GET /products e /products/{categoryId}
    │   ├── create.js         # POST /products
    │   └── package.json
    ├── inventory/
    │   ├── get.js            # GET /inventory/{productId}
    │   ├── update.js         # PUT /inventory/{productId}
    │   └── package.json
    └── orders/
        ├── get.js            # GET /orders
        ├── create.js         # POST /orders
        └── package.json

src/utils/
└── awsApi.ts                 # Cliente API para frontend
```

## Passo a Passo

### 1. Instalar Dependências AWS

```bash
# AWS CLI
pip install awscli

# AWS SAM CLI
pip install aws-sam-cli

# Configurar credenciais
aws configure
```

### 2. Criar Bucket S3 para Deploy

```bash
aws s3 mb s3://natal-menu-deployment-bucket --region us-east-1
```

### 3. Deploy da Infraestrutura

```bash
cd aws
chmod +x deploy.sh
./deploy.sh sk_test_sua_stripe_secret_key
```

Isso criará:
- 3 tabelas DynamoDB
- 6 Lambda Functions
- 1 API Gateway
- Todas as permissões IAM necessárias

### 4. Obter URL da API

```bash
aws cloudformation describe-stacks \
  --stack-name natal-menu-backend \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text
```

### 5. Configurar Frontend

Adicione ao `.env.local`:
```
VITE_AWS_API_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
```

### 6. Migrar Dados Existentes

Se você tem produtos no Supabase, migre-os:

```typescript
import { getProducts as getSupabaseProducts } from './utils/api';
import { createProduct } from './utils/awsApi';

async function migrateProducts() {
  const products = await getSupabaseProducts();
  
  for (const product of products) {
    await createProduct({
      id: product.id,
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      price: product.price,
      priceValue: product.priceValue,
      image: product.image,
      weight: product.weight,
      ingredients: product.ingredients,
      tags: product.tags,
      deliveryOptions: product.deliveryOptions,
      featured: product.featured
    });
  }
  
  console.log('Migração concluída!');
}
```

### 7. Atualizar Componentes

Substitua as chamadas de API nos componentes:

**Antes (Supabase):**
```typescript
import { fetchProducts } from './utils/api';

const products = await fetchProducts(categoryId);
```

**Depois (AWS):**
```typescript
import { getProductsByCategory } from './utils/awsApi';

const products = await getProductsByCategory(categoryId);
```

### 8. Integrar Checkout com Stripe

O endpoint `POST /orders` já cria o Payment Intent:

```typescript
import { createOrder } from './utils/awsApi';
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Criar pedido
const { order, clientSecret } = await createOrder({
  items: cartItems,
  customerEmail: 'cliente@email.com',
  customerName: 'João Silva',
  shippingAddress: {
    street: 'Rua X, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01000-000'
  }
});

// Confirmar pagamento
const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      name: 'João Silva',
      email: 'cliente@email.com'
    }
  }
});

if (!error) {
  console.log('Pagamento confirmado!', order.orderId);
}
```

## Comparação de Custos

### Supabase
- Free tier: 500 MB database, 1 GB bandwidth
- Pro: $25/mês (8 GB database, 50 GB bandwidth)

### AWS (estimativa para 1000 pedidos/mês)
- DynamoDB: $1-2/mês
- Lambda: $0.50/mês
- API Gateway: $3.50/mês
- **Total: ~$5-6/mês**

## Vantagens da Migração

1. **Custo**: ~80% mais barato que Supabase Pro
2. **Escalabilidade**: Auto-scaling automático
3. **Controle**: Infraestrutura como código
4. **Integração**: Stripe integrado nas Lambda Functions
5. **Monitoramento**: CloudWatch nativo

## Rollback

Se precisar voltar para Supabase:

```bash
# Deletar stack AWS
aws cloudformation delete-stack --stack-name natal-menu-backend

# Voltar para imports antigos no código
import { fetchProducts } from './utils/api';
```

## Próximos Passos

1. **Frontend no S3 + CloudFront**
   ```bash
   npm run build
   aws s3 sync dist/ s3://natal-menu-frontend
   ```

2. **Domínio Customizado (Route 53)**
   - Registrar domínio
   - Criar certificado SSL (ACM)
   - Configurar CloudFront

3. **CI/CD (GitHub Actions)**
   - Deploy automático no push
   - Testes antes do deploy

4. **Monitoramento**
   - CloudWatch Alarms
   - X-Ray tracing
   - Cost Explorer

## Suporte

Documentação completa em `aws/README.md`

Para dúvidas:
- AWS SAM: https://docs.aws.amazon.com/serverless-application-model/
- DynamoDB: https://docs.aws.amazon.com/dynamodb/
- Lambda: https://docs.aws.amazon.com/lambda/
