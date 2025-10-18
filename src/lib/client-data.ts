
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
