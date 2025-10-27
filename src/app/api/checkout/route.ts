

import { NextResponse, NextRequest } from "next/server";
import Flutterwave from "flutterwave-node-v3";

import User from '@/models/User';
import Payment from '@/models/Payment'; // Import the new Payment model
import Order from '@/models/Order'; // Import the Order model

export async function POST(req: NextRequest) {
  try {
    

    const { userId, amount, orderId } = await req.json();

    const user = await User.findById(userId);
    if (!user) {
      // Find by backup ID if user is from dummy data
      const backupUser = await User.findOne({ id: userId });
      if (!backupUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    const order = await Order.findOne({ id: orderId });
    if (!order) {
       return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const baseUrl = `${req.headers.get("x-forwarded-proto") || "http"}://${req.headers.get("host")}`;

    const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY!, process.env.FLW_SECRET_KEY!);

    const tx_ref = `tx-${orderId}-${Date.now()}`;

    const payload = {
      tx_ref,
      amount,
      currency: user.currency || "USD",
      redirect_url: `${baseUrl}/api/payments/verify?tx_ref=${tx_ref}`, // Pass tx_ref
      customer: {
        email: user.email,
        name: user.name || "Customer",
      },
      customizations: {
        title: "Don Maris Accessories Payment",
        description: `Payment for Order #${orderId}`,
        logo: `${baseUrl}/logo.png`,
      },
      meta: {
        userId,
        orderId,
      }
    };

    const response = await flw.Payment.initialize(payload);

    if (!response || !response.data?.link) {
      return NextResponse.json({ error: "Failed to initialize payment", details: response.message }, { status: 500 });
    }

    // Save a pending payment record to the database
    await Payment.create({
      userId,
      orderId: order._id,
      tx_ref,
      amount,
      currency: user.currency || "USD",
      status: "unpaid",
    });

    return NextResponse.json({
      checkoutUrl: response.data.link,
      tx_ref,
    });

  } catch (error: any) {
    console.error("Payment initialization error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
