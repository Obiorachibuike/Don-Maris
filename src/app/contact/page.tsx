
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, X, Instagram, Facebook, Youtube, MessageCircle, Clock } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";
import { TikTokIcon } from "@/components/tiktok-icon";

const SnapchatIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px" {...props}>
        <path fill="#fffc00" d="M40,41c0,2.2-1.8,4-4,4H12c-2.2,0-4-1.8,4-4V7c0-2.2,1.8-4,4-4h24c2.2,0,4,1.8,4,4V41z"/>
        <path fill="#fff" fillRule="evenodd" d="M22.4,22.9c-0.2-0.5-0.2-1.1,0-1.6c0.5-1.4,1.6-2.5,3-2.9c1.4-0.4,2.9-0.2,4.1,0.7 c0.1,0.1,0.2,0.1,0.3,0.1c0.3,0,0.5-0.1,0.7-0.3c0.4-0.4,0.4-1.1,0-1.5c-0.6-0.6-1.5-1-2.4-1.3c-1-0.3-2-0.4-3-0.4 c-2.3,0-4.4,0.7-6.2,2.2c-1.7,1.4-2.8,3.3-3.1,5.4c-0.2,1.3-0.1,2.6,0.5,3.8c0.5,1.2,1.4,2.2,2.5,3c0.8,0.6,1.7,1,2.6,1.2 c0.3,0.1,0.6,0.1,0.8,0.1c0.6,0,1.2-0.2,1.7-0.5c0.5-0.3,0.9-0.8,1.2-1.3c0.1-0.2,0.2-0.5,0.2-0.7c0-0.3-0.1-0.6-0.4-0.8 c-0.5-0.5-1.3-0.5-1.8-0.2c-0.5,0.3-1,0.4-1.5,0.4c-0.7,0-1.3-0.2-1.9-0.7c-1-0.7-1.6-1.9-1.6-3.1 C22.1,23.7,22.2,23.3,22.4,22.9z" clipRule="evenodd"/>
    </svg>
)

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" {...props} fill="currentColor">
        <path d="M16.75 13.96c.25.13.43.2.5.28c.07.08.15.18.2.26c.04.09.06.16.06.21c0 .07-.02.16-.04.23c-.02.07-.07.15-.17.26c-.1.11-.21.2-.35.28c-.14.08-.3.13-.48.15c-.18.02-.38.03-.59.03c-.21 0-.42-.01-.63-.04c-.21-.03-.43-.07-.65-.13c-.22-.06-.44-.13-.67-.22c-1.37-.53-2.58-1.28-3.6-2.25c-1.03-0.97-1.8-2.1-2.3-3.4c-.05-.12-.1-.25-.13-.38c-.04-.13-.06-.26-.06-.39c0-.1.01-.2.03-.3c.02-.1.05-.2.09-.28c.04-.08.1-.16.17-.23c.07-.07.15-.13.25-.17c.1-.04.18-.06.25-.06c.07 0 .14.01.2.04c.06.03.12.06.17.1c.05.04.1.08.15.14c.05.06.08.1.11.14c.03.04.05.07.06.1c.01.03.02.05.02.07c0 .02,0 .05-.01.07s-.02.05-.04.07c-.02.02-.04.05-.07.07c-.03.02-.05.05-.08.07c-.03.02-.05.05-.08.07c-.03.02-.05.04-.07.06c-.02.02-.03.03-.05.05c-.02.02-.03.03-.04.05c-.01.02-.02.03-.02.04c-.01.01-.01.03-.01.04c0 .01,0 .03.01.04c0 .01.01.03.02.04c.01.01.02.03.04.04c.02.01.03.03.05.04c.02.01.04.03.06.04c.02.01.05.03.08.04c.03.01.06.03.09.04c.1.03.2.06.31.08c.11.02.22.04.33.05c.11.01.22.01.33.01c.12 0 .24-.01.36-.03c.12-.02.24-.05.35-.1c.11-.05.22-.11.31-.19c.1-.08.18-.18.23-.29c.05-.11.08-.24.08-.38c0-.09-.01-.18-.04-.26s-.07-.16-.13-.23c-.06-.07-.13-.13-.21-.18c-.08-.05-.18-.09-.28-.11c-.1-.02-.2-.03-.3-.03c-.05 0-.09.01-.13.02c-.04.01-.08.02-.12.04c-.04.02-.08.03-.12.05c-.04.02-.08.04-.12.06c-.1.05-.2.1-.3.15c-.1.05-.2.1-.3.15c-.1.05-.18.09-.27.12c-.09.03-.17.04-.25.04c-.08,0-.16-.01-.23-.04c-.07-.03-.14-.06-.2-.1c-.06-.04-.12-.09-.17-.15c-.05-.06-.1-.13-.13-.2c-.03-.07-.05-.15-.05-.23c0-.08.01-.16.04-.24c.03-.08.07-.15.13-.21c.06-.07.13-.13.21-.18c.08-.05.17-.09.27-.12c.09-.03.19-.05.29-.05c.14,0,.28,.02,.41,.07c.13,.05,.26,.11,.37,.2c.11,.08,.21,.19,.29,.31c.08,.12,.15,.25,.19,.4c.G4,.15,.06,.3,.06,.45c0,.1-.01,.2-.03,.3c-.02,.1-.05,.19-.09,.28c-.04,.09-.1,.17-.17,.23c-.07,.07-.15,.12-.25,.16c-.1,.04-.18,.06-.25,.06c-.07,0-.14-.01-.2-.04c-.06-.03-.12-.06-.17-.1c-.05-.04-.1-.08-.15-.14c-.05-.06-.08-.1-.11-.14c-.03-.04-.05-.07-.06-.1c-.01-.03-.02-.05-.02-.07c0-.02,0-.05,.01-.07s.02-.05.04-.07c.02-.02.04-.05.07-.07c.03-.02.05-.05.08-.07c.03-.02.05-.05.08-.07c.03-.02.05-.04.07-.06c.02-.02.03-.03.05-.05c.02-.02.03-.03.04-.05c.01-.02.02-.03.02-.04c.01-.01.01-.03,0-.04c0-.01-.01-.03-.02-.04c-.01-.01-.02-.03-.04-.04c-.02-.01-.03-.03-.05-.04c-.02-.01-.04-.03-.06-.04c-.02-.01-.05-.03-.08-.04c-.03-.01-.06-.03-.09-.04c-.1-.03-.2-.06-.31-.08c-.11-.02-.22-.04-.33-.05c-.11-.01-.22-.01-.33-.01c-.12,0-.24,.01-.36,.03c-.12,.02-.24,.05-.35,.1c-.11,.05-.22,.11-.31,.19c-.1,.08-.18,.18-.23,.29c-.05,.11-.08,.24-.08,.38c0,.09,.01,.18,.04,.26s.07,.16,.13,.23c.06,.07,.13,.13,.21,.18c.08,.05,.18,.09,.28,.11c.1,.02,.2,.03,.3,.03Z" />
    </svg>
);


