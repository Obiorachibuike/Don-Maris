
import { connectDB } from "@/lib/mongodb";
import AdminLog from "@/models/AdminLog";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const logs = await AdminLog.find({}).sort({ timestamp: -1 }).limit(100);
        return NextResponse.json(logs);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
