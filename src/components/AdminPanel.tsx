import React, { useState, useEffect } from "react";
import { Edit, Trash2, Save, X, Plus, DollarSign, Package, Upload, Image as ImageIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { updateProduct, deleteProduct, fetchProducts, uploadProductImage } from "../utils/api";
import { toast } from "sonner";

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

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
  onProductsUpdated: () => void;
}

export function AdminPanel({
  isOpen,
  onClose,
  categoryId,
  categoryName,
  onProductsUpdated,
}: AdminPanelProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && categoryId) {
      loadProducts();
    }
  }, [isOpen, categoryId]);

  const loadProducts = async () => {
    setLoading(true);
    const fetchedProducts = await fetchProducts(categoryId);
    setProducts(fetchedProducts);
    setLoading(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;

    setLoading(true);
    
    // Upload image first if a new one was selected
    let imageUrl = editingProduct.image;
    if (selectedImageFile) {
      setUploadingImage(true);
      const uploadResult = await uploadProductImage(selectedImageFile);
      setUploadingImage(false);
      
      if (uploadResult.success && uploadResult.imageUrl) {
        imageUrl = uploadResult.imageUrl;
      } else {
        toast.error("Erro ao fazer upload da imagem");
        setLoading(false);
        return;
      }
    }

    const success = await updateProduct(categoryId, editingProduct.id, {
      name: editingProduct.name,
      price: editingProduct.price,
      priceValue: editingProduct.priceValue,
      description: editingProduct.description,
      weight: editingProduct.weight,
      image: imageUrl,
    });

    if (success) {
      toast.success("Produto atualizado com sucesso!");
      await loadProducts();
      onProductsUpdated();
      setEditingProduct(null);
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
    } else {
      toast.error("Erro ao atualizar produto");
    }
    setLoading(false);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Tem certeza que deseja deletar este produto?")) return;

    setLoading(true);
    const success = await deleteProduct(categoryId, productId);

    if (success) {
      toast.success("Produto deletado com sucesso!");
      await loadProducts();
      onProductsUpdated();
    } else {
      toast.error("Erro ao deletar produto");
    }
    setLoading(false);
  };

  const updateEditingField = (field: keyof Product, value: any) => {
    if (!editingProduct) return;
    
    const updated = { ...editingProduct, [field]: value };
    
    // Auto-update priceValue when price changes
    if (field === 'price') {
      const numericPrice = parseFloat(value.replace(/[^\\d.,]/g, '').replace(',', '.'));
      if (!isNaN(numericPrice)) {
        updated.priceValue = numericPrice;
      }
    }
    
    setEditingProduct(updated);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-[600px] bg-[#fbf7e8] border-l-2 border-[#d4af37] p-0 flex flex-col"
      >
        <SheetHeader className="px-[24px] pt-[24px] pb-[16px] bg-[#5c0108]">
          <SheetTitle className="font-['Libre_Baskerville',_sans-serif] text-[#fbf7e8] text-[22px] flex items-center gap-[12px]">
            <Package className="w-[24px] h-[24px] text-[#d4af37]" />
            Admin - {categoryName}
          </SheetTitle>
          <SheetDescription className="font-['Libre_Baskerville',_sans-serif] text-[#e8d4a2] text-[13px]">
            Gerencie produtos e preços
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108]">Carregando...</p>
          </div>
        ) : editingProduct ? (
          // Edit Mode
          <ScrollArea className="flex-1 px-[24px] py-[16px]">
            <div className="space-y-[20px]">
              <div className="flex gap-[12px] items-center mb-[20px]">
                <div className="w-[100px] h-[133px] rounded-[8px] overflow-hidden bg-[#f5f5f5] flex-shrink-0">
                  <ImageWithFallback
                    src={editingProduct.image}
                    alt={editingProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[16px] mb-[8px]">
                    Editando Produto
                  </h3>
                  <p className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[12px] opacity-70">
                    ID: {editingProduct.id}
                  </p>
                </div>
              </div>

              <Separator className="bg-[#d4af37]" />

              <div className="space-y-[16px]">
                <div>
                  <Label className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[13px] mb-[6px]">
                    Nome do Produto
                  </Label>
                  <Input
                    value={editingProduct.name}
                    onChange={(e) => updateEditingField('name', e.target.value)}
                    className="font-['Libre_Baskerville',_sans-serif] border-[#d4af37]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-[12px]">
                  <div>
                    <Label className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[13px] mb-[6px]">
                      Preço (formato: R$ 99,90)
                    </Label>
                    <Input
                      value={editingProduct.price}
                      onChange={(e) => updateEditingField('price', e.target.value)}
                      className="font-['Libre_Baskerville',_sans-serif] border-[#d4af37]"
                      placeholder="R$ 99,90"
                    />
                  </div>
                  
                  <div>
                    <Label className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[13px] mb-[6px]">
                      Valor Numérico
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingProduct.priceValue}
                      onChange={(e) => updateEditingField('priceValue', parseFloat(e.target.value))}
                      className="font-['Libre_Baskerville',_sans-serif] border-[#d4af37]"
                    />
                  </div>
                </div>

                <div>
                  <Label className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[13px] mb-[6px]">
                    Peso
                  </Label>
                  <Input
                    value={editingProduct.weight}
                    onChange={(e) => updateEditingField('weight', e.target.value)}
                    className="font-['Libre_Baskerville',_sans-serif] border-[#d4af37]"
                    placeholder="ex: 250g"
                  />
                </div>

                <div>
                  <Label className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[13px] mb-[6px]">
                    Descrição
                  </Label>
                  <Input
                    value={editingProduct.description}
                    onChange={(e) => updateEditingField('description', e.target.value)}
                    className="font-['Libre_Baskerville',_sans-serif] border-[#d4af37]"
                  />
                </div>

                <div>
                  <Label className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[13px] mb-[6px]">
                    Imagem do Produto
                  </Label>
                  <div className="flex items-center gap-[12px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                      id="product-image-upload"
                    />
                    <label
                      htmlFor="product-image-upload"
                      className="bg-[#5c0108] text-[#fbf7e8] rounded-[8px] px-[16px] py-[8px] transition-all hover:bg-[#7c1c3d] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3)] cursor-pointer flex items-center gap-[8px]"
                    >
                      <Upload className="w-[14px] h-[14px]" />
                      <span className="font-['Libre_Baskerville',_sans-serif] text-[12px]">
                        {selectedImageFile ? "Trocar Imagem" : "Escolher Imagem"}
                      </span>
                    </label>
                    {imagePreviewUrl && (
                      <div className="w-[80px] h-[107px] rounded-[6px] overflow-hidden bg-[#f5f5f5] flex-shrink-0">
                        <ImageWithFallback
                          src={imagePreviewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  {selectedImageFile && (
                    <p className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[11px] opacity-70 mt-[6px]">
                      Nova imagem será salva ao clicar em "Salvar"
                    </p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          // List Mode
          <ScrollArea className="flex-1 px-[24px] py-[16px]">
            <div className="space-y-[16px]">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-[12px] p-[16px] rounded-[8px] border border-[#d4af37]/30 bg-white"
                >
                  <div className="w-[60px] h-[80px] rounded-[6px] overflow-hidden bg-[#f5f5f5] flex-shrink-0">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[14px] mb-[4px]">
                      {product.name}
                    </h4>
                    <p className="font-['Libre_Baskerville',_sans-serif] text-[#d4af37] text-[16px] mb-[4px]">
                      {product.price}
                    </p>
                    <p className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[11px] opacity-60">
                      {product.weight}
                    </p>
                  </div>

                  <div className="flex flex-col gap-[8px]">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="p-[8px] rounded-[6px] bg-[#5c0108] text-[#fbf7e8] hover:bg-[#7c1c3d] transition-colors"
                      aria-label="Editar"
                    >
                      <Edit className="w-[16px] h-[16px]" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-[8px] rounded-[6px] bg-[#5c0108] text-[#fbf7e8] hover:bg-[#7c1c3d] transition-colors"
                      aria-label="Deletar"
                    >
                      <Trash2 className="w-[16px] h-[16px]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer Actions */}
        <div className="px-[24px] pb-[24px] pt-[16px] border-t-2 border-[#d4af37] bg-[#fbf7e8]">
          {editingProduct ? (
            <div className="flex gap-[12px]">
              <button
                onClick={handleSaveProduct}
                disabled={loading}
                className="flex-1 bg-[#5c0108] text-[#fbf7e8] rounded-[14px] px-[24px] py-[14px] transition-all hover:bg-[#7c1c3d] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3)] disabled:opacity-50"
              >
                <span className="font-['Libre_Baskerville',_sans-serif] text-[14px] flex items-center justify-center gap-[8px]">
                  <Save className="w-[16px] h-[16px]" />
                  Salvar
                </span>
              </button>
              <button
                onClick={() => setEditingProduct(null)}
                disabled={loading}
                className="flex-1 bg-transparent text-[#5c0108] rounded-[14px] px-[24px] py-[14px] transition-all hover:bg-[#d4af37]/10 border border-[#d4af37] disabled:opacity-50"
              >
                <span className="font-['Libre_Baskerville',_sans-serif] text-[14px] flex items-center justify-center gap-[8px]">
                  <X className="w-[16px] h-[16px]" />
                  Cancelar
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-[#5c0108] text-[#fbf7e8] rounded-[14px] px-[24px] py-[14px] transition-all hover:bg-[#7c1c3d] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3)]"
            >
              <span className="font-['Libre_Baskerville',_sans-serif] text-[14px]">
                Fechar
              </span>
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}