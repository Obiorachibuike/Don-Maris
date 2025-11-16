
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
        const { userId, orderId } = await req.json();

        const user = await User.findById(userId);
        const order = await Order.findById(orderId);

        if (!user || !order) {
            return NextResponse.json({ error: "User or Order not found" }, { status: 404 });
        }

        const reference = `DM-${order.id}-${Date.now()}`;
        const body = {
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
                userMobile: user.virtualAccountNumber, // Assuming this might hold phone
                userName: user.name,
            },
            payMethod: "BankCard", // Can be updated based on user choice
        };

        const response = await axios.post(`${OPAY_API_BASE}/cashier/create`, body, {
            headers: {
                Authorization: `Bearer ${process.env.OPAY_PUBLIC_KEY}`,
                MerchantId: process.env.OPAY_MERCHANT_ID,
                "Content-Type": "application/json",
            },
        });
        
        // Associate opay reference with our order
        order.paymentDetails = {
            ...order.paymentDetails,
            opayReference: reference,
        };
        await order.save();


        return NextResponse.json(response.data);

    } catch (err: any) {
        console.error("OPAY CREATE ERROR:", err.response?.data || err);
        return NextResponse.json(
            { error: err.response?.data || "Failed to create payment" },
            { status: 500 }
        );
    }
}
