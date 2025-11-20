
import { connectDB } from "@/lib/mongodb";
import Order from '@/models/Order';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from "@/lib/mailer";

// GET all orders
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const createdBy = searchParams.get('createdBy');
        const customerId = searchParams.get('customerId');

        const query: any = {};
        if (createdBy) {
            query.createdBy = createdBy;
        }
        if (customerId) {
            query['customer.id'] = customerId;
        }

        const orders = await Order.find(query).sort({ date: -1 }).lean();
        return NextResponse.json(JSON.parse(JSON.stringify(orders)));
    } catch (error: any) {
        console.error("Failed to fetch orders:", error);
        return NextResponse.json({ error: `Failed to fetch orders: ${error.message}` }, { status: 500 });
    }
}


// POST a new order
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const orderData = await request.json();

        // --- New Sequential ID Logic ---
        const lastOrder = await Order.findOne().sort({ date: -1 });
        let nextIdNumber = 145000;
        if (lastOrder && lastOrder.id && lastOrder.id.startsWith('DM-')) {
            const lastIdNumber = parseInt(lastOrder.id.split('-')[1], 10);
            if (!isNaN(lastIdNumber)) {
                nextIdNumber = lastIdNumber + 1;
            }
        }
        const newOrderId = `DM-${nextIdNumber}`;
        // --- End New Logic ---

        const newOrder = new Order({
            ...orderData,
            id: newOrderId, // Use the new sequential ID
        });
        
        const savedOrder = await newOrder.save();

        // If payment is not made upfront, add amount to user's ledger balance
        if (savedOrder.paymentStatus === 'Pending') {
            await User.findByIdAndUpdate(savedOrder.customer.id, {
                $inc: { 
                    ledgerBalance: savedOrder.amount,
                    lifetimeValue: savedOrder.amount,
                }
            });
        }
        
        try {
             await sendEmail({
                request,
                email: savedOrder.customer.email,
                emailType: 'ORDER_CONFIRMATION',
                userId: savedOrder.customer.id,
                orderId: savedOrder.id,
            });
        } catch (emailError: any) {
            // Log the error but don't fail the order process
            console.error(`Failed to send order confirmation email for order ${savedOrder.id}:`, emailError.message);
        }

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
