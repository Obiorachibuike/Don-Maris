
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/lib/get-data-from-token";
import User from "@/models/User";


export async function POST(request: NextRequest) {
    try {
        await connectDB();
    } catch (dbError: any) {
        console.error("Database connection failed:", dbError);
        return NextResponse.json({ error: "Could not connect to the database." }, { status: 500 });
    }

    try {
        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { address, city, state, zip } = await request.json();

        if (!address || !city || !state || !zip) {
            return NextResponse.json({ error: "Missing required address fields." }, { status: 400 });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { address, city, state, zip } },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Address updated successfully",
            success: true,
            data: updatedUser
        });

    } catch (error: any) {
        console.error("Failed to update address:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
