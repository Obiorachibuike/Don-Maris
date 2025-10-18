

import { NextResponse, NextRequest } from 'next/server';
import { getProducts } from '@/lib/data';
import { connectDB } from '@/lib/dbConnect';
import ProductModel from '@/models/Product';
import type { Product } from '@/lib/types';

export async function GET(request: Request) {
    try {
        await connectDB();
    } catch (dbError: any) {
        console.error("Database connection failed:", dbError);
        return NextResponse.json({ error: "Could not connect to the database. Please try again later.", details: dbError.message }, { status: 500 });
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

export async function POST(request: NextRequest) {
    try {
        await connectDB();
    } catch (dbError: any) {
        console.error("Database connection failed on POST:", dbError);
        return NextResponse.json({ error: "Could not connect to the database.", details: dbError.message }, { status: 500 });
    }

    try {
        const productData: Omit<Product, 'id' | 'rating' | 'reviews' | 'dateAdded'> = await request.json();
        
        const newProduct = new ProductModel({
            ...productData,
            id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Generate a unique ID
            rating: 0,
            reviews: [],
            dateAdded: new Date().toISOString(),
        });
        
        await newProduct.save();

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create product", error);
        return NextResponse.json({ error: `Failed to create product: ${error.message}` }, { status: 500 });
    }
}
