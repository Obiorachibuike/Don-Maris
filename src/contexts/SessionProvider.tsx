
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { usePathname, useRouter } from 'next/navigation';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
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
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleAuthRedirect = (newUser: User | null) => {
    if (newUser) {
        toast({
            title: 'Login Successful',
            description: `Welcome back, ${newUser.name}!`,
        });
        if (newUser.role !== 'customer') {
            router.push('/admin');
        } else {
            router.push('/profile');
        }
    } else {
        router.push('/');
    }
  };

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      await axios.get('/api/auth/logout');
      setUser(null);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  }, [router, toast]);
  
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // After Firebase sign-in, call our backend to create/update user and get a session cookie
      const response = await axios.post('/api/auth/social-login', {
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL,
        provider: 'google',
        uid: firebaseUser.uid,
      });

      if (response.data.success) {
        await refetchUser();
        handleAuthRedirect(response.data.user);
      }

    } catch (error) {
      console.error("Google Sign-In failed", error);
      throw error;
    }
  };

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
  
  const refetchUser = useCallback(async () => {
    setIsLoading(true);
    await fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            // If there's a Firebase user, ensure our backend session is also valid
            await fetchUser();
        } else {
            // If no Firebase user, ensure our backend session is also cleared
            if (user) { // Only logout if there was a user before
              await logout();
            }
            setIsLoading(false);
        }
    });

    return () => unsubscribe();
  }, [fetchUser, user, logout]);


  return (
    <SessionContext.Provider value={{ user, isLoading, logout, refetchUser: refetchUser, signInWithGoogle }}>
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
