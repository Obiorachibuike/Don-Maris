
'use client';

import { useProductStore } from '@/store/product-store';
import { useEffect, useRef } from 'react';

export function ProductStoreInitializer() {
  const initialized = useRef(false);
  const { fetchProducts } = useProductStore();

  useEffect(() => {
    if (!initialized.current) {
      fetchProducts();
      initialized.current = true;
    }
  }, [fetchProducts]);

  return null;
}
