
import Flutterwave from "flutterwave-node-v3";
import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Payment from "@/models/Payment";
import OrderModel from "@/models/Order";

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
            await Payment.findOneAndUpdate({ tx_ref }, { status: "failed" });
            const payment = await Payment.findOne({ tx_ref });
            if (payment?.orderId) {
                await OrderModel.findByIdAndUpdate(payment.orderId, { status: "Cancelled" });
            }
        }
        return NextResponse.redirect(`${baseUrl}/payment-failed?reason=cancelled`);
    }

    if (!transaction_id) {
        return NextResponse.redirect(`${baseUrl}/payment-failed?reason=missing_id`);
    }

    const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY!, process.env.FLW_SECRET_KEY!);
    const verify = await flw.Transaction.verify({ id: transaction_id });

    const data = verify.data;
    const paymentRecord = await Payment.findOne({ tx_ref: data.tx_ref });

    if (verify.status === "success" && data.status === "successful") {
      await Payment.findOneAndUpdate(
        { tx_ref: data.tx_ref },
        {
          status: "successful",
          transaction_id,
          charged_amount: data.amount,
          payment_method: data.payment_type,
        }
      );
      
      if (paymentRecord?.orderId) {
          await OrderModel.findByIdAndUpdate(paymentRecord.orderId, { status: 'Processing', paymentStatus: 'Paid', amountPaid: data.amount });
      }

      return NextResponse.redirect(`${baseUrl}/payment-success?tx_ref=${data.tx_ref}`);
    } else {
      await Payment.findOneAndUpdate({ tx_ref: data.tx_ref }, { status: "failed" });
      if (paymentRecord?.orderId) {
         await OrderModel.findByIdAndUpdate(paymentRecord.orderId, { status: "Pending", paymentStatus: 'Not Paid' });
      }
      return NextResponse.redirect(`${baseUrl}/payment-failed?reason=verification_failed`);
    }
  } catch (err: any) {
    console.error("Verification Error:", err);
    const baseUrl = `${req.headers.get("x-forwarded-proto") || "http"}://${req.headers.get("host")}`;
    return NextResponse.redirect(`${baseUrl}/payment-failed?reason=server_error`);
  }
}
