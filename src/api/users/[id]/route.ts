
import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import User from '@/models/User';
import { getDataFromToken } from '@/lib/get-data-from-token';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});


// GET a single user
export async function GET(request: Request, { params }: { params: { id: string } }) {
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
        console.error("Database connection failed for user update:", dbError);
        return NextResponse.json({ error: "Could not connect to the database.", details: dbError.message }, { status: 500 });
    }

    try {
        const loggedInUserId = await getDataFromToken(request);
        if (!loggedInUserId) {
            return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
        }
        
        const loggedInUser = await User.findById(loggedInUserId);
        
        const isSelfUpdate = loggedInUserId === params.id;
        const isAdmin = loggedInUser && loggedInUser.role === 'admin';

        // An admin can update any user. A user can update their own profile.
        if (!isSelfUpdate && !isAdmin) {
             return NextResponse.json({ error: "Not authorized to update this user." }, { status: 403 });
        }
        
        const body = await request.json();
        const updatePayload: any = {};

        // Sanitize body based on role
        if (isAdmin) {
            // Admin can update almost anything
            Object.assign(updatePayload, body);
            // But they cannot change password through this endpoint
            delete updatePayload.password; 
        } else if (isSelfUpdate) {
            // Regular users can only update their name and avatar
            if (body.name) updatePayload.name = body.name;
            if (body.avatar) updatePayload.avatar = body.avatar;
        }

        // Handle avatar upload if a new base64 image is provided
        if (updatePayload.avatar && updatePayload.avatar.startsWith('data:image')) {
            try {
                const result = await cloudinary.uploader.upload(updatePayload.avatar, {
                    folder: "don_maris_avatars",
                });
                updatePayload.avatar = result.secure_url;
            } catch (uploadError: any) {
                console.error("Cloudinary upload failed:", uploadError);
                return NextResponse.json({ error: "Failed to upload avatar.", details: uploadError.message }, { status: 500 });
            }
        }
        
        const updatedUser = await User.findByIdAndUpdate(params.id, { $set: updatePayload }, { new: true, runValidators: true }).select("-password");
        
        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(updatedUser);


    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE a user
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
     try {
        await connectDB();
    } catch (dbError: any) {
        console.error("Database connection failed for user deletion:", dbError);
        return NextResponse.json({ error: "Could not connect to the database.", details: dbError.message }, { status: 500 });
    }

    try {
        const loggedInUserId = await getDataFromToken(request as any);
        const loggedInUser = await User.findById(loggedInUserId);
        
        if (!loggedInUser || loggedInUser.role !== 'admin') {
             return NextResponse.json({ error: "Not authorized. Only admins can perform this action." }, { status: 403 });
        }

        const deletedUser = await User.findByIdAndDelete(params.id);
        
        if (!deletedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "User deleted successfully", success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
