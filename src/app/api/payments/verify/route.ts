
import { connectDB } from "@/lib/mongodb";
import Flutterwave from "flutterwave-node-v3";
import { NextResponse, NextRequest } from "next/server";

import Payment from "@/models/Payment";
import OrderModel from "@/models/Order";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    
    await connectDB();
    const { searchParams } = new URL(req.url);
    const transaction_id = searchParams.get("transaction_id");
    const tx_ref = searchParams.get("tx_ref");
    const status = searchParams.get("status");

    const baseUrl = `${req.headers.get("x-forwarded-proto") || "http"}://${req.headers.get("host")}`;

    if (status === 'cancelled') {
        if(tx_ref) {
            const payment = await Payment.findOneAndUpdate({ tx_ref }, { status: "failed" });
            if (payment?.orderId) {
                await OrderModel.findByIdAndUpdate(payment.orderId, { status: "Cancelled" });
            }
        }
        return NextResponse.redirect(`${baseUrl}/payment-failed?reason=cancelled`);
    }

    if (!transaction_id) {
        return NextResponse.redirect(`${baseUrl}/payment-failed?reason=missing_id`);
    }

    if (!tx_ref) {
        return NextResponse.redirect(`${baseUrl}/payment-failed?reason=missing_tx_ref`);
    }

    const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY!, process.env.FLW_SECRET_KEY!);
    const verify = await flw.Transaction.verify({ id: transaction_id });

    const data = verify.data;
    const paymentRecord = await Payment.findOne({ tx_ref });
    if (!paymentRecord) return NextResponse.redirect(`${baseUrl}/payment-failed?reason=payment_not_found`);

    const order = await OrderModel.findById(paymentRecord.orderId);
    if (!order) return NextResponse.redirect(`${baseUrl}/payment-failed?reason=order_not_found`);
    
    const user = await User.findById(paymentRecord.userId);
    if (!user) return NextResponse.redirect(`${baseUrl}/payment-failed?reason=user_not_found`);
    
    const underpaidAmount = order.amount - data.amount;

    if (verify.status === "success" && data.status === "successful") {
        if (underpaidAmount > 0) {
             // Partial payment
            await Payment.findByIdAndUpdate(paymentRecord._id, {
                status: "partial",
                amountPaid: data.amount,
                transaction_id: data.id,
                payment_method: data.payment_type,
            });

            await OrderModel.findByIdAndUpdate(order._id, { status: "partial" });

            await User.findByIdAndUpdate(user._id, {
                $inc: { ledgerBalance: underpaidAmount },
            });
        } else {
            // Full payment
            await Payment.findByIdAndUpdate(paymentRecord._id, {
                status: "successful",
                amountPaid: data.amount,
                transaction_id: data.id,
                payment_method: data.payment_type,
            });

            await OrderModel.findByIdAndUpdate(order._id, { status: "paid" });
        }

      return NextResponse.redirect(`${baseUrl}/payment-success?tx_ref=${data.tx_ref}`);
    } else {
      // Failed payment
      await Payment.findByIdAndUpdate(paymentRecord._id, { status: "failed", transaction_id: data.id });
      await OrderModel.findByIdAndUpdate(order._id, { status: "failed" });
      return NextResponse.redirect(`${baseUrl}/payment-failed?reason=verification_failed`);
    }
  } catch (err: any) {
    console.error("Verification Error:", err);
    const baseUrl = `${req.headers.get("x-forwarded-proto") || "http"}://${req.headers.get("host")}`;
    return NextResponse.redirect(`${baseUrl}/payment-failed?reason=server_error`);
  }
}
