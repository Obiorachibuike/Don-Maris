

import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/mailer";

const DEVELOPER_EMAIL = 'obiorachibuike22@gmail.com';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
    } catch (dbError: any) {
        console.error("Database connection failed:", dbError);
        return NextResponse.json({ error: "Could not connect to the database. Please try again later.", details: dbError.message }, { status: 500 });
    }

    try {
        const { name, email, password } = await request.json();

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const isAdmin = email === DEVELOPER_EMAIL;
        const role = isAdmin ? 'admin' : 'customer';

        // Get user's country from IP
        let countryCode = 'NG'; // Default to Nigeria
        try {
            const ip = request.headers.get("x-forwarded-for") || '102.89.23.10';
            const geoRes = await fetch(`https://get.geojs.io/v1/ip/geo/${ip}.json`);
            if(geoRes.ok) {
                const geoData = await geoRes.json();
                countryCode = geoData.country_code || 'NG';
            }
        } catch (geoError) {
            console.error("Could not fetch geolocation data:", geoError);
        }

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            countryCode,
            isVerified: isAdmin, // Auto-verify the admin user
        });

        const savedUser = await newUser.save();

        // Send verification email only for non-admin users
        if (!isAdmin) {
            const baseUrl = new URL(request.url).origin;
            await sendEmail({ email, emailType: 'VERIFY', userId: savedUser._id, baseUrl });
        }

        return NextResponse.json({
            message: isAdmin ? "Admin user registered and verified." : "User registered successfully. Please verify your email.",
            success: true,
            user: { id: savedUser._id, name: savedUser.name, email: savedUser.email, role: savedUser.role }
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
