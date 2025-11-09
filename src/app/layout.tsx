
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from '@/hooks/use-cart';
import { SessionProvider } from '@/contexts/SessionProvider';
import { ProductStoreInitializer } from '@/store/product-store-initializer';
import { UserStoreInitializer } from '@/store/user-store-initializer';
import { ThemeProvider } from '@/components/theme-provider';
import { useState, useEffect } from 'react';
import { SplashScreen } from '@/components/splash-screen';
import { usePathname } from 'next/navigation';

// export const metadata: Metadata = {
//   title: 'Don Maris Accessories',
//   description: 'Your one-stop shop for phone accessories.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
        setIsLoading(true);
        const timer = setTimeout(() => {
          setIsLoading(false);
        }, 1500); // Adjust delay as needed

        return () => clearTimeout(timer);
    }
  }, [pathname, isClient]);

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <title>Don Maris Accessories</title>
        <meta name="description" content="Your one-stop shop for phone accessories." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <CartProvider>
              <ProductStoreInitializer />
              <UserStoreInitializer />
              {isLoading && <SplashScreen />}
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
              <Toaster />
            </CartProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
