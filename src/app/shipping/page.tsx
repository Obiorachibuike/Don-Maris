import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck } from "lucide-react";

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Truck className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Shipping Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground/80 leading-relaxed">
          <p>
            We are committed to getting your new accessories to you as quickly and efficiently as possible. Here’s what you need to know about our shipping process.
          </p>
          
          <h2 className="text-xl font-bold font-headline pt-4">Processing Time</h2>
          <p>
            All orders are processed within 1-2 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.
          </p>

          <h2 className="text-xl font-bold font-headline pt-4">Shipping Rates & Estimates</h2>
          <p>
            Shipping charges for your order will be calculated and displayed at checkout. We offer several shipping options to meet your needs:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Standard Shipping:</strong> 5-7 business days</li>
            <li><strong>Expedited Shipping:</strong> 2-3 business days</li>
            <li><strong>Overnight Shipping:</strong> 1 business day</li>
          </ul>

          <h2 className="text-xl font-bold font-headline pt-4">International Shipping</h2>
          <p>
            We offer international shipping to most countries. Shipping charges and delivery times vary depending on your location. Please note that your order may be subject to import duties and taxes, which are incurred once a shipment reaches your destination country. Don Maris Accessories is not responsible for these charges if they are applied.
          </p>

        </CardContent>
      </Card>
    </div>
  );
}
