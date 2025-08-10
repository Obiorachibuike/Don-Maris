
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
}

export const useProductStore = create<ProductState>((set) => ({
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
}));
