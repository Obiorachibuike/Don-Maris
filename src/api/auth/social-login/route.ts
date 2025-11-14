
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
    try {
        await connectDB();
    } catch (dbError: any) {
        console.error("Database connection failed:", dbError);
        return NextResponse.json({ error: "Could not connect to the database." }, { status: 500 });
    }

    try {
        const { name, email, avatar, provider, uid } = await request.json();

        let user = await User.findOne({ email });

        if (!user) {
            // New user, create an account
            const newUser = new User({
                name,
                email,
                avatar,
                role: 'customer',
                isVerified: true, // Social logins are considered verified
                authProvider: provider,
                authProviderId: uid,
            });
            user = await newUser.save();
        } else {
            // Existing user, update avatar if it's different
            if (user.avatar !== avatar) {
                user.avatar = avatar;
                await user.save();
            }
        }
        
        if (user.status === 'inactive') {
            return NextResponse.json({ error: "Your account has been deactivated." }, { status: 403 });
        }

        const tokenData = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
        
        const token = jwt.sign(tokenData, process.env.JWT_SECRET!, { expiresIn: '1d' });
        
        const response = NextResponse.json({
            message: "Login successful",
            success: true,
            user: {
                _id: user._id,
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
        
        response.cookies.set("token", token, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 // 1 day
        });
        
        return response;

    } catch (error: any) {
        console.error("Social login API error:", error);
        return NextResponse.json({ error: "An internal server error occurred during social login." }, { status: 500 });
    }
}
