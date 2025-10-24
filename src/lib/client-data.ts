
'use client';

import type { Product, Order } from './types';

/**
 * Fetches a single product by its ID using the API.
 * This function is safe to use in Client Components.
 * @param id The ID of the product to fetch.
 * @returns A promise that resolves to the product or null if not found.
 */
export async function getProductById(id: string): Promise<Product | null> {
    try {
        const response = await fetch(`/api/products/${id}`);
        
        if (!response.ok) {
            console.warn(`API failed for product ${id}. Status: ${response.status}`);
            return null;
        }

        return await response.json();

    } catch (apiError) {
        console.error(`API error fetching product ${id}.`, apiError);
        return null;
    }
}


/**
 * Submits an order to the server.
 * @param orderDetails - The details of the order to be submitted.
 * @returns A promise that resolves to the server's response.
 */
export async function submitOrder(orderDetails: Omit<Order, 'id'>) {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderDetails),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting order:', error);
    // Return a failed status that the frontend can check
    return { status: 'error', message: (error as Error).message };
  }
}
