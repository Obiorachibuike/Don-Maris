
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { NextRequest, NextResponse } from 'next/server';

// This is a one-time use endpoint to migrate old order IDs to the new format.
// Once you run this successfully, you can delete this file.
export async function GET(request: NextRequest) {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ message: 'Migration is disabled in production.' }, { status: 403 });
    }

    try {
        await connectDB();

        // 1. Find the highest existing DM- number to continue from.
        const lastOrder = await Order.findOne({ id: { $regex: /^DM-/ } }).sort({ id: -1 });
        let nextIdNumber = 14500;
        if (lastOrder && lastOrder.id && lastOrder.id.startsWith('DM-')) {
            const lastIdNumber = parseInt(lastOrder.id.split('-')[1], 10);
            if (!isNaN(lastIdNumber)) {
                nextIdNumber = lastIdNumber + 1;
            }
        }

        // 2. Find all orders that DON'T follow the DM- pattern, sorted by date.
        const ordersToMigrate = await Order.find({ id: { $not: /^DM-/ } }).sort({ date: 1 });

        if (ordersToMigrate.length === 0) {
            return NextResponse.json({ message: 'No orders found that need migration.' });
        }

        let updatedCount = 0;
        // 3. Iterate and update each order.
        for (const order of ordersToMigrate) {
            const newOrderId = `DM-${nextIdNumber}`;
            order.id = newOrderId;
            await order.save();
            nextIdNumber++;
            updatedCount++;
        }

        return NextResponse.json({ 
            message: `Migration successful! ${updatedCount} orders were updated.`,
            newStartingId: `DM-${nextIdNumber}` 
        });

    } catch (error: any) {
        console.error('Order migration failed:', error);
        return NextResponse.json({ error: 'Order migration failed.', details: error.message }, { status: 500 });
    }
}
