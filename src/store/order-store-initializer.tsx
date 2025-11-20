
'use client';

import { useOrderStore } from '@/store/order-store';
import { useEffect, useRef } from 'react';

export function OrderStoreInitializer() {
  const initialized = useRef(false);
  const { fetchOrders } = useOrderStore();

  useEffect(() => {
    if (!initialized.current) {
      fetchOrders();
      initialized.current = true;
    }
  }, [fetchOrders]);

  return null;
}
