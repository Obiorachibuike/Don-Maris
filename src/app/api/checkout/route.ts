
import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import type { CartItem } from "@/lib/types";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
  } catch (dbError: any) {
      console.error("Database connection failed:", dbError);
      return NextResponse.json({ error: "Could not connect to the database. Please try again later.", details: dbError.message }, { status: 500 });
  }

  try {
    const { items, email, saveCard }: { items: CartItem[], email: string, saveCard: boolean } = await req.json();

    if (!items || !email) {
      return NextResponse.json({ error: "Missing items or email" }, { status: 400 });
    }
    
    const user = await User.findOne({ email: email });

    const country = user?.countryCode || 'NG'; // Default to Nigeria if user or countryCode is not found

    let currency: string;
    if (country === "NG") {
      currency = "ngn";
    } else if (country === "BJ") {
      currency = "xof";
    } else {
      currency = "usd";
    }
    
    const totalAmount = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    let customer: Stripe.Customer;
    const existingCustomers = await stripe.customers.list({ email: email, limit: 1 });

    if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
    } else {
        customer = await stripe.customers.create({ email: email });
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // in cents/kobo
        currency: currency,
        customer: customer.id,
        setup_future_usage: saveCard ? "off_session" : undefined,
        automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ 
        clientSecret: paymentIntent.client_secret, 
        currency: currency,
        amount: totalAmount,
    });

  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
