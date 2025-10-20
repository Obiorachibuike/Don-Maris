
import { NextResponse, NextRequest } from "next/server";
import Flutterwave from "flutterwave-node-v3";
import { connectDB } from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { userId, amount } = await req.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const baseUrl = `${req.headers.get("x-forwarded-proto") || "http"}://${req.headers.get("host")}`;

    const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY!, process.env.FLW_SECRET_KEY!);

    const tx_ref = `tx-${Date.now()}`;

    const payload = {
      tx_ref,
      amount,
      currency: user.currency || "USD",
      redirect_url: `${baseUrl}/invoice`, // Using the existing invoice page for confirmation
      customer: {
        email: user.email,
        name: user.name || "Customer",
      },
      customizations: {
        title: "Don Maris Accessories Payment",
        description: "Payment for your order",
        logo: `${baseUrl}/logo.png`, // Optional: Ensure you have a logo at public/logo.png
      },
    };

    const response = await flw.Payment.initialize(payload);

    if (!response || !response.data) {
      return NextResponse.json({ error: "Failed to initialize payment", details: response.message }, { status: 500 });
    }

    return NextResponse.json({
      checkoutUrl: response.data.link,
      tx_ref,
    });

  } catch (error: any) {
    console.error("Payment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
