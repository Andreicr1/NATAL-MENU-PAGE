import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inicializar Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

/**
 * Busca produtos do Stripe e salva no Supabase
 * Execute este script periodicamente ou via webhook
 */
export async function syncProductsFromStripe() {
  try {
    // 1. Buscar produtos do Stripe via Edge Function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-c42493b2/products`,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Falha ao buscar produtos do Stripe');
    }

    const stripeProducts = await response.json();

    // 2. Processar e salvar no Supabase
    for (const product of stripeProducts.data) {
      const price = product.default_price;
      
      // Converter para formato do seu app
      const productData = {
        stripe_product_id: product.id,
        stripe_price_id: price?.id,
        name: product.name,
        description: product.description || '',
        price_value: price ? price.unit_amount / 100 : 0, // Converter de centavos
        price: price ? `R$ ${(price.unit_amount / 100).toFixed(2)}` : 'R$ 0,00',
        image: product.images?.[0] || '',
        active: product.active,
        metadata: product.metadata, // Tags, categoria, etc.
        updated_at: new Date().toISOString(),
      };

      // 3. Upsert no Supabase (inserir ou atualizar)
      const { error } = await supabase
        .from('products')
        .upsert(productData, {
          onConflict: 'stripe_product_id',
        });

      if (error) {
        console.error(`Erro ao sincronizar produto ${product.name}:`, error);
      } else {
        console.log(`✅ Produto sincronizado: ${product.name}`);
      }
    }

    console.log('🎉 Sincronização completa!');
    return { success: true, count: stripeProducts.data.length };
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    return { success: false, error };
  }
}

/**
 * Hook React para sincronizar produtos
 */
export function useSyncProducts() {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sync = async () => {
    setSyncing(true);
    setError(null);

    const result = await syncProductsFromStripe();

    if (!result.success) {
      setError('Falha ao sincronizar produtos');
    }

    setSyncing(false);
    return result;
  };

  return { sync, syncing, error };
}
