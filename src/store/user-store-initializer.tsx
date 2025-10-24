
'use client';

import { useUserStore } from '@/store/user-store';
import { useEffect, useRef } from 'react';

export function UserStoreInitializer() {
  const initialized = useRef(false);
  const { fetchUsers } = useUserStore();

  useEffect(() => {
    if (!initialized.current) {
      fetchUsers();
      initialized.current = true;
    }
  }, [fetchUsers]);

  return null;
}
