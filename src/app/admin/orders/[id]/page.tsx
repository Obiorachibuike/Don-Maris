

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
import { Printer, Pencil } from 'lucide-react';
import type { CartItem, Order } from '@/lib/types';
import { useState, useEffect } from 'react';
import { EditOrderForm } from '@/components/edit-order-form';
import { Skeleton } from '@/components/ui/skeleton';
import { PrintConfirmationDialog } from '@/components/print-confirmation-dialog';
import { useSession } from '@/contexts/SessionProvider';

const getOrderDetails = (id: string): Order | undefined => {
    // Return a copy to prevent direct mutation
    const order = dummyOrders.find(order => order.id === id);
    return order ? { ...order, items: [...order.items], printHistory: [...(order.printHistory || [])] } : undefined;
}

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useSession();
    const orderId = params.id as string;
    
    const [order, setOrder] = useState<Order | null | undefined>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

    const { products, fetchProducts, isLoading: areProductsLoading } = useProductStore();
    
    useEffect(() => {
      fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        async function fetchOrder() {
            if (orderId) {
                try {
                    const response = await fetch(`/api/orders/${orderId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setOrder(data);
                    } else {
                        // Fallback to dummy data if API fails
                        setOrder(getOrderDetails(orderId));
                    }
                } catch (error) {
                    console.error("Failed to fetch order, using fallback.", error);
                    setOrder(getOrderDetails(orderId));
                }
            }
        }
        fetchOrder();
    }, [orderId]);

    if (order === undefined) {
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

    if (!order) {
         return (
            <div className="space-y-6">
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
                        <Skeleton className="h-48 w-full" />
                     </div>
                 </div>
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

    const subtotal = orderItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const shipping = 5.00; // Example shipping cost
    const total = subtotal + shipping;

    const navigateToInvoice = () => {
        if (areProductsLoading) return; // Prevent action if products are not loaded
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
            printedBy: user?.name || "Unknown Admin",
        };

        sessionStorage.setItem('don_maris_order', JSON.stringify(invoiceData));
        router.push(`/admin/orders/${orderId}/invoice`);
    };

    const handlePreviewInvoice = () => {
        if (order?.printHistory && order.printHistory.length > 0) {
            setIsPrintModalOpen(true);
        } else {
            navigateToInvoice();
        }
    };

    const handleOrderUpdate = (updatedOrder: Order) => {
        setOrder(updatedOrder);
    }
    
    const handleForcePrint = () => {
        navigateToInvoice();
        setIsPrintModalOpen(false);
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Order Details</h1>
                        <p className="text-muted-foreground">Invoice ID: {order.id}</p>
                    </div>
                    <div className='flex items-center gap-4'>
                         <Button onClick={() => setIsEditModalOpen(true)} variant="outline">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Order
                        </Button>
                        <Button onClick={handlePreviewInvoice} variant="outline" disabled={areProductsLoading}>
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
                                                    <Image src={item.product.images[0]} alt={item.product.name} width={40} height={40} className="rounded-md object-cover" />
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
                                    <span>₦{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>₦{shipping.toFixed(2)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>₦{total.toFixed(2)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            {isEditModalOpen && (
                <EditOrderForm
                    isOpen={isEditModalOpen}
                    setIsOpen={setIsEditModalOpen}
                    order={order}
                    onOrderUpdate={handleOrderUpdate}
                />
            )}
             <PrintConfirmationDialog
                isOpen={isPrintModalOpen}
                setIsOpen={setIsPrintModalOpen}
                onConfirm={handleForcePrint}
                printHistory={order.printHistory || []}
            />
        </>
    )
}
