

import nodemailer from 'nodemailer';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const emailTemplate = (name: string, title: string, content: string, ctaLink: string, ctaText: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: 'PT Sans', sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background-color: #0F172A; padding: 30px; text-align: center; }
        .header h1 { color: #FFD54A; margin: 0; font-family: 'Poppins', sans-serif; }
        .content { padding: 30px; color: #333; line-height: 1.6; }
        .content h2 { font-family: 'Poppins', sans-serif; color: #0F172A; }
        .credentials { background-color: #f9f9f9; border: 1px solid #eaeaea; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .credentials p { margin: 5px 0; }
        .credentials strong { color: #0F172A; }
        .button-container { text-align: center; margin: 30px 0; }
        .button { background-color: #6D5DF6; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eaeaea; }
        .link { color: #6D5DF6; }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700&family=PT+Sans&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Don Maris Accessories</h1>
        </div>
        <div class="content">
            <h2>Hi ${name},</h2>
            <p>${content}</p>
            <div class="button-container">
                <a href="${ctaLink}" class="button">${ctaText}</a>
            </div>
            <p>If you did not request this, please ignore this email.</p>
            <p>Thanks,<br>The Don Maris Team</p>
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Don Maris Accessories. All rights reserved.
        </div>
    </div>
</body>
</html>
`;


export const sendEmail = async ({ request, email, emailType, userId, password }: { request: NextRequest, email: string, emailType: 'VERIFY' | 'RESET' | 'ADMIN_CREATED', userId: string, password?: string }) => {
    try {
        const hashedToken = await bcrypt.hash(userId.toString(), 10);
        let subject = '';
        let content = '';
        let ctaLink = '';
        let ctaText = '';
        let title = '';

        const baseUrl = new URL(request.url).origin;

        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found to send email.");
        }
        const userName = user.name;
        
        if (emailType === "VERIFY") {
            await User.findByIdAndUpdate(userId, { verifyToken: hashedToken, verifyTokenExpiry: Date.now() + 3600000 });
            subject = 'Verify your email address';
            title = 'Email Verification';
            content = 'Welcome to Don Maris Accessories! We\'re excited to have you. Please verify your email address to complete your registration by clicking the button below.';
            ctaLink = `${baseUrl}/verify-email?token=${hashedToken}`;
            ctaText = 'Verify Email';
        } else if (emailType === 'RESET') {
            await User.findByIdAndUpdate(userId, { forgotPasswordToken: hashedToken, forgotPasswordTokenExpiry: Date.now() + 3600000 });
            subject = 'Reset your password';
            title = 'Password Reset';
            content = 'You requested a password reset. Click the button below to set a new password. This link will expire in 1 hour.';
            ctaLink = `${baseUrl}/reset-password?token=${hashedToken}`;
            ctaText = 'Reset Password';
        } else if (emailType === 'ADMIN_CREATED') {
            if (!password) {
                throw new Error("Password is required for ADMIN_CREATED email type.");
            }
            subject = 'Your Account has been created';
            title = 'Welcome to Don Maris';
            content = `An administrator has created an account for you. You can log in using the credentials below. We recommend changing your password after your first login.<br><br><div class="credentials"><p><strong>Email:</strong> ${email}</p><p><strong>Password:</strong> ${password}</p></div>`;
            ctaLink = `${baseUrl}/login`;
            ctaText = 'Login Now';
        }

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            }
        });

        const mailOptions = {
            from: `"Don Maris" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: subject,
            html: emailTemplate(userName, title, content, ctaLink, ctaText),
        };

        const mailresponse = await transport.sendMail(mailOptions);
        return mailresponse;

    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const createPaystackVirtualAccount = async (user: { name: string, email: string, phone?: string }) => {
  try {
    const [firstName, ...lastNameParts] = user.name.split(' ');
    const lastName = lastNameParts.join(' ');

    const customerRes = await fetch("https://api.paystack.co/customer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        phone: user.phone,
      }),
    });

    const customerData = await customerRes.json();

    let customerCode = customerData.data?.customer_code;

    // Handle case where customer already exists
    if (!customerData.status && customerData.message.includes("Customer with email already exists")) {
      const existingCustomerRes = await fetch(`https://api.paystack.co/customer/${user.email}`, {
          headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      });
      const existingCustomerData = await existingCustomerRes.json();
      if(existingCustomerData.status) {
          customerCode = existingCustomerData.data.customer_code;
      } else {
           throw new Error(`Failed to retrieve existing Paystack customer: ${existingCustomerData.message}`);
      }
    } else if (!customerData.status) {
        throw new Error(`Failed to create Paystack customer: ${customerData.message}`);
    }

    const vaRes = await fetch("https://api.paystack.co/dedicated_account", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: customerCode,
        preferred_bank: "wema-bank", // Use 'test-bank' for testing if needed
      }),
    });

    const vaData = await vaRes.json();

    if (!vaData.status) {
      // Don't throw, just log and return null so signup doesn't fail
      console.error(`Failed to create Paystack DVA: ${vaData.message}`);
      return null;
    }
    
    return {
        bankName: vaData.data.bank.name,
        accountNumber: vaData.data.account_number,
        accountName: vaData.data.account_name
    };
  } catch (error: any) {
    console.error("Paystack Virtual Account Creation Error in helper:", error);
    return null;
  }
}

export const createFlutterwaveVirtualAccount = async (user: { name: string, email: string, phone?: string }) => {
    try {
        const res = await fetch("https://api.flutterwave.com/v3/virtual-account-numbers", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: user.email,
                is_permanent: true,
                bvn: "12345678901", // Placeholder BVN, required in live mode
                tx_ref: `signup_${Date.now()}`,
                narration: `Virtual Account for ${user.name}`,
            }),
        });

        const data = await res.json();
        
        if (data.status !== 'success') {
            console.error(`Failed to create Flutterwave virtual account: ${data.message}`);
            return null;
        }

        const accountData = data.data;

        return {
            bankName: accountData.bank_name,
            accountNumber: accountData.account_number,
            accountName: user.name, // Flutterwave doesn't return account name in this response
        };

    } catch (error: any) {
        console.error("Flutterwave Virtual Account Creation Error in helper:", error);
        return null;
    }
}
