import React from "react";
import { ShoppingCart, ChevronLeft, Home } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { ImageCarousel } from "./ImageCarousel";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  priceValue: number;
  image: string;
  images?: string[];
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
  categories?: Array<{ id: string; name: string; icon: string }>;
  currentCategoryId?: string;
  onCategoryChange?: (categoryId: string) => void;
}

export function CategoryPage({
  categoryName,
  storyPreview,
  products,
  onReadMore,
  onAddToCart,
  onBack,
  cartItemCount = 0,
  onOpenCart,
  categories = [],
  currentCategoryId = '',
  onCategoryChange
}: CategoryPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="bg-[#fbf7e8] min-h-screen w-full">
      {/* Header */}
      <header className="bg-[#5c0108] h-[95px] flex items-center justify-center relative">
        {/* Botão Home (esquerda) */}
        <div className="absolute left-[16px]">
          <button
            onClick={onBack}
            className="text-[#d4af37] hover:text-[#e8d4a2] transition-colors"
            aria-label="Voltar para página inicial"
          >
            <Home className="w-[22px] h-[22px]" />
          </button>
        </div>

        {/* Texto Central */}
        <p className="font-['Libre_Baskerville',_sans-serif] italic text-[#fbf7e8] text-[20px] tracking-[0.36px]">
          Menu Especial de Natal 2025
        </p>

        {/* Cart Indicator direita */}
        {cartItemCount > 0 && onOpenCart && (
          <div className="absolute right-[16px]">
            <button
              onClick={onOpenCart}
              className="flex items-center gap-[8px] text-[#d4af37] hover:text-[#e8d4a2] transition-colors"
              aria-label="Abrir carrinho"
            >
              <div className="relative">
                <ShoppingCart className="w-[24px] h-[24px]" />
                <div className="absolute -top-[4px] -right-[4px] bg-[#d4af37] text-[#5c0108] rounded-full w-[18px] h-[18px] flex items-center justify-center">
                  <span className="text-[10px] font-bold">{cartItemCount}</span>
                </div>
              </div>
            </button>
          </div>
        )}
      </header>

      {/* Botão Voltar/Categorias - Abaixo do Header */}
      <div className="bg-[#fbf7e8] px-[24px] pt-[20px]">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <button
              className="flex items-center gap-2 text-[#5c0108] hover:text-[#d4af37] transition-colors mb-4"
              aria-label="Abrir menu de categorias"
            >
              <ChevronLeft className="w-[20px] h-[20px]" />
              <span className="font-['Libre_Baskerville',_sans-serif] text-[14px]">
                Voltar / Categorias
              </span>
            </button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="w-[280px] p-0 bg-[#5c0108] border-r border-[#f8f1dc]"
          >
            <div className="h-full relative">
              <SheetHeader className="px-[40px] pt-[40px] pb-[37px]">
                <SheetTitle className="font-['Libre_Baskerville',_sans-serif] text-[16px] leading-[24px] text-[#d4af37] border-b border-[#d4af37] pb-3 text-left">
                  Categorias
                </SheetTitle>
              </SheetHeader>

              <nav className="px-[24px] space-y-[8px]">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      if (onCategoryChange) {
                        onCategoryChange(category.id);
                      }
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-[12px] px-[17px] py-[15px] rounded-[10px] transition-all duration-300 ${
                      currentCategoryId === category.id
                        ? "bg-[#fbf7e8] border border-[#d4af37]"
                        : "border border-transparent"
                    }`}
                  >
                    <span
                      className={`flex-1 text-left font-['Libre_Baskerville',_sans-serif] text-[16px] leading-[24px] ${
                        currentCategoryId === category.id
                          ? "text-[#d4af37]"
                          : "text-[#faf8f3]"
                      }`}
                    >
                      {category.name}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="px-[16px] pb-[40px] max-w-[440px] mx-auto">
        {/* Category Title */}
        <div className="mb-[24px]">
          <h1 className="font-['Libre_Baskerville',_sans-serif] text-[rgb(92,1,8)] text-[25px] leading-[30px] mb-[12px]">
            {categoryName}
          </h1>
          <div className="bg-[#d4af37] h-[2px] w-full mb-[16px]" />
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
        {products.length === 0 ? (
          <div className="text-center py-[40px]">
            <p className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[16px]">
              Nenhum produto encontrado
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-[16px] gap-y-[28px]">
            {products.map((product) => (
              <div key={product.id} className="flex flex-col">
                {/* Product Image - 3:4 aspect ratio with carousel */}
                <div className="w-full aspect-[3/4] rounded-[10px] overflow-hidden bg-[#f5f5f5] mb-[10px]">
                  <ImageCarousel
                    images={product.images && product.images.length > 0 ? product.images : [product.image]}
                    alt={product.name}
                    autoPlay={true}
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
                  className="flex items-center justify-center gap-[6px] bg-[#5c0108] text-[#fbf7e8] rounded-[8px] px-[10px] py-[10px] transition-all hover:bg-[#D4AF37] w-full min-h-[44px]"
                  aria-label={`Adicionar ${product.name} ao carrinho`}
                >
                  <ShoppingCart className="w-[13px] h-[13px]" />
                  <span className="font-['Libre_Baskerville',_sans-serif] text-[10.5px]">
                    Adicionar
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
