import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Undo2 } from "lucide-react";

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Undo2 className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Return Policy</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground/80 leading-relaxed">
          <p>
            We want you to be completely satisfied with your purchase. If you're not happy with your order for any reason, we're here to help.
          </p>
          
          <h2 className="text-xl font-bold font-headline pt-4">30-Day Return Window</h2>
          <p>
            We accept returns up to 30 days after delivery, if the item is unused and in its original condition, and we will refund the full order amount minus the shipping costs for the return.
          </p>

          <h2 className="text-xl font-bold font-headline pt-4">How to Initiate a Return</h2>
          <p>
            To start a return, please visit our contact page and send us a message with your order number and the reason for the return. We will respond with instructions on how to proceed.
          </p>
          
          <h2 className="text-xl font-bold font-headline pt-4">Damaged Items</h2>
          <p>
            In the event that your order arrives damaged in any way, please email us as soon as possible at support@donmaris.com with your order number and a photo of the item’s condition. We address these on a case-by-case basis but will try our best to work towards a satisfactory solution.
          </p>

        </CardContent>
      </Card>
    </div>
  );
}
