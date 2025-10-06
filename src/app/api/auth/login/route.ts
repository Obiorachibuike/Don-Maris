
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
    try {
        await connectDB();
    } catch (dbError: any) {
        console.error("Database connection failed:", dbError);
        return NextResponse.json({ error: "Could not connect to the database. Please try again later.", details: dbError.message }, { status: 500 });
    }

    try {
        const { email, password } = await request.json();
        
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "No user found with that email address." }, { status: 404 });
        }
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return NextResponse.json({ error: "Invalid credentials provided." }, { status: 400 });
        }

        if (!user.isVerified) {
            return NextResponse.json({ error: "Please verify your email before logging in." }, { status: 400 });
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
        });
        
        response.cookies.set("token", token, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 // 1 day
        });
        
        return response;

    } catch (error: any) {
        console.error("Login API error:", error);
        return NextResponse.json({ error: "An internal server error occurred during login." }, { status: 500 });
    }
}
