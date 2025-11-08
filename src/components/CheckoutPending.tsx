import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, Mail, Smartphone, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function CheckoutPending() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get('orderId') || searchParams.get('external_reference');
  const paymentId = searchParams.get('payment_id');
  const paymentType = searchParams.get('payment_type');

  useEffect(() => {
    // Track evento de pending no Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'payment_pending', {
        transaction_id: orderId,
        payment_type: paymentType
      });
    }
  }, [orderId, paymentType]);

  return (
    <div className="min-h-screen bg-[#fbf7e8] flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white border-2 border-[#d4af37]">
        <CardHeader className="text-center bg-[#5c0108] text-[#fbf7e8] rounded-t-lg">
          <div className="flex justify-center mb-4">
            <Clock className="w-20 h-20 text-yellow-400 animate-pulse" />
          </div>
          <CardTitle className="font-['Libre_Baskerville'] text-2xl text-[#fbf7e8]">
            Pagamento Pendente
          </CardTitle>
          <CardDescription className="text-[#d4af37] text-lg">
            Aguardando confirmação do pagamento
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Status do Pedido */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-['Libre_Baskerville'] text-yellow-800 text-lg mb-3">
              Status do Seu Pedido
            </h3>

            <p className="text-sm text-yellow-700 mb-4">
              Seu pedido foi registrado com sucesso, mas o pagamento ainda está sendo processado.
            </p>

            {paymentType === 'pix' && (
              <div className="bg-green-50 border border-green-200 p-3 rounded mb-4">
                <p className="text-green-800 text-sm font-medium">
                  ✅ Se você já pagou o PIX, aguarde alguns minutos para a confirmação automática.
                </p>
              </div>
            )}

            {(orderId || paymentId) && (
              <div className="space-y-2 text-sm bg-white p-3 rounded border border-yellow-200">
                {orderId && (
                  <div className="flex justify-between">
                    <span className="text-yellow-700 font-semibold">Número do Pedido:</span>
                    <span className="text-yellow-900 font-mono">{orderId}</span>
                  </div>
                )}

                {paymentId && (
                  <div className="flex justify-between">
                    <span className="text-yellow-700 font-semibold">ID do Pagamento:</span>
                    <span className="text-yellow-900 font-mono">{paymentId}</span>
                  </div>
                )}

                {paymentType && (
                  <div className="flex justify-between">
                    <span className="text-yellow-700 font-semibold">Forma de Pagamento:</span>
                    <span className="text-yellow-900 capitalize">{paymentType}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Informações sobre o que fazer */}
          <div className="bg-[#fbf7e8] p-4 rounded-lg border border-[#d4af37]">
            <h3 className="font-['Libre_Baskerville'] text-[#5c0108] text-lg mb-3">
              O que acontece agora?
            </h3>

            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <Mail className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-[#5c0108]">Confirmaremos por E-mail</p>
                  <p className="text-sm text-gray-600">
                    Assim que o pagamento for confirmado, você receberá um e-mail com todos os detalhes.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Smartphone className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-[#5c0108]">Notificação no Celular</p>
                  <p className="text-sm text-gray-600">
                    Se pagou pelo app do Mercado Pago, receberá uma notificação.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <FileText className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-[#5c0108]">Boleto ou Pix</p>
                  <p className="text-sm text-gray-600">
                    Se escolheu boleto ou Pix, complete o pagamento através do app ou e-mail recebido.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tempo de Processamento */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-['Libre_Baskerville'] text-blue-800 text-lg mb-2">
              Tempo de Confirmação
            </h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span><strong>Pix:</strong> até 10 minutos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span><strong>Cartão de crédito:</strong> até 48 horas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span><strong>Boleto:</strong> até 3 dias úteis após pagamento</span>
              </li>
            </ul>
          </div>

          {/* Mensagem de Tranquilidade */}
          <div className="bg-[#5c0108] text-[#fbf7e8] p-4 rounded-lg text-center">
            <p className="font-['Libre_Baskerville'] italic">
              "Fique tranquilo! Seu pedido está reservado e aguardando confirmação do pagamento."
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
              onClick={() => window.open('https://wa.me/5548991960811', '_blank')}
              variant="outline"
              className="flex-1 border-[#d4af37] text-[#5c0108] hover:bg-[#fbf7e8]"
            >
              Falar com Suporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
