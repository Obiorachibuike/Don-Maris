
'use client';

import { useRef, ReactNode } from 'react';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { cn } from '@/lib/utils';

type AnimatedSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: string;
};

export function AnimatedSection({ children, className, delay = 'delay-0' }: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isIntersecting = useIntersectionObserver(ref, { threshold: 0.1, triggerOnce: true });

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        delay,
        className
      )}
    >
      {children}
    </div>
  );
}
