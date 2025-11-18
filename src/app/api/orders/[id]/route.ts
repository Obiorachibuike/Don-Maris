
import { connectDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import AdminLog from '@/models/AdminLog';
import OrderModel from '@/models/Order';
import User from '@/models/User';
import { dummyOrders } from '@/lib/dummy-orders';
import type { Order } from '@/lib/types';
import { getDataFromToken } from '@/lib/get-data-from-token';
import type { NextRequest } from 'next/server';

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
        return NextResponse.json({ error: "Could not connect to the database.", details: dbError.message }, { status: 500 });
    }
    
    try {
        const order = await OrderModel.findOne({ id: id }).lean();

        if (order) {
            return NextResponse.json(JSON.parse(JSON.stringify(order)));
        } else {
            return new NextResponse('Order not found', { status: 404 });
        }
    } catch (error: any) {
        console.error(`Error fetching order ${id} from DB`, error);
        return NextResponse.json({ error: `Failed to fetch order: ${error.message}` }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    try {
        await connectDB();
        const updatedData: Partial<Order> = await request.json();

        // If payment status is being updated, log it as an admin action
        if (updatedData.paymentStatus || updatedData.amountPaid !== undefined) {
             const loggedInUserId = await getDataFromToken(request);
             if (loggedInUserId) {
                 const adminUser = await User.findById(loggedInUserId);
                 const originalOrder = await OrderModel.findOne({ id: id }).lean();

                 if (adminUser && originalOrder) {
                     const changes = [];
                     if (updatedData.paymentStatus && updatedData.paymentStatus !== originalOrder.paymentStatus) {
                         changes.push(`Payment status from "${originalOrder.paymentStatus}" to "${updatedData.paymentStatus}"`);
                     }
                      if (updatedData.amountPaid !== undefined && updatedData.amountPaid !== originalOrder.amountPaid) {
                         changes.push(`Amount paid from "₦${originalOrder.amountPaid}" to "₦${updatedData.amountPaid}"`);
                     }

                     if(changes.length > 0) {
                        await AdminLog.create({
                            adminId: loggedInUserId,
                            adminName: adminUser.name,
                            action: 'UPDATE_USER', // Or a new 'UPDATE_PAYMENT' action
                            targetType: 'Order',
                            targetId: originalOrder.id,
                            targetName: `Order for ${originalOrder.customer.name}`,
                            details: `Updated payment for Order #${id}: ${changes.join(', ')}.`
                        });
                     }
                 }
             }
        }


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
