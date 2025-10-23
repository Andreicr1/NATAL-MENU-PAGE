import React, { useEffect, useState } from 'react';
import { CheckCircle2, Package, Home } from 'lucide-react';
import { Button } from '../components/ui/button';
import { getCheckoutSession } from '../utils/stripe';

export function PaymentSuccess() {
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get session ID from URL
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (sessionId) {
      loadSessionData(sessionId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadSessionData = async (sessionId: string) => {
    try {
      const data = await getCheckoutSession(sessionId);
      setSessionData(data);
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf7e8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5c0108] mx-auto mb-4"></div>
          <p className="font-['Libre_Baskerville'] text-[#5c0108]">
            Verificando pagamento...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf7e8] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center border-2 border-[#d4af37]">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="font-['Libre_Baskerville'] text-[28px] text-[#5c0108] mb-2">
            Pagamento Confirmado!
          </h1>
          <p className="text-gray-600 mb-4">
            Obrigado pela sua compra. Seu pedido foi confirmado com sucesso.
          </p>
        </div>

        {sessionData && (
          <div className="bg-[#fbf7e8] rounded-lg p-4 mb-6 text-left">
            <h2 className="font-['Libre_Baskerville'] text-[16px] text-[#5c0108] mb-3">
              Detalhes do Pedido
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ID da Transação:</span>
                <span className="font-mono text-xs text-gray-800">
                  {sessionData.id.slice(0, 20)}...
                </span>
              </div>
              {sessionData.customer_email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="text-gray-800">{sessionData.customer_email}</span>
                </div>
              )}
              {sessionData.amount_total && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-['Libre_Baskerville'] text-[#d4af37] font-semibold">
                    R$ {(sessionData.amount_total / 100).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-semibold">Pago</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Próximos Passos
                </h3>
                <p className="text-sm text-blue-800">
                  Enviamos um email de confirmação com todos os detalhes do seu pedido.
                  Você receberá atualizações sobre o status da entrega.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => window.location.href = '/'}
            className="w-full bg-[#5c0108] hover:bg-[#7a0109] text-white"
          >
            <Home className="mr-2 h-4 w-4" />
            Voltar para a Página Inicial
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Precisa de ajuda? Entre em contato com nosso suporte.
        </p>
      </div>
    </div>
  );
}
