
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
import { dummyOrders } from '@/lib/dummy-orders';
import { useProductStore } from '@/store/product-store';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import type { CartItem } from '@/lib/types';

const getOrderDetails = (id: string) => {
    return dummyOrders.find(order => order.id === id);
}

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;
    const order = getOrderDetails(orderId);
    const { products } = useProductStore();

    if (!order) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Order Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The requested order could not be found.</p>
                </CardContent>
            </Card>
        )
    }

    const orderItems = order.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
            ...item,
            product: product || { name: 'Unknown Product', image: 'https://placehold.co/100x100.png', price: 0 }
        };
    });

    const subtotal = orderItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const shipping = 5.00; // Example shipping cost
    const total = subtotal + shipping;

    const handlePreviewInvoice = () => {
        const cartItems: CartItem[] = order.items.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                id: item.productId,
                product: product!,
                quantity: item.quantity
            }
        }).filter(item => item.product);

         const invoiceData = {
            items: cartItems,
            total: order.amount,
            invoiceId: order.id,
            date: new Date(order.date).toLocaleDateString(),
            customer: {
                name: order.customer.name,
                email: order.customer.email,
                address: order.shippingAddress.split(', ')[0],
                city: order.shippingAddress.split(', ')[1],
                state: order.shippingAddress.split(', ')[2].split(' ')[0],
                zip: order.shippingAddress.split(', ')[2].split(' ')[1],
            },
            paymentStatus: order.status === 'Fulfilled' ? 'paid' : 'unpaid',
        };

        sessionStorage.setItem('don_maris_order', JSON.stringify(invoiceData));
        router.push('/invoice');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Order Details</h1>
                    <p className="text-muted-foreground">Invoice ID: {order.id}</p>
                </div>
                <div className='flex items-center gap-4'>
                    <Button onClick={handlePreviewInvoice} variant="outline">
                        <Printer className="mr-2 h-4 w-4" />
                        Preview Invoice
                    </Button>
                    <Badge variant={
                        order.status === 'Fulfilled' ? 'default' :
                        order.status === 'Processing' ? 'secondary' :
                        'destructive'
                    } className={`capitalize ${order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20' : order.status === 'Cancelled' ? 'bg-gray-500/20 text-gray-700 border-gray-500/20' : ''}`}>
                        {order.status}
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
                                {orderItems.map(item => (
                                    <TableRow key={item.productId}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Image src={item.product.image} alt={item.product.name} width={40} height={40} className="rounded-md object-cover" />
                                                <span className="font-medium">{item.product.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">{item.quantity}</TableCell>
                                        <TableCell className="text-right">${item.product.price.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">${(item.product.price * item.quantity).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link href={`/admin/users/${order.customer.id}`} className="flex items-center gap-3 group">
                                <Avatar>
                                    <AvatarImage src={order.customer.avatar} alt={order.customer.name} />
                                    <AvatarFallback>{order.customer.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium group-hover:underline">{order.customer.name}</p>
                                    <p className="text-sm text-muted-foreground group-hover:underline">{order.customer.email}</p>
                                </div>
                            </Link>
                            <Separator className="my-4" />
                            <h4 className="font-semibold mb-2">Shipping Address</h4>
                            <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Order Date:</span>
                                <span>{new Date(order.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Payment Method:</span>
                                <span className="text-right">{order.paymentMethod}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>${shipping.toFixed(2)}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
