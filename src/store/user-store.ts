
'use client';

import { create } from 'zustand';
import type { User } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  addUser: (newUserData: Omit<User, '_id' | 'id' | 'dateJoined'>) => Promise<void>;
  updateUser: (userId: string, updatedData: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isLoading: true,
  error: null,
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      // Pass a param to include inactive users for admin views
      const response = await axios.get('/api/users?includeInactive=true');
      set({ users: response.data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch users.';
      set({ isLoading: false, error: errorMessage });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    }
  },
  addUser: async (newUserData) => {
    try {
      const response = await axios.post('/api/auth/signup', newUserData);
      const newUser = response.data.user;
       set(state => ({
        users: [newUser, ...state.users],
      }));
       toast({
          title: "User Added",
          description: `User "${newUser.name}" has been created.`,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to add user.';
      toast({
        variant: 'destructive',
        title: 'Add User Failed',
        description: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },
  updateUser: async (userId, updatedData) => {
    try {
      const response = await axios.put(`/api/users/${userId}`, updatedData);
      const updatedUser = response.data;
      set(state => ({
        users: state.users.map(user => (user._id === userId ? { ...user, ...updatedUser } : user)),
      }));
      return updatedUser;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update user.';
       toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: errorMessage,
      });
       throw new Error(errorMessage);
    }
  },
  deleteUser: async (userId) => {
    try {
      await axios.delete(`/api/users/${userId}`);
      set(state => ({
        users: state.users.filter(user => user._id !== userId),
      }));
    } catch (error: any) {
       const errorMessage = error.response?.data?.error || 'Failed to delete user.';
       toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: errorMessage,
      });
      throw new Error(errorMessage);
    }
  }
}));
