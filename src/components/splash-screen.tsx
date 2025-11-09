
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
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ease-in-out',
        isFadingOut ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div className="relative flex items-center justify-center">
        {/* Wavy background elements */}
        <div className="animate-wave-1 absolute -top-1/2 -left-1/2 w-48 h-48 bg-primary/10 rounded-full opacity-0 blur-2xl"></div>
        <div className="animate-wave-2 absolute -bottom-1/2 -right-1/2 w-56 h-56 bg-accent/10 rounded-full opacity-0 blur-2xl"></div>

        {/* The content with the glow animation */}
        <div className="relative flex items-center justify-center">
          <div className="animate-glow absolute h-24 w-56 rounded-full bg-primary/20 blur-2xl"></div>
          <div className="flex items-center gap-4">
              <Smartphone className="h-16 w-16 text-primary drop-shadow-[0_0_10px_hsl(var(--primary)/0.7)]" />
              <span className="text-4xl font-bold font-headline bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent drop-shadow-[0_0_10px_hsl(var(--accent)/0.5)]">
              Don Maris
              </span>
          </div>
        </div>
      </div>
      <p className="mt-4 text-muted-foreground animate-pulse">Loading accessories...</p>
    </div>
  );
}

