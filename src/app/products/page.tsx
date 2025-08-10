'use client';

import { useState, useMemo } from 'react';
import type { Product } from '@/lib/types';
import { getProducts } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/product-card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatedSection } from '@/components/animated-section';

export default function ProductsPage() {
  const products = getProducts();
  const brands = [...new Set(products.map((p) => p.brand))].sort();
  const types = [...new Set(products.map((p) => p.type))].sort();
  const maxPrice = Math.max(...products.map(p => p.price));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, maxPrice]);
  const [sortOption, setSortOption] = useState('newest');

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
    setSortOption('newest');
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(product.type);
      const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
      return searchMatch && typeMatch && brandMatch && priceMatch;
    });

    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    return filtered;
  }, [products, searchQuery, selectedTypes, selectedBrands, priceRange, sortOption]);

  const FilterControls = () => (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-3 font-headline">Category</h3>
        <ScrollArea className="h-48">
          <div className="space-y-2 pr-4">
            {types.map(type => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox id={`filter-${type}`} checked={selectedTypes.includes(type)} onCheckedChange={() => handleTypeChange(type)} />
                <Label htmlFor={`filter-${type}`} className="font-normal cursor-pointer">{type}</Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-3 font-headline">Brand</h3>
        <ScrollArea className="h-48">
          <div className="space-y-2 pr-4">
            {brands.map(brand => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox id={`filter-${brand}`} checked={selectedBrands.includes(brand)} onCheckedChange={() => handleBrandChange(brand)} />
                <Label htmlFor={`filter-${brand}`} className="font-normal cursor-pointer">{brand}</Label>
              </div>
            ))}
          </div>
        </ScrollArea>
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
      <AnimatedSection>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-headline">All Products</h1>
          <p className="text-lg text-muted-foreground mt-2">Browse our extensive collection of accessories and parts.</p>
        </div>
      </AnimatedSection>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="hidden lg:block lg:col-span-1">
          <AnimatedSection>
            <div className="sticky top-24 p-6 bg-card rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-6 font-headline">Filters</h2>
              <FilterControls />
            </div>
          </AnimatedSection>
        </aside>

        <main className="lg:col-span-3">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
              <Input
                  type="search"
                  placeholder="Search for accessories..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full md:w-1/2"
                />
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
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
                        <div className="p-4">
                          <FilterControls />
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
            </div>
          </AnimatedSection>
          
          <AnimatedSection>
            {filteredAndSortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">No products found.</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters.</p>
              </div>
            )}
          </AnimatedSection>
        </main>
      </div>
    </div>
  );
}
