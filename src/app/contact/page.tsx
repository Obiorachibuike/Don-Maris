
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, X, Instagram, Facebook, Youtube } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";

const SnapchatIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px" {...props}>
        <path fill="#fffc00" d="M40,41c0,2.2-1.8,4-4,4H12c-2.2,0-4-1.8-4-4V7c0-2.2,1.8-4,4-4h24c2.2,0,4,1.8,4,4V41z"/>
        <path fill="#fff" fillRule="evenodd" d="M22.4,22.9c-0.2-0.5-0.2-1.1,0-1.6c0.5-1.4,1.6-2.5,3-2.9c1.4-0.4,2.9-0.2,4.1,0.7 c0.1,0.1,0.2,0.1,0.3,0.1c0.3,0,0.5-0.1,0.7-0.3c0.4-0.4,0.4-1.1,0-1.5c-0.6-0.6-1.5-1-2.4-1.3c-1-0.3-2-0.4-3-0.4 c-2.3,0-4.4,0.7-6.2,2.2c-1.7,1.4-2.8,3.3-3.1,5.4c-0.2,1.3-0.1,2.6,0.5,3.8c0.5,1.2,1.4,2.2,2.5,3c0.8,0.6,1.7,1,2.6,1.2 c0.3,0.1,0.6,0.1,0.8,0.1c0.6,0,1.2-0.2,1.7-0.5c0.5-0.3,0.9-0.8,1.2-1.3c0.1-0.2,0.2-0.5,0.2-0.7c0-0.3-0.1-0.6-0.4-0.8 c-0.5-0.5-1.3-0.5-1.8-0.2c-0.5,0.3-1,0.4-1.5,0.4c-0.7,0-1.3-0.2-1.9-0.7c-1-0.7-1.6-1.9-1.6-3.1 C22.1,23.7,22.2,23.3,22.4,22.9z" clipRule="evenodd"/>
    </svg>
)

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" {...props}>
        <path fill="currentColor" d="M16.75 13.96c.25.13.43.2.5.28c.07.08.15.18.2.26c.04.09.06.16.06.21c0 .07-.02.16-.04.23c-.02.07-.07.15-.17.26c-.1.11-.21.2-.35.28c-.14.08-.3.13-.48.15c-.18.02-.38.03-.59.03c-.21 0-.42-.01-.63-.04c-.21-.03-.43-.07-.65-.13c-.22-.06-.44-.13-.67-.22c-1.37-.53-2.58-1.28-3.6-2.25c-1.03-0.97-1.8-2.1-2.3-3.4c-.05-.12-.1-.25-.13-.38c-.04-.13-.06-.26-.06-.39c0-.1.01-.2.03-.3c.02-.1.05-.2.09-.28c.04-.08.1-.16.17-.23c.07-.07.15-.13.25-.17c.1-.04.18-.06.25-.06c.07 0 .14.01.2.04c.06.03.12.06.17.1c.05.04.1.08.15.14c.05.06.08.1.11.14c.03.04.05.07.06.1c.01.03.02.05.02.07c0 .02,0 .05-.01.07s-.02.05-.04.07c-.02.02-.04.05-.07.07c-.03.02-.05.05-.08.07c-.03.02-.05.05-.08.07c-.03.02-.05.04-.07.06c-.02.02-.03.03-.05.05c-.02.02-.03.03-.04.05c-.01.02-.02.03-.02.04c-.01.01-.01.03-.01.04c0 .01,0 .03.01.04c0 .01.01.03.02.04c.01.01.02.03.04.04c.02.01.03.03.05.04c.02.01.04.03.06.04c.02.01.05.03.08.04c.03.01.06.03.09.04c.1.03.2.06.31.08c.11.02.22.04.33.05c.11.01.22.01.33.01c.12 0 .24-.01.36-.03c.12-.02.24-.05.35-.1c.11-.05.22-.11.31-.19c.1-.08.18-.18.23-.29c.05-.11.08-.24.08-.38c0-.09-.01-.18-.04-.26s-.07-.16-.13-.23c-.06-.07-.13-.13-.21-.18c-.08-.05-.18-.09-.28-.11c-.1-.02-.2-.03-.3-.03c-.05 0-.09.01-.13.02c-.04.01-.08.02-.12.04c-.04.02-.08.03-.12.05c-.04.02-.08.04-.12.06c-.1.05-.2.1-.3.15c-.1.05-.2.1-.3.15c-.1.05-.18.09-.27.12c-.09.03-.17.04-.25.04c-.08,0-.16-.01-.23-.04c-.07-.03-.14-.06-.2-.1c-.06-.04-.12-.09-.17-.15c-.05-.06-.1-.13-.13-.2c-.03-.07-.05-.15-.05-.23c0-.08.01-.16.04-.24c.03-.08.07-.15.13-.21c.06-.06.13-.12.21-.16c.08-.04.17-.08.27-.11c.1-.03.2-.05.31-.07c.11-.02.23-.03.35-.03c.23,0,.45.03.66.09c.21.06.4.15.57.29c.17.14.3.3.4.49c.1.19.15.39.15.6c0,.21-.05.42-.14.61c-.09.19-.23.38-.41.55Z"/>
    </svg>
)

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" {...props}>
        <path fill="currentColor" d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.59A2.592 2.592 0 0 1 7.27 15.4a2.592 2.592 0 0 1 2.59-2.59v-4.68a7.272 7.272 0 0 0-7.27 7.27a7.272 7.272 0 0 0 7.27 7.27a7.272 7.272 0 0 0 7.27-7.27V9.43c.43 2.18 2.27 4.91 4.91 4.91V9.14a4.278 4.278 0 0 0-3.46-3.32Z"/>
    </svg>
)

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
                  <CardContent className="flex flex-wrap gap-4">
                        <Button variant="outline" size="icon" asChild>
                          <a href="#" aria-label="X (formerly Twitter)"><X className="h-5 w-5"/></a>
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                          <a href="#" aria-label="Instagram"><Instagram className="h-5 w-5"/></a>
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                          <a href="#" aria-label="Facebook"><Facebook className="h-5 w-5"/></a>
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                            <a href="#" aria-label="YouTube"><Youtube className="h-5 w-5" /></a>
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                            <a href="#" aria-label="WhatsApp"><WhatsAppIcon /></a>
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                            <a href="#" aria-label="Snapchat"><SnapchatIcon /></a>
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                            <a href="#" aria-label="TikTok"><TikTokIcon /></a>
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

    