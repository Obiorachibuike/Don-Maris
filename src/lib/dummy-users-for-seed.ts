
import type { User } from './types';

// This file is specifically for seeding, including plain-text passwords
// which will be hashed by the seed script. DO NOT use these directly in the app.

export const dummyUsers: Partial<User>[] = [
    { _id: 'USR001', id: 'USR001', name: 'Alex Maris', email: 'alex@donmaris.com', password: 'password123', role: 'admin', isVerified: true, dateJoined: '2023-01-15', avatar: 'https://placehold.co/100x100.png' },
    { _id: 'USR002', id: 'USR002', name: 'Jessica Lane', email: 'jessica@donmaris.com', password: 'password123', role: 'supplier', isVerified: true, dateJoined: '2023-02-20', avatar: 'https://placehold.co/100x100.png' },
    { _id: 'USR003', id: 'USR003', name: 'David Chen', email: 'david@donmaris.com', password: 'password123', role: 'sales', isVerified: true, dateJoined: '2023-03-10', avatar: 'https://placehold.co/100x100.png' },
    { _id: 'USR004', id: 'USR004', name: 'Maria Rodriguez', email: 'maria@donmaris.com', password: 'password123', role: 'accountant', isVerified: true, dateJoined: '2023-04-05', avatar: 'https://placehold.co/100x100.png' },
    { _id: 'USR005', id: 'USR005', name: 'John Smith', email: 'john@donmaris.com', password: 'password123', role: 'sales', isVerified: true, dateJoined: '2023-05-12', avatar: 'https://placehold.co/100x100.png' },
    { _id: 'CUST001', id: 'CUST001', name: 'Olivia Martin', email: 'olivia.martin@email.com', password: 'password123', role: 'customer', isVerified: true, dateJoined: '2023-11-23', avatar: 'https://placehold.co/100x100.png', ledgerBalance: 0, lifetimeValue: 219.95 },
    { _id: 'CUST002', id: 'CUST002', name: 'Jackson Lee', email: 'jackson.lee@email.com', password: 'password123', role: 'customer', isVerified: true, dateJoined: '2023-11-23', avatar: 'https://placehold.co/100x100.png', ledgerBalance: 0, lifetimeValue: 145.00 },
    { _id: 'CUST003', id: 'CUST003', name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', password: 'password123', role: 'customer', isVerified: true, dateJoined: '2023-11-22', avatar: 'https://placehold.co/100x100.png', ledgerBalance: 0, lifetimeValue: 92.48 },
    { _id: 'CUST004', id: 'CUST004', name: 'William Kim', email: 'william.kim@email.com', password: 'password123', role: 'customer', isVerified: true, dateJoined: '2023-11-22', avatar: 'https://placehold.co/100x100.png', ledgerBalance: 24.99, lifetimeValue: 24.99 },
    { _id: 'CUST005', id: 'CUST005', name: 'Sophia Davis', email: 'sophia.davis@email.com', password: 'password123', role: 'customer', isVerified: true, dateJoined: '2023-11-21', avatar: 'https://placehold.co/100x100.png', ledgerBalance: 0, lifetimeValue: 189.99 },
];
