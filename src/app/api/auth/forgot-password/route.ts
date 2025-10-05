

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
    await dbConnect();
    try {
        const { email } = await request.json();
        const user = await User.findOne({ email });

        if (!user) {
            // Still return success to not reveal if a user exists
            return NextResponse.json({ message: "If a user with that email exists, a password reset link has been sent.", success: true });
        }

        const baseUrl = new URL(request.url).origin;
        await sendEmail({ email, emailType: 'RESET', userId: user._id, baseUrl });

        return NextResponse.json({ message: "If a user with that email exists, a password reset link has been sent.", success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
