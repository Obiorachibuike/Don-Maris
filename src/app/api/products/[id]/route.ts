
import { NextResponse } from 'next/server';
import type { Product, StockHistoryEntry } from '@/lib/types';
import { connectDB } from '@/lib/dbConnect';
import ProductModel from '@/models/Product';
import { dummyProducts } from '@/lib/dummy-products';

// Fallback function in case DB fails
function getDummyProductById(id: string): Product | undefined {
    return dummyProducts.find(p => p.id === id);
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    try {
        await connectDB();
    } catch (dbError: any) {
        console.error(`Database connection failed for product ${id}:`, dbError);
        const fallbackProduct = getDummyProductById(id);
        if (fallbackProduct) return NextResponse.json(fallbackProduct);
        return NextResponse.json({ error: "Could not connect to the database.", details: dbError.message }, { status: 500 });
    }
    
    try {
        const product = await ProductModel.findOne({ id: id }).lean();

        if (product) {
            return NextResponse.json({ ...product, _id: product._id.toString() });
        } else {
            const fallbackProduct = getDummyProductById(id);
             if (fallbackProduct) return NextResponse.json(fallbackProduct);
            return new NextResponse('Product not found', { status: 404 });
        }
    } catch (error: any) {
        console.error(`Error fetching product ${id} from DB`, error);
        const fallbackProduct = getDummyProductById(id);
        if (fallbackProduct) return NextResponse.json(fallbackProduct);
        return NextResponse.json({ error: `Failed to fetch product: ${error.message}` }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    try {
        await connectDB();
    } catch (dbError: any) {
        console.error(`Database connection failed for updating product ${id}:`, dbError);
        return NextResponse.json({ error: "Could not connect to the database.", details: dbError.message }, { status: 500 });
    }
    
    try {
        const updatedData: Partial<Product> & { stockChangeReason?: StockHistoryEntry['type'], stockChangeUser?: string } = await request.json();
        const existingProduct = await ProductModel.findOne({ id: id }).lean();

        if (!existingProduct) {
            return new NextResponse('Product not found', { status: 404 });
        }
        
        // Ensure stockHistory is an array
        const newStockHistory = Array.isArray(existingProduct.stockHistory) ? [...existingProduct.stockHistory] : [];

        // Check if stock has been updated
        if (updatedData.stock !== undefined && updatedData.stock !== existingProduct.stock) {
            const stockChange: StockHistoryEntry = {
                date: new Date().toISOString(),
                quantityChange: updatedData.stock - existingProduct.stock,
                newStockLevel: updatedData.stock,
                type: updatedData.stockChangeReason || 'Admin Update',
                updatedBy: updatedData.stockChangeUser || 'Admin', // In a real app, get this from session
            };
            newStockHistory.push(stockChange);
        }

        const { stockChangeReason, stockChangeUser, ...productUpdateData } = updatedData;

        const finalUpdateData = {
            ...productUpdateData,
            stockHistory: newStockHistory,
        };

        const updatedProduct = await ProductModel.findOneAndUpdate(
            { id: id },
            { $set: finalUpdateData },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedProduct) {
            // This case should theoretically not be hit if existingProduct was found
            return new NextResponse('Product not found during update', { status: 404 });
        }

        return NextResponse.json({ ...updatedProduct, _id: updatedProduct._id.toString() });

    } catch (error: any) {
        console.error("Failed to update product", error);
        return NextResponse.json({ error: `Failed to update product: ${error.message}` }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    try {
        await connectDB();
    } catch (dbError: any) {
        console.error(`Database connection failed for deleting product ${id}:`, dbError);
        return NextResponse.json({ error: "Could not connect to the database.", details: dbError.message }, { status: 500 });
    }

    try {
        const result = await ProductModel.deleteOne({ id: id });

        if (result.deletedCount === 0) {
            return new NextResponse('Product not found', { status: 404 });
        }

        return new NextResponse(null, { status: 204 }); // No Content
    } catch (error: any) {
        console.error("Failed to delete product", error);
        return NextResponse.json({ error: `Failed to delete product: ${error.message}` }, { status: 500 });
    }
}
