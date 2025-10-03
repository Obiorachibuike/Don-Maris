
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { email, first_name, last_name, phone } = await request.json();

    if (!email || !first_name) {
         return NextResponse.json({ success: false, error: 'Email and name are required.' }, { status: 400 });
    }

    // Step 1: Create a customer on Paystack to get a customer_code
    const customerResponse = await axios.post(
      'https://api.paystack.co/customer',
      {
        email,
        first_name,
        last_name,
        phone,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const customerCode = customerResponse.data.data.customer_code;

    if (!customerCode) {
        return NextResponse.json({ success: false, error: 'Failed to create Paystack customer.' }, { status: 500 });
    }

    // Step 2: Use the customer_code to create the dedicated virtual account
    const response = await axios.post(
      'https://api.paystack.co/dedicated_account',
      {
        customer: customerCode,
        preferred_bank: 'wema-bank',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json({
      success: true,
      data: response.data.data,
    });

  } catch (error: any) {
    console.error('Error creating virtual account:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || 'An internal server error occurred.';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
