
import type { Product } from './types';
import ProductModel from '@/models/Product';
import OrderModel from '@/models/Order';


/**
 * Fetches all products from the database. Assumes DB connection is already handled by the API route.
 * @returns A promise that resolves to an array of products.
 */
export async function getProducts(): Promise<Product[]> {
  const products = await ProductModel.find({}).sort({ dateAdded: -1 }).lean();
  // A bit of a hack to serialize the _id to a string, which is what `JSON.stringify` does.
  return JSON.parse(JSON.stringify(products));
}

/**
 * Fetches a single product by its ID from the database.
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/products/${id}`);
    if (!response.ok) {
        return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch product ${id} from API, returning null.`, error);
    return null;
  }
}

/**
 * Submits an order to the server.
 * @param orderData - The data for the order to be submitted.
 * @returns The response from the server.
 */
export async function submitOrder(orderData: any) {
    try {
        const newOrderId = `DM-${Date.now()}`;
        const newOrder = new OrderModel({
            ...orderData,
            id: newOrderId,
            customer: {
              id: orderData.customer.email, // Using email as a stable customer ID
              name: `${orderData.customer.firstName} ${orderData.customer.lastName}`,
              email: orderData.customer.email,
              avatar: 'https://placehold.co/100x100.png' // Default avatar
            }
        });
        const savedOrder = await newOrder.save();
        return { 
            status: 'success', 
            message: 'Order saved successfully',
            id: savedOrder.id,
        };
    } catch (error) {
        console.error('Could not submit order to server.', error);
        return {
            status: 'error',
            message: 'Failed to save order.'
        };
    }
}
