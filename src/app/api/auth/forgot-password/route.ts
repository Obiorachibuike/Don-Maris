

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
    try {
        await connectDB();
    } catch (dbError: any) {
        console.error("Database connection failed:", dbError);
        return NextResponse.json({ error: "Could not connect to the database. Please try again later.", details: dbError.message }, { status: 500 });
    }

    try {
        const { email } = await request.json();
        const user = await User.findOne({ email });

        if (!user) {
            // Still return success to not reveal if a user exists
            return NextResponse.json({ message: "If a user with that email exists, a password reset link has been sent.", success: true });
        }

        await sendEmail({ request, email, emailType: 'RESET', userId: user._id });

        return NextResponse.json({ message: "If a user with that email exists, a password reset link has been sent.", success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
