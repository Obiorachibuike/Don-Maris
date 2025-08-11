
import type { Order } from './types';

// More detailed mock data for orders, including items.
export const dummyOrders: Order[] = [
    {
        id: '123456',
        customer: { id: 'CUST001', name: 'Olivia Martin', email: 'olivia.martin@email.com', avatar: 'https://placehold.co/100x100.png' },
        shippingAddress: '123 Main St, Anytown, USA 12345',
        amount: 219.95,
        status: 'Fulfilled',
        date: '2023-11-23',
        paymentMethod: 'Credit Card (**** **** **** 4242)',
        items: [
            { productId: '3', quantity: 1 }, // iPhone 14 Pro Max Screen
            { productId: '5', quantity: 1 }, // Pro-Tech 25-in-1 Repair Toolkit
        ]
    },
    {
        id: '123457',
        customer: { id: 'CUST002', name: 'Jackson Lee', email: 'jackson.lee@email.com', avatar: 'https://placehold.co/100x100.png' },
        amount: 145.00,
        status: 'Processing',
        date: '2023-11-23',
        shippingAddress: '456 Oak Ave, Anytown, USA 12345',
        paymentMethod: 'PayPal',
        items: [
             { productId: '9', quantity: 1 } // Pixel 7 Pro Screen
        ]
    },
    {
        id: '123458',
        customer: { id: 'CUST003', name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', avatar: 'https://placehold.co/100x100.png' },
        amount: 92.48,
        status: 'Fulfilled',
        date: '2023-11-22',
        shippingAddress: '789 Pine Ln, Anytown, USA 12345',
        paymentMethod: 'Credit Card (**** **** **** 5678)',
        items: [
            { productId: '10', quantity: 1 }, // S22 Ultra Backglass
            { productId: '6', quantity: 1 }, // X650 C/F
            { productId: '8', quantity: 1 }, // iPhone 12 P/F
        ]
    },
    {
        id: '123459',
        customer: { id: 'CUST004', name: 'William Kim', email: 'william.kim@email.com', avatar: 'https://placehold.co/100x100.png' },
        amount: 24.99,
        status: 'Pending',
        date: '2023-11-22',
        shippingAddress: '101 Maple Dr, Anytown, USA 12345',
        paymentMethod: 'Bank Transfer',
        items: [
            { productId: '5', quantity: 1 } // Pro-Tech 25-in-1 Repair Toolkit
        ]
    },
     {
        id: '123460',
        customer: { id: 'CUST005', name: 'Sophia Davis', email: 'sophia.davis@email.com', avatar: 'https://placehold.co/100x100.png' },
        amount: 189.99,
        status: 'Fulfilled',
        date: '2023-11-21',
        shippingAddress: '212 Birch Rd, Anytown, USA 12345',
        paymentMethod: 'Credit Card (**** **** **** 1121)',
        items: [
            { productId: '3', quantity: 1 } // iPhone 14 Pro Max Screen
        ]
    },
];

export function updateOrder(orderId: string, updatedItems: { productId: string, quantity: number }[], updatedAmount: number): Order | undefined {
    const orderIndex = dummyOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        return undefined;
    }
    
    const updatedOrder = {
        ...dummyOrders[orderIndex],
        items: updatedItems,
        amount: updatedAmount,
    };

    dummyOrders[orderIndex] = updatedOrder;

    return updatedOrder;
}
