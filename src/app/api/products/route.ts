
import { NextResponse } from 'next/server';
import type { Product } from '@/lib/types';
import { dummyProducts } from '@/lib/dummy-products';

// In a real application, this data would come from a database.
const products: Product[] = dummyProducts;


export async function GET() {
    // Simulate a delay to mimic a real API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return NextResponse.json(products);
}
