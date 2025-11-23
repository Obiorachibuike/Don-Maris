

'use client';
import type { Order } from './types';

export async function submitOrder(orderDetails: Omit<Order, 'id'>): Promise<{id: string | null}> {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderDetails),
    });
    if (!response.ok) {
        throw new Error('Failed to submit order');
    }
    const data = await response.json();
    return { id: data.id };
  } catch (error) {
    console.error('Order submission error:', error);
    return { id: null };
  }
}
