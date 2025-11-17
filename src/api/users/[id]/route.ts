
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import AdminLog from "@/models/AdminLog";
import { getDataFromToken } from "@/lib/get-data-from-token";
import { v2 as cloudinary } from 'cloudinary';

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
        const loggedInUserId = await getDataFromToken(request);
        if (!loggedInUserId) {
            return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
        }

        await connectDB();
        const loggedInUser = await User.findById(loggedInUserId);
        
        const isSelfUpdate = loggedInUserId === params.id;
        const isAdmin = loggedInUser && loggedInUser.role === 'admin';
        const isAccountant = loggedInUser && loggedInUser.role === 'accountant';

        if (!isSelfUpdate && !isAdmin && !isAccountant) {
             return NextResponse.json({ error: "Not authorized to perform this action." }, { status: 403 });
        }

        const body = await request.json();
        const targetUser = await User.findById(params.id);

        if(!targetUser) {
            return NextResponse.json({ error: "User to update not found." }, { status: 404 });
        }
        
        let updateData: Record<string, any> = {};
        let changes: string[] = [];

        // A user can always update their own name
        if (body.name && body.name !== targetUser.name) {
            updateData.name = body.name;
            changes.push(`Name changed from "${targetUser.name}" to "${body.name}"`);
        }
        
        if (body.avatar && body.avatar !== targetUser.avatar) {
            if (body.avatar.startsWith('data:image')) {
                 try {
                    const uploadResult = await cloudinary.uploader.upload(body.avatar, {
                        folder: 'don_maris_avatars',
                    });
                    updateData.avatar = uploadResult.secure_url;
                } catch (uploadError) {
                    return NextResponse.json({ error: "Failed to upload avatar." }, { status: 500 });
                }
            } else {
                updateData.avatar = body.avatar;
            }
             changes.push(`Avatar updated.`);
        }

        // Admins can change more fields
        if (isAdmin) {
            if (body.email && body.email !== targetUser.email) {
                updateData.email = body.email;
                changes.push(`Email changed from "${targetUser.email}" to "${body.email}"`);
            }
            if (body.age && body.age !== targetUser.age) {
                updateData.age = body.age;
                changes.push(`Age changed from "${targetUser.age || 'N/A'}" to "${body.age}"`);
            }
            if (body.role && body.role !== targetUser.role) {
                updateData.role = body.role;
                changes.push(`Role changed from "${targetUser.role}" to "${body.role}"`);
            }
            const otherAdminFields = ['status', 'forceLogoutBefore', 'ledgerBalance', 'lifetimeValue'];
            for (const field of otherAdminFields) {
                if (body[field] !== undefined && body[field] !== targetUser[field]) {
                    updateData[field] = body[field];
                    changes.push(`${field} changed from "${targetUser[field] || 'N/A'}" to "${body[field]}"`);
                }
            }
        }
        
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(targetUser); // No changes
        }

        const updatedUser = await User.findByIdAndUpdate(params.id, { $set: updateData }, { new: true, runValidators: true }).select("-password");
        
        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        
        // Log the administrative action if it wasn't a self-update
        if (!isSelfUpdate && (isAdmin || isAccountant)) {
             await AdminLog.create({
                adminId: loggedInUserId,
                adminName: loggedInUser.name,
                action: 'UPDATE_USER',
                targetType: 'User',
                targetId: params.id,
                targetName: targetUser.name,
                details: changes.join(', '),
            });
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

        const userToDelete = await User.findById(id);
        if (!userToDelete) {
             return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const deletedUser = await User.findByIdAndDelete(id);
        
        if (loggedInUser.role === 'admin' && loggedInUserId !== id) {
            await AdminLog.create({
                adminId: loggedInUserId,
                adminName: loggedInUser.name,
                action: 'DELETE_USER',
                targetType: 'User',
                targetId: id,
                targetName: userToDelete.name,
                details: `User account for ${userToDelete.name} (${userToDelete.email}) was permanently deleted.`,
            });
        }


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

    