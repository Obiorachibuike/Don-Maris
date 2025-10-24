
import { connectDB } from '@/lib/dbConnect';
import Order from '@/models/Order';
import { NextRequest, NextResponse } from 'next/server';

// GET all orders
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const orders = await Order.find({}).sort({ date: -1 }).lean();
        return NextResponse.json(JSON.parse(JSON.stringify(orders)));
    } catch (error: any) {
        console.error("Failed to fetch orders:", error);
        return NextResponse.json({ error: `Failed to fetch orders: ${error.message}` }, { status: 500 });
    }
}


// POST a new order
export async function POST(request: Request) {
    try {
        await connectDB();
        const orderData = await request.json();

        const newOrder = new Order({
            ...orderData,
            id: `DM-${Date.now()}`, // Generate unique ID
        });
        
        const savedOrder = await newOrder.save();

        return NextResponse.json({ 
            status: 'success', 
            message: 'Order received successfully',
            id: savedOrder.id,
            ...savedOrder.toObject()
        });

    } catch (error: any) {
        console.error('Failed to process order:', error);
        if (error.name === 'ValidationError') {
            return NextResponse.json({ error: `Validation Error: ${error.message}` }, { status: 400 });
        }
        return new NextResponse('Error processing order', { status: 500 });
    }
}
