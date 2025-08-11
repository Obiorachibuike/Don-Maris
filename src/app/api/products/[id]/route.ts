
import { NextResponse } from 'next/server';
import type { Product } from '@/lib/types';
import { dummyProducts } from '@/lib/dummy-products';

// In a real application, this data would come from a database.
let products: Product[] = [...dummyProducts];


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

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    try {
        const updatedData: Product = await request.json();
        
        const productIndex = products.findIndex(p => p.id === id);

        if (productIndex === -1) {
            return new NextResponse('Product not found', { status: 404 });
        }

        // In a real app, you'd validate the updatedData here.
        // For this demo, we'll just merge it.
        products[productIndex] = { ...products[productIndex], ...updatedData };
        
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return NextResponse.json(products[productIndex]);

    } catch (error) {
        console.error("Failed to update product", error);
        // If an error occurs, the server state remains unchanged (dummy data).
        // A real app would have more robust error handling and transactions.
        return new NextResponse('Error updating product', { status: 500 });
    }
}
