
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { usePathname } from 'next/navigation';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    ledgerBalance?: number;
    countryCode?: string;
}

interface SessionContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  const fetchUser = useCallback(async () => {
    // No need to set loading to true here on every fetch, only on initial load.
    try {
      const res = await axios.get('/api/auth/me');
      setUser(res.data.data);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser, pathname]);

  const logout = async () => {
    try {
      await axios.get('/api/auth/logout');
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <SessionContext.Provider value={{ user, isLoading, logout, refetchUser: fetchUser }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
