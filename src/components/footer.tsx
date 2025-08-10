import Link from 'next/link';
import { Smartphone, Mail } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

export function Footer() {
  return (
    <footer className="bg-card border-t mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
            <div>
                 <div className="flex items-center gap-2 mb-4">
                    <Smartphone className="h-7 w-7 text-primary" />
                    <span className="text-xl font-bold font-headline text-foreground">
                    Don Maris Accessories
                    </span>
                </div>
                <p className="text-sm text-muted-foreground">Your one-stop shop for stylish and reliable phone accessories.</p>
            </div>
            <div className="md:col-span-1">
                <h3 className="font-semibold mb-4 font-headline">Quick Links</h3>
                <nav className="flex flex-col gap-2 text-sm">
                    <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                        About Us
                    </Link>
                    <Link href="/shipping" className="text-muted-foreground hover:text-foreground transition-colors">
                    Shipping
                    </Link>
                    <Link href="/returns" className="text-muted-foreground hover:text-foreground transition-colors">
                    Returns
                    </Link>
                    <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact Us
                    </Link>
                </nav>
            </div>
            <div>
                 <h3 className="font-semibold mb-4 font-headline">Newsletter</h3>
                 <p className="text-sm text-muted-foreground mb-3">Subscribe to get the latest deals and updates.</p>
                 <form className="flex gap-2">
                    <Input type="email" placeholder="Enter your email" className="bg-background"/>
                    <Button type="submit" variant="outline" className="shrink-0">Subscribe</Button>
                 </form>
            </div>
        </div>
        <div className="text-center text-xs text-muted-foreground mt-12 pt-8 border-t">
          &copy; {new Date().getFullYear()} Don Maris Accessories. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
