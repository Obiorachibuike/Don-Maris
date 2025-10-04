
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/lib/get-data-from-token";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";

export async function GET(request: NextRequest) {
    await dbConnect();
    try {
        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const user = await User.findOne({ _id: userId }).select("-password");

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "User found",
            data: user
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
