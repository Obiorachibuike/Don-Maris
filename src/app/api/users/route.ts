

import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    try {
        await connectDB();
        const users = await User.find({}).select("-password").sort({ dateJoined: -1 }).setOptions({ includeInactive: includeInactive });
        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
