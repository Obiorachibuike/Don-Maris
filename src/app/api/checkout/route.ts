
import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import geoip from "geoip-lite";
import axios from "axios";
import { CartItem } from "@/lib/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { items, email }: { items: CartItem[], email: string } = await req.json();

    if (!items || !email) {
      return NextResponse.json({ error: "Missing items or email" }, { status: 400 });
    }

    // Detect country from IP
    const ip = req.headers.get("x-forwarded-for") || "102.89.23.10"; // fallback for development
    const geo = geoip.lookup(ip);
    const country = geo?.country || "NG"; // Default to Nigeria if IP lookup fails

    // Map country → currency + gateway
    let gateway: "stripe" | "paystack" = "stripe";
    let currency: string = "usd";

    if (country === "NG") {
      gateway = "paystack";
      currency = "NGN";
    } else if (country === "BJ") {
      gateway = "paystack";
      currency = "XOF";
    } else if (country === "GH") {
      gateway = "paystack";
      currency = "GHS";
    } else {
      gateway = "stripe";
      currency = "usd";
    }

    // -------- If Paystack -------- //
    if (gateway === "paystack") {
      const totalAmount = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

      const paystackRes = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email,
          amount: Math.round(totalAmount * 100), // kobo or equivalent lowest denomination
          currency,
          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/invoice`,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return NextResponse.json({
        url: paystackRes.data.data.authorization_url,
        gateway: "paystack",
        currency,
        country,
      });
    }

    // -------- If Stripe -------- //
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.product.name,
          images: item.product.image ? [item.product.image] : [],
        },
        unit_amount: Math.round(item.product.price * 100), // in cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/invoice?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/payment`,
      customer_email: email,
    });

    return NextResponse.json({
      url: session.url,
      gateway: "stripe",
      currency,
      country,
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
