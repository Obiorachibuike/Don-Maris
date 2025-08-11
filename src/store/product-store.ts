
'use client';

import { create } from 'zustand';
import type { Product } from '@/lib/types';
import { getProducts } from '@/lib/data';
import { dummyProducts } from '@/lib/dummy-products';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews' | 'dateAdded'>) => void;
  decreaseStock: (productId: string, quantity: number) => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: true,
  error: null,
  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const products = await getProducts();
      set({ products, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch products from API, falling back to dummy data.", error);
      set({
        products: dummyProducts,
        isLoading: false,
        error: 'Could not fetch products. Displaying sample data.',
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
    set(state => ({
        products: [newProduct, ...state.products]
    }));
    // In a real app, you would also make an API call to save the product to the database.
  },
  decreaseStock: (productId: string, quantity: number) => {
    set(state => ({
        products: state.products.map(p => {
            if (p.id === productId) {
                return { ...p, stock: p.stock - quantity };
            }
            return p;
        })
    }));
  }
}));
