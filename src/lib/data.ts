
import type { Product } from './types';
import { connectDB } from './dbConnect';
import ProductModel from '@/models/Product';

/**
 * Fetches all products from the database.
 * @returns A promise that resolves to an array of products.
 */
export async function getProducts(): Promise<Product[]> {
  try {
    await connectDB();
    const products = await ProductModel.find({}).sort({ dateAdded: -1 }).lean();
    // A bit of a hack to serialize the _id to a string, which is what `JSON.stringify` does.
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("Database fetch failed:", error);
    // In a production environment, you might want to throw the error 
    // or handle it in a way that doesn't expose dummy data.
    return []; // Return empty array on error
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
        return null;
    } catch (dbError) {
        console.error(`Database error fetching product ${id}.`, dbError);
        return null;
    }
}
