
import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/data';
import dbConnect from '@/lib/dbConnect';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const products = await getProducts();
        return NextResponse.json(products);
    } catch (error: any) {
        console.error("Error in /api/products:", error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' }, 
            { status: 500 }
        );
    }
}
