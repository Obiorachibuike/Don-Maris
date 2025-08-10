
'use client';

import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CreditCard, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
import { submitOrder } from '@/lib/data';

export default function CheckoutPage() {
    const { items, total, clearCart } = useCart();
    const { toast } = useToast();
    const router = useRouter();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const customerDetails = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            address: formData.get('address') as string,
            city: formData.get('city') as string,
            state: formData.get('state') as string,
            zip: formData.get('zip') as string,
        };

        const orderDetails = {
            items,
            total,
            customer: customerDetails,
            date: new Date().toISOString(),
        };
        
        const result = await submitOrder(orderDetails);

        if (result.status === 'success' || result.id) {
            // Store the finalized order details in sessionStorage to pass to the invoice page
            const finalOrder = {
                ...orderDetails,
                invoiceId: result.id || `DM-${new Date().getTime()}`,
                date: new Date(orderDetails.date).toLocaleDateString(),
            };
            sessionStorage.setItem('don_maris_order', JSON.stringify(finalOrder));

            clearCart();
            
            toast({
                title: "Order Placed!",
                description: "Thank you for your purchase. We've received your order.",
            });

            router.push('/invoice');
        } else {
             toast({
                variant: 'destructive',
                title: "Order Failed",
                description: "There was a problem placing your order. Please try again.",
            });
        }
    };

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold font-headline mb-4">Your Cart is Empty</h1>
                <p className="text-muted-foreground mb-6">You need to add items to your cart before you can check out.</p>
                <Button asChild>
                    <Link href="/products">Start Shopping</Link>
                </Button>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold font-headline mb-8 text-center">Checkout</h1>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Shipping and Payment Details */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">Shipping & Payment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" defaultValue="shipping" collapsible>
                                    <AccordionItem value="shipping">
                                        <AccordionTrigger className="text-lg font-semibold">Shipping Information</AccordionTrigger>
                                        <AccordionContent className="pt-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Full Name</Label>
                                                    <Input id="name" name="name" placeholder="John Doe" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email Address</Label>
                                                    <Input id="email" name="email" type="email" placeholder="john.doe@example.com" required />
                                                </div>
                                                <div className="sm:col-span-2 space-y-2">
                                                    <Label htmlFor="address">Street Address</Label>
                                                    <Input id="address" name="address" placeholder="123 Tech Lane" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="city">City</Label>
                                                    <Input id="city" name="city" placeholder="Techville" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="state">State / Province</Label>
                                                    <Input id="state" name="state" placeholder="California" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="zip">ZIP / Postal Code</Label>
                                                    <Input id="zip" name="zip" placeholder="90210" required />
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                     <AccordionItem value="payment">
                                        <AccordionTrigger className="text-lg font-semibold">Payment Details</AccordionTrigger>
                                        <AccordionContent className="pt-4">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="card-number">Card Number</Label>
                                                    <div className="relative">
                                                        <Input id="card-number" placeholder="0000 0000 0000 0000" required />
                                                        <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="expiry-date">Expiry Date</Label>
                                                        <Input id="expiry-date" placeholder="MM / YY" required />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="cvc">CVC</Label>
                                                        <Input id="cvc" placeholder="123" required />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                                                    <Lock className="h-4 w-4" />
                                                    <span>Your payment information is secure.</span>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {items.map(item => (
                                    <div key={item.id} className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <Image src={item.product.image} alt={item.product.name} width={48} height={48} className="rounded-md" />
                                            <div>
                                                <p className="font-medium">{item.product.name}</p>
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                                <Separator />
                                <div className="flex justify-between">
                                    <p className="text-muted-foreground">Subtotal</p>
                                    <p className="font-medium">${total.toFixed(2)}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-muted-foreground">Shipping</p>
                                    <p className="font-medium">Free</p>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-xl">
                                    <p>Total</p>
                                    <p>${total.toFixed(2)}</p>
                                </div>
                            </CardContent>
                        </Card>
                         <div className="mt-6">
                            <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                                Place Order
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
