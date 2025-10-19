
'use client';

import type { Product } from './types';
import { dummyProducts } from './dummy-products';

/**
 * Fetches a single product by its ID using the API.
 * This function is safe to use in Client Components.
 * @param id The ID of the product to fetch.
 * @returns A promise that resolves to the product or null if not found.
 */
export async function getProductById(id: string): Promise<Product | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
        const response = await fetch(`${baseUrl}/api/products/${id}`);
        
        if (!response.ok) {
            console.warn(`API failed for product ${id}, falling back to dummy data.`);
            return dummyProducts.find(p => p.id === id) || null;
        }

        return await response.json();

    } catch (apiError) {
        console.error(`API error fetching product ${id}. Falling back to dummy data.`, apiError);
        return dummyProducts.find(p => p.id === id) || null;
    }
}


/**
 * Submits an order to the server.
 * @param orderDetails - The details of the order to be submitted.
 * @returns A promise that resolves to the server's response.
 */
export async function submitOrder(orderDetails: any) {
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
