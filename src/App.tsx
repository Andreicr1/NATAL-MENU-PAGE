import {
  ChevronRight,
  Instagram,
  LeafyGreen,
  Menu,
  MessageCircle,
  Package,
  Plus,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CartSheet } from './components/CartSheet';
import { CategoryPage } from './components/CategoryPage';
import { ImageCarousel } from './components/ImageCarousel';
import { StoryPage } from './components/StoryPage';
import { Badge } from './components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog';
import { Separator } from './components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './components/ui/sheet';
import { Toaster } from './components/ui/sonner';
import { categoryStories } from './data/stories';
import menuSvgPaths from './imports/svg-k56t5hodsm';
import { fetchProducts } from './utils/api';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  priceValue: number;
  image: string;
  images?: string[]; // Array de imagens para carrossel (até 10)
  featured?: boolean;
  weight: string;
  ingredients: string[];
  tags: string[];
  deliveryOptions: string[];
  categoryId?: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  products: Product[];
}

interface CartItem {
  product: Product;
  quantity: number;
}

const categories: Category[] = [
  {
    id: 'advent',
    name: 'Calendário do Advento',
    icon: '🎁',
    products: [
      {
        id: 'adv-1',
        name: 'Calendário Premium',
        description:
          '24 chocolates artesanais selecionados para cada dia até o Natal',
        price: 'R$ 289,00',
        priceValue: 289,
        image:
          'https://images.unsplash.com/photo-1607575152555-9e0c6aeb3b18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHZlbnQlMjBjYWxlbmRhciUyMGNob2NvbGF0ZXxlbnwxfHx8fDE3NjExNzYyODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        featured: true,
        weight: '600g',
        ingredients: [
          'Chocolate ao leite belga',
          'Chocolate meio amargo',
          'Avelãs',
          'Amêndoas',
          'Cacau em pó',
        ],
        tags: [],
        deliveryOptions: [
          'Entrega expressa 2 dias',
          'Entrega padrão 5 dias',
          'Retirada na loja',
        ],
      },
      {
        id: 'adv-2',
        name: 'Calendário Deluxe',
        description:
          'Edição especial com chocolates premium e trufas exclusivas',
        price: 'R$ 389,00',
        priceValue: 389,
        image:
          'https://images.unsplash.com/photo-1607575152555-9e0c6aeb3b18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHZlbnQlMjBjYWxlbmRhciUyMGNob2NvbGF0ZXxlbnwxfHx8fDE3NjExNzYyODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        weight: '800g',
        ingredients: [
          'Chocolate belga premium',
          'Trufas artesanais',
          'Pistache',
          'Castanhas',
        ],
        tags: ['vegano'],
        deliveryOptions: ['Entrega expressa 2 dias', 'Entrega padrão 5 dias'],
      },
    ],
  },
  {
    id: 'panettone',
    name: 'Panetone',
    icon: '🎄',
    products: [
      {
        id: 'pan-1',
        name: 'Panetone Chocolate Belga',
        description: 'Panetone artesanal recheado com gotas de chocolate belga',
        price: 'R$ 89,00',
        priceValue: 89,
        image:
          'https://images.unsplash.com/photo-1608644281564-6d7ff23a47e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHJpc3RtYXMlMjBwYW5ldHRvbmV8ZW58MXx8fHwxNzYxMTc2Mjg2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        featured: true,
        weight: '750g',
        ingredients: [
          'Farinha de trigo especial',
          'Chocolate belga',
          'Manteiga',
          'Ovos',
          'Fermento natural',
        ],
        tags: [],
        deliveryOptions: [
          'Entrega expressa 2 dias',
          'Entrega padrão 5 dias',
          'Retirada na loja',
        ],
      },
      {
        id: 'pan-2',
        name: 'Panetone Frutas Cristalizadas',
        description: 'Receita tradicional com frutas cristalizadas premium',
        price: 'R$ 79,00',
        priceValue: 79,
        image:
          'https://images.unsplash.com/photo-1670179937919-d39ffee6991d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxwYW5ldHRvbmV8ZW58MXx8fHwxNzYwNzI0MTQyfDA&ixlib=rb-4.1.0&q=80&w=1080',
        weight: '750g',
        ingredients: [
          'Farinha de trigo especial',
          'Frutas cristalizadas',
          'Manteiga',
          'Ovos',
          'Fermento natural',
        ],
        tags: [],
        deliveryOptions: ['Entrega padrão 5 dias', 'Retirada na loja'],
      },
      {
        id: 'pan-3',
        name: 'Panetone Vegano',
        description:
          'Opção vegana deliciosa com chocolate 70% cacau e frutas secas',
        price: 'R$ 95,00',
        priceValue: 95,
        image:
          'https://images.unsplash.com/photo-1670179937919-d39ffee6991d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxwYW5ldHRvbmV8ZW58MXx8fHwxNzYwNzI0MTQyfDA&ixlib=rb-4.1.0&q=80&w=1080',
        weight: '700g',
        ingredients: [
          'Farinha de trigo integral',
          'Chocolate 70% cacau',
          'Óleo de coco',
          'Frutas secas',
          'Fermento natural',
        ],
        tags: ['vegano', 'sem-lactose'],
        deliveryOptions: ['Entrega expressa 2 dias', 'Entrega padrão 5 dias'],
      },
    ],
  },
  {
    id: 'bars',
    name: 'Barras de Chocolate',
    icon: '🍫',
    products: [
      {
        id: 'bar-1',
        name: 'Barra 70% Cacau',
        description: 'Chocolate amargo intenso com 70% de cacau premium',
        price: 'R$ 28,00',
        priceValue: 28,
        image:
          'https://images.unsplash.com/photo-1516905327772-37c577f92a35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBiYXIlMjBkYXJrfGVufDF8fHx8MTc2MTE3NjI4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        weight: '100g',
        ingredients: ['Cacau', 'Açúcar de coco', 'Manteiga de cacau'],
        tags: ['vegano', 'sem-lactose'],
        deliveryOptions: [
          'Entrega expressa 2 dias',
          'Entrega padrão 5 dias',
          'Retirada na loja',
        ],
      },
      {
        id: 'bar-2',
        name: 'Barra ao Leite com Avelãs',
        description: 'Chocolate ao leite belga com avelãs torradas',
        price: 'R$ 32,00',
        priceValue: 32,
        image:
          'https://images.unsplash.com/photo-1516905327772-37c577f92a35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBiYXIlMjBkYXJrfGVufDF8fHx8MTc2MTE3NjI4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        featured: true,
        weight: '100g',
        ingredients: [
          'Chocolate ao leite belga',
          'Avelãs torradas',
          'Açúcar',
          'Leite em pó',
        ],
        tags: [],
        deliveryOptions: ['Entrega padrão 5 dias', 'Retirada na loja'],
      },
      {
        id: 'bar-3',
        name: 'Barra Branca com Pistache',
        description: 'Chocolate branco premium com pistache siciliano',
        price: 'R$ 38,00',
        priceValue: 38,
        image:
          'https://images.unsplash.com/photo-1516905327772-37c577f92a35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBiYXIlMjBkYXJrfGVufDF8fHx8MTc2MTE3NjI4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        weight: '100g',
        ingredients: [
          'Chocolate branco',
          'Pistache siciliano',
          'Manteiga de cacau',
          'Leite em pó',
        ],
        tags: [],
        deliveryOptions: ['Entrega expressa 2 dias', 'Entrega padrão 5 dias'],
      },
      {
        id: 'bar-4',
        name: 'Barra Ruby com Framboesa',
        description: 'Chocolate ruby natural com framboesas liofilizadas',
        price: 'R$ 45,00',
        priceValue: 45,
        image:
          'https://images.unsplash.com/photo-1516905327772-37c577f92a35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBiYXIlMjBkYXJrfGVufDF8fHx8MTc2MTE3NjI4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        featured: true,
        weight: '100g',
        ingredients: ['Chocolate ruby', 'Framboesa liofilizada', 'Açúcar'],
        tags: [],
        deliveryOptions: [
          'Entrega expressa 2 dias',
          'Entrega padrão 5 dias',
          'Retirada na loja',
        ],
      },
    ],
  },
  {
    id: 'special',
    name: 'Doces Especiais',
    icon: '⭐',
    products: [
      {
        id: 'sp-1',
        name: 'Caixa Festiva Mix',
        description:
          'Seleção especial de bombons, trufas e chocolates para presentear',
        price: 'R$ 145,00',
        priceValue: 145,
        image:
          'https://images.unsplash.com/photo-1629610306962-a8aa73153d0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjaG9jb2xhdGUlMjBnaWZ0fGVufDF8fHx8MTc2MTE3NjI4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        featured: true,
        weight: '500g',
        ingredients: [
          'Variedade de chocolates',
          'Trufas artesanais',
          'Bombons recheados',
        ],
        tags: [],
        deliveryOptions: [
          'Entrega expressa 2 dias',
          'Entrega padrão 5 dias',
          'Retirada na loja',
        ],
      },
      {
        id: 'sp-2',
        name: 'Bombons Sortidos Premium',
        description: '16 bombons artesanais com recheios variados',
        price: 'R$ 89,00',
        priceValue: 89,
        image:
          'https://images.unsplash.com/photo-1629610306962-a8aa73153d0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjaG9jb2xhdGUlMjBnaWZ0fGVufDF8fHx8MTc2MTE3NjI4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        weight: '320g',
        ingredients: [
          'Chocolate belga',
          'Recheios variados',
          'Frutas secas',
          'Licores',
        ],
        tags: [],
        deliveryOptions: ['Entrega padrão 5 dias', 'Retirada na loja'],
      },
      {
        id: 'sp-3',
        name: 'Mendiants Artesanais',
        description: 'Discos de chocolate decorados com frutas e nuts',
        price: 'R$ 65,00',
        priceValue: 65,
        image:
          'https://images.unsplash.com/photo-1629610306962-a8aa73153d0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjaG9jb2xhdGUlMjBnaWZ0fGVufDF8fHx8MTc2MTE3NjI4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        weight: '250g',
        ingredients: [
          'Chocolate ao leite e amargo',
          'Amêndoas',
          'Cranberries',
          'Pistache',
          'Laranja cristalizada',
        ],
        tags: ['sem-gluten'],
        deliveryOptions: ['Entrega expressa 2 dias', 'Entrega padrão 5 dias'],
      },
    ],
  },
  {
    id: 'truffles',
    name: 'Trufas',
    icon: '🌰',
    products: [
      {
        id: 'tru-1',
        name: 'Trufas Tradicionais',
        description: '12 trufas clássicas com cobertura de cacau em pó',
        price: 'R$ 58,00',
        priceValue: 58,
        image:
          'https://images.unsplash.com/photo-1582493255270-b3844e2a63c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjB0cnVmZmxlc3xlbnwxfHx8fDE3NjExNzYyODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        weight: '240g',
        ingredients: [
          'Chocolate belga',
          'Creme de leite',
          'Manteiga',
          'Cacau em pó',
        ],
        tags: [],
        deliveryOptions: [
          'Entrega expressa 2 dias',
          'Entrega padrão 5 dias',
          'Retirada na loja',
        ],
      },
      {
        id: 'tru-2',
        name: 'Trufas de Champagne',
        description: 'Trufas premium com champagne e cobertura dourada',
        price: 'R$ 85,00',
        priceValue: 85,
        image:
          'https://images.unsplash.com/photo-1582493255270-b3844e2a63c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjB0cnVmZmxlc3xlbnwxfHx8fDE3NjExNzYyODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        featured: true,
        weight: '240g',
        ingredients: [
          'Chocolate belga premium',
          'Champagne',
          'Creme de leite',
          'Pó dourado comestível',
        ],
        tags: [],
        deliveryOptions: ['Entrega expressa 2 dias', 'Entrega padrão 5 dias'],
      },
      {
        id: 'tru-3',
        name: 'Trufas Veganas Mix',
        description: 'Variedade de trufas veganas com coberturas especiais',
        price: 'R$ 72,00',
        priceValue: 72,
        image:
          'https://images.unsplash.com/photo-1582493255270-b3844e2a63c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjB0cnVmZmxlc3xlbnwxfHx8fDE3NjExNzYyODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        weight: '240g',
        ingredients: [
          'Chocolate 70% cacau',
          'Creme de coco',
          'Óleo de coco',
          'Cacau em pó',
          'Castanhas',
        ],
        tags: ['vegano', 'sem-lactose'],
        deliveryOptions: [
          'Entrega expressa 2 dias',
          'Entrega padrão 5 dias',
          'Retirada na loja',
        ],
      },
      {
        id: 'tru-4',
        name: 'Trufas de Café Especial',
        description: 'Trufas com café premium e cobertura crocante',
        price: 'R$ 68,00',
        priceValue: 68,
        image:
          'https://images.unsplash.com/photo-1582493255270-b3844e2a63c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjB0cnVmZmxlc3xlbnwxfHx8fDE3NjExNzYyODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        weight: '240g',
        ingredients: [
          'Chocolate meio amargo',
          'Café especial',
          'Creme de leite',
          'Nibs de cacau',
        ],
        tags: [],
        deliveryOptions: ['Entrega padrão 5 dias', 'Retirada na loja'],
      },
    ],
  },
  {
    id: 'giftboxes',
    name: 'Caixas de Presente',
    icon: '🎀',
    products: [
      {
        id: 'gift-1',
        name: 'Caixa Elegance',
        description:
          'Caixa premium com seleção de chocolates belgas e trufas exclusivas',
        price: 'R$ 185,00',
        priceValue: 185,
        image:
          'https://images.unsplash.com/photo-1629610306962-a8aa73153d0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjaG9jb2xhdGUlMjBnaWZ0JTIwYm94fGVufDF8fHx8MTc2MTE3NjkxMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        featured: true,
        weight: '450g',
        ingredients: [
          'Chocolates belgas sortidos',
          'Trufas artesanais',
          'Bombons premium',
          'Embalagem especial',
        ],
        tags: [],
        deliveryOptions: [
          'Entrega expressa 2 dias',
          'Entrega padrão 5 dias',
          'Retirada na loja',
        ],
      },
      {
        id: 'gift-2',
        name: 'Caixa Corporativa Premium',
        description:
          'Ideal para presentes corporativos com chocolates e trufas selecionadas',
        price: 'R$ 225,00',
        priceValue: 225,
        image:
          'https://images.unsplash.com/photo-1593563645819-d633b1873d37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwY2hvY29sYXRlJTIwaGFtcGVyfGVufDF8fHx8MTc2MTE3NjkxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        weight: '600g',
        ingredients: [
          'Mix de chocolates premium',
          'Trufas de champagne',
          'Barras artesanais',
          'Caixa personalizada',
        ],
        tags: [],
        deliveryOptions: ['Entrega expressa 2 dias', 'Entrega padrão 5 dias'],
      },
      {
        id: 'gift-3',
        name: 'Caixa Deluxe Natal',
        description:
          'Edição especial de Natal com os melhores chocolates da casa',
        price: 'R$ 295,00',
        priceValue: 295,
        image:
          'https://images.unsplash.com/photo-1629610306962-a8aa73153d0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjaG9jb2xhdGUlMjBnaWZ0JTIwYm94fGVufDF8fHx8MTc2MTE3NjkxMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        featured: true,
        weight: '750g',
        ingredients: [
          'Chocolates premium exclusivos',
          'Trufas especiais',
          'Barras ruby e gold',
          'Bombons artesanais',
        ],
        tags: [],
        deliveryOptions: [
          'Entrega expressa 2 dias',
          'Entrega padrão 5 dias',
          'Retirada na loja',
        ],
      },
      {
        id: 'gift-4',
        name: 'Caixa Vegana Festiva',
        description:
          'Seleção completa de chocolates veganos em embalagem premium',
        price: 'R$ 165,00',
        priceValue: 165,
        image:
          'https://images.unsplash.com/photo-1593563645819-d633b1873d37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwY2hvY29sYXRlJTIwaGFtcGVyfGVufDF8fHx8MTc2MTE3NjkxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        weight: '400g',
        ingredients: [
          'Chocolates veganos 70% cacau',
          'Trufas veganas variadas',
          'Barras veganas sortidas',
        ],
        tags: ['vegano', 'sem-lactose'],
        deliveryOptions: ['Entrega expressa 2 dias', 'Entrega padrão 5 dias'],
      },
    ],
  },
  {
    id: 'cards',
    name: 'Cartões de Natal',
    icon: '✉️',
    products: [
      {
        id: 'card-1',
        name: 'Cartão Premium com Chocolate',
        description:
          'Cartão artesanal com mensagem personalizada e barra de chocolate',
        price: 'R$ 45,00',
        priceValue: 45,
        image:
          'https://images.unsplash.com/photo-1577201869476-d08b737ee1c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHJpc3RtYXMlMjBncmVldGluZyUyMGNhcmRzJTIwZWxlZ2FudHxlbnwxfHx8fDE3NjExNzY5MTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        featured: true,
        weight: '80g',
        ingredients: [
          'Cartão em papel especial',
          'Barra de chocolate 70% cacau',
          'Envelope premium',
        ],
        tags: [],
        deliveryOptions: [
          'Entrega expressa 2 dias',
          'Entrega padrão 5 dias',
          'Retirada na loja',
        ],
      },
      {
        id: 'card-2',
        name: 'Cartão Deluxe com Trufas',
        description: 'Cartão sofisticado acompanhado de 4 trufas artesanais',
        price: 'R$ 68,00',
        priceValue: 68,
        image:
          'https://images.unsplash.com/photo-1703000957460-839adaf09db2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZXN0aXZlJTIwY2hyaXN0bWFzJTIwY2FyZHN8ZW58MXx8fHwxNzYxMTc2OTEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        weight: '120g',
        ingredients: [
          'Cartão artesanal hot stamping',
          '4 trufas belgas',
          'Caixa especial',
        ],
        tags: [],
        deliveryOptions: ['Entrega expressa 2 dias', 'Entrega padrão 5 dias'],
      },
      {
        id: 'card-3',
        name: 'Kit Cartões Personalizados',
        description:
          'Conjunto de 5 cartões com mensagens personalizadas e chocolates',
        price: 'R$ 185,00',
        priceValue: 185,
        image:
          'https://images.unsplash.com/photo-1577201869476-d08b737ee1c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHJpc3RtYXMlMjBncmVldGluZyUyMGNhcmRzJTIwZWxlZ2FudHxlbnwxfHx8fDE3NjExNzY5MTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        weight: '350g',
        ingredients: [
          '5 cartões personalizados',
          'Barras de chocolate sortidas',
          'Embalagem presenteável',
        ],
        tags: [],
        deliveryOptions: [
          'Entrega expressa 2 dias',
          'Entrega padrão 5 dias',
          'Retirada na loja',
        ],
      },
      {
        id: 'card-4',
        name: 'Cartão Corporativo Executivo',
        description:
          'Cartão elegante ideal para clientes e parceiros com bombons premium',
        price: 'R$ 95,00',
        priceValue: 95,
        image:
          'https://images.unsplash.com/photo-1703000957460-839adaf09db2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZXN0aXZlJTIwY2hyaXN0bWFzJTIwY2FyZHN8ZW58MXx8fHwxNzYxMTc2OTEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        featured: true,
        weight: '180g',
        ingredients: [
          'Cartão premium hot stamping',
          '6 bombons belgas',
          'Caixa executiva',
        ],
        tags: [],
        deliveryOptions: ['Entrega expressa 2 dias', 'Entrega padrão 5 dias'],
      },
    ],
  },
];

