
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getDataFromToken } from "@/lib/get-data-from-token";

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
        const loggedInUserId = await getDataFromToken(request);
        if (!loggedInUserId) {
            return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
        }

        await connectDB();
        const loggedInUser = await User.findById(loggedInUserId);
        
        const isSelfUpdate = loggedInUserId === params.id;
        const isAdmin = loggedInUser && loggedInUser.role === 'admin';

        if (!isSelfUpdate && !isAdmin) {
             return NextResponse.json({ error: "Not authorized to perform this action." }, { status: 403 });
        }

        const body = await request.json();
        
        let updateData: Record<string, any> = {};

        // A user can always update their own name
        if (body.name) {
            updateData.name = body.name;
        }

        // Handle avatar update. We are not using Cloudinary for now.
        if (body.avatar) {
             updateData.avatar = body.avatar;
        }

        // Only admins can change other fields for other users
        if (isAdmin) {
            if (body.email) updateData.email = body.email;
            if (body.age) updateData.age = body.age;
            
            // Only an admin can change roles
            if (body.role) {
                updateData.role = body.role;
            }
             // Allow admin to update other specific fields if present
            const otherAdminFields = ['status', 'forceLogoutBefore', 'ledgerBalance', 'lifetimeValue'];
            for (const field of otherAdminFields) {
                if (body[field] !== undefined) {
                    updateData[field] = body[field];
                }
            }
        }
        
        const updatedUser = await User.findByIdAndUpdate(params.id, { $set: updateData }, { new: true, runValidators: true }).select("-password");
        
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
        
        // Admins can delete any user. Users can delete themselves.
        if (!loggedInUser || (loggedInUser.role !== 'admin' && loggedInUserId !== id)) {
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
