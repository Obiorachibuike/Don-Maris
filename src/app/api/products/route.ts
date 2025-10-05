
import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/data';
import dbConnect from '@/lib/dbConnect';

export async function GET(request: Request) {
    try {
        await dbConnect();
    } catch (dbError: any) {
        console.error("Error connecting to database in /api/products:", dbError);
        return NextResponse.json(
            { error: "Could not connect to the database.", details: dbError.message },
            { status: 500 }
        );
    }
    
    try {
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
