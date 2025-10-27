
import { NextResponse } from 'next/server';

import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { dummyUsers } from '@/lib/dummy-users-for-seed';
import { dummyProducts } from '@/lib/dummy-products';
import { dummyOrders } from '@/lib/dummy-orders';
import bcrypt from 'bcryptjs';

// This endpoint is for development purposes only.
// In a production environment, you should use a more robust seeding strategy.
export async function GET() {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ message: 'Seeding is disabled in production.' }, { status: 403 });
    }
    
    try {
        
    } catch (dbError: any) {
        console.error('Database seeding failed during connection:', dbError);
        return NextResponse.json({ error: 'Database connection failed for seeding.', details: dbError.message }, { status: 500 });
    }

    try {
        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});

        // Hash passwords for dummy users
        const usersWithHashedPasswords = await Promise.all(
            dummyUsers.map(async (user) => {
                if (user.password) {
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(user.password, salt);
                    return { ...user, password: hashedPassword };
                }
                // For customers without a preset password, we can assign a default one or leave it
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash('password123', salt);
                return { ...user, password: hashedPassword };
            })
        );
        
        // Insert new data
        await User.insertMany(usersWithHashedPasswords);
        await Product.insertMany(dummyProducts);
        await Order.insertMany(dummyOrders);

        return NextResponse.json({ message: 'Database seeded successfully!' });

    } catch (error: any) {
        console.error('Database seeding failed:', error);
        return NextResponse.json({ error: 'Database seeding failed.', details: error.message }, { status: 500 });
    }
}
