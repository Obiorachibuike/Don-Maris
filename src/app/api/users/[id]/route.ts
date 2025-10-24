
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
        
        const loggedInUserId = await getDataFromToken(request as any);
        const { id } = params;

        if (!loggedInUserId) {
            return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
        }
        
        const loggedInUser = await User.findById(loggedInUserId);
        
        // Allow admin or supplier roles to update users, with some restrictions
        if (!loggedInUser || !['admin', 'supplier'].includes(loggedInUser.role)) {
             return NextResponse.json({ error: "Not authorized to perform this action." }, { status: 403 });
        }
        
        const body = await request.json();
        const { name, email, age, avatar, role, ...otherData } = body;
        
        let updateData: Record<string, any> = { ...otherData };

        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (age) updateData.age = age;

        // Handle role update, restricted by updater's permissions
        if (role) {
            if(loggedInUser.role !== 'admin' && role === 'admin') {
                return NextResponse.json({ error: "Only admins can assign the admin role." }, { status: 403 });
            }
             if(loggedInUser.role !== 'admin') {
                // Non-admins cannot change roles
                 return NextResponse.json({ error: "You are not authorized to change user roles." }, { status: 403 });
            }
            updateData.role = role;
        }

        // Handle avatar upload to Cloudinary
        if (avatar && avatar.startsWith('data:image')) {
            try {
                const uploadResult = await cloudinary.uploader.upload(avatar, {
                    folder: 'don_maris_avatars',
                });
                updateData.avatar = uploadResult.secure_url;
            } catch (uploadError) {
                return NextResponse.json({ error: "Failed to upload avatar." }, { status: 500 });
            }
        } else if (avatar) {
            // If avatar is not a data URI, assume it's already a URL
            updateData.avatar = avatar;
        }
        
        const updatedUser = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).select("-password");
        
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
        
        if (!loggedInUser || loggedInUser.role === 'customer') {
             return NextResponse.json({ error: "Not authorized" }, { status: 403 });
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
