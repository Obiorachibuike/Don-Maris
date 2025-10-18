
import type { Product } from './types';
import { connectDB } from './dbConnect';
import ProductModel from '@/models/Product';
import { dummyProducts } from './dummy-products';

/**
 * Fetches all products from the database.
 * If the database fetch fails or returns no products, it falls back to dummy data.
 * @returns A promise that resolves to an array of products.
 */
export async function getProducts(): Promise<Product[]> {
  try {
    await connectDB();
    const products = await ProductModel.find({}).sort({ dateAdded: -1 }).lean();
    if (products.length > 0) {
      // A bit of a hack to serialize the _id to a string, which is what `JSON.stringify` does.
      return JSON.parse(JSON.stringify(products));
    }
    // Fallback to dummy data if DB is empty
    return dummyProducts; 
  } catch (error) {
    console.error("Database fetch failed, falling back to dummy data:", error);
    return dummyProducts; // Fallback on error
  }
}

/**
 * Fetches a single product by its ID directly from the database.
 * This function is for SERVER-SIDE use only.
 */
export async function getProductById_SERVER(id: string): Promise<Product | null> {
    try {
        await connectDB();
        const product = await ProductModel.findOne({ id: id }).lean();
        if (product) {
            return JSON.parse(JSON.stringify(product));
        }
        return dummyProducts.find(p => p.id === id) || null;
    } catch (dbError) {
        console.error(`Database error fetching product ${id}. Falling back to dummy data.`, dbError);
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
