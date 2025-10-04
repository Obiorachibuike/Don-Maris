
import type { User, Order, Product } from './types';
import { dummyOrders } from './dummy-orders';
import { dummyProducts } from './dummy-products';

let allUsers: User[] = [
    { id: 'USR001', name: 'Alex Maris', email: 'alex@donmaris.com', role: 'admin', dateJoined: '2023-01-15', avatar: 'https://placehold.co/100x100.png' },
    { id: 'USR002', name: 'Jessica Lane', email: 'jessica@donmaris.com', role: 'supplier', dateJoined: '2023-02-20', avatar: 'https://placehold.co/100x100.png' },
    { id: 'USR003', name: 'David Chen', email: 'david@donmaris.com', role: 'sales', dateJoined: '2023-03-10', avatar: 'https://placehold.co/100x100.png' },
    { id: 'USR004', name: 'Maria Rodriguez', email: 'maria@donmaris.com', role: 'accountant', dateJoined: '2023-04-05', avatar: 'https://placehold.co/100x100.png' },
    { id: 'USR005', name: 'John Smith', email: 'john@donmaris.com', role: 'sales', dateJoined: '2023-05-12', avatar: 'https://placehold.co/100x100.png' },
    { id: 'CUST001', name: 'Olivia Martin', email: 'olivia.martin@email.com', role: 'customer', dateJoined: '2023-11-23', avatar: 'https://placehold.co/100x100.png', ledgerBalance: 0, lifetimeValue: 219.95 },
    { id: 'CUST002', name: 'Jackson Lee', email: 'jackson.lee@email.com', role: 'customer', dateJoined: '2023-11-23', avatar: 'https://placehold.co/100x100.png', ledgerBalance: 0, lifetimeValue: 145.00 },
    { id: 'CUST003', name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', role: 'customer', dateJoined: '2023-11-22', avatar: 'https://placehold.co/100x100.png', ledgerBalance: 0, lifetimeValue: 92.48 },
    { id: 'CUST004', name: 'William Kim', email: 'william.kim@email.com', role: 'customer', dateJoined: '2023-11-22', avatar: 'https://placehold.co/100x100.png', ledgerBalance: 24.99, lifetimeValue: 24.99 },
    { id: 'CUST005', name: 'Sophia Davis', email: 'sophia.davis@email.com', role: 'customer', dateJoined: '2023-11-21', avatar: 'https://placehold.co/100x100.png', ledgerBalance: 0, lifetimeValue: 189.99 },
];

// Add ledger balances for mock customers based on their orders
dummyOrders.forEach(order => {
    const customer = allUsers.find(u => u.id === order.customer.id && u.role === 'customer');
    if (customer) {
        if (customer.ledgerBalance === undefined) customer.ledgerBalance = 0;
        if (customer.lifetimeValue === undefined) customer.lifetimeValue = 0;
        
        customer.ledgerBalance += (order.amount - order.amountPaid);
        customer.lifetimeValue += order.amountPaid;
    }
});


export function getAllUsers(): User[] {
    return allUsers;
}

export function getUserById(id: string): User | undefined {
    return allUsers.find(user => user.id === id);
}

export function getOrdersByUserId(userId: string): Order[] {
    return dummyOrders.filter(order => order.customer.id === userId);
}

export function addUser(userData: { name: string; email?: string }): User {
    const newUser: User = {
        id: `CUST${Date.now()}${Math.floor(Math.random() * 1000)}`,
        name: userData.name,
        email: userData.email || '',
        role: 'customer',
        dateJoined: new Date().toISOString(),
        avatar: 'https://placehold.co/100x100.png',
        ledgerBalance: 0,
        lifetimeValue: 0
    };
    allUsers.push(newUser);
    return newUser;
}
