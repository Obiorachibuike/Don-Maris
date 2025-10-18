
'use client';

import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/star-rating';
import { formatProductType } from '@/lib/display-utils';
import { Tag, DollarSign, Package, CheckCircle, BarChart2, Calendar, ShoppingCart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { dummyOrders } from '@/lib/dummy-orders';
import type { Order, Customer, Product } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getProductById } from '@/lib/client-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PurchaseHistoryEntry {
    orderId: string;
    customer: Customer;
    date: string;
    quantity: number;
}

export default function AdminProductDetailsPage() {
    const params = useParams();
    const productId = params.id as string;
    const [product, setProduct] = useState<Product | null | undefined>(null);
    const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryEntry[]>([]);

    useEffect(() => {
        async function loadProductData() {
            const fetchedProduct = await getProductById(productId);
            setProduct(fetchedProduct);

            if (fetchedProduct) {
                const history: PurchaseHistoryEntry[] = dummyOrders
                    .map(order => {
                        const item = order.items.find(item => item.productId === productId);
                        if (item) {
                            return {
                                orderId: order.id,
                                customer: order.customer,
                                date: order.date,
                                quantity: item.quantity,
                            };
                        }
                        return null;
                    })
                    .filter((entry): entry is PurchaseHistoryEntry => entry !== null);
                setPurchaseHistory(history);
            }
        }
        
        if(productId) {
            loadProductData();
        }
    }, [productId]);


    if (product === undefined) {
        notFound();
    }

    if (product === null) {
        return (
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <Skeleton className="h-8 w-1/2" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                         <Skeleton className="aspect-square w-full rounded-lg" />
                    </div>
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{product.name}</h1>
                    <p className="text-muted-foreground">Product ID: {product.id}</p>
                </div>
                {product.isFeatured && (
                    <Badge>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Featured
                    </Badge>
                )}
            </div>

            <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Product Details</TabsTrigger>
                    <TabsTrigger value="activities">Activities</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                             <Card>
                                <CardContent className="p-4 flex items-center justify-center">
                                     <div className="aspect-square relative w-full max-w-sm">
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-contain rounded-md"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            data-ai-hint={product.data_ai_hint}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Product Details</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <Tag className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Brand</p>
                                            <p className="font-medium">{product.brand}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Package className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Type</p>
                                            <p className="font-medium">{formatProductType(product.type)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Price</p>
                                            <p className="font-medium">${product.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                     <div className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Stock</p>
                                            <p className="font-medium">{product.stock} units</p>
                                        </div>
                                    </div>
                                     <div className="flex items-center gap-3">
                                        <BarChart2 className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Rating</p>
                                            <div className="flex items-center">
                                               <StarRating rating={product.rating} />
                                               <span className="ml-2 text-sm font-medium">{product.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </div>
                                     <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Date Added</p>
                                            <p className="font-medium">{new Date(product.dateAdded).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Descriptions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-1">Short Description</h4>
                                        <p className="text-sm text-muted-foreground">{product.description}</p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h4 className="font-semibold mb-1">Long Description</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{product.longDescription}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="activities" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Purchase History</CardTitle>
                            <CardDescription>
                                 {purchaseHistory.length > 0
                                    ? `This product has been purchased ${purchaseHistory.length} time(s).`
                                    : 'This product has not been purchased yet.'
                                }
                            </CardDescription>
                        </CardHeader>
                        {purchaseHistory.length > 0 && (
                             <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Quantity</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {purchaseHistory.map(purchase => (
                                            <TableRow key={purchase.orderId}>
                                                <TableCell>
                                                    <Link href={`/admin/users/${purchase.customer.id}`} className="flex items-center gap-3 group">
                                                        <Avatar>
                                                            <AvatarImage src={purchase.customer.avatar} alt={purchase.customer.name} />
                                                            <AvatarFallback>{purchase.customer.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium group-hover:underline">{purchase.customer.name}</p>
                                                            <p className="text-sm text-muted-foreground group-hover:underline">{purchase.customer.email}</p>
                                                        </div>
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Link href={`/admin/orders/${purchase.orderId}`} className="text-primary hover:underline">
                                                        {purchase.orderId}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">{purchase.quantity}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        )}
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle>Customer Reviews</CardTitle>
                            <CardDescription>
                                {product.reviews.length > 0
                                    ? `A summary of ${product.reviews.length} reviews.`
                                    : 'No customer reviews for this product yet.'
                                }
                            </CardDescription>
                        </CardHeader>
                        {product.reviews.length > 0 && (
                            <CardContent className="space-y-4">
                                {product.reviews.map(review => (
                                    <div key={review.id} className="border p-4 rounded-md">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="font-semibold">{review.author}</p>
                                            <StarRating rating={review.rating} />
                                        </div>
                                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                                        <p className="text-xs text-muted-foreground mt-2">{new Date(review.date).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </CardContent>
                        )}
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
