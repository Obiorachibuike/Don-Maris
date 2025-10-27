
import { connectDB } from '@/lib/dbConnect';
import { NextResponse } from 'next/server';

import BrandModel from '@/models/Brand';

export async function GET() {
    try {
        await connectDB();
        const brands = await BrandModel.find({}).sort({ name: 1 }).lean();
        // A simple fallback for initial setup
        if (brands.length === 0) {
            const initialBrands = [
                { id: 'brand-1', name: 'ScreenSavvy' },
                { id: 'brand-2', name: 'Pro-Tech' },
                { id: 'brand-3', name: 'PartPerfect' },
                { id: 'brand-4', name: 'GlassGuard' },
                { id: 'brand-5', name: 'FixIt' },
            ];
            await BrandModel.insertMany(initialBrands);
            return NextResponse.json(initialBrands);
        }
        return NextResponse.json(brands.map(b => ({ ...b, _id: b._id.toString() })));
    } catch (error: any) {
        console.error("Error fetching brands:", error);
        return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
    }
}
