
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
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews' | 'dateAdded' | 'totalSales'>) => Promise<void>;
  editProduct: (productId: string, updatedData: Partial<Omit<Product, 'id' | 'rating' | 'reviews' | 'dateAdded'>>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateStock: (productId: string, quantitySold: number, updatedBy: string) => Promise<void>;
}

const computeDerivedProducts = (products: Product[]) => {
  if (!products || products.length === 0) {
    return { 
      featured: [], 
      newArrivals: [], 
      bestRated: [], 
      bestSellers: [], 
      trending: [] 
    };
  }

  const inStockProducts = products.filter(p => p.stock > 0);

  const featured = inStockProducts.filter(p => p.isFeatured);
  
  const newArrivals = [...inStockProducts].sort((a, b) => {
    const dateA = new Date(b.dateAdded).getTime();
    const dateB = new Date(a.dateAdded).getTime();
    if (dateA !== dateB) return dateA - dateB;
    return a.id.localeCompare(b.id);
  }).slice(0, 8);

  const bestRated = [...inStockProducts].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return a.id.localeCompare(b.id);
  }).slice(0, 8);
  
  const bestSellers = [...inStockProducts].sort((a, b) => {
    // Assuming higher totalSales means better seller. If not available, fallback to stock.
    if (b.totalSales !== undefined && a.totalSales !== undefined && b.totalSales !== a.totalSales) {
        return b.totalSales - a.totalSales;
    }
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
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch from the database.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // Response was not JSON, use the status text.
          errorMessage = `Network error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const productsFromDb: Product[] = await response.json();
      
      const derived = computeDerivedProducts(productsFromDb);
      set({ 
        products: productsFromDb || [], 
        ...derived,
        isLoading: false 
      });

    } catch (error: any) {
      console.error("Failed to fetch products from API:", error.message);
      toast({
        variant: 'destructive',
        title: 'API Error',
        description: error.message,
      });
      const derived = computeDerivedProducts([]);
      set({
        products: [],
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
        const errorMessage = errorData.details ? `${errorData.error} ${errorData.details.join(', ')}` : errorData.error;
        throw new Error(errorMessage || 'Failed to add product on server');
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

      toast({
          title: "Product Added",
          description: `"${newProductFromServer.name}" has been successfully added.`,
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
  updateStock: async (productId: string, quantitySold: number, updatedBy: string) => {
    const product = get().products.find(p => p.id === productId);
    if (!product) {
        console.error(`Product with ID ${productId} not found in store.`);
        return;
    }
    
    const newStock = product.stock - quantitySold;
    
    try {
        await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                stock: newStock,
                stockChangeReason: 'Sale',
                stockChangeUser: updatedBy
            }),
        });

        set(state => {
            const updatedProducts = state.products.map(p => {
                if (p.id === productId) {
                    return { ...p, stock: newStock };
                }
                return p;
            });
            const derived = computeDerivedProducts(updatedProducts);
            return { products: updatedProducts, ...derived };
        });

    } catch (error) {
        console.error(`Failed to update stock for product ${productId}`, error);
        toast({
            variant: 'destructive',
            title: `Stock Update Failed`,
            description: `Could not update stock for ${product.name}.`,
        });
    }
  },
}));
