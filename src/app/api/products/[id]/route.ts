
import { NextResponse } from 'next/server';
import type { Product } from '@/lib/types';
import dbConnect from '@/lib/dbConnect';
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
        await dbConnect();
        const product = await ProductModel.findOne({ id: id }).lean();

        if (product) {
            return NextResponse.json({ ...product, _id: product._id.toString() });
        } else {
            return new NextResponse('Product not found', { status: 404 });
        }
    } catch (error) {
        console.error(`Error fetching product ${id} from DB`, error);
        const dummyProduct = getDummyProductById(id);
        if (dummyProduct) {
            return NextResponse.json(dummyProduct);
        }
        return new NextResponse('Product not found', { status: 404 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    try {
        await dbConnect();
        const updatedData: Partial<Product> = await request.json();
        
        const updatedProduct = await ProductModel.findOneAndUpdate(
            { id: id },
            { $set: updatedData },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedProduct) {
            return new NextResponse('Product not found', { status: 404 });
        }

        return NextResponse.json({ ...updatedProduct, _id: updatedProduct._id.toString() });

    } catch (error) {
        console.error("Failed to update product", error);
        return new NextResponse('Error updating product', { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    try {
        await dbConnect();
        const result = await ProductModel.deleteOne({ id: id });

        if (result.deletedCount === 0) {
            return new NextResponse('Product not found', { status: 404 });
        }

        return new NextResponse(null, { status: 204 }); // No Content
    } catch (error) {
        console.error("Failed to delete product", error);
        return new NextResponse('Error deleting product', { status: 500 });
    }
}
