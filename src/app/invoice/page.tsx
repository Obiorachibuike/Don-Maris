
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { CartItem } from '@/lib/types';
import { ArrowLeft, Printer } from 'lucide-react';

interface CustomerDetails {
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
}

interface OrderDetails {
    items: CartItem[];
    total: number;
    invoiceId: string;
    date: string;
    customer: CustomerDetails;
}

export default function InvoicePage() {
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const router = useRouter();

    useEffect(() => {
        const savedOrder = sessionStorage.getItem('don_maris_order');
        if (savedOrder) {
            setOrder(JSON.parse(savedOrder));
            // Optional: clear the sessionStorage after reading it
            // sessionStorage.removeItem('don_maris_order');
        } else {
            // If there's no order data, redirect to home
            router.push('/');
        }
    }, [router]);

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p>Loading invoice...</p>
            </div>
        );
    }
    
    const { items, total, invoiceId, date, customer } = order;

    return (
        <div className="container mx-auto px-4 py-8">
           <h1 className="text-4xl font-bold font-headline mb-8 text-center">Order Confirmation</h1>
           <div className="relative bg-card rounded-lg shadow-lg p-8 md:p-12 overflow-hidden">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <span className="text-7xl md:text-9xl font-black font-headline text-foreground/5 rotate-[-15deg] select-none">
                        Don Maris
                    </span>
                </div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-2xl font-bold font-headline text-primary">Don Maris Accessories</h2>
                            <p className="text-muted-foreground">Invoice #{invoiceId}</p>
                            <p className="text-muted-foreground">Date: {date}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="font-bold">Billed To:</h3>
                            <p>{customer.name}</p>
                            <p>{customer.address}</p>
                            <p>{customer.city}, {customer.state} {customer.zip}</p>
                        </div>
                    </div>

                    <div className="flow-root">
                        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                <table className="min-w-full divide-y divide-border">
                                    <thead>
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground sm:pl-0">Product</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">Price</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">Quantity</th>
                                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-foreground">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
                                                    <div className="flex items-center">
                                                        <div className="h-16 w-16 flex-shrink-0">
                                                            <Image
                                                                className="h-16 w-16 rounded-md object-cover"
                                                                src={item.product.image}
                                                                alt={item.product.name}
                                                                width={64}
                                                                height={64}
                                                            />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="font-medium text-foreground">{item.product.name}</div>
                                                            <div className="text-muted-foreground">{item.product.brand}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">${item.product.price.toFixed(2)}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground text-center">{item.quantity}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground text-right">${(item.product.price * item.quantity).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-8" />

                    <div className="flex justify-end">
                        <div className="w-full max-w-sm space-y-4">
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">${total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="font-medium">Free</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total Paid</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button asChild>
                            <Link href="/products">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Continue Shopping
                            </Link>
                        </Button>
                        <Button variant="outline" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Invoice
                        </Button>
                    </div>
                </div>
           </div>
        </div>
    );
}
