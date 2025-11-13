
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import { getDataFromToken } from "@/lib/get-data-from-token";
import User from "@/models/User";
import { Review } from "@/lib/types";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
    } catch (dbError: any) {
        return NextResponse.json({ error: "Could not connect to the database." }, { status: 500 });
    }

    try {
        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
        }

        const { rating, comment } = await request.json();
        if (!rating || !comment) {
            return NextResponse.json({ error: "Rating and comment are required." }, { status: 400 });
        }

        const product = await ProductModel.findOne({ id: params.id });
        if (!product) {
            return NextResponse.json({ error: "Product not found." }, { status: 404 });
        }

        const newReview: Review = {
            id: new mongoose.Types.ObjectId().toString(),
            author: user.name,
            rating,
            comment,
            date: new Date().toISOString(),
        };

        product.reviews.push(newReview);

        // Recalculate average rating
        const totalRating = product.reviews.reduce((acc: number, review: Review) => acc + review.rating, 0);
        product.rating = totalRating / product.reviews.length;

        await product.save();

        return NextResponse.json(product);

    } catch (error: any) {
        console.error("Failed to add review:", error);
        return NextResponse.json({ error: "Failed to add review." }, { status: 500 });
    }
}
