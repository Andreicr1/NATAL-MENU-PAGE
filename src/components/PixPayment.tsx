import { Check, Copy, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { createOrder } from '../utils/awsApi';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';

interface PixPaymentProps {
  cartItems: Array<{
    id: string;
    name: string;
    priceValue: number;
    quantity: number;
  }>;
  shippingCost: number;
  onSuccess: () => void;
}

export function PixPayment({ cartItems, shippingCost, onSuccess }: PixPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: dados, 2: QR Code
  const [copied, setCopied] = useState(false);
  const [pixData, setPixData] = useState<{
    qr_code: string;
    qr_code_base64: string;
    ticket_url?: string;
    paymentId: string;
  } | null>(null);

  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
  });

  // Total dos produtos
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.priceValue * item.quantity,
    0
  );

  // Total com frete
  const total = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar itens
      const invalidItems = cartItems.filter(
        item => !item.priceValue || item.priceValue <= 0
      );
      if (invalidItems.length > 0) {
        toast.error('Erro: Alguns itens no carrinho não têm preço válido');
        setLoading(false);
        return;
      }

      // 1. Criar pedido
      const { order } = await createOrder({
        items: cartItems,
        customerEmail: customerData.email,
        customerName: customerData.name,
        customerPhone: customerData.phone,
        shippingAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
        },
        shippingCost: shippingCost,
      });

      // 2. Criar pagamento PIX
      const response = await fetch(
        `${import.meta.env.VITE_AWS_API_URL}/payments/pix`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction_amount: total,
            description: `Pedido Sweet Bar #${order.orderId}`,
            payer: {
              email: customerData.email,
              name: customerData.name,
              identification: {
                type: 'CPF',
                number: customerData.cpf.replace(/\D/g, ''),
              },
            },
            external_reference: order.orderId,
            notification_url: `${
              import.meta.env.VITE_AWS_API_URL
            }/payments/webhook`,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar pagamento PIX');
      }

      const pixResult = await response.json();

      // 3. Salvar dados do PIX
      setPixData({
        qr_code: pixResult.qr_code,
        qr_code_base64: pixResult.qr_code_base64,
        ticket_url: pixResult.ticket_url,
        paymentId: pixResult.id,
      });

      // 4. Salvar no localStorage
      localStorage.setItem(
        'pix_pending_payment',
        JSON.stringify({
          orderId: order.orderId,
          paymentId: pixResult.id,
          customerData,
          total,
        })
      );

      // 5. Avançar para tela de QR Code
      setStep(2);
      setLoading(false);

      // 6. Iniciar polling para verificar pagamento
      startPaymentPolling(pixResult.id);
    } catch (error: any) {
      console.error('Erro ao criar pagamento PIX:', error);
      toast.error(error.message || 'Erro ao processar pagamento PIX');
      setLoading(false);
    }
  };

  const startPaymentPolling = (paymentId: string) => {
    const checkPayment = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_AWS_API_URL}/payments/${paymentId}`
        );
        const payment = await response.json();

        if (payment.status === 'approved') {
          toast.success('Pagamento aprovado! 🎉');
          localStorage.removeItem('pix_pending_payment');
          onSuccess();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
        return false;
      }
    };

    // Verificar a cada 3 segundos por até 10 minutos
    const interval = setInterval(async () => {
      const approved = await checkPayment();
      if (approved) {
        clearInterval(interval);
      }
    }, 3000);

    // Limpar após 10 minutos
    setTimeout(() => clearInterval(interval), 600000);
  };

  const copyToClipboard = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (step === 2 && pixData) {
    return (
      <div className="space-y-4">
        {/* QR Code */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col items-center">
          <img
            src={`data:image/jpeg;base64,${pixData.qr_code_base64}`}
            alt="QR Code PIX"
            className="w-64 h-64 mb-4"
          />
          <p className="text-2xl font-bold text-[#5c0108]">
            R$ {total.toFixed(2)}
          </p>
        </div>

        {/* Copiar e Colar */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Código PIX:</p>
          <div className="flex gap-2">
            <Input
              value={pixData.qr_code}
              readOnly
              className="text-xs font-mono bg-white"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Aguardando confirmação do pagamento
          </p>
          <p className="text-xs text-gray-400 mt-3">
            Beneficiário: Oksana Vasilchenko
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <Input
          placeholder="Nome completo"
          value={customerData.name}
          onChange={e =>
            setCustomerData({ ...customerData, name: e.target.value })
          }
          required
          className="border-gray-300"
          disabled={loading}
        />

        <Input
          type="email"
          placeholder="Email"
          value={customerData.email}
          onChange={e =>
            setCustomerData({ ...customerData, email: e.target.value })
          }
          required
          className="border-gray-300"
          disabled={loading}
        />

        <Input
          placeholder="CPF"
          value={customerData.cpf}
          onChange={e =>
            setCustomerData({
              ...customerData,
              cpf: e.target.value.replace(/\D/g, ''),
            })
          }
          required
          pattern="[0-9]{11}"
          maxLength={11}
          className="border-gray-300"
          disabled={loading}
        />

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-gray-900">R$ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Frete:</span>
            <span className="text-gray-900">R$ {shippingCost.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm font-semibold text-gray-700">Total a pagar:</span>
            <span className="text-xl font-bold text-[#5c0108]">R$ {total.toFixed(2)}</span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#5c0108] hover:bg-[#7c1c3d] text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            'Continuar'
          )}
        </Button>
      </div>
    </form>
  );
}
