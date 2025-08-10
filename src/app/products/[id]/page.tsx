'use client'

import { getProductById } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/star-rating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

type ProductPageProps = {
  params: {
    id: string;
  };
};

export default function ProductPage({ params }: ProductPageProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const product = getProductById(params.id);

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="bg-card rounded-lg p-4 flex items-center justify-center">
            <div className="aspect-square relative w-full max-w-md">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    data-ai-hint={product.data_ai_hint}
                />
            </div>
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2">{product.name}</h1>
          <p className="text-lg text-muted-foreground mb-4">{product.brand} - {product.type}</p>
          
          <div className="flex items-center gap-2 mb-4">
            <StarRating rating={product.rating} />
            <span className="text-sm text-muted-foreground">({product.reviews.length} reviews)</span>
          </div>
          
          <p className="text-4xl font-bold text-accent mb-6">${product.price.toFixed(2)}</p>

          <p className="text-foreground/80 leading-relaxed mb-6">{product.longDescription}</p>

            <div className="flex items-center gap-4 mt-auto">
                 <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-20"
                  />
                <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                </Button>
            </div>
        </div>
      </div>

      <Separator className="my-12" />

      <div>
        <h2 className="text-3xl font-bold font-headline mb-6">Customer Reviews</h2>
        {product.reviews.length > 0 ? (
          <div className="space-y-6">
            {product.reviews.map(review => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{review.author}</CardTitle>
                      <p className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/90">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No reviews yet for this product.</p>
        )}
      </div>
    </div>
  );
}
