

'use client';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from './star-rating';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
      <Link href={`/products/${product.id}`} className="flex flex-col h-full bg-card rounded-lg">
        <CardHeader className="p-0">
          <div className="aspect-square relative">
            <Image
              src={product.images[0] || 'https://placehold.co/600x600.png'}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint={product.data_ai_hint}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg font-headline mb-2 leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <StarRating rating={product.rating} />
            <span className="text-xs text-muted-foreground">({product.reviews.length} reviews)</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <p className="text-2xl font-semibold font-headline text-accent">
            ₦{product.price.toFixed(2)}
          </p>
          <Button size="icon" variant="outline" onClick={handleAddToCart} title="Add to cart">
             <ShoppingCart className="h-5 w-5" />
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
}
