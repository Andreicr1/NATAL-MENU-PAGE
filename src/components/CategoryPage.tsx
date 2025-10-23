import { ShoppingCart, Menu, ArrowLeft } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

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

interface CategoryPageProps {
  categoryName: string;
  storyPreview: string;
  products: Product[];
  onReadMore: () => void;
  onAddToCart: (product: Product) => void;
  onBack: () => void;
  cartItemCount?: number;
  onOpenCart?: () => void;
}

export function CategoryPage({ 
  categoryName, 
  storyPreview, 
  products, 
  onReadMore, 
  onAddToCart, 
  onBack,
  cartItemCount = 0,
  onOpenCart
}: CategoryPageProps) {
  return (
    <div className="bg-[#fbf7e8] min-h-screen w-full">
      {/* Header */}
      <header className="bg-[#5c0108] h-[95px] flex items-center justify-center relative">
        <button
          onClick={onBack}
          className="absolute left-[16px] text-[#d4af37] hover:text-[#e8d4a2] transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-[24px] h-[24px]" />
        </button>
        
        <p className="font-['Libre_Baskerville',_sans-serif] italic text-[#fbf7e8] text-[20px] tracking-[0.36px]">
          Menu Especial de Natal 2025
        </p>

        {/* Cart Indicator */}
        {cartItemCount > 0 && onOpenCart && (
          <button
            onClick={onOpenCart}
            className="absolute right-[16px] flex items-center gap-[8px] text-[#d4af37] hover:text-[#e8d4a2] transition-colors"
            aria-label="Abrir carrinho"
          >
            <div className="relative">
              <ShoppingCart className="w-[24px] h-[24px]" />
              <div className="absolute -top-[4px] -right-[4px] bg-[#d4af37] text-[#5c0108] rounded-full w-[18px] h-[18px] flex items-center justify-center">
                <span className="text-[10px] font-bold">{cartItemCount}</span>
              </div>
            </div>
          </button>
        )}
      </header>

      {/* Content */}
      <main className="px-[16px] py-[24px] max-w-[440px] mx-auto">
        {/* Category Title */}
        <div className="mb-[24px]">
          <h1 className="font-['Libre_Baskerville',_sans-serif] text-[rgb(92,1,8)] text-[25px] leading-[30px] mb-[12px]">
            {categoryName}
          </h1>
          <div className="bg-[#d4af37] h-[2px] w-full" />
        </div>

        {/* Story Box */}
        <div className="border border-[#d4af37] rounded-[14px] p-[18px] mb-[40px]">
          <div className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[16.5px] leading-[30px] whitespace-pre-line mb-[24px]">
            {storyPreview}
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={onReadMore}
              className="bg-[#5c0108] text-[#fbf7e8] rounded-[14px] px-[40px] py-[10px] transition-all hover:bg-[#D4AF37] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3)]"
            >
              <span className="font-['Libre_Baskerville',_sans-serif] text-[12px] tracking-[0.1px]">
                Leia mais
              </span>
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-x-[16px] gap-y-[28px] pb-[40px]">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col">
              {/* Product Image - 3:4 aspect ratio */}
              <div className="w-full aspect-[3/4] rounded-[10px] overflow-hidden bg-[#f5f5f5] mb-[10px]">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Product Name */}
              <p className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[13px] leading-[18px] mb-[6px] min-h-[36px]">
                {product.name}
              </p>
              
              {/* Price */}
              <p className="font-['Libre_Baskerville',_sans-serif] text-[#d4af37] text-[15px] leading-[20px] mb-[10px]">
                {product.price}
              </p>
              
              {/* Add to Cart Button */}
              <button
                onClick={() => {
                  console.log("Botão clicado! Produto:", product);
                  onAddToCart(product);
                }}
                className="flex items-center justify-center gap-[6px] bg-[#5c0108] text-[#fbf7e8] rounded-[8px] px-[10px] py-[7px] transition-all hover:bg-[#D4AF37] w-full"
              >
                <ShoppingCart className="w-[13px] h-[13px]" />
                <span className="font-['Libre_Baskerville',_sans-serif] text-[10.5px]">
                  Adicionar
                </span>
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}