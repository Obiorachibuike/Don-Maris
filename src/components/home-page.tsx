'use client';

import { useState, useMemo } from 'react';
import type { Product } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/product-card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from './ui/scroll-area';

type HomePageProps = {
  products: Product[];
  brands: string[];
  types: string[];
  maxPrice: number;
};

export function HomePage({ products, brands, types, maxPrice }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, maxPrice]);

  const handleTypeChange = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTypes([]);
    setSelectedBrands([]);
    setPriceRange([0, maxPrice]);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(product.type);
      const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
      return searchMatch && typeMatch && brandMatch && priceMatch;
    });
  }, [products, searchQuery, selectedTypes, selectedBrands, priceRange]);

  const FilterControls = () => (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-3 font-headline">Category</h3>
        <div className="space-y-2">
          {types.map(type => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox id={type} checked={selectedTypes.includes(type)} onCheckedChange={() => handleTypeChange(type)} />
              <Label htmlFor={type} className="font-normal cursor-pointer">{type}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-3 font-headline">Brand</h3>
        <div className="space-y-2">
          {brands.map(brand => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox id={brand} checked={selectedBrands.includes(brand)} onCheckedChange={() => handleBrandChange(brand)} />
              <Label htmlFor={brand} className="font-normal cursor-pointer">{brand}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-3 font-headline">Price Range</h3>
        <Slider
          min={0}
          max={maxPrice}
          step={1}
          value={priceRange}
          onValueChange={(value) => setPriceRange(value)}
        />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>
       <Button onClick={clearFilters} variant="outline">
        <X className="mr-2 h-4 w-4" /> Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24 p-6 bg-card rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6 font-headline">Filters</h2>
            <FilterControls />
          </div>
        </aside>

        <main className="lg:col-span-3">
          <div className="mb-6">
             <Input
                type="search"
                placeholder="Search for accessories..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full"
              />
          </div>

          <div className="flex justify-between items-center mb-6">
             <h1 className="text-3xl font-bold font-headline">Products</h1>
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100%-4rem)]">
                    <div className="p-4">
                      <FilterControls />
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
             <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">No products found.</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
