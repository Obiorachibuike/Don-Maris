
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";

const OPAY_API_BASE = process.env.OPAY_MODE === 'test'
  ? "https://testapi.opaycheckout.com/api/v1/international"
  : "https://api.opaycheckout.com/api/v1/international";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
    } catch (dbError: any) {
        console.error("OPAY CREATE - DB CONNECTION ERROR:", dbError);
        return NextResponse.json({ error: "Database connection failed." }, { status: 500 });
    }

    let body;
    try {
        body = await req.json();
    } catch (jsonError) {
        console.error("OPAY CREATE - INVALID JSON:", jsonError);
        return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    
    const { userId, orderId } = body;

    if (!userId || !orderId) {
        return NextResponse.json({ error: "User ID and Order ID are required." }, { status: 400 });
    }

    try {
        const user = await User.findById(userId);
        const order = await Order.findById(orderId);

        if (!user || !order) {
            return NextResponse.json({ error: "User or Order not found" }, { status: 404 });
        }

        const reference = `DM-${order.id}-${Date.now()}`;
        
        const opayPayload = {
            country: user.countryCode || "NG",
            reference: reference,
            amount: {
                total: order.amount * 100, // OPay expects amount in kobo/cents
                currency: user.currency || "NGN",
            },
            returnUrl: `${req.nextUrl.origin}/payment-success?orderId=${order.id}`,
            cancelUrl: `${req.nextUrl.origin}/payment-failed?orderId=${order.id}`,
            callbackUrl: `${req.nextUrl.origin}/api/opay/callback`,
            customerVisitSource: "BROWSER",
            expireAt: 300,
            product: {
                name: "Don Maris Accessories Order",
                description: `Payment for order ${order.id}`,
            },
            userInfo: {
                userEmail: user.email,
                userId: user._id.toString(),
                userMobile: user.virtualAccountNumber || 'N/A',
                userName: user.name,
            },
            payMethod: "BankCard",
        };

        console.log("OPAY CREATE - REQUEST PAYLOAD:", JSON.stringify(opayPayload, null, 2));

        const response = await axios.post(`${OPAY_API_BASE}/cashier/create`, opayPayload, {
            headers: {
                Authorization: `Bearer ${process.env.OPAY_PUBLIC_KEY}`,
                MerchantId: process.env.OPAY_MERCHANT_ID,
                "Content-Type": "application/json",
            },
        });
        
        console.log("OPAY CREATE - RESPONSE:", response.data);

        // Associate opay reference with our order
        order.paymentDetails = {
            ...order.paymentDetails,
            opayReference: reference,
        };
        await order.save();

        return NextResponse.json(response.data);

    } catch (err: any) {
        console.error("OPAY CREATE - ERROR:", err.response?.data || err.message);
        return NextResponse.json(
            { error: err.response?.data?.message || "Failed to create payment" },
            { status: err.response?.status || 500 }
        );
    }
}
