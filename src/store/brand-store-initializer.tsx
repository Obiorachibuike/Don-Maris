
'use client';

import { useBrandStore } from '@/store/brand-store';
import { useEffect, useRef } from 'react';

export function BrandStoreInitializer() {
  const initialized = useRef(false);
  const { fetchBrands } = useBrandStore();

  useEffect(() => {
    if (!initialized.current) {
      fetchBrands();
      initialized.current = true;
    }
  }, [fetchBrands]);

  return null;
}
