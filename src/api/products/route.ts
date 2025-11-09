
import { connectDB } from '@/lib/mongodb';
import { NextResponse, NextRequest } from 'next/server';

import ProductModel from '@/models/Product';
import type { Product, StockHistoryEntry } from '@/lib/types';

export async function GET(request: Request) {
    try {
        await connectDB();
    } catch (dbError: any) {
        console.error("Database connection failed:", dbError);
        return NextResponse.json({ error: "Could not connect to the database. Please try again later.", details: dbError.message }, { status: 500 });
    }
    
    try {
        const products = await ProductModel.find({}).sort({ dateAdded: -1 }).lean();
        // An empty array is a valid response, so we just return it.
        return NextResponse.json(JSON.parse(JSON.stringify(products)));
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
    } catch (dbError: any)_ {
        console.error("Database connection failed on POST:", dbError);
        return NextResponse.json({ error: "Could not connect to the database.", details: dbError.message }, { status: 500 });
    }

    try {
        const productData: Omit<Product, 'id'> = await request.json();
        
        // Check for uniqueness of product name (case-insensitive)
        const existingProduct = await ProductModel.findOne({ name: { $regex: new RegExp(`^${productData.name}$`, 'i') } });
        if (existingProduct) {
            return NextResponse.json({ error: `A product with the name "${productData.name}" already exists.` }, { status: 409 });
        }

        if (!productData.images || productData.images.length === 0) {
            return NextResponse.json({ error: "At least one image is required." }, { status: 400 });
        }

        const initialStockHistory: StockHistoryEntry = {
            date: new Date().toISOString(),
            quantityChange: productData.stock,
            newStockLevel: productData.stock,
            type: 'Initial',
            updatedBy: 'Admin', // In a real app, get this from session
        };

        const newProduct = new ProductModel({
            ...productData,
            id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            images: productData.images, // Use provided image URLs directly
            rating: 0,
            reviews: [],
            dateAdded: new Date().toISOString(),
            stockHistory: [initialStockHistory],
        });
        
        await newProduct.save();

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create product:", error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            return NextResponse.json({ error: "Validation failed.", details: messages }, { status: 400 });
        }

        return NextResponse.json({ error: `Failed to create product: ${error.message}` }, { status: 500 });
    }
}
