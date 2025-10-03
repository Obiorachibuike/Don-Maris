
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Banknote, Copy, Check } from 'lucide-react';
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

interface VirtualAccount {
    bank: {
        name: string;
    };
    account_name: string;
    account_number: string;
}

export default function PaymentPage() {
    const { items, total, clearCart } = useCart();
    const { decreaseStock } = useProductStore();
    const { toast } = useToast();
    const router = useRouter();
    const [shippingDetails, setShippingDetails] = useState<ShippingDetails | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | null>(null);
    const [virtualAccount, setVirtualAccount] = useState<VirtualAccount | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const savedShipping = sessionStorage.getItem('don_maris_shipping');
        if (savedShipping) {
            setShippingDetails(JSON.parse(savedShipping));
        } else {
            router.push('/checkout');
        }
    }, [router]);
    
    const handlePayment = async (method: 'card' | 'transfer') => {
        if (!shippingDetails) {
            toast({ variant: 'destructive', title: 'Error', description: 'Shipping details are missing.' });
            return;
        }

        setIsProcessing(true);
        setPaymentMethod(method);

        if (method === 'card') {
            await handleCardCheckout();
        } else {
            await handleBankTransferCheckout();
        }
    }

    const handleCardCheckout = async () => {
        sessionStorage.setItem('don_maris_pending_order', JSON.stringify({ ...shippingDetails, date: new Date().toISOString(), paymentStatus: 'unpaid' }));

        try {
            const response = await axios.post('/api/checkout', { items: shippingDetails!.items, email: shippingDetails!.customer.email });
            if (response.data.url) {
                await savePendingOrder();
                window.location.href = response.data.url;
            } else {
                throw new Error(response.data.error || 'Could not initiate payment.');
            }
        } catch (error: any) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Payment Error', description: error.response?.data?.error || error.message || 'Could not start the payment process.' });
            setIsProcessing(false);
        }
    };

    const handleBankTransferCheckout = async () => {
        try {
            const response = await axios.post('/api/create-virtual-account', {
                email: shippingDetails!.customer.email,
                first_name: shippingDetails!.customer.firstName,
                last_name: shippingDetails!.customer.lastName,
                phone: shippingDetails!.customer.phone,
            });
            if (response.data.success) {
                setVirtualAccount(response.data.data);
                await savePendingOrder();
            } else {
                throw new Error(response.data.error || 'Could not create virtual account.');
            }
        } catch (error: any) {
             console.error(error);
            toast({ variant: 'destructive', title: 'Bank Transfer Error', description: error.message || 'Could not set up bank transfer. Please try another method.' });
        } finally {
            setIsProcessing(false);
        }
    }
    
    const savePendingOrder = async () => {
        if (!shippingDetails) return;

         const orderDetails = { ...shippingDetails, date: new Date().toISOString(), paymentStatus: (paymentMethod === 'card' ? 'paid' : 'unpaid') as PaymentStatus };
        const result = await submitOrder(orderDetails);

        if (result.status === 'success' || result.id) {
            shippingDetails.items.forEach(item => decreaseStock(item.product.id, item.quantity));
            const finalOrder = { ...orderDetails, invoiceId: result.id || `DM-${Date.now()}`, date: new Date(orderDetails.date).toLocaleDateString(), customer: { ...orderDetails.customer, name: `${orderDetails.customer.firstName} ${orderDetails.customer.lastName}`.trim() } };
            sessionStorage.setItem('don_maris_order', JSON.stringify(finalOrder));
            clearCart();
            sessionStorage.removeItem('don_maris_shipping');
            
            if (paymentMethod === 'card') {
                toast({ title: "Order Placed!", description: "Thank you! We've received your order."});
            }
        } else {
             toast({ variant: 'destructive', title: "Order Failed", description: "Could not save your order. Please contact support." });
        }
    };
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

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
                     {virtualAccount ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">Complete Your Bank Transfer</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground">Transfer the total amount to the account details below. Your order will be processed once payment is confirmed.</p>
                                <div className="p-4 bg-muted rounded-md space-y-2">
                                    <div className="flex justify-between"><span>Bank:</span> <span className="font-bold">{virtualAccount.bank.name}</span></div>
                                    <div className="flex justify-between"><span>Account Name:</span> <span className="font-bold">{virtualAccount.account_name}</span></div>
                                    <div className="flex justify-between items-center">
                                        <span>Account Number:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">{virtualAccount.account_number}</span>
                                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyToClipboard(virtualAccount.account_number)}>
                                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t"><span>Amount:</span> <span className="font-bold">${total.toFixed(2)}</span></div>
                                </div>
                                <Button className="w-full" asChild>
                                    <a href="/products">Continue Shopping</a>
                                </Button>
                            </CardContent>
                        </Card>
                     ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">Choose Payment Method</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button onClick={() => handlePayment('card')} disabled={isProcessing} className="w-full" size="lg">
                                    {isProcessing && paymentMethod === 'card' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {isProcessing && paymentMethod === 'card' ? 'Processing...' : 'Pay with Card or Online'}
                                </Button>
                                <Button onClick={() => handlePayment('transfer')} variant="outline" disabled={isProcessing} className="w-full" size="lg">
                                    {isProcessing && paymentMethod === 'transfer' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Banknote className="mr-2 h-4 w-4" />}
                                    {isProcessing && paymentMethod === 'transfer' ? 'Setting up...' : 'Pay with Bank Transfer'}
                                </Button>
                                <p className="text-xs text-muted-foreground text-center">
                                    Card payments are redirected to our secure payment partner. Bank transfers will generate a dedicated account for you.
                                </p>
                            </CardContent>
                        </Card>
                    )}
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
