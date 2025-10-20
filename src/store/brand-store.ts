
'use client';

import { create } from 'zustand';
import type { Brand } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface BrandState {
  brands: Brand[];
  isLoading: boolean;
  error: string | null;
  fetchBrands: () => Promise<void>;
}

export const useBrandStore = create<BrandState>((set, get) => ({
  brands: [],
  isLoading: false,
  error: null,
  fetchBrands: async () => {
    if (get().brands.length > 0) return;

    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/brands');
      if (!response.ok) {
        throw new Error('Failed to fetch brands.');
      }
      const brandsData: Brand[] = await response.json();
      set({ brands: brandsData, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch brands.',
      });
    }
  },
}));
