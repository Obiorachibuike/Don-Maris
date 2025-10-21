
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import OrderModel from '@/models/Order';
import { dummyOrders } from '@/lib/dummy-orders';
import type { Order } from '@/lib/types';

// Fallback function in case DB fails
function getDummyOrderById(id: string): Order | undefined {
    return dummyOrders.find(o => o.id === id);
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    try {
        await connectDB();
    } catch (dbError: any) {
        console.error(`Database connection failed for order ${id}:`, dbError);
        const fallbackOrder = getDummyOrderById(id);
        if (fallbackOrder) return NextResponse.json(fallbackOrder);
        return NextResponse.json({ error: "Could not connect to the database.", details: dbError.message }, { status: 500 });
    }
    
    try {
        const order = await OrderModel.findOne({ id: id }).lean();

        if (order) {
            return NextResponse.json(JSON.parse(JSON.stringify(order)));
        } else {
            const fallbackOrder = getDummyOrderById(id);
            if (fallbackOrder) return NextResponse.json(fallbackOrder);
            return new NextResponse('Order not found', { status: 404 });
        }
    } catch (error: any) {
        console.error(`Error fetching order ${id} from DB`, error);
        const fallbackOrder = getDummyOrderById(id);
        if (fallbackOrder) return NextResponse.json(fallbackOrder);
        return NextResponse.json({ error: `Failed to fetch order: ${error.message}` }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    try {
        await connectDB();
        const updatedData: Partial<Order> = await request.json();

        const updatedOrder = await OrderModel.findOneAndUpdate(
            { id: id },
            { $set: updatedData },
            { new: true, runValidators: true }
        ).lean();
        
        if (!updatedOrder) {
            return new NextResponse('Order not found', { status: 404 });
        }

        return NextResponse.json(JSON.parse(JSON.stringify(updatedOrder)));

    } catch (error: any) {
        console.error(`Failed to update order ${id}:`, error);
        return NextResponse.json({ error: `Failed to update order: ${error.message}` }, { status: 500 });
    }
}
