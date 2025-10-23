/**
 * Script para sincronizar produtos do sistema com Stripe
 * Execute este script uma vez para sincronizar todos os produtos
 * 
 * Uso:
 * import { syncAllProducts } from './syncStripeProducts';
 * await syncAllProducts();
 */

import { syncMultipleProductsToStripe } from './stripe';

// Exemplo de produtos - substitua pelos seus produtos reais
const produtos = [
  {
    id: 'panetone-tradicional',
    name: 'Panetone Tradicional',
    description: 'Panetone artesanal com frutas cristalizadas e uvas passas',
    price: '45.90',
    priceValue: 45.90,
    image: 'https://example.com/panetone-tradicional.jpg',
  },
  {
    id: 'panetone-chocolate',
    name: 'Panetone de Chocolate',
    description: 'Panetone recheado com delicioso chocolate belga',
    price: '52.90',
    priceValue: 52.90,
    image: 'https://example.com/panetone-chocolate.jpg',
  },
  // Adicione mais produtos aqui
];

/**
 * Sincroniza todos os produtos com o Stripe
 */
export async function syncAllProducts() {
  console.log('🚀 Iniciando sincronização de produtos com Stripe...\n');

  try {
    const result = await syncMultipleProductsToStripe(produtos);

    console.log('\n✅ Sincronização concluída!');
    console.log(`   Sucesso: ${result.success} produtos`);
    console.log(`   Falhas: ${result.failed} produtos\n`);

    if (result.failed > 0) {
      console.log('❌ Produtos com falha:');
      result.results
        .filter(r => r.stripeProduct === null)
        .forEach(r => {
          console.log(`   - ${r.product.name} (${r.product.id})`);
        });
    }

    if (result.success > 0) {
      console.log('\n✨ Produtos sincronizados:');
      result.results
        .filter(r => r.stripeProduct !== null)
        .forEach(r => {
          console.log(`   - ${r.product.name}`);
          console.log(`     Stripe ID: ${r.stripeProduct?.id}`);
          console.log(`     Price ID: ${r.stripeProduct?.price_id}\n`);
        });
    }

    return result;
  } catch (error) {
    console.error('❌ Erro durante sincronização:', error);
    throw error;
  }
}

/**
 * Função auxiliar para buscar produtos do backend
 * Adapte para sua implementação
 */
export async function fetchProductsFromBackend(): Promise<any[]> {
  try {
    // Exemplo: buscar de uma API
    // const response = await fetch('/api/products');
    // return await response.json();
    
    // Por enquanto, retorna os produtos de exemplo
    return produtos;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
}

/**
 * Sincroniza produtos de todas as categorias
 */
export async function syncProductsByCategory(categoryId: string) {
  console.log(`🏷️ Sincronizando produtos da categoria: ${categoryId}\n`);

  try {
    // Buscar produtos da categoria
    const categoryProducts = produtos.filter(p => 
      p.id.startsWith(categoryId.toLowerCase())
    );

    if (categoryProducts.length === 0) {
      console.log('⚠️ Nenhum produto encontrado nesta categoria');
      return;
    }

    const result = await syncMultipleProductsToStripe(categoryProducts);

    console.log(`\n✅ Categoria sincronizada!`);
    console.log(`   Sucesso: ${result.success} produtos`);
    console.log(`   Falhas: ${result.failed} produtos`);

    return result;
  } catch (error) {
    console.error('❌ Erro ao sincronizar categoria:', error);
    throw error;
  }
}

// Se executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  syncAllProducts()
    .then(() => {
      console.log('\n🎉 Processo finalizado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Processo finalizado com erro:', error);
      process.exit(1);
    });
}
