# AWS Backend Infrastructure

Estrutura serverless mínima para gerenciar produtos, estoque, pedidos e pagamentos.

## Arquitetura

```
Frontend (S3 + CloudFront)
    ↓
API Gateway
    ↓
Lambda Functions
    ↓
DynamoDB + Stripe
```

## Recursos

### DynamoDB Tables
- **natal-products**: Produtos por categoria
- **natal-orders**: Pedidos com histórico
- **natal-inventory**: Controle de estoque

### Lambda Functions
- **GetProducts**: Lista produtos (todos ou por categoria)
- **CreateProduct**: Cria novo produto
- **GetInventory**: Consulta estoque
- **UpdateInventory**: Atualiza estoque (set/increment/decrement)
- **CreateOrder**: Cria pedido + Payment Intent Stripe
- **GetOrders**: Lista pedidos com filtros

## Deploy

### Pré-requisitos
```bash
# Instalar AWS SAM CLI
pip install aws-sam-cli

# Configurar AWS CLI
aws configure
```

### Criar bucket S3 para deployment
```bash
aws s3 mb s3://natal-menu-deployment-bucket --region us-east-1
```

### Deploy da infraestrutura
```bash
cd aws
chmod +x deploy.sh
./deploy.sh <sua-stripe-secret-key>
```

### Obter API URL
```bash
aws cloudformation describe-stacks \
  --stack-name natal-menu-backend \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text
```

## Configuração Frontend

Adicione ao `.env.local`:
```
VITE_AWS_API_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
```

## Uso da API

### Produtos
```typescript
import { getProducts, getProductsByCategory, createProduct } from './utils/awsApi';

// Listar todos
const products = await getProducts();

// Por categoria
const products = await getProductsByCategory('panettone');

// Criar
await createProduct({
  categoryId: 'panettone',
  name: 'Panetone Chocolate',
  description: 'Delicioso panetone',
  price: 'R$ 89,00',
  priceValue: 89,
  image: 'https://...',
  weight: '750g',
  ingredients: ['Farinha', 'Chocolate'],
  tags: [],
  deliveryOptions: ['Entrega padrão']
});
```

### Estoque
```typescript
import { getInventory, updateInventory } from './utils/awsApi';

// Consultar
const inventory = await getInventory('product-id');

// Definir quantidade
await updateInventory('product-id', 100, 'set');

// Adicionar
await updateInventory('product-id', 10, 'increment');

// Remover
await updateInventory('product-id', 5, 'decrement');
```

### Pedidos
```typescript
import { createOrder, getOrders } from './utils/awsApi';

// Criar pedido
const { order, clientSecret } = await createOrder({
  items: [
    { id: 'prod-1', name: 'Panetone', priceValue: 89, quantity: 2 }
  ],
  customerEmail: 'cliente@email.com',
  customerName: 'João Silva',
  shippingAddress: {
    street: 'Rua X',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01000-000'
  }
});

// Usar clientSecret com Stripe Elements para pagamento

// Listar pedidos
const orders = await getOrders();

// Filtrar por status
const pendingOrders = await getOrders({ status: 'pending' });

// Filtrar por data
const recentOrders = await getOrders({
  startDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
  endDate: Date.now()
});
```

## Custos Estimados

Com AWS Free Tier:
- **DynamoDB**: 25 GB armazenamento + 25 WCU/RCU grátis
- **Lambda**: 1M requisições + 400k GB-segundos grátis/mês
- **API Gateway**: 1M chamadas grátis/mês

Após Free Tier (~1000 pedidos/mês):
- DynamoDB: ~$1-2/mês
- Lambda: ~$0.50/mês
- API Gateway: ~$3.50/mês
- **Total: ~$5-6/mês**

## Monitoramento

```bash
# Logs Lambda
aws logs tail /aws/lambda/natal-menu-backend-GetProductsFunction --follow

# Métricas CloudWatch
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=natal-menu-backend-GetProductsFunction \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

## Limpeza

```bash
# Deletar stack
aws cloudformation delete-stack --stack-name natal-menu-backend

# Deletar bucket
aws s3 rb s3://natal-menu-deployment-bucket --force
```
