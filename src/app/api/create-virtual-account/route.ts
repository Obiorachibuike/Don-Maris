
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { email, first_name, last_name, phone } = await request.json();

    if (!email || !first_name) {
         return NextResponse.json({ success: false, error: 'Email and name are required.' }, { status: 400 });
    }

    const response = await axios.post(
      'https://api.paystack.co/dedicated_account',
      {
        customer: email,
        preferred_bank: 'wema-bank',
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

    return NextResponse.json({
      success: true,
      data: response.data.data,
    });

  } catch (error: any) {
    console.error(error.response?.data || error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.response?.data || 'Server Error',
      },
      { status: 500 }
    );
  }
}
