import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { createOrder, createPaymentPreference } from '../utils/awsApi';
import { consultarCEP } from '../utils/viaCep';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface MercadoPagoCheckoutProps {
  cartItems: Array<{
    id: string;
    name: string;
    priceValue: number;
    quantity: number;
  }>;
  shippingCost: number;
  onSuccess: () => void;
}

export function MercadoPagoCheckout({
  cartItems,
  shippingCost,
  onSuccess,
}: MercadoPagoCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [loadingCEP, setLoadingCEP] = useState(false);

  const handleCEPBlur = async () => {
    const cep = customerData.zipCode.replace(/\D/g, '');

    if (cep.length !== 8) {
      return;
    }

    setLoadingCEP(true);
    try {
      const result = await consultarCEP(cep);

      if (result) {
        setCustomerData(prev => ({
          ...prev,
          street: result.logradouro,
          neighborhood: result.bairro,
          city: result.localidade,
          state: result.uf,
        }));
        toast.success('Endereço preenchido automaticamente!');
      } else {
        toast.error('CEP não encontrado. Verifique e tente novamente.');
      }
    } catch (error) {
      toast.error('Erro ao buscar CEP');
    } finally {
      setLoadingCEP(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar itens do carrinho
      const invalidItems = cartItems.filter(
        item => !item.priceValue || item.priceValue <= 0
      );
      if (invalidItems.length > 0) {
        console.error('Itens inválidos no carrinho:', invalidItems);
        toast.error('Erro: Alguns itens no carrinho não têm preço válido');
        setLoading(false);
        return;
      }

      // Calcular total do carrinho + frete
      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.priceValue * item.quantity,
        0
      );
      const total = subtotal + shippingCost;

      // 1. Criar pedido
      const { order } = await createOrder({
        items: cartItems,
        customerEmail: customerData.email,
        customerName: customerData.name,
        customerPhone: customerData.phone,
        shippingAddress: {
          street: `${customerData.street}, ${customerData.number}`,
          complement: customerData.complement,
          neighborhood: customerData.neighborhood,
          city: customerData.city,
          state: customerData.state,
          zipCode: customerData.zipCode,
        },
        shippingCost: shippingCost,
      });

      // 2. Criar preferência de pagamento Mercado Pago Checkout Pro
      // Log para debug
      console.log('Criando preferência de pagamento:', {
        items: cartItems.map(item => ({
          id: item.id,
          title: item.name,
          quantity: item.quantity,
          unit_price: item.priceValue,
        })),
      });

      const preferenceData = {
        items: cartItems.map(item => ({
          id: item.id,
          title: item.name,
          quantity: item.quantity,
          unit_price: Number(item.priceValue) || 0.01, // Garantir número válido
          currency_id: 'BRL',
        })),
        payer: {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone, // Enviamos o telefone completo
        },
        backUrls: {
          success: `${window.location.origin}/checkout/success?orderId=${order.orderId}`,
          failure: `${window.location.origin}/checkout/failure?orderId=${order.orderId}`,
          pending: `${window.location.origin}/checkout/pending?orderId=${order.orderId}`,
          webhook: `${import.meta.env.VITE_AWS_API_URL}/payments/webhook`,
        },
      };

      console.log('Criando preferência de pagamento:', preferenceData);
      const response = await createPaymentPreference(preferenceData);

      // 3. Salvar dados no localStorage para recuperar depois
      localStorage.setItem(
        'mp_pending_order',
        JSON.stringify({
          orderId: order.orderId,
          customerData,
          total,
        })
      );

      // 4. Redirecionar para Mercado Pago Checkout Pro
      toast.success('Redirecionando para o pagamento...');
      window.location.href = response.initPoint;
    } catch (error: any) {
      console.error('Erro no checkout:', error);
      toast.error(
        error.message || 'Erro ao processar pedido. Tente novamente.'
      );
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {step === 1 && (
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
            type="tel"
            placeholder="Telefone"
            value={customerData.phone}
            onChange={e =>
              setCustomerData({
                ...customerData,
                phone: e.target.value.replace(/\D/g, ''),
              })
            }
            required
            pattern="[0-9]{10,11}"
            maxLength={11}
            className="border-gray-300"
            disabled={loading}
          />

          <Button
            type="button"
            onClick={() => setStep(2)}
            className="w-full bg-[#5c0108] hover:bg-[#7c1c3d] text-white"
            disabled={loading}
          >
            Continuar
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <div>
            <Input
              placeholder="CEP (ex: 88010-001)"
              value={customerData.zipCode}
              onChange={e =>
                setCustomerData({
                  ...customerData,
                  zipCode: e.target.value.replace(/\D/g, ''),
                })
              }
              onBlur={() => {
                handleCEPBlur();
                // Resetar zoom no mobile
                if (window.visualViewport) {
                  setTimeout(() => {
                    window.scrollTo(0, 0);
                    document.body.style.zoom = '1';
                  }, 100);
                }
              }}
              required
              pattern="[0-9]{8}"
              maxLength={8}
              className="border-gray-300"
              disabled={loading || loadingCEP}
            />
            {loadingCEP && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Buscando endereço...
              </p>
            )}
          </div>

          <Input
            placeholder="Rua/Logradouro"
            value={customerData.street}
            onChange={e =>
              setCustomerData({ ...customerData, street: e.target.value })
            }
            required
            className="border-gray-300"
            disabled={loading}
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Número"
              value={customerData.number}
              onChange={e =>
                setCustomerData({ ...customerData, number: e.target.value })
              }
              required
              className="border-gray-300"
              disabled={loading}
            />
            <Input
              placeholder="Complemento (opcional)"
              value={customerData.complement}
              onChange={e =>
                setCustomerData({ ...customerData, complement: e.target.value })
              }
              className="border-gray-300"
              disabled={loading}
            />
          </div>

          <Input
            placeholder="Bairro"
            value={customerData.neighborhood}
            onChange={e =>
              setCustomerData({ ...customerData, neighborhood: e.target.value })
            }
            required
            className="border-gray-300"
            disabled={loading}
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Cidade"
              value={customerData.city}
              onChange={e =>
                setCustomerData({ ...customerData, city: e.target.value })
              }
              required
              className="border-gray-300"
              disabled={loading}
            />
            <Input
              placeholder="Estado (UF)"
              value={customerData.state}
              onChange={e =>
                setCustomerData({
                  ...customerData,
                  state: e.target.value.toUpperCase(),
                })
              }
              required
              maxLength={2}
              className="border-gray-300"
              disabled={loading}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setStep(1)}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Voltar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#5c0108] hover:bg-[#7c1c3d] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Finalizar'
              )}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
