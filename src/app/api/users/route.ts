
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
    try {
        await connectDB();
        const users = await User.find({}).select("-password").sort({ dateJoined: -1 });
        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
