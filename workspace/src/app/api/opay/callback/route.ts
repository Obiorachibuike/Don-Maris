
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import crypto from 'crypto';

const OPAY_API_BASE = process.env.OPAY_MODE === 'test'
  ? "https://testapi.opaycheckout.com/api/v1/international"
  : "https://api.opaycheckout.com/api/v1/international";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        console.log("OPAY CALLBACK RECEIVED:", data);

        // 1. Verify webhook signature for security
        const signature = req.headers.get("x-opay-signature");
        if (process.env.OPAY_WEBHOOK_SECRET) {
            const expectedSignature = crypto
                .createHmac("sha256", process.env.OPAY_WEBHOOK_SECRET)
                .update(JSON.stringify(data))
                .digest("hex");

            if (signature !== expectedSignature) {
                console.error("Invalid OPay webhook signature.");
                return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
            }
        }

        await connectDB();

        const { reference } = data;
        if (!reference) {
            return NextResponse.json({ error: "No reference provided" }, { status: 400 });
        }
        
        // 2. Find the order in our database using the OPay reference
        const order = await Order.findOne({ 'paymentDetails.opayReference': reference });

        if (!order) {
            console.error(`Order not found for OPay reference: ${reference}`);
            // Return a success response to OPay to prevent retries for an unknown order
            return NextResponse.json({ success: true, message: "Order not found, but acknowledged." });
        }

        // 3. Auto-verify the transaction status with OPay's Query API
        const response = await axios.post(
            `${OPAY_API_BASE}/cashier/query`,
            { reference },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPAY_PUBLIC_KEY}`,
                    MerchantId: process.env.OPAY_MERCHANT_ID,
                    "Content-Type": "application/json",
                },
            }
        );

        const verifiedData = response.data.data;
        
        // 4. Update order status based on verified data
        if (verifiedData.status === 'SUCCESS') {
            order.status = 'Processing';
            order.paymentStatus = 'Paid';
            order.amountPaid = verifiedData.amount.total / 100; // Convert from kobo/cents
            if(order.paymentDetails) {
                 order.paymentDetails.opayOrderNo = verifiedData.orderNo;
            }
        } else if (verifiedData.status === 'FAILED') {
            order.status = 'Cancelled';
            order.paymentStatus = 'Not Paid';
        }
        // If status is INITIAL or PENDING, we don't change our internal status yet.

        await order.save();

        console.log(`Order ${order.id} verified and updated with status: ${verifiedData.status}`);

        // 5. Respond to OPay
        return NextResponse.json({ success: true, order });
    } catch (err: any) {
        console.error("OPAY CALLBACK ERROR:", err.response?.data || err.message);
        return NextResponse.json({ error: err.response?.data || "Callback failed" }, { status: 500 });
    }
}
