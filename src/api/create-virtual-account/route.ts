
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
    let customerCode = customerData.data?.customer_code;

    // Handle case where customer already exists
    if (!customerData.status && customerData.message.includes("Customer with email already exists")) {
        const existingCustomerRes = await fetch(`https://api.paystack.co/customer/${email}`, {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
        });
        const existingCustomerData = await existingCustomerRes.json();
        if(existingCustomerData.status) {
            customerCode = existingCustomerData.data.customer_code;
        } else {
             return NextResponse.json(
                { error: "A customer with this email already exists, but we failed to retrieve their details.", details: existingCustomerData },
                { status: 500 }
             );
        }
    } else if (!customerData.status) {
      return NextResponse.json(
        { error: "Failed to create customer with Paystack", details: customerData },
        { status: 400 }
      );
    }


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
