import React from "react";
import { ShoppingCart, Plus, Minus, X, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

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
  const handleCheckout = () => {
    // Aqui você pode implementar a lógica de checkout
    alert("Funcionalidade de checkout em desenvolvimento!");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-[400px] bg-[#fbf7e8] border-l-2 border-[#d4af37] p-0 flex flex-col"
      >
        <SheetHeader className="px-[24px] pt-[24px] pb-[16px] bg-[#5c0108]">
          <SheetTitle className="font-['Libre_Baskerville',_sans-serif] text-[#fbf7e8] text-[22px] flex items-center gap-[12px]">
            <ShoppingCart className="w-[24px] h-[24px] text-[#d4af37]" />
            Carrinho de Compras
          </SheetTitle>
          <SheetDescription className="font-['Libre_Baskerville',_sans-serif] text-[#e8d4a2] text-[13px]">
            {cart.length === 0 
              ? "Seu carrinho está vazio" 
              : `${cart.length} ${cart.length === 1 ? 'item' : 'itens'} no carrinho`}
          </SheetDescription>
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
            <ScrollArea className="flex-1 px-[24px] py-[16px]">
              <div className="space-y-[20px]">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-[12px] pb-[20px] border-b border-[#d4af37]/30">
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
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="text-[#5c0108] hover:text-[#d4af37] transition-colors"
                            aria-label="Diminuir quantidade"
                          >
                            <Minus className="w-[14px] h-[14px]" />
                          </button>
                          <span className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[14px] min-w-[24px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="text-[#5c0108] hover:text-[#d4af37] transition-colors"
                            aria-label="Aumentar quantidade"
                          >
                            <Plus className="w-[14px] h-[14px]" />
                          </button>
                        </div>
                        <span className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[13px]">
                          Subtotal: R$ {(item.product.priceValue * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Cart Summary */}
            <div className="px-[24px] pb-[24px] pt-[16px] border-t-2 border-[#d4af37] bg-[#fbf7e8]">
              <div className="mb-[20px]">
                <div className="flex justify-between items-center mb-[8px]">
                  <span className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[14px]">
                    Subtotal:
                  </span>
                  <span className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[14px]">
                    R$ {cartTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-[12px]">
                  <span className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[14px]">
                    Frete:
                  </span>
                  <span className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[14px]">
                    Calculado no checkout
                  </span>
                </div>
                <Separator className="bg-[#d4af37] mb-[12px]" />
                <div className="flex justify-between items-center">
                  <span className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[18px]">
                    Total:
                  </span>
                  <span className="font-['Libre_Baskerville',_sans-serif] text-[#d4af37] text-[20px]">
                    R$ {cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-[#5c0108] text-[#fbf7e8] rounded-[14px] px-[24px] py-[14px] transition-all hover:bg-[#D4AF37] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3)]"
              >
                <span className="font-['Libre_Baskerville',_sans-serif] text-[14px]">
                  Finalizar Pedido
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
    </Sheet>
  );
}
