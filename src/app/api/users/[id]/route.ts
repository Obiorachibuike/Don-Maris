
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import { v2 as cloudinary } from 'cloudinary';
import { getDataFromToken } from "@/lib/get-data-from-token";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
    } catch (dbError: any) {
        return NextResponse.json({ error: "Could not connect to the database." }, { status: 500 });
    }

    try {
        const authenticatedUserId = await getDataFromToken(request);
        const { id } = params;

        if (authenticatedUserId !== id) {
             return NextResponse.json({ error: "Unauthorized: You can only edit your own profile." }, { status: 403 });
        }

        const body = await request.json();
        const { name, email, age, avatar } = body;
        
        let updateData: Record<string, any> = { name, email, age };

        if (avatar && avatar.startsWith('data:image')) {
            try {
                const uploadResult = await cloudinary.uploader.upload(avatar, {
                    folder: 'don_maris_avatars',
                });
                updateData.avatar = uploadResult.secure_url;
            } catch (uploadError) {
                return NextResponse.json({ error: "Failed to upload avatar." }, { status: 500 });
            }
        }
        
        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select("-password");

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "User updated successfully",
            success: true,
            data: updatedUser,
        });
    } catch (error: any) {
        if (error.code === 11000) { // Handle duplicate email error
            return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
     try {
        await connectDB();
    } catch (dbError: any) {
        return NextResponse.json({ error: "Could not connect to the database." }, { status: 500 });
    }

    try {
        const authenticatedUserId = await getDataFromToken(request);
        const { id } = params;

        if (authenticatedUserId !== id) {
             return NextResponse.json({ error: "Unauthorized: You can only delete your own profile." }, { status: 403 });
        }

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const response = NextResponse.json({
            message: "User deleted successfully",
            success: true,
        });

        // Clear the session token cookie
        response.cookies.set('token', '', {
            httpOnly: true,
            expires: new Date(0),
            path: '/',
        });

        return response;

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
