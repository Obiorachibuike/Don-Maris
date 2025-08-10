'use client';

import Link from 'next/link';
import { Smartphone, Sparkles, Home, ShoppingCart, Package } from 'lucide-react';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { useEffect, useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const { items } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/recommendations', label: 'AI Recommender', icon: Sparkles },
  ];

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Smartphone className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-headline text-foreground">
              Don Maris
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = (link.href === '/' && pathname === '/') || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Button key={link.href} variant="ghost" asChild className={cn(isActive && 'bg-accent text-accent-foreground')}>
                  <Link href={link.href} className="flex items-center gap-2">
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </Button>
              );
            })}
          </nav>

          <div className="flex items-center">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {isClient && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
                <span className="sr-only">Shopping Cart</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
