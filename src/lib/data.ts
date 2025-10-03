
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
    // We use a timestamp to prevent caching of the API route.
    const response = await fetch(`${API_BASE_URL}/products?t=${new Date().getTime()}`);
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
  // This function is kept for components that are not yet async.
  return dummyProducts;
}

/**
 * Fetches a single product by its ID from the server with a fallback to local data.
 */
export async function getProductById(id: string): Promise<Product | undefined> {
  // For this demo, we'll just return from local data.
  // In a real app, you would fetch from the API.
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) {
        if(response.status === 404) {
            return undefined;
        }
      throw new Error('Network response was not ok');
    }
    const product: Product = await response.json();
    return product;
  } catch (error) {
    console.error(`Failed to fetch product ${id} from API, falling back to dummy data.`, error);
    return dummyProducts.find(p => p.id === id);
  }
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
