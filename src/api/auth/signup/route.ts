

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendEmail, createPaystackVirtualAccount, createFlutterwaveVirtualAccount } from "@/lib/mailer";
import { getDataFromToken } from "@/lib/get-data-from-token";

const DEVELOPER_EMAIL = 'obiorachibuike22@gmail.com';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
    } catch (dbError: any) {
        console.error("Database connection failed:", dbError);
        return NextResponse.json({ error: "Could not connect to the database. Please try again later.", details: dbError.message }, { status: 500 });
    }

    try {
        const { name, email, password, role: requestedRole } = await request.json();

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Determine user role
        const loggedInUserId = await getDataFromToken(request);
        const loggedInUser = loggedInUserId ? await User.findById(loggedInUserId) : null;
        let role = 'customer'; // Default role
        let isVerified = false;
        let createdByAdmin = false;

        // If a role is explicitly provided in the request (e.g., by an admin)
        if (requestedRole && loggedInUser && loggedInUser.role === 'admin') {
            role = requestedRole;
            isVerified = true; // Users created by admin are auto-verified
            createdByAdmin = true;
        } else if (email === DEVELOPER_EMAIL) {
            role = 'admin';
            isVerified = true;
        }

        let country = 'Nigeria';
        let countryCode = 'NG';
        let currency = 'NGN';
        try {
            const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.ip || '102.89.23.10';
            const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
            if(geoRes.ok) {
                const geoData = await geoRes.json();
                country = geoData.country_name || 'Nigeria';
                countryCode = geoData.country_code || 'NG';
                currency = geoData.currency || 'NGN';
            }
        } catch (geoError) {
            console.error("Could not fetch geolocation data:", geoError);
        }

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            country,
            countryCode,
            currency,
            isVerified,
        });

        const savedUser = await newUser.save();
        
        let virtualAccountDetails;
        if (countryCode === 'NG') {
            virtualAccountDetails = await createPaystackVirtualAccount({ name, email });
        } else {
            virtualAccountDetails = await createFlutterwaveVirtualAccount({ name, email });
        }

        if (virtualAccountDetails) {
            savedUser.virtualBankName = virtualAccountDetails.bankName;
            savedUser.virtualAccountNumber = virtualAccountDetails.accountNumber;
            savedUser.virtualAccountName = virtualAccountDetails.accountName;
            await savedUser.save();
        }

        // Send appropriate email
        if (createdByAdmin) {
            await sendEmail({ request, email, emailType: 'ADMIN_CREATED', userId: savedUser._id, password: password });
        } else if (!isVerified) {
            await sendEmail({ request, email, emailType: 'VERIFY', userId: savedUser._id });
        }

        return NextResponse.json({
            message: createdByAdmin ? "User created successfully. A welcome email has been sent." : "User registered successfully. Please verify your email.",
            success: true,
            user: { id: savedUser._id, name: savedUser.name, email: savedUser.email, role: savedUser.role }
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
