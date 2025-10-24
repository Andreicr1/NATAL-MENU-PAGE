# 🔄 Sincronização de Produtos: Stripe ↔ Frontend

## Estratégias de Sincronização

### **Opção 1: Stripe como Fonte Única (Recomendado para E-commerce)**

#### 1️⃣ Criar Tabela no Supabase

Execute no SQL Editor do Supabase:

```sql
-- Criar tabela de produtos sincronizada com Stripe
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_product_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  price_value DECIMAL(10, 2) NOT NULL,
  price TEXT NOT NULL,
  image TEXT,
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  weight TEXT,
  category TEXT,
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_products_stripe_id ON products(stripe_product_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_category ON products(category);

-- RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler produtos ativos
CREATE POLICY "Produtos ativos são públicos"
  ON products FOR SELECT
  USING (active = true);

-- Política: Apenas autenticados podem inserir/atualizar
CREATE POLICY "Autenticados podem gerenciar produtos"
  ON products FOR ALL
  USING (auth.role() = 'authenticated');
```

#### 2️⃣ Sincronização Automática

**No Admin Panel**, adicione um botão de sincronização:

```tsx
import { useSyncProducts } from '../utils/syncProductsFromStripe';

function AdminPanel() {
  const { sync, syncing, error } = useSyncProducts();

  return (
    <div>
      <button 
        onClick={sync} 
        disabled={syncing}
        className="bg-[#5c0108] text-white px-6 py-3 rounded-lg"
      >
        {syncing ? 'Sincronizando...' : '🔄 Sincronizar Produtos do Stripe'}
      </button>
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
```

#### 3️⃣ Criar Produtos no Stripe Dashboard

1. Acesse [dashboard.stripe.com/products](https://dashboard.stripe.com/products)
2. Clique em **"+ Add product"**
3. Preencha:
   - **Name**: Nome do produto (ex: "Panetone Tradicional")
   - **Description**: Descrição detalhada
   - **Image**: Upload da imagem
   - **Price**: Valor em R$ (ex: 45.00)
   - **Metadata** (adicione campos customizados):
     ```
     category: panetones
     weight: 500g
     featured: true
     tags: natal,tradicional,artesanal
     ```

4. Clique em **"Save product"**

#### 4️⃣ Sincronizar para o Frontend

No Admin Panel, clique no botão "Sincronizar Produtos".

#### 5️⃣ Usar Produtos no Frontend

```tsx
// Em CategoryPage.tsx ou similar
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';

export function CategoryPage({ category }: { category: string }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [category]);

  async function loadProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .eq('category', category)
      .order('name');

    if (data) {
      setProducts(data);
    }
    setLoading(false);
  }

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="grid grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

### **Opção 2: Produtos Locais + Sincronizar Preços do Stripe**

Se você já tem produtos definidos localmente (como em `data/products.ts`), pode apenas sincronizar os preços:

```tsx
// src/utils/syncPricesFromStripe.ts
export async function syncPricesFromStripe(localProducts: Product[]) {
  for (const product of localProducts) {
    // Se o produto tem stripe_price_id, buscar preço atualizado
    if (product.stripe_price_id) {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/stripe-c42493b2/products`,
        {
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      const stripeProducts = await response.json();
      const stripeProduct = stripeProducts.data.find(
        (p: any) => p.default_price.id === product.stripe_price_id
      );

      if (stripeProduct) {
        product.priceValue = stripeProduct.default_price.unit_amount / 100;
        product.price = `R$ ${product.priceValue.toFixed(2)}`;
      }
    }
  }
  
  return localProducts;
}
```

---

### **Opção 3: Webhook Automático (Mais Avançado)**

Configure um webhook no Stripe para sincronizar automaticamente quando produtos mudarem:

1. **No Stripe Dashboard** → **Developers** → **Webhooks**
2. **Add endpoint**: `https://mypdmnucmkigqshafrwx.supabase.co/functions/v1/stripe-c42493b2/webhook`
3. **Select events**:
   - `product.created`
   - `product.updated`
   - `product.deleted`
   - `price.created`
   - `price.updated`

4. **Na Edge Function** (`stripe-payment/index.ts`), adicione handlers:

```typescript
// No webhook handler
case 'product.created':
case 'product.updated':
  const product = event.data.object as Stripe.Product;
  await supabase.from('products').upsert({
    stripe_product_id: product.id,
    name: product.name,
    description: product.description,
    image: product.images[0],
    active: product.active,
    metadata: product.metadata,
  });
  break;

case 'product.deleted':
  await supabase.from('products')
    .update({ active: false })
    .eq('stripe_product_id', event.data.object.id);
  break;
```

---

## 🎯 Fluxo Recomendado

```
1. Criar produto no Stripe Dashboard
   ↓
2. Adicionar metadata (categoria, tags, peso)
   ↓
3. Clicar em "Sincronizar" no Admin Panel
   ↓
4. Produtos aparecem automaticamente no frontend
   ↓
5. Usuário adiciona ao carrinho
   ↓
6. Checkout usa o stripe_price_id correto
```

---

## 🔧 Resolver Erro de CORS

O erro que você está vendo é porque a Edge Function precisa de CORS habilitado. Já está implementado no código, mas certifique-se de que está deployado:

```powershell
npx supabase functions deploy stripe-payment
```

E que as variáveis de ambiente estão configuradas no Supabase Dashboard:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

---

## 📝 Resumo Rápido

**Para começar agora:**

1. Execute o SQL acima no Supabase
2. Crie 2-3 produtos de teste no Stripe Dashboard
3. Use o botão de sincronização no Admin Panel
4. Os produtos aparecerão automaticamente no frontend

**Dúvidas?** Consulte `STRIPE_SETUP.md` para mais detalhes!
