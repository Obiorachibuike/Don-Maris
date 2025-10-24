
import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import ProductModel from '@/models/Product';
import type { Product, StockHistoryEntry } from '@/lib/types';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function GET(request: Request) {
    try {
        await connectDB();
    } catch (dbError: any) {
        console.error("Database connection failed:", dbError);
        return NextResponse.json({ error: "Could not connect to the database. Please try again later.", details: dbError.message }, { status: 500 });
    }
    
    try {
        const products = await ProductModel.find({}).sort({ dateAdded: -1 }).lean();
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
    } catch (dbError: any) {
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

        const uploadedImageUrls = [];
        try {
            for (const image of productData.images) {
                // Assuming images are base64 data URIs
                const result = await cloudinary.uploader.upload(image, {
                    folder: "don_maris_products",
                });
                uploadedImageUrls.push(result.secure_url);
            }
        } catch (uploadError: any) {
            console.error("Cloudinary upload failed:", uploadError);
            return NextResponse.json({ error: "Failed to upload one or more images to Cloudinary.", details: uploadError.message }, { status: 500 });
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
            images: uploadedImageUrls, // Use Cloudinary URLs
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
