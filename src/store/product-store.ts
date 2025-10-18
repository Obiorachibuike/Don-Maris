

'use client';

import { create } from 'zustand';
import type { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { dummyProducts } from '@/lib/dummy-products';

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  newArrivals: Product[];
  bestSellers: Product[];
  bestRated: Product[];
  trending: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews' | 'dateAdded' | 'totalSales'>) => Promise<void>;
  editProduct: (productId: string, updatedData: Partial<Omit<Product, 'id' | 'rating' | 'reviews' | 'dateAdded'>>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  decreaseStock: (productId: string, quantity: number) => void;
}

const computeDerivedProducts = (products: Product[]) => {
  const featured = products.filter(p => p.isFeatured);
  
  const newArrivals = [...products].sort((a, b) => {
    const dateA = new Date(b.dateAdded).getTime();
    const dateB = new Date(a.dateAdded).getTime();
    if (dateA !== dateB) return dateA - dateB;
    return a.id.localeCompare(b.id);
  }).slice(0, 8);

  const bestRated = [...products].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return a.id.localeCompare(b.id);
  }).slice(0, 8);
  
  const bestSellers = [...products].sort((a, b) => {
    if (b.stock !== a.stock) return b.stock - a.stock;
    return a.id.localeCompare(b.id);
  }).slice(0, 8);

  const trending = [...bestSellers.slice(0, 4), ...newArrivals.slice(0, 4)].filter((p, i, a) => a.findIndex(p2 => p2.id === p.id) === i).slice(0, 8);

  return { featured, newArrivals, bestRated, bestSellers, trending };
};

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  featuredProducts: [],
  newArrivals: [],
  bestSellers: [],
  bestRated: [],
  trending: [],
  isLoading: true,
  error: null,
  fetchProducts: async () => {
    if (get().products.length > 0 && !get().isLoading) {
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error('Failed to fetch from the database.');
      }
      
      const productsFromDb: Product[] = await response.json();

      if (productsFromDb && productsFromDb.length > 0) {
        const derived = computeDerivedProducts(productsFromDb);
        set({ 
          products: productsFromDb, 
          ...derived,
          isLoading: false 
        });
      } else {
        throw new Error("No products found in database.");
      }

    } catch (error: any) {
      console.error("Failed to fetch products from API, falling back to dummy data.", error);
      toast({
        variant: 'destructive',
        title: 'API Error',
        description: 'Could not fetch products. Displaying local fallback data.',
      });
      const derived = computeDerivedProducts(dummyProducts);
      set({
        products: dummyProducts,
        ...derived,
        isLoading: false,
        error: error.message,
      });
    }
  },
  addProduct: async (newProductData) => {
     try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProductData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add product on server');
      }

      const newProductFromServer: Product = await response.json();

      set(state => {
        const updatedProducts = [newProductFromServer, ...state.products];
        const derived = computeDerivedProducts(updatedProducts);
        return {
            products: updatedProducts,
            ...derived
        };
      });
    } catch (error: any) {
       const errorMessage = error.message || 'Failed to add product. Please try again.';
        console.error("Failed to add product:", error);
        set({ error: errorMessage });
        toast({
          variant: 'destructive',
          title: 'Add Failed',
          description: errorMessage,
        });
    }
  },
  editProduct: async (productId, updatedData) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product on server');
      }

      const updatedProductFromServer: Product = await response.json();

      set(state => {
        const updatedProducts = state.products.map(p => p.id === productId ? { ...p, ...updatedProductFromServer } : p);
        const derived = computeDerivedProducts(updatedProducts);
        return {
            products: updatedProducts,
            ...derived
        };
      });
    } catch (error: any) {
        const errorMessage = error.message || 'Failed to update product. Please try again.';
        console.error("Failed to update product:", error);
        set({ error: errorMessage });
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: errorMessage,
        });
    }
  },
  deleteProduct: async (productId) => {
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
        });

        if (!response.ok && response.status !== 204) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to delete product on server');
        }

        set(state => {
            const updatedProducts = state.products.filter(p => p.id !== productId);
            const derived = computeDerivedProducts(updatedProducts);
            return {
                products: updatedProducts,
                ...derived
            };
        });
    } catch (error: any) {
        const errorMessage = error.message || 'Failed to delete product. Please try again.';
        console.error("Failed to delete product:", error);
        set({ error: errorMessage });
        toast({
          variant: 'destructive',
          title: 'Delete Failed',
          description: errorMessage,
        });
    }
  },
  decreaseStock: (productId: string, quantity: number) => {
    set(state => {
        const updatedProducts = state.products.map(p => {
            if (p.id === productId) {
                return { ...p, stock: p.stock - quantity };
            }
            return p;
        });
        // We don't need to recompute derived products here as stock changes don't affect them
        return { products: updatedProducts };
    })
  }
}));
