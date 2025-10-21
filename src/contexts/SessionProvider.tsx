
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { usePathname } from 'next/navigation';

interface User {
    _id: string;
    id: string;
    name: string;
    email: string;
    role: string;
    status?: 'active' | 'inactive';
    forceLogoutBefore?: Date;
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

  const logout = useCallback(async () => {
    try {
      await axios.get('/api/auth/logout');
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get('/api/auth/me');
      const fetchedUser = res.data.data as User;

      // Forced logout check
      if (fetchedUser.forceLogoutBefore && new Date(fetchedUser.forceLogoutBefore) > new Date()) {
          console.log("Forced logout triggered.");
          await logout();
          return;
      }
      setUser(fetchedUser);

    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser, pathname]);


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
