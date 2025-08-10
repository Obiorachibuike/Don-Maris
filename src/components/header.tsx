
'use client';

import Link from 'next/link';
import { Smartphone, Sparkles, Home, ShoppingCart, Package, Info, Mail, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

export function Header() {
  const pathname = usePathname();
  const { items } = useCart();
  const [isClient, setIsClient] = useState(false);
  const [isSheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/recommendations', label: 'AI Recommender', icon: Sparkles },
    { href: '/about', label: 'About', icon: Info },
    { href: '/contact', label: 'Contact', icon: Mail },
  ];

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const NavLink = ({ href, label, icon: Icon, isMobile = false }: { href: string, label: string, icon: React.ElementType, isMobile?: boolean }) => {
    const isActive = (href === '/' && pathname === '/') || (href !== '/' && pathname.startsWith(href));
    return (
      <Button
        variant="ghost"
        asChild
        className={cn(
          isActive && 'bg-accent text-accent-foreground',
          isMobile && 'w-full justify-start text-lg'
        )}
        onClick={() => isMobile && setSheetOpen(false)}
      >
        <Link href={href} className="flex items-center gap-4">
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      </Button>
    );
  };

  return (
    <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2" onClick={() => setSheetOpen(false)}>
            <Smartphone className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-headline text-foreground">
              Don Maris
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
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
            
            <div className="md:hidden">
              <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[340px]">
                  <SheetHeader>
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4 mt-8">
                     {navLinks.map((link) => (
                       <NavLink key={link.href} {...link} isMobile />
                     ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
