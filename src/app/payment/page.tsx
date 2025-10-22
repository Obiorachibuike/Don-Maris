
'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Banknote, CreditCard, Copy, Forward } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { submitOrder } from '@/lib/client-data';
import type { PaymentStatus, CartItem, Order } from '@/lib/types';
import axios, { AxiosError } from 'axios';
import { useProductStore } from '@/store/product-store';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSession } from '@/contexts/SessionProvider';
import Image from 'next/image';

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
    account_name: string;
    account_number: string;
    bank: {
        name: string;
    };
}

export default function PaymentPage() {
    const { items, total, clearCart } = useCart();
    const router = useRouter();
    const { user } = useSession();
    const [shippingDetails, setShippingDetails] = useState<ShippingDetails | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | null>(null);
    const [isCardLoading, setIsCardLoading] = useState(false);
    const [isTransferLoading, setIsTransferLoading] = useState(false);
    const [isPayLaterLoading, setIsPayLaterLoading] = useState(false);
    const [virtualAccount, setVirtualAccount] = useState<VirtualAccount | null>(null);
    const { toast } = useToast();
    const { decreaseStock, products } = useProductStore();
    
    const isNigeria = user?.countryCode === 'NG';
    
    useEffect(() => {
        const savedShipping = sessionStorage.getItem('don_maris_shipping');
        if (savedShipping) {
            const details = JSON.parse(savedShipping);
            setShippingDetails(details);
        } else {
            router.push('/checkout');
        }
    }, [router]);

    const updateStockInDatabase = async (productId: string, quantitySold: number) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        const newStock = product.stock - quantitySold;
        
        try {
            await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stock: newStock,
                    stockChangeReason: 'Sale',
                    stockChangeUser: user?.name || shippingDetails?.customer.firstName || 'Customer'
                }),
            });
            decreaseStock(productId, quantitySold); // Update client state
        } catch (error) {
            console.error(`Failed to update stock for product ${productId}`, error);
        }
    };


    const handleCardCheckout = async () => {
        if (!user || !shippingDetails) return;
        setIsCardLoading(true);

        const orderDetails = { ...shippingDetails, date: new Date().toISOString(), paymentStatus: 'unpaid' as PaymentStatus };
        const orderResult = await submitOrder(orderDetails);

        if (!orderResult.id) {
             toast({ variant: 'destructive', title: "Order Failed", description: "Could not save your order before payment. Please contact support." });
             setIsCardLoading(false);
             return;
        }

        try {
            // Update stock before redirecting to payment
            for (const item of shippingDetails.items) {
                await updateStockInDatabase(item.product.id, item.quantity);
            }

            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user._id,
                    amount: total,
                    orderId: orderResult.id
                }),
            });

            const data = await res.json();
            if (data.checkoutUrl) {
                clearCart();
                window.location.href = data.checkoutUrl;
            } else {
                toast({ variant: 'destructive', title: 'Error', description: data.error || "Error initializing payment" });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: "Could not initialize card payment. Please try again." });
        } finally {
            setIsCardLoading(false);
        }
    };
    
    const handleBankTransferCheckout = async () => {
        setIsTransferLoading(true);
        try {
            const response = await axios.post('/api/create-virtual-account', {
                email: shippingDetails!.customer.email,
                first_name: shippingDetails!.customer.firstName,
                last_name: shippingDetails!.customer.lastName,
                phone: shippingDetails!.customer.phone,
            });
            setVirtualAccount(response.data.virtualAccount);
            setPaymentMethod('transfer');
        } catch (error: any) {
            console.error('Error creating virtual account', error);
            const axiosError = error as AxiosError<{ error: string, details?: any }>;
            const errorMessage = axiosError.response?.data?.error || 'Could not create a bank account for transfer. Please try again.';
            toast({
                variant: 'destructive',
                title: 'Bank Transfer Failed',
                description: errorMessage,
            });
        }
        setIsTransferLoading(false);
    };

    const handlePayLater = async () => {
        if (!shippingDetails || !user) return;

        setIsPayLaterLoading(true);
        
        const customerDetails = {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
        };

        const orderDate = new Date();

        const orderDetails: Omit<Order, 'id'> = {
            customer: customerDetails,
            shippingAddress: `${shippingDetails.customer.address}, ${shippingDetails.customer.city}, ${shippingDetails.customer.state} ${shippingDetails.customer.zip}`,
            amount: shippingDetails.total,
            status: 'Pending',
            date: orderDate.toISOString(),
            paymentMethod: 'Pay on Delivery',
            items: shippingDetails.items.map(item => ({ productId: item.id, quantity: item.quantity })),
            deliveryMethod: 'Waybill', // Default or choose one
            paymentStatus: 'Not Paid',
            amountPaid: 0
        };

        const result = await submitOrder(orderDetails);
        
        if (result.status === 'success' || result.id) {
            for (const item of shippingDetails.items) {
                await updateStockInDatabase(item.product.id, item.quantity);
            }

            const invoiceData = {
                items: shippingDetails.items,
                total: shippingDetails.total,
                invoiceId: result.id || `DM-${Date.now()}`,
                date: orderDate.toLocaleDateString(),
                customer: {
                    ...customerDetails,
                    name: `${shippingDetails.customer.firstName} ${shippingDetails.customer.lastName}`.trim(),
                    address: shippingDetails.customer.address,
                    city: shippingDetails.customer.city,
                    state: shippingDetails.customer.state,
                    zip: shippingDetails.customer.zip,
                },
                paymentStatus: 'unpaid' as PaymentStatus,
            };

            sessionStorage.setItem('don_maris_order', JSON.stringify(invoiceData));
            
            toast({
                title: "Order Placed!",
                description: "Your order has been recorded. You can pay at a later time.",
            });
            clearCart();
            router.push('/invoice');
        } else {
            toast({ variant: 'destructive', title: "Order Failed", description: "Could not save your order. Please contact support." });
        }
        
        setIsPayLaterLoading(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: 'Copied to clipboard!',
        });
    }

    if (!shippingDetails || !user) {
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
                             {!paymentMethod ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Button variant="outline" size="lg" className="h-20 text-lg" onClick={handleCardCheckout} disabled={isCardLoading}>
                                         {isCardLoading ? <Loader2 className="mr-4 h-6 w-6 animate-spin"/> : <CreditCard className="mr-4 h-6 w-6"/>}
                                        Pay with Card
                                    </Button>
                                    {isNigeria && (
                                     <Button variant="outline" size="lg" className="h-20 text-lg" onClick={handleBankTransferCheckout} disabled={isTransferLoading}>
                                        {isTransferLoading ? <Loader2 className="mr-4 h-6 w-6 animate-spin"/> : <Banknote className="mr-4 h-6 w-6"/>}
                                        Pay with Bank Transfer
                                    </Button>
                                    )}
                                    <div className="sm:col-span-2">
                                        <Button variant="secondary" size="lg" className="h-20 w-full text-lg" onClick={handlePayLater} disabled={isPayLaterLoading}>
                                            {isPayLaterLoading ? <Loader2 className="mr-4 h-6 w-6 animate-spin"/> : <Forward className="mr-4 h-6 w-6"/>}
                                            Continue Without Payment
                                        </Button>
                                    </div>
                                </div>
                             ) : (
                                 virtualAccount && (
                                     <Alert>
                                        <Banknote className="h-4 w-4" />
                                        <AlertTitle>Your Bank Transfer Details</AlertTitle>
                                        <AlertDescription>
                                            <p>Please transfer the total amount to the account below. Your order will be processed upon confirmation.</p>
                                            <div className="space-y-2 mt-4 bg-muted p-4 rounded-md">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Bank Name</p>
                                                        <p className="font-semibold">{virtualAccount.bank.name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                     <div>
                                                        <p className="text-xs text-muted-foreground">Account Number</p>
                                                        <p className="font-semibold text-lg">{virtualAccount.account_number}</p>
                                                    </div>
                                                     <Button variant="ghost" size="icon" onClick={() => copyToClipboard(virtualAccount.account_number)}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                 <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Account Name</p>
                                                        <p className="font-semibold">{virtualAccount.account_name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Amount</p>
                                                        <p className="font-semibold text-lg">₦{total.toFixed(2)}</p>
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(total.toFixed(2))}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <Button className="w-full mt-4" asChild>
                                                <a href="/products">Continue Shopping</a>
                                            </Button>
                                        </AlertDescription>
                                     </Alert>
                                 )
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
                                        <Image src={item.product.images?.[0] || 'https://placehold.co/48x48.png'} alt={item.product.name} width={48} height={48} className="rounded-md" />
                                        <div>
                                            <p className="font-medium">{item.product.name}</p>
                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-medium">₦{(item.product.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                            <Separator />
                            <div className="flex justify-between font-bold text-xl">
                                <p>Total</p>
                                <p>₦{total.toFixed(2)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