export default function ContactPage() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thanks for reaching out. We'll get back to you shortly.",
    });
    (e.target as HTMLFormElement).reset();
  }

  const whatsappContacts = [
    { name: "Support 1", number: "12345678901" },
    { name: "Support 2", number: "12345678902" },
    { name: "Support 3", number: "12345678903" },
    { name: "Support 4", number: "12345678904" },
  ];

  const defaultMessage = "Hello Don Maris, I have a complaint/inquiry.";

  return (
    <div className="container mx-auto px-4 py-12">
      <AnimatedSection>
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold font-headline mb-4">Get in Touch</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We'd love to hear from you. Whether you have a question about our products, need assistance, or just want to chat, we're here to help.
          </p>
        </section>
      </AnimatedSection>
      
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <AnimatedSection delay="delay-100">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-start gap-4">
                        <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold">Our Address</h3>
                            <p className="text-muted-foreground">123 Tech Avenue, Silicon Valley, CA 94043</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Mail className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold">Email Us</h3>
                            <a href="mailto:support@donmaris.com" className="text-muted-foreground hover:text-primary transition-colors">support@donmaris.com</a>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Phone className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold">Call Us</h3>
                            <p className="text-muted-foreground">(123) 456-7890</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold">Business Hours</h3>
                            <p className="text-muted-foreground">Monday - Saturday: 8am - 5pm</p>
                            <p className="text-muted-foreground">Sunday: Closed</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <MessageCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold">WhatsApp Complaints/Inquiries</h3>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                                {whatsappContacts.map(contact => (
                                    <a
                                        key={contact.number}
                                        href={`https://wa.me/${contact.number}?text=${encodeURIComponent(defaultMessage)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                                    >
                                        <WhatsAppIcon /> {contact.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                         <h3 className="font-semibold mb-4">Follow Us</h3>
                         <div className="flex items-center gap-4">
                            <a href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-6 w-6" /></a>
                            <a href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-6 w-6" /></a>
                            <a href="#" className="text-muted-foreground hover:text-primary"><X className="h-6 w-6" /></a>
                            <a href="#" className="text-muted-foreground hover:text-primary"><Youtube className="h-6 w-6" /></a>
                            <a href="#" className="text-muted-foreground hover:text-primary"><SnapchatIcon className="h-6 w-6" /></a>
                            <a href="#" className="text-muted-foreground hover:text-primary"><TikTokIcon /></a>
                         </div>
                    </div>
                </CardContent>
            </Card>
        </AnimatedSection>
        
        <AnimatedSection delay="delay-200">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Send Us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" name="name" placeholder="John Doe" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" name="subject" placeholder="e.g., Question about an order" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" name="message" rows={5} placeholder="Your message..." required />
                        </div>
                        <Button type="submit" className="w-full">Send Message</Button>
                    </form>
                </CardContent>
            </Card>
        </AnimatedSection>
      </div>

      <AnimatedSection delay="delay-300">
        <section>
          <h2 className="text-3xl font-bold font-headline text-center mb-8">Find Us Here</h2>
          <Card>
            <CardContent className="p-0 rounded-lg overflow-hidden">
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3168.6300435133644!2d-122.086029324024!3d37.42232093125233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fba024251be2d%3A0x47b4c038c202029!2sGoogleplex!5e0!3m2!1sen!2sus!4v1717805126135!5m2!1sen!2sus"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </CardContent>
          </Card>
        </section>
      </AnimatedSection>
    </div>
  );
}
