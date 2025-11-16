
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface User {
    _id: string;
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
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
  const router = useRouter();
  const { toast } = useToast();

  const logout = useCallback(async () => {
    try {
      await axios.get('/api/auth/logout');
      setUser(null);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  }, [router, toast]);

  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get('/api/auth/me');
      const fetchedUser = res.data.data as User;

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
  
  const refetchUser = useCallback(async () => {
    setIsLoading(true);
    await fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);


  return (
    <SessionContext.Provider value={{ user, isLoading, logout, refetchUser }}>
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
