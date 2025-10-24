
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

// GET a single user by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const user = await User.findById(params.id).select("-password");
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json(user);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


// UPDATE a user
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
    } catch (dbError: any) {
        return NextResponse.json({ error: "Could not connect to the database." }, { status: 500 });
    }

    try {
        const loggedInUserId = await getDataFromToken(request);
        const { id } = params;

        // Allow admin to edit any user, or user to edit their own profile
        const loggedInUser = await User.findById(loggedInUserId);
        if (!loggedInUser || (loggedInUser.role === 'customer' && loggedInUserId !== id)) {
             return NextResponse.json({ error: "Not authorized to perform this action." }, { status: 403 });
        }
        
        const body = await request.json();
        const { name, email, age, avatar, role } = body;
        
        let updateData: Record<string, any> = { name, email, age };

        // Handle role update, restricted to non-customers (admins, etc.)
        if (role && loggedInUser.role !== 'customer') {
            // Prevent non-admins from making other users admin
            if(role === 'admin' && loggedInUser.role !== 'admin') {
                return NextResponse.json({ error: "Only admins can assign the admin role." }, { status: 403 });
            }
            updateData.role = role;
        }

        // Handle avatar upload
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

        return NextResponse.json(updatedUser);

    } catch (error: any) {
        if (error.code === 11000) { // Handle duplicate email error
            return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE a user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
     try {
        await connectDB();
    } catch (dbError: any) {
        return NextResponse.json({ error: "Could not connect to the database." }, { status: 500 });
    }

    try {
        const loggedInUserId = await getDataFromToken(request);
        const { id } = params;

        const loggedInUser = await User.findById(loggedInUserId);

        // User can delete themselves, or an admin can delete anyone.
        if (!loggedInUser || (loggedInUser.role === 'customer' && loggedInUserId !== id)) {
             return NextResponse.json({ error: "Not authorized to perform this action" }, { status: 403 });
        }

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const response = NextResponse.json({
            message: "User deleted successfully",
            success: true,
        });

        // If the user deleted themselves, clear their session cookie
        if (loggedInUserId === id) {
            response.cookies.set('token', '', {
                httpOnly: true,
                expires: new Date(0),
                path: '/',
            });
        }

        return response;

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
