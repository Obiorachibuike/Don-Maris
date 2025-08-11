
import { NextResponse } from 'next/server';
import type { Product } from '@/lib/types';
import { dummyProducts } from '@/lib/dummy-products';

const products: Product[] = dummyProducts;

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const product = products.find(p => p.id === id);

    if (product) {
        // Simulate a delay to mimic a real API call
        await new Promise(resolve => setTimeout(resolve, 300));
        return NextResponse.json(product);
    } else {
        return new NextResponse('Product not found', { status: 404 });
    }
}
