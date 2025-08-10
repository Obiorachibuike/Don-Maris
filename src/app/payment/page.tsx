
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CreditCard, Landmark, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { submitOrder } from '@/lib/data';
import type { PaymentStatus, CartItem } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CustomerDetails {
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
}

interface ShippingDetails {
    items: CartItem[];
    total: number;
    customer: CustomerDetails;
}

export default function PaymentPage() {
    const { clearCart } = useCart();
    const { toast } = useToast();
    const router = useRouter();
    const [shippingDetails, setShippingDetails] = useState<ShippingDetails | null>(null);

    useEffect(() => {
        const savedShipping = sessionStorage.getItem('don_maris_shipping');
        if (savedShipping) {
            setShippingDetails(JSON.parse(savedShipping));
        } else {
            // If no shipping data, redirect to checkout
            router.push('/checkout');
        }
    }, [router]);

    const handleSubmit = async (paymentMade: boolean) => {
        if (!shippingDetails) return;

        const orderDetails = {
            ...shippingDetails,
            date: new Date().toISOString(),
            paymentStatus: paymentMade ? 'paid' : 'unpaid' as PaymentStatus,
        };
        
        const result = await submitOrder(orderDetails);

        if (result.status === 'success' || result.id) {
            const finalOrder = {
                ...orderDetails,
                invoiceId: result.id || `DM-${new Date().getTime()}`,
                date: new Date(orderDetails.date).toLocaleDateString(),
            };
            sessionStorage.setItem('don_maris_order', JSON.stringify(finalOrder));

            clearCart();
            sessionStorage.removeItem('don_maris_shipping');
            
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
    
    if (!shippingDetails) {
        return (
             <div className="container mx-auto px-4 py-16 text-center">
                <p>Loading details...</p>
            </div>
        );
    }
    
    const { items, total } = shippingDetails;

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold font-headline mb-8 text-center">Payment - Step 2 of 2</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Payment Options */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Payment Options</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" defaultValue="card" collapsible>
                                <AccordionItem value="card">
                                    <AccordionTrigger className="text-lg font-semibold flex items-center gap-2">
                                        <CreditCard /> Pay with Card (Stripe)
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4">
                                        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(true); }}>
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
                                                    <span>Your payment information is secure with Stripe.</span>
                                                </div>
                                                <Button type="submit" className="w-full">Pay ${total.toFixed(2)}</Button>
                                            </div>
                                        </form>
                                    </AccordionContent>
                                </AccordionItem>
                                 <AccordionItem value="transfer">
                                    <AccordionTrigger className="text-lg font-semibold flex items-center gap-2">
                                        <Landmark /> Bank Transfer (Paystack)
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4 space-y-4">
                                       <p className="text-muted-foreground">To complete your purchase, please transfer the total amount to the virtual account number below using Paystack.</p>
                                       <div className="p-4 bg-muted rounded-lg">
                                           <p><span className="font-semibold">Account Number:</span> 8025160310</p>
                                           <p><span className="font-semibold">Bank:</span> Opay</p>
                                           <p><span className="font-semibold">Amount:</span> ${total.toFixed(2)}</p>
                                       </div>
                                       <p className="text-sm text-muted-foreground">After making the transfer, click the button below to confirm your order.</p>
                                       <Button onClick={() => handleSubmit(true)} className="w-full">I've made the transfer</Button>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                    <div className="mt-6 text-center">
                        <p className="text-muted-foreground mb-2">Or, place your order now and pay later.</p>
                        <Button onClick={() => handleSubmit(false)} variant="secondary" size="lg" className="w-full">
                            Place Order Without Payment
                        </Button>
                    </div>
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
                            <div className="flex justify-between font-bold text-xl">
                                <p>Total</p>
                                <p>${total.toFixed(2)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

