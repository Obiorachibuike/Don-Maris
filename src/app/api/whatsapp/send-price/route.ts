
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getProductById_SERVER } from "@/lib/data";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

const requestSchema = z.object({
  customerPhone: z.string().regex(/^\d{10,15}$/, "Invalid phone number format."),
  productId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.flatten() }, { status: 400 });
    }

    const { customerPhone, productId } = validation.data;

    const product = await getProductById_SERVER(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const productUrl = new URL(`/products/${product.id}`, req.nextUrl.origin).toString();

    await sendWhatsAppMessage(customerPhone, {
        name: product.name,
        price: product.price,
        description: product.description,
        url: productUrl
    });

    return NextResponse.json({ success: true, message: "WhatsApp message sent!" });

  } catch (error: any) {
    console.error("[WHATSAPP_SEND_PRICE_API]", error);
    return NextResponse.json({ error: error.message || "An internal server error occurred." }, { status: 500 });
  }
}
