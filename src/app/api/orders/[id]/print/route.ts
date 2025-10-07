
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import OrderModel from '@/models/Order';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    try {
        await connectDB();
    } catch (dbError: any) {
        console.error(`Database connection failed for printing order ${id}:`, dbError);
        return NextResponse.json({ error: "Could not connect to the database.", details: dbError.message }, { status: 500 });
    }
    
    try {
        const { printedBy } = await request.json();
        if (!printedBy) {
            return NextResponse.json({ error: 'printedBy field is required.' }, { status: 400 });
        }

        const newPrintEntry = {
            printedBy,
            printedAt: new Date().toISOString(),
        };

        const updatedOrder = await OrderModel.findOneAndUpdate(
            { id: id },
            { $push: { printHistory: newPrintEntry } },
            { new: true }
        ).lean();

        if (!updatedOrder) {
            return new NextResponse('Order not found', { status: 404 });
        }

        return NextResponse.json(JSON.parse(JSON.stringify(updatedOrder)));

    } catch (error: any) {
        console.error(`Failed to record print for order ${id}:`, error);
        return NextResponse.json({ error: `Failed to record print: ${error.message}` }, { status: 500 });
    }
}
