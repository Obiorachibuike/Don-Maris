
import type { User, Order, Product } from './types';
import { dummyOrders } from './dummy-orders';
import { dummyProducts } from './dummy-products';

const allUsers: User[] = [
    { id: 'USR001', name: 'Alex Maris', email: 'alex@donmaris.com', role: 'admin', dateJoined: '2023-01-15', avatar: 'https://placehold.co/100x100.png' },
    { id: 'USR002', name: 'Jessica Lane', email: 'jessica@donmaris.com', role: 'supplier', dateJoined: '2023-02-20', avatar: 'https://placehold.co/100x100.png' },
    { id: 'USR003', name: 'David Chen', email: 'david@donmaris.com', role: 'sales', dateJoined: '2023-03-10', avatar: 'https://placehold.co/100x100.png' },
    { id: 'USR004', name: 'Maria Rodriguez', email: 'maria@donmaris.com', role: 'accountant', dateJoined: '2023-04-05', avatar: 'https://placehold.co/100x100.png' },
    { id: 'USR005', name: 'John Smith', email: 'john@donmaris.com', role: 'sales', dateJoined: '2023-05-12', avatar: 'https://placehold.co/100x100.png' },
    { id: 'CUST001', name: 'Olivia Martin', email: 'olivia.martin@email.com', role: 'customer', dateJoined: '2023-11-23', avatar: 'https://placehold.co/100x100.png' },
    { id: 'CUST002', name: 'Jackson Lee', email: 'jackson.lee@email.com', role: 'customer', dateJoined: '2023-11-23', avatar: 'https://placehold.co/100x100.png' },
    { id: 'CUST003', name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', role: 'customer', dateJoined: '2023-11-22', avatar: 'https://placehold.co/100x100.png' },
    { id: 'CUST004', name: 'William Kim', email: 'william.kim@email.com', role: 'customer', dateJoined: '2023-11-22', avatar: 'https://placehold.co/100x100.png' },
    { id: 'CUST005', name: 'Sophia Davis', email: 'sophia.davis@email.com', role: 'customer', dateJoined: '2023-11-21', avatar: 'https://placehold.co/100x100.png' },
];

export function getAllUsers(): User[] {
    return allUsers;
}

export function getUserById(id: string): User | undefined {
    return allUsers.find(user => user.id === id);
}

export function getOrdersByUserId(userId: string): Order[] {
    return dummyOrders.filter(order => order.customer.id === userId);
}
