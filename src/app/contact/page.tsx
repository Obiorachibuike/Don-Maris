import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Mail className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Contact Us</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground/80 leading-relaxed">
          <p>
            Have a question, comment, or concern? We'd love to hear from you. Our customer support team is here to help.
          </p>
          
          <h2 className="text-xl font-bold font-headline pt-4">Email Support</h2>
          <p>
            The best way to reach us is by email. Please send your inquiries to:
            <br />
            <a href="mailto:support@donmaris.com" className="text-accent font-semibold hover:underline">
              support@donmaris.com
            </a>
          </p>
          <p>
            We aim to respond to all emails within 24 hours during business days.
          </p>

          <h2 className="text-xl font-bold font-headline pt-4">Business Hours</h2>
          <p>
            Our team is available Monday - Friday, from 9:00 AM to 5:00 PM (EST).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
