
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { useProductStore } from '@/store/product-store';
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
import { ProductChat } from '@/components/product-chat';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';

export default function ProductsPage() {
  const { products, isLoading, fetchProducts } = useProductStore();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  const brands = useMemo(() => [...new Set(products.map((p) => p.brand))].sort(), [products]);
  const types = useMemo(() => [...new Set(products.map((p) => p.type))].sort(), [products]);
  const maxPrice = useMemo(() => products.length > 0 ? Math.ceil(Math.max(...products.map(p => p.price))) : 100, [products]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, maxPrice]);
  const [sortOption, setSortOption] = useState('newest');
  const [timeFilter, setTimeFilter] = useState('all');
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
      setPriceRange([0, maxPrice]);
  }, [maxPrice]);
    
  useEffect(() => {
    const sortParam = searchParams.get('sort');
    const featuredParam = searchParams.get('featured');

    if (sortParam) {
        setSortOption(sortParam);
    }
    if(featuredParam) {
        setIsFeatured(featuredParam === 'true');
    }

  }, [searchParams]);

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
    setTimeFilter('all');
    setIsFeatured(false);
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(product.type);
      const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
      const featuredMatch = !isFeatured || product.isFeatured;
      
      const timeMatch = (() => {
        if (timeFilter === 'all') return true;
        const productDate = new Date(product.dateAdded);
        const now = new Date();
        let days = 0;
        if (timeFilter === 'last-week') days = 7;
        if (timeFilter === 'last-month') days = 30;
        if (timeFilter === 'last-year') days = 365;
        
        const filterDate = new Date();
        filterDate.setDate(now.getDate() - days);
        
        return productDate >= filterDate;
      })();

      return searchMatch && typeMatch && brandMatch && priceMatch && timeMatch && featuredMatch;
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
  }, [products, searchQuery, selectedTypes, selectedBrands, priceRange, sortOption, timeFilter, isFeatured]);

  const FilterControls = () => (
    <div className="flex flex-col gap-6">
       <div>
        <h3 className="text-lg font-semibold mb-3 font-headline">Featured</h3>
        <div className="flex items-center space-x-2">
            <Checkbox id="filter-featured" checked={isFeatured} onCheckedChange={(checked) => setIsFeatured(!!checked)} />
            <Label htmlFor="filter-featured" className="font-normal cursor-pointer">Only Featured Products</Label>
        </div>
      </div>
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
      <div>
        <h3 className="text-lg font-semibold mb-3 font-headline">Date Added</h3>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="last-week">Last Week</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="last-year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
       <Button onClick={clearFilters} variant="outline">
        <X className="mr-2 h-4 w-4" /> Clear Filters
      </Button>
    </div>
  );
  
  const ProductGridSkeleton = () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
            </div>
        ))}
      </div>
  )

  return (
    <>
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
              {isLoading && products.length === 0 ? (
                  <div className="space-y-4">
                      <Skeleton className="h-8 w-1/2" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-8 w-1/2" />
                      <Skeleton className="h-20 w-full" />
                  </div>
              ) : <FilterControls />}
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
            {isLoading && products.length === 0 ? (
              <ProductGridSkeleton />
            ) : filteredAndSortedProducts.length > 0 ? (
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
    <ProductChat />
    </>
  );
}
