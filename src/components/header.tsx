
'use client';

import Link from 'next/link';
import { Smartphone, Sparkles, Home, ShoppingCart, Package, Info, Mail, Menu, LayoutDashboard, Wallet, LogIn, UserPlus, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { useSession } from '@/contexts/SessionProvider';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const pathname = usePathname();
  const { items } = useCart();
  const { user, isLoading, logout } = useSession();
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
  
  if (user?.role === 'admin') {
      navLinks.push({ href: '/admin', label: 'Admin', icon: LayoutDashboard });
  }

  const totalItems = items.length;

  const NavLink = ({ href, label, icon: Icon, isMobile = false }: { href: string, label: string, icon: React.ElementType, isMobile?: boolean }) => {
    const isActive = (href === '/' && pathname === '/') || (href !== '/' && pathname.startsWith(href) && href.length > 1);
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
            <span className="text-2xl font-bold font-headline bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent">
              Don Maris
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            {isClient && user && user.role === 'customer' && user.ledgerBalance && user.ledgerBalance > 0 && (
                <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 px-3 py-1.5 rounded-md">
                    <Wallet className="h-5 w-5 text-destructive" />
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-destructive font-medium -mb-1">Balance</span>
                        <span className="font-bold text-destructive">${user.ledgerBalance.toFixed(2)}</span>
                    </div>
                </div>
            )}
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
            
            {isClient && !isLoading && (
              <>
                {user ? (
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar>
                          <AvatarImage src={(user as any).avatar || 'https://placehold.co/100x100.png'} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <Link href="/profile" className="block hover:bg-muted -m-1 p-1 rounded-md transition-colors">
                            <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium leading-none">{user.name}</p>
                              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                            </div>
                          </Link>
                        </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                           <Link href="/profile">
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                           </Link>
                        </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => logout()}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="hidden md:flex items-center gap-2">
                    <Button asChild variant="ghost">
                        <Link href="/login"><LogIn className="mr-2"/> Login</Link>
                    </Button>
                     <Button asChild>
                        <Link href="/signup"><UserPlus className="mr-2"/> Sign Up</Link>
                    </Button>
                  </div>
                )}
              </>
            )}

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
                      <div className="md:hidden pt-4 border-t">
                      {user ? (
                           <Button onClick={() => { logout(); setSheetOpen(false);}} className="w-full justify-start text-lg" variant="ghost">
                              <LogOut className="mr-4"/> Logout
                           </Button>
                        ) : (
                          <>
                           <Button asChild variant="ghost" className="w-full justify-start text-lg">
                              <Link href="/login" onClick={() => setSheetOpen(false)}><LogIn className="mr-4"/> Login</Link>
                           </Button>
                           <Button asChild className="w-full justify-start text-lg mt-2">
                              <Link href="/signup" onClick={() => setSheetOpen(false)}><UserPlus className="mr-4"/> Sign Up</Link>
                           </Button>
                          </>
                        )}
                    </div>
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
