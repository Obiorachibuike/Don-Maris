
'use client';

import { useEffect, useState, FormEvent } from 'react';
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

export default function PaymentPage() {
    const { items, total, clearCart } = useCart();
    const { decreaseStock } = useProductStore();
    const { toast } = useToast();
    const router = useRouter();
    const [shippingDetails, setShippingDetails] = useState<ShippingDetails | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    useEffect(() => {
        const savedShipping = sessionStorage.getItem('don_maris_shipping');
        if (savedShipping) {
            setShippingDetails(JSON.parse(savedShipping));
        } else {
            router.push('/checkout');
        }
    }, [router]);

    const handleCheckout = async () => {
        if (!shippingDetails) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Shipping details are missing.',
            });
            return;
        }

        setIsProcessingPayment(true);

        // Store order details temporarily before redirecting to payment
        const orderDetails = {
            ...shippingDetails,
            date: new Date().toISOString(),
            paymentStatus: 'unpaid' as PaymentStatus, // Initially unpaid
        };
        sessionStorage.setItem('don_maris_pending_order', JSON.stringify(orderDetails));

        try {
            const response = await axios.post('/api/checkout', {
                items: shippingDetails.items,
                email: shippingDetails.customer.email,
            });

            const data = response.data;
            if (data.url) {
                // Before redirecting, save the order as pending
                await savePendingOrder();
                // Redirect to the payment gateway
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Could not initiate payment.');
            }
        } catch (error: any) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Payment Error',
                description: error.response?.data?.error || error.message || 'Could not start the payment process. Please try again.',
            });
            setIsProcessingPayment(false);
        }
    };
    
    // This function will be called when the user returns from the payment gateway
    const savePendingOrder = async () => {
        if (!shippingDetails) return;

         const orderDetails = {
            ...shippingDetails,
            date: new Date().toISOString(),
            paymentStatus: 'paid' as PaymentStatus, // Assume paid on successful return
        };
        
        const result = await submitOrder(orderDetails);

        if (result.status === 'success' || result.id) {
            shippingDetails.items.forEach(item => {
                decreaseStock(item.product.id, item.quantity);
            });

            const finalOrder = {
                ...orderDetails,
                invoiceId: result.id || `DM-${new Date().getTime()}`,
                date: new Date(orderDetails.date).toLocaleDateString(),
                customer: {
                    ...orderDetails.customer,
                    name: `${orderDetails.customer.firstName} ${orderDetails.customer.lastName}`.trim(),
                }
            };
            sessionStorage.setItem('don_maris_order', JSON.stringify(finalOrder));
            clearCart();
            sessionStorage.removeItem('don_maris_shipping');
            
            toast({
                title: "Order Placed!",
                description: "Thank you for your purchase. We've received your order.",
            });

        } else {
             toast({
                variant: 'destructive',
                title: "Order Failed",
                description: "There was a problem saving your order after payment. Please contact support.",
            });
        }
    };
    
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
                            <CardTitle className="font-headline text-2xl">Confirm and Pay</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-muted-foreground">
                                You are about to complete your purchase. Clicking the button below will redirect you to a secure payment gateway (Stripe or Paystack) based on your location.
                            </p>
                            <p className="text-muted-foreground">
                                Please review your order summary on the right one last time.
                            </p>
                            <Button 
                                onClick={handleCheckout} 
                                disabled={isProcessingPayment} 
                                className="w-full"
                                size="lg"
                            >
                                {isProcessingPayment ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                {isProcessingPayment ? 'Redirecting...' : `Proceed to Payment - $${total.toFixed(2)}`}
                            </Button>
                            <p className="text-xs text-muted-foreground text-center">
                                You will be redirected to our secure payment partner to complete your purchase.
                            </p>
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
