import {
  Loader2,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { calculateShipping } from '../utils/shipping';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { UnifiedCheckout } from './UnifiedCheckout';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  priceValue: number;
  image: string;
  featured?: boolean;
  weight: string;
  ingredients: string[];
  tags: string[];
  deliveryOptions: string[];
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  cartTotal: number;
}

export function CartSheet({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  cartTotal,
}: CartSheetProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [shippingCEP, setShippingCEP] = useState('');
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [shippingDistance, setShippingDistance] = useState<number | null>(null);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  const totalWithShipping = cartTotal + (shippingCost || 0);

  // Detectar scroll para ocultar indicador
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (scrollTop > 50) {
      setShowScrollIndicator(false);
    } else {
      setShowScrollIndicator(true);
    }
  };

  // Formatar CEP (88010-001)
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const handleCEPChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    setShippingCEP(formatCEP(cleanCep));

    if (cleanCep.length === 8) {
      setCalculatingShipping(true);
      try {
        const result = await calculateShipping(cleanCep);

        if (result.success && result.value !== undefined) {
          setShippingCost(result.value);
          setShippingDistance(result.distance || null);
          toast.success(
            `Frete: R$ ${result.value.toFixed(2)} (${result.distance?.toFixed(
              1
            )} km)`
          );
        } else {
          setShippingCost(null);
          setShippingDistance(null);
          toast.error(result.message || 'Área fora de entrega');
        }
      } catch (error) {
        setShippingCost(null);
        setShippingDistance(null);
        toast.error('Erro ao calcular frete');
      } finally {
        setCalculatingShipping(false);
      }
    } else {
      setShippingCost(null);
      setShippingDistance(null);
    }
  };

  const handleCheckout = () => {
    if (!shippingCost) {
      toast.error('Por favor, informe o CEP para calcular o frete');
      return;
    }
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    setShippingCEP('');
    setShippingCost(null);
    setShippingDistance(null);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[400px] bg-[#fbf7e8] border-l-2 border-[#d4af37] p-0 flex flex-col h-[100vh]"
      >
        {/* Header Fixo */}
        <SheetHeader className="px-[24px] pt-[24px] pb-[16px] bg-[#5c0108] flex-shrink-0">
          <SheetTitle className="font-['Libre_Baskerville',_sans-serif] text-[#fbf7e8] text-[22px] flex items-center gap-[12px]">
            <ShoppingCart className="w-[24px] h-[24px] text-[#d4af37]" />
            Carrinho de Compras
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-[24px] text-center">
            <ShoppingCart className="w-[64px] h-[64px] text-[#d4af37] opacity-30 mb-[16px]" />
            <p className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[16px] mb-[8px]">
              Seu carrinho está vazio
            </p>
            <p className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[13px] opacity-70">
              Adicione produtos das nossas categorias especiais de Natal
            </p>
          </div>
        ) : (
          <>
            {/* Lista de Produtos com Scroll */}
            <div
              className="flex-1 overflow-y-auto overflow-x-hidden px-[24px] py-[16px] relative"
              style={{ maxHeight: 'calc(100vh - 550px)' }}
              onScroll={handleScroll}
            >
              {/* Indicador de Scroll */}
              {showScrollIndicator && cart.length > 2 && (
                <div className="sticky bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#fbf7e8] to-transparent pointer-events-none flex items-end justify-center pb-2 z-10">
                  <div className="animate-bounce text-[#5c0108] opacity-60">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              )}
              <div className="space-y-[20px]">
                {cart.map(item => (
                  <div
                    key={item.product.id}
                    className="flex gap-[12px] pb-[20px] border-b border-[#d4af37]/30"
                  >
                    {/* Product Image */}
                    <div className="w-[80px] h-[107px] rounded-[8px] overflow-hidden bg-[#f5f5f5] flex-shrink-0">
                      <ImageWithFallback
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-[8px]">
                        <h3 className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[13px] leading-[18px] pr-[8px]">
                          {item.product.name}
                        </h3>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-[#5c0108] hover:text-[#d4af37] transition-colors flex-shrink-0"
                          aria-label="Remover item"
                        >
                          <Trash2 className="w-[16px] h-[16px]" />
                        </button>
                      </div>

                      <p className="font-['Libre_Baskerville',_sans-serif] text-[#d4af37] text-[15px] mb-[12px]">
                        {item.product.price}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-[12px] mt-auto">
                        <div className="flex items-center gap-[8px] bg-white border border-[#d4af37] rounded-[8px] px-[8px] py-[4px]">
                          <button
                            onClick={() =>
                              onUpdateQuantity(
                                item.product.id,
                                item.quantity - 1
                              )
                            }
                            className="text-[#5c0108] hover:text-[#d4af37] transition-colors"
                            aria-label="Diminuir quantidade"
                          >
                            <Minus className="w-[14px] h-[14px]" />
                          </button>
                          <span className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[14px] min-w-[24px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              onUpdateQuantity(
                                item.product.id,
                                item.quantity + 1
                              )
                            }
                            className="text-[#5c0108] hover:text-[#d4af37] transition-colors"
                            aria-label="Aumentar quantidade"
                          >
                            <Plus className="w-[14px] h-[14px]" />
                          </button>
                        </div>
                        <span className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[13px]">
                          Subtotal: R${' '}
                          {(item.product.priceValue * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout Fixo no Rodapé */}
            <div className="px-[24px] pb-[24px] pt-[16px] border-t-2 border-[#d4af37] bg-[#fbf7e8] flex-shrink-0">
              <div className="mb-[20px]">
                <div className="flex justify-between items-center mb-[8px]">
                  <span className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[14px]">
                    Subtotal:
                  </span>
                  <span className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[14px]">
                    R$ {cartTotal.toFixed(2)}
                  </span>
                </div>

                {/* Campo CEP para calcular frete */}
                <div className="mb-[12px]">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-[#5c0108]" />
                    <span className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[14px]">
                      CEP de Entrega:
                    </span>
                  </div>
                  <Input
                    placeholder="00000-000"
                    value={shippingCEP}
                    onChange={e => handleCEPChange(e.target.value)}
                    maxLength={9}
                    className="text-sm border-[#d4af37]"
                    disabled={calculatingShipping}
                  />
                  {calculatingShipping && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Calculando frete...
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center mb-[12px]">
                  <span className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[14px]">
                    Frete:
                  </span>
                  <span className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[14px]">
                    {shippingCost !== null
                      ? `R$ ${shippingCost.toFixed(2)}`
                      : '-'}
                  </span>
                </div>

                {shippingDistance !== null && (
                  <p className="text-xs text-gray-600 mb-[12px] text-right">
                    Distância: {shippingDistance.toFixed(1)} km
                  </p>
                )}

                <Separator className="bg-[#d4af37] mb-[12px]" />
                <div className="flex justify-between items-center">
                  <span className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[18px]">
                    Total:
                  </span>
                  <span className="font-['Libre_Baskerville',_sans-serif] text-[#d4af37] text-[20px]">
                    R$ {totalWithShipping.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Botão Pagar Único */}
              <button
                onClick={() => handleCheckout()}
                className="w-full bg-[#5c0108] text-[#fbf7e8] rounded-[14px] px-[24px] py-[16px] transition-all hover:bg-[#D4AF37] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3)] flex items-center justify-center gap-2 font-semibold"
              >
                <span className="font-['Libre_Baskerville',_sans-serif] text-[16px]">
                  Pagar
                </span>
              </button>

              <button
                onClick={onClose}
                className="w-full mt-[12px] bg-transparent text-[#5c0108] rounded-[14px] px-[24px] py-[12px] transition-all hover:bg-[#d4af37]/10 border border-[#d4af37]"
              >
                <span className="font-['Libre_Baskerville',_sans-serif] text-[13px]">
                  Continuar Comprando
                </span>
              </button>
            </div>
          </>
        )}
      </SheetContent>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-[#fbf7e8]">
          <DialogHeader>
            <DialogTitle className="font-['Libre_Baskerville'] text-[#5c0108]">
              Finalizar Pedido
            </DialogTitle>
          </DialogHeader>

          <UnifiedCheckout
            cartItems={cart.map(item => ({
              id: item.product.id,
              name: item.product.name,
              quantity: item.quantity,
              priceValue: item.product.priceValue,
            }))}
            cartTotal={cartTotal}
            initialCEP={shippingCEP.replace(/\D/g, '')}
            initialShippingCost={shippingCost}
            onSuccess={handleCheckoutSuccess}
          />
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
