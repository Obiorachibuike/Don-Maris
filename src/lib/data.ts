
import type { Product } from './types';
import { dummyProducts } from './dummy-products';
import axios from 'axios';
import dbConnect from './dbConnect';
import ProductModel from '@/models/Product';
import OrderModel from '@/models/Order';


/**
 * Fetches all products from the database.
 * @returns A promise that resolves to an array of products.
 */
export async function getProducts(): Promise<Product[]> {
  try {
    await dbConnect();
    const products = await ProductModel.find({}).lean();
    // The .lean() method returns a plain JavaScript object, not a Mongoose document.
    // Mongoose documents have a lot of internal state for change tracking.
    // Using .lean() is faster and uses less memory.
    // We need to convert the _id to a string for consistency.
    return products.map(p => ({ ...p, _id: p._id.toString() })) as Product[];
  } catch (error) {
    console.error("Failed to fetch products from DB, falling back to dummy data.", error);
    return dummyProducts;
  }
}


/**
 * Fetches all products from the server with a fallback to local data.
 */
export function getProductsSync(): Product[] {
  // This function is kept for components that are not yet async.
  // It will now only return dummy data as we can't synchronously fetch from DB.
  // Components using this should be migrated to use getProducts().
  return dummyProducts;
}

/**
 * Fetches a single product by its ID from the database.
 */
export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    await dbConnect();
    const product = await ProductModel.findOne({ id: id }).lean();
    if (product) {
      return { ...product, _id: product._id.toString() } as Product;
    }
    return undefined;
  } catch (error: any) {
    console.error(`Failed to fetch product ${id} from DB, falling back to dummy data.`, error);
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
        await dbConnect();
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
