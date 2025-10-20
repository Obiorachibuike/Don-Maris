
import { NextResponse, NextRequest } from "next/server";
import Flutterwave from "flutterwave-node-v3";
import { connectDB } from '@/lib/dbConnect';
import User from '@/models/User';
import Payment from '@/models/Payment'; // Import the new Payment model

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { userId, amount, orderId } = await req.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const baseUrl = `${req.headers.get("x-forwarded-proto") || "http"}://${req.headers.get("host")}`;

    const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY!, process.env.FLW_SECRET_KEY!);

    const tx_ref = `tx-${orderId}-${Date.now()}`;

    const payload = {
      tx_ref,
      amount,
      currency: user.currency || "USD",
      redirect_url: `${baseUrl}/api/payments/verify`, // Flutterwave will redirect here
      customer: {
        email: user.email,
        name: user.name || "Customer",
      },
      customizations: {
        title: "Don Maris Accessories Payment",
        description: "Payment for your order",
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
      orderId,
      tx_ref,
      amount,
      currency: user.currency || "USD",
      status: "pending",
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
