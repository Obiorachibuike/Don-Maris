
import { getProducts } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle, Smartphone, Truck } from 'lucide-react';
import { AnimatedSection } from '@/components/animated-section';

export default function Home() {
  const allProducts = getProducts();
  const featuredProducts = allProducts.filter(p => p.isFeatured);
  const newArrivals = allProducts.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <AnimatedSection>
        <section className="bg-gradient-to-br from-primary to-accent py-20 md:py-32">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-bold font-headline leading-tight text-primary-foreground">
                Quality Parts, Expertly Delivered
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80">
                Your one-stop shop for high-quality phone accessories and repair parts. Find exactly what you need to keep your devices running perfectly.
              </p>
              <div className="flex gap-4 justify-center md:justify-start">
                <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
                  <Link href="/products">Shop All Products <ArrowRight className="ml-2" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-white border-white/50 hover:bg-white/10 hover:text-white">
                  <Link href="/recommendations">AI Recommender</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-64 md:h-96">
              <Image 
                src="https://placehold.co/700x500.png"
                alt="Assortment of phone accessories"
                fill
                className="object-cover rounded-lg shadow-xl"
                data-ai-hint="phone accessories"
              />
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Featured Products Section */}
      <AnimatedSection>
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10 font-headline">Featured Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>
      
      {/* Why Choose Us Section */}
      <AnimatedSection>
        <section className="bg-card py-16">
          <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-10 font-headline">Why Choose Don Maris?</h2>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div className="p-6">
                      <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-bold font-headline mb-2">Quality Guaranteed</h3>
                      <p className="text-muted-foreground">We source only the highest-quality parts and accessories to ensure performance and longevity.</p>
                  </div>
                  <div className="p-6">
                      <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-bold font-headline mb-2">Fast Shipping</h3>
                      <p className="text-muted-foreground">Get your orders quickly with our reliable and efficient shipping network.</p>
                  </div>
                  <div className="p-6">
                      <Smartphone className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-bold font-headline mb-2">Expert Support</h3>
                      <p className="text-muted-foreground">Our knowledgeable team is here to help you find the perfect part for your repair or upgrade.</p>
                  </div>
              </div>
          </div>
        </section>
      </AnimatedSection>

      {/* New Arrivals Section */}
      <AnimatedSection>
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10 font-headline">New Arrivals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
