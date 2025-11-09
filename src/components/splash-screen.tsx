
'use client';

import { Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function SplashScreen() {
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsFadingOut(true);
        }, 1200); // Start fading out before it's removed

        return () => clearTimeout(timer);
    }, []);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-300 ease-in-out',
        isFadingOut ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div className="flex items-center gap-4 animate-pulse">
        <Smartphone className="h-16 w-16 text-primary" />
        <span className="text-4xl font-bold font-headline bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent">
          Don Maris
        </span>
      </div>
      <p className="mt-4 text-muted-foreground">Loading accessories...</p>
    </div>
  );
}
