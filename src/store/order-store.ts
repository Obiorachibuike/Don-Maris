
'use client';

import { create } from 'zustand';
import type { Order } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  addOrder: (orderData: Omit<Order, 'id'>) => Promise<Order | null>;
  updateOrder: (orderId: string, updatedData: Partial<Order>) => Promise<Order | null>;
  deleteOrder: (orderId: string) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: true,
  error: null,
  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/api/orders');
      set({ orders: response.data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch orders.';
      set({ isLoading: false, error: errorMessage });
      toast({
        variant: 'destructive',
        title: 'Error Fetching Orders',
        description: errorMessage,
      });
    }
  },
  addOrder: async (orderData) => {
    try {
      const response = await axios.post('/api/orders', orderData);
      const newOrder: Order = response.data;
      set(state => ({
        orders: [newOrder, ...state.orders],
      }));
      return newOrder;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create order.';
      toast({
        variant: 'destructive',
        title: 'Order Creation Failed',
        description: errorMessage,
      });
      return null;
    }
  },
  updateOrder: async (orderId, updatedData) => {
    try {
      const response = await axios.put(`/api/orders/${orderId}`, updatedData);
      const updatedOrder: Order = response.data;
      set(state => ({
        orders: state.orders.map(order => order.id === orderId ? updatedOrder : order),
      }));
      return updatedOrder;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update order.';
      toast({
        variant: 'destructive',
        title: 'Order Update Failed',
        description: errorMessage,
      });
      return null;
    }
  },
  deleteOrder: async (orderId) => {
    try {
        await axios.delete(`/api/orders/${orderId}`);
        set(state => ({
            orders: state.orders.filter(order => order.id !== orderId),
        }));
        toast({ title: 'Order Deleted', description: `Order #${orderId} has been moved to the archive.` });
    } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Failed to delete order.';
        toast({
            variant: 'destructive',
            title: 'Delete Failed',
            description: errorMessage,
        });
        throw new Error(errorMessage);
    }
  },
  getOrderById: (orderId) => {
    return get().orders.find(order => order.id === orderId);
  }
}));
