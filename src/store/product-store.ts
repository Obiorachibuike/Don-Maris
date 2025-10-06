
'use client';

import { create } from 'zustand';
import type { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

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
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews' | 'dateAdded'>) => void;
  editProduct: (productId: string, updatedData: Omit<Product, 'id' | 'rating' | 'reviews' | 'dateAdded'>) => Promise<void>;
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
  
  // Simulate best sellers by sorting by stock in descending order (assuming higher stock means it's a popular item that's restocked often)
  const bestSellers = [...products].sort((a, b) => {
    if (b.stock !== a.stock) return b.stock - a.stock;
    return a.id.localeCompare(b.id);
  }).slice(0, 8);

  // Simulate trending products for now, e.g., by taking some from best sellers and new arrivals
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
    if (get().products.length > 0 || (get().isLoading === false && get().products.length > 0)) {
      if (get().isLoading) set({ isLoading: false });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      let response = await fetch('/api/products');
      
      if (!response.ok) {
        let errorDetails = `Failed to fetch products: ${response.status} ${response.statusText}`;
        try {
            const errorBody = await response.json();
            errorDetails = errorBody.error || errorDetails;
        } catch (e) {
            // response body is not json or empty
        }
        throw new Error(errorDetails);
      }
      
      let products = await response.json();

      if (products.length === 0) {
        console.log("No products found, attempting to seed database...");
        try {
          const seedResponse = await fetch('/api/seed');
          if (!seedResponse.ok) {
            const seedError = await seedResponse.json();
            throw new Error(`Seeding failed: ${seedError.error || seedError.message || 'Unknown error'}`);
          }
          console.log("Database seeded successfully.");

          response = await fetch('/api/products');
          if (!response.ok) {
             let errorDetails = `Failed to fetch products after seeding: ${response.status} ${response.statusText}`;
             try {
                const errorBody = await response.json();
                errorDetails = errorBody.error || errorDetails;
             } catch(e) {}
            throw new Error(errorDetails);
          }
          products = await response.json();
        } catch (seedError: any) {
          console.error("Seeding process failed:", seedError);
          throw seedError;
        }
      }

      const { featured, newArrivals, bestRated, bestSellers, trending } = computeDerivedProducts(products);
      set({ 
        products, 
        featuredProducts: featured,
        newArrivals,
        bestRated,
        bestSellers,
        trending,
        isLoading: false 
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Could not fetch products. Please try refreshing the page.';
      console.error("Failed to fetch products from API.", error);
      set({
        isLoading: false,
        error: errorMessage,
      });
      toast({
        variant: 'destructive',
        title: 'Error Fetching Products',
        description: errorMessage
      });
    }
  },
  addProduct: (newProductData) => {
    const newProduct: Product = {
        ...newProductData,
        id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        rating: 0,
        reviews: [],
        dateAdded: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    };
    set(state => {
        const updatedProducts = [newProduct, ...state.products];
        const derived = computeDerivedProducts(updatedProducts);
        return {
            products: updatedProducts,
            ...derived
        };
    });
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
        const updatedProducts = state.products.map(p => p.id === productId ? updatedProductFromServer : p);
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

        if (!response.ok) {
            const errorData = await response.json();
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
        const derived = computeDerivedProducts(updatedProducts);
        return {
            products: updatedProducts,
            ...derived
        };
    })
  }
}));
