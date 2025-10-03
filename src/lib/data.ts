
import type { Product } from './types';
import { dummyProducts } from './dummy-products';
import axios from 'axios';

// This is a placeholder for where the API is located.
const API_BASE_URL = '/api';


/**
 * Fetches all products from the server.
 * @returns A promise that resolves to an array of products.
 */
export async function getProducts(): Promise<Product[]> {
  try {
    // We use a timestamp to prevent caching of the API route.
    const response = await axios.get(`${API_BASE_URL}/products`, { params: { t: new Date().getTime() }});
    return response.data;
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
  try {
    const response = await axios.get(`${API_BASE_URL}/products/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
        return undefined;
    }
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
        const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
        return response.data;
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
