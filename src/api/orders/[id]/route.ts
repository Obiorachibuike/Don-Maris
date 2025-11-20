
import { connectDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import AdminLog from '@/models/AdminLog';
import OrderModel from '@/models/Order';
import DeletedOrderModel from '@/models/DeletedOrder';
import User from '@/models/User';
import type { Order } from '@/lib/types';
import { getDataFromToken } from '@/lib/get-data-from-token';
import type { NextRequest } from 'next/server';

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

        const loggedInUserId = await getDataFromToken(request);
        const adminUser = loggedInUserId ? await User.findById(loggedInUserId) : null;

        // If payment status is being updated, log it as an admin action
        if (adminUser && (updatedData.paymentStatus || updatedData.amountPaid !== undefined)) {
            const originalOrder = await OrderModel.findOne({ id: id }).lean();
            if (originalOrder) {
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
                        action: 'UPDATE_PAYMENT',
                        targetType: 'Order',
                        targetId: originalOrder.id,
                        targetName: `Order for ${originalOrder.customer.name}`,
                        details: `Updated payment for Order #${id}: ${changes.join(', ')}.`
                    });
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

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    try {
        await connectDB();
    } catch (dbError: any) {
        console.error(`Database connection failed for deleting order ${id}:`, dbError);
        return NextResponse.json({ error: "Could not connect to the database.", details: dbError.message }, { status: 500 });
    }
    
    try {
        const loggedInUserId = await getDataFromToken(request);
        if (!loggedInUserId) {
            return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
        }
        
        const adminUser = await User.findById(loggedInUserId);
        if (!adminUser || !['admin', 'accountant'].includes(adminUser.role)) {
            return NextResponse.json({ error: "Not authorized." }, { status: 403 });
        }

        const orderToDelete = await OrderModel.findOne({ id: id }).lean();
        if (!orderToDelete) {
            return new NextResponse('Order not found', { status: 404 });
        }

        // Create an archived copy in the DeletedOrder collection
        await new DeletedOrderModel({
            ...orderToDelete,
            deletedBy: adminUser.name,
            deletedAt: new Date(),
        }).save();


        // Revert ledger balance change if order was not fully paid
        if (orderToDelete.paymentStatus !== 'Paid') {
            const balanceToRevert = orderToDelete.amount - orderToDelete.amountPaid;
             if (balanceToRevert > 0) {
                await User.findOneAndUpdate({ id: orderToDelete.customer.id }, {
                    $inc: {
                        ledgerBalance: -balanceToRevert,
                        lifetimeValue: -balanceToRevert, // Also adjust lifetime value
                    }
                });
             }
        }
        
        // Now, permanently delete the order from the active collection
        await OrderModel.deleteOne({ id: id });

        await AdminLog.create({
            adminId: loggedInUserId,
            adminName: adminUser.name,
            action: 'DELETE_ORDER',
            targetType: 'Order',
            targetId: orderToDelete.id,
            targetName: `Order for ${orderToDelete.customer.name}`,
            details: `Deleted and archived order #${id}.`,
        });

        return new NextResponse(null, { status: 204 }); // No Content
    } catch (error: any) {
        console.error(`Failed to delete order ${id}:`, error);
        return NextResponse.json({ error: `Failed to delete order: ${error.message}` }, { status: 500 });
    }
}
