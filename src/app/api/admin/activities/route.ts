
import { connectDB } from "@/lib/mongodb";
import AdminLog from "@/models/AdminLog";
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/lib/get-data-from-token";
import User from "@/models/User";

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        
        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
        }

        const user = await User.findById(userId);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: "Not authorized." }, { status: 403 });
        }

        const logs = await AdminLog.find({}).sort({ timestamp: -1 }).limit(100);
        return NextResponse.json(logs);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
