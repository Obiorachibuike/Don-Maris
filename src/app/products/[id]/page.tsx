
'use client'

import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/star-rating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, ShoppingCart, Send } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { AnimatedSection } from '@/components/animated-section';
import { ProductChat } from '@/components/product-chat';
import type { Product, Review } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatProductType } from '@/lib/display-utils';
import { getProductById } from '@/lib/client-data';
import { cn } from '@/lib/utils';
import { WhatsAppInquiryModal } from '@/components/whatsapp-inquiry-modal';
import { useSession } from '@/contexts/SessionProvider';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating.'),
  comment: z.string().min(10, 'Review must be at least 10 characters.'),
});
type ReviewFormValues = z.infer<typeof reviewSchema>;


export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null | undefined>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useSession();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
        rating: 0,
        comment: '',
    },
  });

  useEffect(() => {
    async function loadProduct() {
      const fetchedProduct = await getProductById(productId);
      setProduct(fetchedProduct);
    }
    if (productId) {
      loadProduct();
    }
  }, [productId]);
  
  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast({
          title: "Added to cart",
          description: `${quantity} x ${product.name} has been added to your cart.`,
      });
    }
  };

  const onReviewSubmit = async (data: ReviewFormValues) => {
    if (!product) return;
    try {
      const response = await axios.post(`/api/products/${product.id}/reviews`, data);
      const updatedProduct: Product = response.data;
      setProduct(updatedProduct);
      form.reset();
      toast({
        title: 'Review Submitted',
        description: 'Thank you for your feedback!',
      });
    } catch (error) {
      console.error('Failed to submit review', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Could not submit your review. Please try again.',
      });
    }
  };

  if (product === undefined) {
    notFound();
  }
  
  if (!product) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div>
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <div className="flex gap-2 mt-4">
                        <Skeleton className="w-16 h-16 rounded-md" />
                        <Skeleton className="w-16 h-16 rounded-md" />
                        <Skeleton className="w-16 h-16 rounded-md" />
                    </div>
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-12 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
    );
  }

  const sortedReviews = product.reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
    <div className="container mx-auto px-4 py-8">
      <AnimatedSection>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="flex flex-col gap-4">
              <div className="bg-card rounded-lg p-4 flex items-center justify-center">
                  <div className="aspect-square relative w-full max-w-md">
                      <Image
                          src={product.images[selectedImage]}
                          alt={product.name}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          data-ai-hint={product.data_ai_hint}
                      />
                  </div>
              </div>
              <div className="flex gap-2 justify-center">
                  {product.images.map((image, index) => (
                      <button 
                        key={index} 
                        onClick={() => setSelectedImage(index)} 
                        className={cn(
                          "w-16 h-16 rounded-md overflow-hidden border-2 transition-all",
                          index === selectedImage ? "border-primary" : "border-transparent hover:border-muted-foreground"
                        )}
                      >
                          <Image src={image} alt={`${product.name} thumbnail ${index + 1}`} width={64} height={64} className="object-cover w-full h-full" />
                      </button>
                  ))}
              </div>
          </div>

          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2">{product.name}</h1>
            <p className="text-lg text-muted-foreground mb-4">{product.brand} - {formatProductType(product.type)}</p>
            
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={product.rating} />
              <span className="text-sm text-muted-foreground">({product.reviews.length} reviews)</span>
            </div>

            <p className="text-foreground/80 leading-relaxed mb-6">{product.longDescription}</p>

              <div className="flex flex-col sm:flex-row items-center gap-4 mt-auto">
                  <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-20"
                    />
                  <Button size="lg" variant="outline" className="w-full" onClick={() => setIsModalOpen(true)}>
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Ask Price on WhatsApp
                  </Button>
                  <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleAddToCart}>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                  </Button>
              </div>
          </div>
        </div>
      </AnimatedSection>

      <Separator className="my-12" />

      <AnimatedSection>
        <div>
          <h2 className="text-3xl font-bold font-headline mb-6">Customer Reviews</h2>
          {user ? (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Write a Review</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onReviewSubmit)} className="space-y-4">
                   <div>
                    <label className="text-sm font-medium mb-2 block">Your Rating</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => form.setValue('rating', star, { shouldValidate: true })}
                          className="focus:outline-none"
                        >
                          <Star
                            className={cn(
                              "h-7 w-7 transition-colors",
                              form.watch('rating') >= star ? "text-primary fill-primary" : "text-muted-foreground/50"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                     {form.formState.errors.rating && (
                        <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.rating.message}</p>
                    )}
                   </div>
                  
                  <Textarea
                    {...form.register('comment')}
                    placeholder={`Tell us what you think about the ${product.name}...`}
                    rows={4}
                  />
                   {form.formState.errors.comment && (
                        <p className="text-sm font-medium text-destructive">{form.formState.errors.comment.message}</p>
                    )}

                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Review
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
             <div className="text-center p-8 bg-muted rounded-lg mb-8">
                <p className="font-semibold mb-2">Want to share your experience?</p>
                <Button asChild>
                    <Link href="/login">Login to leave a review</Link>
                </Button>
            </div>
          )}

          {sortedReviews.length > 0 ? (
            <div className="space-y-6">
              {sortedReviews.map(review => (
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
            <p className="text-muted-foreground text-center py-8">No reviews yet for this product. Be the first!</p>
          )}
        </div>
      </AnimatedSection>
    </div>
    <WhatsAppInquiryModal 
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        product={product}
      />
    <ProductChat productId={product.id} productName={product.name} />
    </>
  );
}
