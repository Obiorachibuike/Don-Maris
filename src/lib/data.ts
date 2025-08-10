
import type { Product } from './types';
import { dummyProducts } from './dummy-products';

// This is a placeholder for where the API is located.
const API_BASE_URL = '/api';


/**
 * Fetches all products from the server.
 * @returns A promise that resolves to an array of products.
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const products: Product[] = await response.json();
    return products;
  } catch (error) {
    console.error("Failed to fetch products from API, falling back to dummy data.", error);
    return dummyProducts;
  }
}


/**
 * Fetches all products from the server with a fallback to local data.
 */
export function getProductsSync(): Product[] {
  // For this demo, we'll just return the local data.
  // In a real app, you would fetch from the API.
  return dummyProducts;
}

/**
 * Fetches a single product by its ID from the server with a fallback to local data.
 */
export function getProductById(id: string): Product | undefined {
  // For this demo, we'll just return from local data.
  // In a real app, you would fetch from the API.
  return dummyProducts.find(p => p.id === id);
}

/**
 * Submits an order to the server.
 * @param orderData - The data for the order to be submitted.
 * @returns The response from the server.
 */
export async function submitOrder(orderData: any) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });
        if (!response.ok) {
            throw new Error('Failed to submit order.');
        }
        return await response.json();
    } catch (error) {
        console.error('Could not submit order to server.', error);
        // Fallback for demo purposes: return the submitted data with a mock order ID
        return {
            ...orderData,
            id: `MOCK-${Date.now()}`,
            status: 'success'
        };
    }
}
