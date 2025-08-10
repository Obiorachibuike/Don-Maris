
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const orderData = await request.json();

        // In a real application, you would save the order to a database.
        // For this demo, we'll just log it and return a success response.
        console.log('Received new order:', orderData);

        // Simulate some processing time
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generate a mock order ID
        const orderId = `SRV-${Date.now()}`;

        return NextResponse.json({ 
            status: 'success', 
            message: 'Order received successfully',
            id: orderId,
            ...orderData 
        });

    } catch (error) {
        console.error('Failed to process order:', error);
        return new NextResponse('Error processing order', { status: 500 });
    }
}
