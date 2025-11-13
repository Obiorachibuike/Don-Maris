
'use client';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from './star-rating';
import { Button } from './ui/button';
import { MessageSquare, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { WhatsAppInquiryModal } from './whatsapp-inquiry-modal';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAskPrice = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };
  
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    toast({
        title: "Added to cart",
        description: `1 x ${product.name} has been added.`,
    });
  };

  return (
    <>
      <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 group relative shadow-md hover:shadow-2xl hover:-translate-y-1">
        <Link href={`/products/${product.id}`} className="flex flex-col h-full bg-card rounded-lg">
          <CardHeader className="p-0">
            <div className="aspect-square relative overflow-hidden">
              <Image
                src={product.images[0] || 'https://placehold.co/600x600.png'}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                data-ai-hint={product.data_ai_hint}
              />
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-grow flex flex-col">
            <CardTitle className="text-base font-headline mb-2 leading-tight group-hover:text-primary transition-colors">
              {product.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground mb-2">{product.brand}</p>
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={product.rating} />
              <span className="text-xs text-muted-foreground">({product.reviews.length})</span>
            </div>
             <div className="mt-auto flex items-center gap-2">
                 <Button size="sm" className="w-full bg-primary/80 backdrop-blur-sm hover:bg-primary text-primary-foreground shadow-lg" onClick={handleAskPrice}>
                    <MessageSquare className="mr-2" /> Ask Price
                </Button>
                <Button size="icon" className="bg-accent/80 backdrop-blur-sm hover:bg-accent text-accent-foreground shadow-lg shrink-0" onClick={handleAddToCart}>
                    <ShoppingCart />
                </Button>
             </div>
          </CardContent>
        </Link>
      </Card>
      <WhatsAppInquiryModal 
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        product={product}
      />
    </>
  );
}
