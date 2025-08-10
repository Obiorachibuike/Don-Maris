import Link from 'next/link';
import { Smartphone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Smartphone className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold font-headline text-foreground">
              Don Maris Accessories
            </span>
          </div>
          <nav className="flex gap-4 md:gap-6 text-sm">
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
        <div className="text-center text-xs text-muted-foreground mt-8">
          &copy; {new Date().getFullYear()} Don Maris Accessories. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
