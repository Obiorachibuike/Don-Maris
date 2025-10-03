
import { NextResponse } from 'next/server';
import type { Product } from '@/lib/types';
import { dummyProducts } from '@/lib/dummy-products';

// In a real application, this data would come from a database.
const products: Product[] = dummyProducts;


export async function GET(request: Request) {
    // Simulate a delay to mimic a real API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // You can add logic here to simulate an API failure for testing fallbacks
    // if (Math.random() > 0.5) {
    //   return new NextResponse('Internal Server Error', { status: 500 });
    // }
    
    return NextResponse.json(products);
}
