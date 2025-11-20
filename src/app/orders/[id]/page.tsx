

'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import type { Order } from '@/lib/types';
import { useState, useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/contexts/SessionProvider';
import { useProductStore } from '@/store/product-store';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { useOrderStore } from '@/store/order-store';

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoading: isUserLoading } = useSession();
    const { toast } = useToast();
    const orderId = params.id as string;
    
    const [isPaying, setIsPaying] = useState(false);

    const { products, isLoading: areProductsLoading } = useProductStore();
    const { getOrderById, isLoading: isOrderLoading } = useOrderStore();
    
    const order = useMemo(() => getOrderById(orderId), [getOrderById, orderId]);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
        if (!isUserLoading && user && order) {
            if (user.role === 'customer' && order.customer.id !== user.id) {
                 toast({ variant: 'destructive', title: 'Access Denied', description: 'You are not authorized to view this order.' });
                 router.push('/profile');
            }
        }
    }, [isUserLoading, user, order, router, toast]);

    const handlePayNow = async (orderToPay: Order) => {
        if (!user) return;
        setIsPaying(true);

        const amountToPay = orderToPay.amount - orderToPay.amountPaid;

        try {
            const res = await axios.post("/api/checkout", {
                userId: user._id,
                amount: amountToPay,
                orderId: orderToPay.id
            });

            const data = res.data;
            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            } else {
                toast({ variant: 'destructive', title: 'Error', description: data.error || "Error initializing payment" });
                setIsPaying(false);
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: "Could not initialize payment. Please try again." });
            setIsPaying(false);
        }
    };

    if (isUserLoading || isOrderLoading || areProductsLoading) {
         return (
            <div className="container mx-auto px-4 py-8 space-y-6">
                <Skeleton className="h-8 w-1/4" />
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     <Card className="lg:col-span-2">
                         <CardHeader>
                            <Skeleton className="h-6 w-1/3" />
                         </CardHeader>
                         <CardContent>
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                         </CardContent>
                     </Card>
                      <div className="space-y-6">
                        <Skeleton className="h-48 w-full" />
                     </div>
                 </div>
            </div>
         )
    }

    if (!order) {
        return (
             <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Not Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>The requested order could not be found.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    const orderItems = order.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
            ...item,
            product: product || { name: 'Unknown Product', images: ['https://placehold.co/100x100.png'], price: 0 }
        };
    });

    const balance = order.amount - order.amountPaid;

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Order Details</h1>
                    <p className="text-muted-foreground">Invoice ID: {order.id}</p>
                </div>
                <div className='flex items-center gap-4'>
                    <Badge variant={
                        order.status === 'Fulfilled' ? 'default' :
                        order.status === 'Processing' ? 'secondary' :
                        'destructive'
                    } className={`capitalize ${order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20' : order.status === 'Cancelled' ? 'bg-gray-500/20 text-gray-700 border-gray-500/20' : ''}`}>
                        {order.status}
                    </Badge>
                     <Badge variant={
                        order.paymentStatus === 'Paid' ? 'default' :
                        order.paymentStatus === 'Not Paid' ? 'destructive' :
                        'secondary'
                    } className={`capitalize ${order.paymentStatus === 'Incomplete' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20' : ''}`}>
                        {order.paymentStatus}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Products Ordered</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-center">Quantity</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {areProductsLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <Skeleton className="h-6 w-1/2 mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : orderItems.map(item => (
                                    <TableRow key={item.productId}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Image src={item.product.images?.[0] || 'https://placehold.co/40x40.png'} alt={item.product.name} width={40} height={40} className="rounded-md object-contain" />
                                                <span className="font-medium">{item.product.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">{item.quantity}</TableCell>
                                        <TableCell className="text-right">₦{item.product.price.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">₦{(item.product.price * item.quantity).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping & Billing</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <h4 className="font-semibold mb-2">Shipping Address</h4>
                            <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
                            <Separator className="my-4" />
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={order.customer.avatar} alt={order.customer.name} />
                                    <AvatarFallback>{order.customer.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{order.customer.name}</p>
                                    <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Order Date:</span>
                                <span>{new Date(order.date).toLocaleDateString()}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Amount</span>
                                <span>₦{order.amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Amount Paid</span>
                                <span className="text-green-600">₦{order.amountPaid.toFixed(2)}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Balance Due</span>
                                <span className={balance > 0 ? 'text-destructive' : ''}>₦{balance.toFixed(2)}</span>
                            </div>
                             {balance > 0 && (
                                <Button className="w-full mt-4" onClick={() => handlePayNow(order)} disabled={isPaying}>
                                    {isPaying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                                    Pay Balance: ₦{balance.toFixed(2)}
                                </Button>
                             )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
