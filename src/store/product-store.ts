
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
  editProduct: (productId: string, updatedData: Omit<Product, 'id' | 'rating' | 'reviews' | 'dateAdded'>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
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
        throw new Error('Failed to update product on server');
      }

      const updatedProductFromServer: Product = await response.json();

      set(state => ({
        products: state.products.map(p => p.id === productId ? updatedProductFromServer : p)
      }));
    } catch (error) {
        console.error("Failed to update product:", error);
        // Optionally handle the error in the UI
        set({ error: 'Failed to update product. Please try again.' });
    }
  },
  deleteProduct: async (productId) => {
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete product on server');
        }

        set(state => ({
            products: state.products.filter(p => p.id !== productId)
        }));
    } catch (error) {
        console.error("Failed to delete product:", error);
        set({ error: 'Failed to delete product. Please try again.' });
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