const tagLabels: Record<string, string> = {
  vegano: 'Vegano',
  'sem-lactose': 'Sem Lactose',
  'sem-gluten': 'Sem Glúten',
};

type PageView = 'landing' | 'category' | 'story';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [showProducts, setShowProducts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [descriptionProduct, setDescriptionProduct] = useState<Product | null>(
    null
  );
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('sweetbar-cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Salvar carrinho no localStorage
  useEffect(() => {
    localStorage.setItem('sweetbar-cart', JSON.stringify(cart));
  }, [cart]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('default');
  const [backendProducts, setBackendProducts] = useState<
    Record<string, Product[]>
  >({});

  const currentCategory = categories.find(cat => cat.id === selectedCategory);

  // Load products from backend
  const loadProductsFromBackend = async (categoryId: string) => {
    const products = await fetchProducts(categoryId);
    setBackendProducts((prev: Record<string, Product[]>) => ({
      ...prev,
      [categoryId]: products,
    }));
  };

  // Load ALL products on mount
  useEffect(() => {
    const loadAllProducts = async () => {
      console.log('Carregando produtos do backend...');
      const promises = categories.map(cat =>
        fetchProducts(cat.id).then(products => ({ id: cat.id, products }))
      );
      const results = await Promise.all(promises);
      const productsMap = results.reduce((acc, { id, products }) => {
        acc[id] = products;
        return acc;
      }, {} as Record<string, Product[]>);
      setBackendProducts(productsMap);
      console.log('Produtos carregados:', productsMap);
    };

    // Carrega produtos na inicialização
    loadAllProducts();
    trackEvent('page_view', { page: 'home' });

    // Recarrega produtos quando a página ganha foco (útil após adicionar produtos no admin)
    const handleFocus = () => {
      loadAllProducts();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Get products (from backend with fallback to static)
  const getCurrentProducts = () => {
    if (
      backendProducts[selectedCategory] &&
      backendProducts[selectedCategory].length > 0
    ) {
      return backendProducts[selectedCategory];
    }
    return currentCategory?.products || [];
  };

  // Analytics helper
  const trackEvent = (eventName: string, data?: Record<string, unknown>) => {
    if (
      typeof window !== 'undefined' &&
      (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
    ) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
        'event',
        eventName,
        data
      );
    }
    console.log('Event:', eventName, data);
  };

  const addToCart = (product: Product) => {
    setCart((prevCart: CartItem[]) => {
      const existingItem = prevCart.find(
        (item: CartItem) => item.product.id === product.id
      );
      if (existingItem) {
        return prevCart.map((item: CartItem) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
    toast.success(`${product.name} adicionado ao carrinho!`, {
      description: 'Seu carrinho foi salvo automaticamente',
      duration: 1000, // 1 segundo
    });
    trackEvent('add_to_cart', {
      item_name: product.name,
      item_id: product.id,
      price: product.priceValue,
      item_category: product.categoryId,
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart: CartItem[]) =>
      prevCart.filter((item: CartItem) => item.product.id !== productId)
    );
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart: CartItem[]) =>
      prevCart.map((item: CartItem) =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const cartTotal = cart.reduce(
    (total: number, item: CartItem) =>
      total + item.product.priceValue * item.quantity,
    0
  );

  const cartItemCount = cart.reduce(
    (total: number, item: CartItem) => total + item.quantity,
    0
  );

  // Filter and sort products
  const getFilteredProducts = () => {
    const products = getCurrentProducts();
    if (products.length === 0) return [];

    let filtered = [...products];

    // Filter by price
    if (priceFilter !== 'all') {
      if (priceFilter === 'under-50') {
        filtered = filtered.filter(p => p.priceValue < 50);
      } else if (priceFilter === '50-100') {
        filtered = filtered.filter(
          p => p.priceValue >= 50 && p.priceValue <= 100
        );
      } else if (priceFilter === 'over-100') {
        filtered = filtered.filter(p => p.priceValue > 100);
      }
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(p =>
        selectedTags.some(tag => p.tags.includes(tag))
      );
    }

    // Sort
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.priceValue - b.priceValue);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.priceValue - a.priceValue);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Render different pages based on currentPage state
  if (currentPage === 'category') {
    console.log(
      'Renderizando CategoryPage. Cart:',
      cart,
      'CartItemCount:',
      cartItemCount
    );
    const currentCategoryData = categories.find(
      cat => cat.id === selectedCategory
    );
    const currentStory = categoryStories[selectedCategory];

    if (!currentCategoryData || !currentStory) {
      return (
        <>
          <Toaster />
          <div className="bg-[#fbf7e8] min-h-screen flex items-center justify-center">
            <div className="text-[#5c0108] text-center p-8">
              <p className="font-['Libre_Baskerville',_sans-serif] text-[18px] mb-4">
                Categoria não encontrada
              </p>
              <button
                onClick={() => setCurrentPage('landing')}
                className="bg-[#5c0108] text-[#fbf7e8] px-6 py-2 rounded-[14px] hover:bg-[#7c1c3d] transition-colors"
              >
                Voltar à página inicial
              </button>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <Toaster />
        <CategoryPage
          categoryName={currentCategoryData.name}
          storyPreview={currentStory.preview}
          products={getCurrentProducts()}
          onReadMore={() => setCurrentPage('story')}
          onAddToCart={addToCart}
          onBack={() => setCurrentPage('landing')}
          cartItemCount={cartItemCount}
          onOpenCart={() => setIsCartOpen(true)}
          categories={categories}
          currentCategoryId={selectedCategory}
          onCategoryChange={categoryId => {
            setSelectedCategory(categoryId);
            setCurrentPage('category');
          }}
        />
        <CartSheet
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          cartTotal={cartTotal}
        />
      </>
    );
  }

  if (currentPage === 'story') {
    const currentCategoryData = categories.find(
      cat => cat.id === selectedCategory
    );
    const currentStory = categoryStories[selectedCategory];

    if (!currentCategoryData || !currentStory) return null;

    return (
      <>
        <Toaster />
        <StoryPage
          categoryName={currentCategoryData.name}
          fullStory={currentStory.fullStory}
          onBack={() => setCurrentPage('category')}
          onBackToLanding={() => setCurrentPage('landing')}
        />
      </>
    );
  }

  return (
    <>
      <Toaster />

      {/* Landing Page - Only show when currentPage is "landing" */}
      <div
        className={`bg-[#fbf7e8] relative min-h-screen w-full overflow-x-hidden ${
          currentPage !== 'landing' ? 'hidden' : 'block'
        }`}
      >
        {/* Floating Cart Button */}
        {cartItemCount > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="fixed top-[100px] right-[20px] z-50 bg-[#5c0108] text-[#d4af37] rounded-full p-[12px] shadow-lg hover:bg-[#7c1c3d] transition-all"
            aria-label="Abrir carrinho"
          >
            <div className="relative">
              <ShoppingCart className="w-[24px] h-[24px]" />
              <div className="absolute -top-[8px] -right-[8px] bg-[#d4af37] text-[#5c0108] rounded-full w-[20px] h-[20px] flex items-center justify-center">
                <span className="text-[11px] font-bold">{cartItemCount}</span>
              </div>
            </div>
          </button>
        )}

        {/* Header */}
        <div className="absolute bg-[#5c0108] h-[95px] left-0 overflow-clip top-[88px] w-full">
          <div className="absolute h-[61.008px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[404.388px] max-w-[95%]">
            <div className="absolute content-stretch flex flex-col gap-[4.158px] h-[61.008px] items-start left-0 top-[19.89px] w-full max-w-[308.596px]">
              <p
                onClick={() => {
                  const password = prompt('Digite a senha de admin:');
                  if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
                    setIsAdminAuthenticated(true);
                    toast.success('Admin autenticado! Acesse: /admin.html');
                    // Painel admin disponível em: https://d3c3no9shu6bly.cloudfront.net/admin.html
                  } else if (password) {
                    toast.error('Senha incorreta!');
                  }
                }}
                className="font-['Libre_Baskerville',_sans-serif] italic leading-[21.87px] relative shrink-0 text-[#fbf7e8] text-[20.829px] text-left text-nowrap tracking-[0.3645px] whitespace-pre px-[25px] py-[0px] cursor-pointer"
              >
                Menu de Natal Sweet Bar
              </p>
            </div>
            {/* SVG carrinho removido */}
          </div>
        </div>

        {/* Main Content */}
        <div className="absolute content-stretch flex flex-col items-start left-0 overflow-clip top-[183px] w-full px-4 pt-[24px]">
          <div className="w-full max-w-[437.742px] mx-auto">
            {/* Sobre nós Section */}
            <div className="mb-[24px] mt-[48px]">
              <h1 className="font-['Libre_Baskerville',_sans-serif] text-[rgb(92,1,8)] text-[25px] leading-[30px] mb-[12px]">
                Sobre nós
              </h1>
              <div className="bg-[#d4af37] h-[2px] w-full" />
            </div>

            {/* About Text Box */}
            <div className="w-full rounded-[14px] mb-8">
              <div className="box-border content-stretch flex flex-col gap-[10.422px] items-start overflow-clip px-[18.76px] py-[17.718px] relative rounded-[inherit] w-full border-[#d4af37] border-[1.042px] border-solid">
                <div className="flex flex-col font-['Libre_Baskerville',_sans-serif] leading-[30.017px] not-italic text-[#5c0108] text-[16.676px] text-left w-full">
                  <p className="mb-0">Bem-vindo(a) à Sweet Bar!</p>
                  <p className="mb-0">
                    Ateliê de chocolate onde a qualidade belga se encontra com a
                    arte de presentear com alma.
                  </p>
                  <p className="mb-0">&nbsp;</p>
                  <p className="mb-0">
                    Há mais de 6 anos, criamos chocolates artesanais premium,
                    transformando cada pedaço em prazer e emoção.
                  </p>
                  <p>Nosso chocolate é um sabor que fica na memória.</p>
                </div>
              </div>
            </div>

            {/* Veja Menu de Natal Button */}
            <div
              className="w-full flex justify-center mb-8"
              role="navigation"
              aria-label="Menu de categorias"
            >
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <button className="bg-[#5c0108] h-[35px] overflow-clip rounded-[14px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] px-6">
                    <div className="flex flex-col font-['Libre_Baskerville',_sans-serif] justify-center leading-[0] not-italic text-[#fbf7e8] text-[12px] text-nowrap tracking-[0.1px]">
                      <p className="leading-[20px] whitespace-pre">
                        Veja Menu de Natal
                      </p>
                    </div>
                  </button>
                </SheetTrigger>

                <SheetContent
                  side="left"
                  className="w-[280px] p-0 bg-[#5c0108] border-r border-[#f8f1dc]"
                  style={{
                    boxShadow:
                      '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
                  }}
                >
                  <div className="h-full relative">
                    {/* Header */}
                    <SheetHeader className="px-[40px] pt-[40px] pb-[37px]">
                      <SheetTitle className="font-['Libre_Baskerville',_sans-serif] text-[16px] leading-[24px] text-[#d4af37] border-b border-[#d4af37] pb-3 text-left">
                        Categorias
                      </SheetTitle>
                      <SheetDescription className="sr-only">
                        Navegue pelas categorias de produtos
                      </SheetDescription>
                    </SheetHeader>

                    {/* Navigation */}
                    <nav className="px-[24px] space-y-[8px]">
                      {categories.map((category, index) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setCurrentPage('category');
                            setIsSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-[12px] px-[17px] py-[15px] rounded-[10px] transition-all duration-300 ${
                            selectedCategory === category.id
                              ? 'bg-[#fbf7e8] border border-[#d4af37]'
                              : 'border border-transparent'
                          }`}
                        >
                          <span
                            className={`flex-1 text-left font-['Libre_Baskerville',_sans-serif] text-[16px] leading-[24px] ${
                              selectedCategory === category.id
                                ? 'text-[#d4af37]'
                                : 'text-[#faf8f3]'
                            }`}
                          >
                            {category.name}
                          </span>
                          <svg
                            className="w-[20px] h-[20px] flex-shrink-0"
                            fill="none"
                            viewBox="0 0 20 20"
                          >
                            <path
                              d={menuSvgPaths.p2637acc0}
                              stroke={
                                selectedCategory === category.id
                                  ? '#D4AF37'
                                  : '#E8D4A2'
                              }
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.66584"
                            />
                          </svg>
                        </button>
                      ))}
                    </nav>

                    {/* Divider */}
                    <div className="navigation-divider absolute left-[24px] right-[24px] h-[1px] bg-[#d4af37]" />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Delivery Info Box */}
            <div className="bg-[#fbf7e8] rounded-[20px] border-[#5c0108] border-[3px] p-[32px] mb-[32px]">
              <div className="w-full">
                <h3 className="font-['Libre_Baskerville',_sans-serif] font-bold text-[#5c0108] text-[22px] text-center w-full mb-4">
                  Entregas de Natal
                </h3>
                <p className="font-['Libre_Baskerville',_sans-serif] leading-[26px] text-[#5c0108] text-[16px] text-left w-full mb-4">
                  Para garantir que todos recebam seus pedidos com
                  tranquilidade, oferecemos duas modalidades de entrega:
                </p>

                <h3 className="font-['Libre_Baskerville',_sans-serif] font-bold text-[#5c0108] text-[18px] text-left w-full mt-6 mb-3">
                  Entregas Programadas
                </h3>
                <p className="font-['Libre_Baskerville',_sans-serif] leading-[26px] text-[#5c0108] text-[16px] text-left w-full mb-3">
                  As entregas de Natal serão realizadas nos dias{' '}
                  <strong>22, 23 e 24 de dezembro</strong>, das{' '}
                  <strong>8h às 22h</strong>.
                </p>
                <p className="font-['Libre_Baskerville',_sans-serif] leading-[26px] text-[#5c0108] text-[16px] text-left w-full mb-4">
                  Essa opção é ideal para quem já fez o pedido no site e deseja
                  receber na véspera das festas, dentro do cronograma oficial de
                  Natal.
                </p>

                <h3 className="font-['Libre_Baskerville',_sans-serif] font-bold text-[#5c0108] text-[18px] text-left w-full mt-6 mb-3">
                  Entregas Rápidas
                </h3>
                <p className="font-['Libre_Baskerville',_sans-serif] leading-[26px] text-[#5c0108] text-[16px] text-left w-full mb-3">
                  <strong>Precisa receber antes?</strong>
                </p>
                <p className="font-['Libre_Baskerville',_sans-serif] leading-[26px] text-[#5c0108] text-[16px] text-left w-full mb-3">
                  Disponibilizamos também entregas com curto prazo, realizadas
                  em <strong>1 a 3 dias úteis</strong>, incluindo finais de
                  semana.
                </p>
                <p className="font-['Libre_Baskerville',_sans-serif] leading-[26px] text-[#5c0108] text-[16px] text-left w-full mb-4">
                  Para agendar essa opção, é só entrar em contato pelo WhatsApp
                  e nos avisar - nós cuidamos do resto.
                </p>

                <p className="font-['Libre_Baskerville',_sans-serif] leading-[26px] text-[#5c0108] text-[16px] text-center w-full mt-6">
                  <strong>(48) 99196-0811</strong>
                </p>
                <p className="font-['Libre_Baskerville',_sans-serif] leading-[26px] text-[#5c0108] text-[16px] text-center w-full">
                  (ou clique no ícone abaixo)
                </p>
              </div>
            </div>

            {/* Footer com Redes Sociais */}
            <div className="w-full mt-12 mb-8">
              <div className="flex justify-center items-center gap-8">
                <a
                  href="https://www.instagram.com/sweetbar.store?igsh=MWd6aTcyeXlnd2Q1dw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[rgb(212,175,55)] hover:text-[#d4af37] transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-[28px] h-[28px]" />
                </a>

                <a
                  href="https://wa.me/5548991960811"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[rgb(212,175,55)] hover:text-[#d4af37] transition-colors duration-300"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-[28px] h-[28px]" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Page */}
      <div
        className={`min-h-screen flex flex-col bg-cream ${
          showProducts ? 'block' : 'hidden'
        }`}
      >
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Sidebar - Desktop Only */}
          <aside className="hidden lg:block lg:w-80 lg:sticky lg:top-0 lg:h-screen overflow-y-auto bg-dark-burgundy">
            <div className="p-8">
              <h2 className="mb-8 pb-4 border-b text-gold border-gold">
                Categorias
              </h2>

              <nav className="space-y-3">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-6 py-4 rounded-lg transition-all duration-300 flex items-center gap-3 group ${
                      selectedCategory === category.id
                        ? 'category-button-selected'
                        : 'category-button-unselected'
                    }`}
                  >
                    <span className="text-3xl">{category.icon}</span>
                    <span className="flex-1">{category.name}</span>
                    <ChevronRight
                      className={`w-6 h-6 transition-transform group-hover:translate-x-1 ${
                        selectedCategory === category.id
                          ? 'text-gold'
                          : 'text-light-gold'
                      }`}
                    />
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header */}
            <header className="sticky top-0 z-40 px-4 md:px-8 py-4 md:py-6 shadow-md bg-dark-burgundy">
              <div className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                  <div className="flex items-center justify-between gap-2">
                    {/* Menu Button - Mobile Only */}
                    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                      <SheetTrigger asChild>
                        <button
                          className="lg:hidden p-2 rounded-lg hover:bg-opacity-20 transition-all bg-gold-opacity"
                          aria-label="Abrir menu de navegação"
                        >
                          <Menu className="w-6 h-6 text-gold" />
                        </button>
                      </SheetTrigger>
                      <SheetContent
                        side="left"
                        className="w-[280px] p-0 bg-[#5c0108] border-r border-[#f8f1dc] sheet-shadow"
                      >
                        <div className="h-full relative">
                          {/* Header */}
                          <SheetHeader className="px-[40px] pt-[40px] pb-[37px]">
                            <SheetTitle className="font-['Libre_Baskerville',_sans-serif] text-[16px] leading-[24px] text-[#d4af37] border-b border-[#d4af37] pb-3 text-left">
                              Categorias
                            </SheetTitle>
                            <SheetDescription className="sr-only">
                              Navegue pelas categorias de produtos
                            </SheetDescription>
                          </SheetHeader>

                          {/* Navigation */}
                          <nav className="px-[24px] space-y-[8px]">
                            {categories.map(category => (
                              <button
                                key={category.id}
                                onClick={() => {
                                  console.log(
                                    'Categoria clicada:',
                                    category.name
                                  );
                                  setSelectedCategory(category.id);
                                  setCurrentPage('category');
                                  setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-[12px] px-[17px] py-[15px] rounded-[10px] transition-all duration-300 ${
                                  selectedCategory === category.id
                                    ? 'bg-[#fbf7e8] border border-[#d4af37]'
                                    : 'border border-transparent'
                                }`}
                              >
                                <span
                                  className={`flex-1 text-left font-['Libre_Baskerville',_sans-serif] text-[16px] leading-[24px] ${
                                    selectedCategory === category.id
                                      ? 'text-[#d4af37]'
                                      : 'text-[#faf8f3]'
                                  }`}
                                >
                                  {category.name}
                                </span>
                                <svg
                                  className="w-[20px] h-[20px] flex-shrink-0"
                                  fill="none"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    d={menuSvgPaths.p2637acc0}
                                    stroke={
                                      selectedCategory === category.id
                                        ? '#D4AF37'
                                        : '#E8D4A2'
                                    }
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.66584"
                                  />
                                </svg>
                              </button>
                            ))}
                          </nav>

                          {/* Divider */}
                        </div>
                      </SheetContent>
                    </Sheet>

                    <div className="flex-1 text-center">
                      <h1 className="font-decorative text-cream text-clamp-large">
                        Sweet Bar Chocolates
                      </h1>
                      <p className="italic mt-1 text-light-gold text-clamp-medium">
                        Menu Especial de Natal 2025
                      </p>
                    </div>

                    {/* Cart */}
                    {/* Cart removido - usando floating cart button */}
                  </div>
                </div>
              </div>
            </header>

            {/* Products Section */}
            <div className="px-4 md:px-8 py-6 md:py-8">
              <div className="max-w-7xl mx-auto">
                {/* Category Title */}
                <div className="mb-6 md:mb-8">
                  <h2 className="font-decorative mb-2 text-burgundy text-clamp-large">
                    {currentCategory?.name}
                  </h2>
                  <Separator className="bg-gold" />
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-666">Nenhum produto encontrado.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 md:gap-8">
                    {filteredProducts.map(product => (
                      <div
                        key={product.id}
                        className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-2xl bg-white ${
                          product.featured
                            ? 'border-2 border-gold'
                            : 'border border-gray-200'
                        }`}
                      >
                        {product.featured && (
                          <div className="absolute top-3 md:top-4 right-3 md:right-4 z-10 px-2 md:px-3 py-1 rounded-full flex items-center gap-1 bg-gold">
                            <Star className="w-3 h-3 md:w-4 md:h-4 fill-current text-burgundy" />
                            <span className="text-burgundy">Destaque</span>
                          </div>
                        )}

                        <div className="aspect-[4/3] overflow-hidden">
                          <ImageCarousel
                            images={
                              product.images && product.images.length > 0
                                ? product.images
                                : [product.image]
                            }
                            alt={product.name}
                            autoPlay={true}
                          />
                        </div>

                        <div className="p-4 md:p-6">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-burgundy text-clamp-small">
                              {product.name}
                            </h3>
                            {product.tags.length > 0 && (
                              <div className="flex gap-1">
                                {product.tags.includes('vegano') && (
                                  <LeafyGreen
                                    className="w-5 h-5 flex-shrink-0"
                                    style={{
                                      color: 'var(--burgundy)',
                                    }}
                                  />
                                )}
                              </div>
                            )}
                          </div>

                          {product.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {product.tags.map(tag => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  style={{
                                    borderColor: 'var(--gold)',
                                    color: 'var(--burgundy)',
                                  }}
                                >
                                  {tagLabels[tag]}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex flex-col gap-3 pt-4 border-t border-light-gold-custom">
                            {/* Botão Descrição */}
                            <button
                              onClick={() => setDescriptionProduct(product)}
                              className="w-full px-3 py-2 rounded-lg transition-all duration-300 hover:bg-[#d4af37] hover:bg-opacity-20 text-sm bg-transparent text-[#5c0108] font-medium border-2 border-[#d4af37]"
                            >
                              Descrição
                            </button>

                            {/* Preço e Botões */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <span className="text-burgundy text-clamp-price">
                                {product.price}
                              </span>

                              <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                  onClick={() => setSelectedProduct(product)}
                                  className="flex-1 sm:flex-initial px-3 md:px-4 py-2 rounded-lg transition-all duration-300 hover:opacity-80 border btn-burgundy-outline"
                                >
                                  Detalhes
                                </button>
                                <button
                                  onClick={() => addToCart(product)}
                                  className="flex-1 sm:flex-initial px-3 md:px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 bg-dark-burgundy text-cream"
                                >
                                  <Plus className="w-4 h-4" />
                                  Adicionar
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Note */}
                <div className="mt-8 md:mt-12 p-4 md:p-6 rounded-xl text-center bg-burgundy-light border border-light-gold-custom">
                  <p className="font-decorative mb-2 text-burgundy text-clamp-footer">
                    Encomendas Personalizadas
                  </p>
                  <p className="italic text-gray-666">
                    Entre em contato para criar uma cesta personalizada com seus
                    produtos favoritos
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Description Popup */}
        <Dialog
          open={!!descriptionProduct}
          onOpenChange={() => setDescriptionProduct(null)}
        >
          <DialogContent
            className="max-w-[95vw] sm:max-w-lg"
            style={{ backgroundColor: 'var(--cream)' }}
          >
            {descriptionProduct && (
              <>
                <DialogHeader>
                  <DialogTitle
                    style={{
                      color: 'var(--burgundy)',
                      fontSize: 'clamp(1.125rem, 3vw, 1.5rem)',
                    }}
                  >
                    {descriptionProduct.name}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Descrição do produto
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                  <p className="text-gray-700 leading-relaxed">
                    {descriptionProduct.description}
                  </p>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Product Details Modal */}
        <Dialog
          open={!!selectedProduct}
          onOpenChange={() => setSelectedProduct(null)}
        >
          <DialogContent
            className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--cream)' }}
          >
            {selectedProduct && (
              <>
                <DialogHeader>
                  <DialogTitle
                    style={{
                      color: 'var(--burgundy)',
                      fontSize: 'clamp(1.25rem, 4vw, 2rem)',
                    }}
                  >
                    {selectedProduct.name}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Detalhes completos do produto incluindo ingredientes e
                    opções de entrega
                  </DialogDescription>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-4 md:gap-6 mt-4">
                  <div>
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="mb-4">
                      <p className="italic mb-2 text-gray-666">
                        {selectedProduct.description}
                      </p>
                      <p className="text-burgundy text-clamp-footer">
                        {selectedProduct.price}
                      </p>
                    </div>

                    {selectedProduct.tags.length > 0 && (
                      <div className="mb-4">
                        <h4 className="mb-2 text-burgundy">Características</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProduct.tags.map(tag => (
                            <Badge
                              key={tag}
                              style={{
                                backgroundColor: 'var(--gold)',
                                color: 'var(--burgundy)',
                              }}
                            >
                              {tagLabels[tag]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="mb-2 flex items-center gap-2 text-burgundy">
                        <Package className="w-5 h-5" />
                        Peso: {selectedProduct.weight}
                      </h4>
                    </div>

                    <div className="mb-4">
                      <h4 className="mb-2 text-burgundy">Ingredientes</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-666">
                        {selectedProduct.ingredients.map(
                          (ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                          )
                        )}
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h4 className="mb-2 flex items-center gap-2 text-burgundy">
                        <Truck className="w-5 h-5" />
                        Opções de Entrega
                      </h4>
                      <ul className="space-y-1 text-gray-666">
                        {selectedProduct.deliveryOptions.map(
                          (option, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <ChevronRight className="w-4 h-4 text-gold" />
                              {option}
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className="w-full py-3 rounded-lg transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 bg-dark-burgundy text-cream"
                    >
                      <Plus className="w-5 h-5" />
                      Adicionar ao Carrinho
                    </button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Back button on products page */}
      {showProducts && (
        <button
          onClick={() => setShowProducts(false)}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl bg-dark-burgundy text-cream"
        >
          Voltar para Início
        </button>
      )}

      {/* Cart Sheet - Global */}
      <CartSheet
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        cartTotal={cartTotal}
      />
    </>
  );
}
