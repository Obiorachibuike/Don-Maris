
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, first_name, last_name, phone } = await req.json();

    // Step 1: Create a customer (or retrieve existing one)
    const customerRes = await fetch("https://api.paystack.co/customer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        first_name,
        last_name,
        phone,
      }),
    });

    const customerData = await customerRes.json();

    if (!customerData.status) {
      // If customer creation fails, check if it's because the customer already exists.
      if (customerData.message.includes("Customer with email already exists")) {
          // In a real app you might want to fetch the existing customer by email here.
          // For now, we'll return a more specific error.
          return NextResponse.json(
            { error: "A customer with this email already has an account. Please try logging in or using a different email.", details: customerData },
            { status: 409 } // 409 Conflict
          );
      }
      return NextResponse.json(
        { error: "Failed to create customer", details: customerData },
        { status: 400 }
      );
    }

    const customerCode = customerData.data.customer_code;

    // Step 2: Create dedicated virtual account
    const vaRes = await fetch("https://api.paystack.co/dedicated_account", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: customerCode,
        preferred_bank: "wema-bank", // You can cycle through 'wema-bank', 'titan-bank', 'providus-bank'
      }),
    });

    const vaData = await vaRes.json();

    if (!vaData.status) {
      return NextResponse.json(
        { error: "Failed to create virtual account", details: vaData },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Virtual account created successfully",
      virtualAccount: vaData.data,
    });
  } catch (error: any) {
    console.error("Virtual Account Creation Error:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}
