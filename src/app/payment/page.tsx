
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { submitOrder } from '@/lib/data';
import type { PaymentStatus, CartItem } from '@/lib/types';
import axios from 'axios';
import { useProductStore } from '@/store/product-store';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CustomerDetails {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
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

function CheckoutForm({ shippingDetails }: { shippingDetails: ShippingDetails }) {
    const { items, total, clearCart } = useCart();
    const { decreaseStock } = useProductStore();
    const { toast } = useToast();
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [saveCard, setSaveCard] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsLoading(true);

        const orderDetails = { ...shippingDetails, date: new Date().toISOString(), paymentStatus: 'paid' as PaymentStatus };
        const result = await submitOrder(orderDetails);
        
        if (result.status === 'success' || result.id) {
            shippingDetails.items.forEach(item => decreaseStock(item.product.id, item.quantity));
            const finalOrder = { ...orderDetails, invoiceId: result.id || `DM-${Date.now()}`, date: new Date(orderDetails.date).toLocaleDateString(), customer: { ...orderDetails.customer, name: `${orderDetails.customer.firstName} ${orderDetails.customer.lastName}`.trim() } };
            sessionStorage.setItem('don_maris_order', JSON.stringify(finalOrder));
            
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/invoice`,
                },
            });

            if (error.type === "card_error" || error.type === "validation_error") {
                toast({ variant: 'destructive', title: "Payment Failed", description: error.message });
            } else {
                toast({ variant: 'destructive', title: "An unexpected error occurred." });
            }

        } else {
            toast({ variant: 'destructive', title: "Order Failed", description: "Could not save your order. Please contact support." });
        }


        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            <div className="flex items-center space-x-2 mt-4">
                <Checkbox 
                    id="save-card" 
                    checked={saveCard}
                    onCheckedChange={(checked) => setSaveCard(Boolean(checked))}
                />
                <Label htmlFor="save-card" className="cursor-pointer">
                    Save card for future payments
                </Label>
            </div>
            <Button disabled={isLoading || !stripe || !elements} className="w-full mt-4" size="lg">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Pay Now
            </Button>
        </form>
    );
}

export default function PaymentPage() {
    const { items, total } = useCart();
    const router = useRouter();
    const [shippingDetails, setShippingDetails] = useState<ShippingDetails | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [options, setOptions] = useState<StripeElementsOptions | null>(null);
    
    useEffect(() => {
        const savedShipping = sessionStorage.getItem('don_maris_shipping');
        if (savedShipping) {
            const details = JSON.parse(savedShipping);
            setShippingDetails(details);
            // Create PaymentIntent as soon as the page loads
            axios.post('/api/checkout', {
                items: details.items,
                email: details.customer.email,
                saveCard: true, // This can be controlled by a checkbox later
            }).then(res => {
                setClientSecret(res.data.clientSecret);
                setOptions({
                    clientSecret: res.data.clientSecret,
                    appearance: { theme: 'stripe' },
                });
            }).catch(err => {
                console.error("Error creating payment intent", err);
                // Handle error appropriately
            });
        } else {
            router.push('/checkout');
        }
    }, [router]);

    if (!shippingDetails) {
        return (
             <div className="container mx-auto px-4 py-16 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                <p className="mt-2">Loading details...</p>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold font-headline mb-8 text-center">Payment - Final Step</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Payment Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                             {clientSecret && options ? (
                                <Elements options={options} stripe={stripePromise}>
                                    <CheckoutForm shippingDetails={shippingDetails} />
                                </Elements>
                            ) : (
                                <div className='flex justify-center items-center h-40'>
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            )}
                        </CardContent>
                     </Card>
                </div>

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

