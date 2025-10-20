
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Twitter, Instagram, Facebook } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";

export default function ContactPage() {
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Here you would typically handle form submission, e.g., send to an API endpoint.
        // For this example, we'll just show a success toast.
        toast({
            title: "Message Sent!",
            description: "Thanks for reaching out. We'll get back to you soon.",
        });
        (e.target as HTMLFormElement).reset();
    };

  return (
    <div className="container mx-auto px-4 py-12">
      <AnimatedSection>
        <section className="text-center mb-12">
          <h1 className="text-5xl font-bold font-headline mb-4">Get in Touch</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're here to help with any questions you may have. Reach out to us, and we'll respond as soon as we can.
          </p>
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
              <Card>
                  <CardHeader>
                      <CardTitle className="font-headline text-2xl">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                          <Mail className="h-6 w-6 text-primary" />
                          <div>
                              <h3 className="font-semibold">Email</h3>
                              <a href="mailto:support@donmaris.com" className="text-accent hover:underline">
                                  support@donmaris.com
                              </a>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                          <Phone className="h-6 w-6 text-primary" />
                          <div>
                              <h3 className="font-semibold">WhatsApp</h3>
                              <a href="tel:+1234567891" className="text-muted-foreground hover:text-primary">
                                  +1 (234) 567-891
                              </a>
                              <p className="text-xs text-muted-foreground">For complaints or more information.</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                          <Phone className="h-6 w-6 text-primary" />
                          <div>
                              <h3 className="font-semibold">Office Phone</h3>
                              <p className="text-muted-foreground">(123) 456-7890</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                          <MapPin className="h-6 w-6 text-primary" />
                          <div>
                              <h3 className="font-semibold">Office</h3>
                              <p className="text-muted-foreground">123 Tech Avenue, Silicon Valley, CA 94043</p>
                          </div>
                      </div>
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader>
                      <CardTitle className="font-headline text-2xl">Business Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 5:00 PM (EST)</p>
                      <p className="text-muted-foreground">Saturday & Sunday: Closed</p>
                  </CardContent>
              </Card>
              
              <Card>
                  <CardHeader>
                      <CardTitle className="font-headline text-2xl">Follow Us</CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-4">
                      <Button variant="outline" size="icon" asChild>
                          <a href="#" aria-label="Twitter"><Twitter className="h-5 w-5"/></a>
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                          <a href="#" aria-label="Instagram"><Instagram className="h-5 w-5"/></a>
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                          <a href="#" aria-label="Facebook"><Facebook className="h-5 w-5"/></a>
                      </Button>
                  </CardContent>
              </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="p-4 sm:p-6 lg:p-8">
                  <CardHeader>
                      <CardTitle className="font-headline text-2xl">Send us a Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid sm:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                  <Label htmlFor="name">Name</Label>
                                  <Input id="name" name="name" placeholder="Your Name" required />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="email">Email</Label>
                                  <Input id="email" name="email" type="email" placeholder="your.email@example.com" required />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="subject">Subject</Label>
                              <Input id="subject" name="subject" placeholder="What is your message about?" required />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="message">Message</Label>
                              <Textarea id="message" name="message" placeholder="Write your message here..." required rows={6} />
                          </div>
                          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="lg">
                              Send Message
                          </Button>
                      </form>
                  </CardContent>
              </Card>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
