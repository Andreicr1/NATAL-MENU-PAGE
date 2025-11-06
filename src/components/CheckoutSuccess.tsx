import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Truck, Download, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { getOrderStatus } from '../utils/awsApi';

export function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderStatus, setOrderStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('orderId') || searchParams.get('external_reference');
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  useEffect(() => {
    // Limpar carrinho após compra bem-sucedida
    localStorage.removeItem('sweetbar-cart');

    // Track conversão no Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'purchase', {
        transaction_id: orderId,
        value: searchParams.get('total'),
        currency: 'BRL'
      });
    }
  }, [orderId, searchParams]);

  // Verificar status do pagamento
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const status = await getOrderStatus(orderId);
        setOrderStatus(status);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order status:', error);
        setLoading(false);
      }
    };

    // Verificar status imediatamente
    checkPaymentStatus();

    // Verificar status a cada 5 segundos por até 2 minutos
    let attempts = 0;
    const maxAttempts = 24; // 24 * 5s = 2 minutos

    const interval = setInterval(async () => {
      attempts++;

      if (attempts >= maxAttempts || orderStatus?.paymentStatus === 'approved') {
        clearInterval(interval);
        return;
      }

      await checkPaymentStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  // Determinar se o pagamento foi aprovado
  const isPaymentApproved = orderStatus?.paymentStatus === 'approved';
  const isPending = !loading && !isPaymentApproved;

  return (
    <div className="min-h-screen bg-[#fbf7e8] flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white border-2 border-[#d4af37]">
        <CardHeader className="text-center bg-[#5c0108] text-[#fbf7e8] rounded-t-lg">
          <div className="flex justify-center mb-4">
            {loading ? (
              <Loader2 className="w-20 h-20 text-[#d4af37] animate-spin" />
            ) : (
              <CheckCircle className="w-20 h-20 text-[#d4af37]" />
            )}
          </div>
          <CardTitle className="font-['Libre_Baskerville'] text-2xl text-[#fbf7e8]">
            {loading ? 'Verificando Pagamento...' : isPaymentApproved ? 'Pagamento Confirmado!' : 'Pedido Registrado!'}
          </CardTitle>
          <CardDescription className="text-[#d4af37] text-lg">
            {loading ? 'Aguarde um momento' : isPaymentApproved ? 'Recebemos seu pagamento. Agradecemos a preferência!' : 'Aguardando confirmação do pagamento'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Banner de Confirmação para Pagamento Aprovado */}
          {isPaymentApproved && (
            <div className="bg-green-50 border-2 border-green-500 p-6 rounded-lg text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-3" />
              <h2 className="text-2xl font-['Libre_Baskerville'] text-green-800 mb-2">
                Recebemos seu pagamento
              </h2>
              <p className="text-green-700 text-lg">
                Agradecemos a preferência!
              </p>
            </div>
          )}

          {/* Informações do Pedido */}
          <div className="bg-[#fbf7e8] p-4 rounded-lg border border-[#d4af37]">
            <h3 className="font-['Libre_Baskerville'] text-[#5c0108] text-lg mb-3">
              Detalhes do Pedido
            </h3>

            <div className="space-y-2 text-sm">
              {orderId && (
                <div className="flex justify-between">
                  <span className="text-[#5c0108] font-semibold">Número do Pedido:</span>
                  <span className="text-[#5c0108] font-mono">{orderId}</span>
                </div>
              )}

              {(paymentId || orderStatus?.paymentId) && (
                <div className="flex justify-between">
                  <span className="text-[#5c0108] font-semibold">ID do Pagamento:</span>
                  <span className="text-[#5c0108] font-mono">{paymentId || orderStatus?.paymentId}</span>
                </div>
              )}

              {orderStatus?.paymentStatus && (
                <div className="flex justify-between">
                  <span className="text-[#5c0108] font-semibold">Status do Pagamento:</span>
                  <span className={`font-semibold capitalize ${
                    orderStatus.paymentStatus === 'approved' ? 'text-green-600' :
                    orderStatus.paymentStatus === 'pending' ? 'text-yellow-600' :
                    'text-[#d4af37]'
                  }`}>
                    {orderStatus.paymentStatus === 'approved' ? 'Aprovado' :
                     orderStatus.paymentStatus === 'pending' ? 'Pendente' :
                     orderStatus.paymentStatus}
                  </span>
                </div>
              )}

              {orderStatus?.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-[#5c0108] font-semibold">Forma de Pagamento:</span>
                  <span className="text-[#5c0108] capitalize">{orderStatus.paymentMethod}</span>
                </div>
              )}
            </div>
          </div>

          {/* Próximos Passos */}
          <div className="space-y-4">
            <h3 className="font-['Libre_Baskerville'] text-[#5c0108] text-lg">
              Próximos Passos
            </h3>

            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <Package className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-[#5c0108]">Confirmação por E-mail</p>
                  <p className="text-sm text-gray-600">
                    {isPaymentApproved
                      ? 'Você receberá um e-mail confirmando o pagamento e os detalhes do seu pedido.'
                      : 'Assim que o pagamento for confirmado, você receberá um e-mail com todos os detalhes.'}
                  </p>
                </div>
              </div>

              {isPaymentApproved && (
                <div className="flex gap-3 items-start">
                  <Truck className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-[#5c0108]">Preparação e Envio</p>
                    <p className="text-sm text-gray-600">
                      Seu pedido será preparado com cuidado e enviado em até 2 dias úteis.
                    </p>
                  </div>
                </div>
              )}

              {isPaymentApproved && (
                <div className="flex gap-3 items-start">
                  <Download className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-[#5c0108]">Acompanhamento</p>
                    <p className="text-sm text-gray-600">
                      Em breve você receberá o código de rastreamento.
                    </p>
                  </div>
                </div>
              )}

              {isPending && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Atenção:</strong> Seu pagamento ainda está sendo processado.
                    Você receberá uma confirmação assim que ele for aprovado.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Mensagem Especial */}
          <div className="bg-[#5c0108] text-[#fbf7e8] p-4 rounded-lg text-center">
            <p className="font-['Libre_Baskerville'] italic">
              "Desejamos um Feliz Natal repleto de doçura e alegria!"
            </p>
            <p className="text-[#d4af37] text-sm mt-2">
              - Equipe Sweet Bar
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate('/')}
              className="flex-1 bg-[#5c0108] hover:bg-[#7c1c3d] text-[#fbf7e8]"
            >
              Voltar à Loja
            </Button>

            <Button
              onClick={() => window.print()}
              variant="outline"
              className="flex-1 border-[#d4af37] text-[#5c0108] hover:bg-[#fbf7e8]"
            >
              Imprimir Comprovante
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
