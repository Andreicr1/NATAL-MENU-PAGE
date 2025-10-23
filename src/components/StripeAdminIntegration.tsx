/**
 * Exemplo de como integrar sincronização Stripe no AdminPanel
 * Adicione este código ao seu componente AdminPanel.tsx
 */

import { useState } from 'react';
import { syncProductToStripe, syncMultipleProductsToStripe } from '../utils/stripe';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

// Interface para o status de sincronização
interface SyncStatus {
  loading: boolean;
  success: boolean;
  error: string | null;
  message: string | null;
}

// Adicione este hook no seu AdminPanel component
function useStripeSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    loading: false,
    success: false,
    error: null,
    message: null,
  });

  const syncProduct = async (product: any) => {
    setSyncStatus({ loading: true, success: false, error: null, message: null });

    try {
      const result = await syncProductToStripe({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        priceValue: product.priceValue,
        image: product.image,
      });

      if (result) {
        setSyncStatus({
          loading: false,
          success: true,
          error: null,
          message: `Produto "${product.name}" sincronizado com sucesso!`,
        });
        return true;
      } else {
        throw new Error('Falha ao sincronizar produto');
      }
    } catch (error) {
      setSyncStatus({
        loading: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        message: null,
      });
      return false;
    }
  };

  const syncAllProducts = async (products: any[]) => {
    setSyncStatus({ loading: true, success: false, error: null, message: null });

    try {
      const result = await syncMultipleProductsToStripe(products);

      setSyncStatus({
        loading: false,
        success: true,
        error: null,
        message: `${result.success} produtos sincronizados com sucesso! ${
          result.failed > 0 ? `${result.failed} falharam.` : ''
        }`,
      });

      return result;
    } catch (error) {
      setSyncStatus({
        loading: false,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        message: null,
      });
      return null;
    }
  };

  const resetStatus = () => {
    setSyncStatus({ loading: false, success: false, error: null, message: null });
  };

  return {
    syncStatus,
    syncProduct,
    syncAllProducts,
    resetStatus,
  };
}

// Componente de botão de sincronização para um produto individual
export function ProductSyncButton({ product }: { product: any }) {
  const { syncStatus, syncProduct, resetStatus } = useStripeSync();

  const handleSync = async () => {
    await syncProduct(product);
    // Auto-clear status após 3 segundos
    setTimeout(resetStatus, 3000);
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSync}
        disabled={syncStatus.loading}
        variant="outline"
        size="sm"
        className="w-full"
      >
        {syncStatus.loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sincronizando...
          </>
        ) : (
          'Sincronizar com Stripe'
        )}
      </Button>

      {syncStatus.success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {syncStatus.message}
          </AlertDescription>
        </Alert>
      )}

      {syncStatus.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{syncStatus.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Componente de botão para sincronizar todos os produtos
export function BulkSyncButton({ products }: { products: any[] }) {
  const { syncStatus, syncAllProducts, resetStatus } = useStripeSync();

  const handleSyncAll = async () => {
    await syncAllProducts(products);
    // Auto-clear status após 5 segundos
    setTimeout(resetStatus, 5000);
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSyncAll}
        disabled={syncStatus.loading || products.length === 0}
        className="w-full"
      >
        {syncStatus.loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sincronizando {products.length} produtos...
          </>
        ) : (
          `Sincronizar Todos (${products.length})`
        )}
      </Button>

      {syncStatus.success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {syncStatus.message}
          </AlertDescription>
        </Alert>
      )}

      {syncStatus.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{syncStatus.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/**
 * EXEMPLO DE USO NO ADMINPANEL:
 * 
 * 1. Importar os componentes:
 * import { ProductSyncButton, BulkSyncButton } from './StripeAdminIntegration';
 * 
 * 2. No formulário de edição de produto, adicione:
 * <ProductSyncButton product={currentProduct} />
 * 
 * 3. Na lista de produtos, adicione um botão para sincronizar todos:
 * <BulkSyncButton products={allProducts} />
 * 
 * 4. Ou adicione uma seção de configuração Stripe:
 * <div className="p-4 border rounded-lg">
 *   <h3 className="font-bold mb-2">Sincronização Stripe</h3>
 *   <p className="text-sm text-gray-600 mb-4">
 *     Sincronize seus produtos com Stripe para habilitar pagamentos
 *   </p>
 *   <BulkSyncButton products={products} />
 * </div>
 */
