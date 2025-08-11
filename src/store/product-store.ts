
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
