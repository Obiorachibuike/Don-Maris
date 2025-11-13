
'use client';

import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Trash2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export default function CartPage() {
  const { items, removeItem, updateItemQuantity, clearCart, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold font-headline mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild>
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
       <h1 className="text-4xl font-bold font-headline mb-8 text-center">Your Shopping Cart</h1>
       <div className="relative bg-card rounded-lg shadow-lg p-8 md:p-12 overflow-hidden">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <span className="text-7xl md:text-9xl font-black font-headline bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent opacity-10 rotate-[-15deg] select-none">
                    Don Maris Phone Accessories
                </span>
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-2xl font-bold font-headline text-primary">Don Maris Accessories</h2>
                        <p className="text-muted-foreground">Invoice #{new Date().getTime()}</p>
                        <p className="text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="font-bold">Billed To:</h3>
                        <p>Valued Customer</p>
                    </div>
                </div>

                <div className="flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <table className="min-w-full divide-y divide-border">
                                <thead>
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground sm:pl-0">Product</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">Quantity</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Remove</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
                                                <div className="flex items-center">
                                                    <div className="h-16 w-16 flex-shrink-0">
                                                        <Image
                                                            className="h-16 w-16 rounded-md object-contain"
                                                            src={item.product.images?.[0] || 'https://placehold.co/64x64.png'}
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
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value, 10))}
                                                    className="w-20"
                                                />
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
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
                            <span className="font-medium">₦{total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Shipping</span>
                            <span className="font-medium">Calculated at next step</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>₦{total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex items-center justify-end gap-x-6">
                    <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
                    <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                </div>
            </div>
       </div>
    </div>
  );
}
