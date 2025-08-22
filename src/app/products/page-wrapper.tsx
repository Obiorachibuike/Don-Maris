
'use client'

import { Suspense } from 'react';

export function ProductsPageWrapper({ children }: { children: React.ReactNode }) {
    return <Suspense>{children}</Suspense>
}
