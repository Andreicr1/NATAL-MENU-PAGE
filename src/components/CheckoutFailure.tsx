import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCw, Home, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function CheckoutFailure() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get('orderId') || searchParams.get('external_reference');
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  return (
    <div className="min-h-screen bg-[#fbf7e8] flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white border-2 border-[#d4af37]">
        <CardHeader className="text-center bg-[#5c0108] text-[#fbf7e8] rounded-t-lg">
          <div className="flex justify-center mb-4">
            <XCircle className="w-20 h-20 text-red-400" />
          </div>
          <CardTitle className="font-['Libre_Baskerville'] text-2xl text-[#fbf7e8]">
            Pagamento Não Aprovado
          </CardTitle>
          <CardDescription className="text-[#d4af37] text-lg">
            Não foi possível processar seu pagamento
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Informações do Problema */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-['Libre_Baskerville'] text-red-800 text-lg mb-3">
              O que aconteceu?
            </h3>

            <p className="text-sm text-red-700 mb-4">
              Seu pagamento não foi aprovado. Isso pode acontecer por diversos motivos:
            </p>

            <ul className="space-y-2 text-sm text-red-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>Saldo insuficiente na conta</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>Limite do cartão excedido</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>Dados do cartão incorretos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>Problema temporário com o banco</span>
              </li>
            </ul>

            {(orderId || paymentId) && (
              <div className="mt-4 pt-4 border-t border-red-200">
                <p className="text-xs text-red-600">
                  {orderId && `Referência: ${orderId}`}
                  {paymentId && ` | ID: ${paymentId}`}
                </p>
              </div>
            )}
          </div>

          {/* Sugestões */}
          <div className="bg-[#fbf7e8] p-4 rounded-lg border border-[#d4af37]">
            <h3 className="font-['Libre_Baskerville'] text-[#5c0108] text-lg mb-3">
              O que fazer agora?
            </h3>

            <div className="space-y-3 text-sm text-[#5c0108]">
              <div className="flex gap-3 items-start">
                <RefreshCw className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Tente novamente</p>
                  <p className="text-gray-600">
                    Verifique seus dados e tente realizar o pagamento novamente
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <MessageCircle className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Entre em contato</p>
                  <p className="text-gray-600">
                    Nossa equipe pode ajudar você a concluir a compra
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Home className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Método alternativo</p>
                  <p className="text-gray-600">
                    Tente usar outro cartão ou forma de pagamento
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate('/')}
              className="flex-1 bg-[#5c0108] hover:bg-[#7c1c3d] text-[#fbf7e8]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>

            <Button
              onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
              variant="outline"
              className="flex-1 border-[#d4af37] text-[#5c0108] hover:bg-[#fbf7e8]"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Falar com Suporte
            </Button>
          </div>

          {/* Nota de Ajuda */}
          <div className="text-center text-sm text-gray-500">
            <p>
              Seus itens continuam no carrinho. Nenhum valor foi cobrado.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
