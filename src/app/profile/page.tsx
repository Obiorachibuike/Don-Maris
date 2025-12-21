'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import { useSession } from '@/contexts/SessionProvider';
import { useOrderStore } from '@/store/order-store';
import type { Order } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditProfileForm } from '@/components/edit-profile-form';

import { Mail, Calendar, ShoppingBag, DollarSign, Wallet, Loader2, CreditCard, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
    const router = useRouter();
    const { toast } = useToast();

    const session = useSession();
    const user = session?.user ?? null;
    const isLoading = session?.isLoading ?? true;
    const refetchUser = session?.refetchUser;

    const orderStore = useOrderStore();
    const allOrders: Order[] = orderStore?.orders ?? [];
    const areOrdersLoading = orderStore?.isLoading ?? true;

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPaying, setIsPaying] = useState<string | null>(null);

    /* -------------------- AUTH REDIRECT (SAFE) -------------------- */
    useEffect(() => {
        if (isLoading === false && user === null) {
            router.replace('/login');
        }
    }, [user, isLoading, router]);

    /* -------------------- FILTER USER ORDERS (SAFE) -------------------- */
    const userOrders = useMemo(() => {
        if (user?.role === 'customer' && Array.isArray(allOrders)) {
            return allOrders.filter(order => order.customer?._id === user._id);
        }
        return [];
    }, [user, allOrders]);

    /* -------------------- PAYMENT HANDLER -------------------- */
    const handlePayNow = async (order: Order) => {
        if (!user) return;

        setIsPaying(order.id);

        const amountToPay = (order.amount ?? 0) - (order.amountPaid ?? 0);

        try {
            const res = await axios.post('/api/checkout', {
                userId: user._id,
                amount: amountToPay,
                orderId: order.id,
            });

            if (res.data?.checkoutUrl) {
                window.location.href = res.data.checkoutUrl;
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Payment Error',
                    description: res.data?.error || 'Unable to initialize payment',
                });
                setIsPaying(null);
            }
        } catch {
            toast({
                variant: 'destructive',
                title: 'Payment Error',
                description: 'Could not initialize payment. Please try again.',
            });
            setIsPaying(null);
        }
    };

    /* -------------------- LOADING STATE -------------------- */
    if (isLoading || areOrdersLoading || !user) {
        return (
            <div className="container mx-auto flex min-h-[80vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    /* -------------------- DERIVED VALUES -------------------- */
    const totalSpent = userOrders.reduce((acc, order) => acc + (order.amountPaid ?? 0), 0);
    const outstandingOrders = userOrders.filter(order => order.paymentStatus !== 'Paid');
    const isCustomer = user.role === 'customer';

    /* -------------------- ORDER TABLE -------------------- */
    const renderOrderTable = (orders: Order[]) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map(order => (
                    <TableRow key={order.id}>
                        <TableCell>
                            <Link href={`/orders/${order.id}`} className="font-medium text-primary hover:underline">
                                {order.id}
                            </Link>
                        </TableCell>
                        <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                            <Badge variant={order.status === 'Fulfilled' ? 'default' : order.status === 'Processing' ? 'secondary' : 'destructive'}>
                                {order.status}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant={order.paymentStatus === 'Paid' ? 'default' : order.paymentStatus === 'Not Paid' ? 'destructive' : 'secondary'}>
                                {order.paymentStatus}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">₦{(order.amount ?? 0).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                            {order.paymentStatus !== 'Paid' ? (
                                <Button size="sm" onClick={() => handlePayNow(order)} disabled={isPaying === order.id}>
                                    {isPaying === order.id ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <CreditCard className="mr-2 h-4 w-4" />
                                    )}
                                    Pay Now
                                </Button>
                            ) : (
                                <span className="text-sm text-muted-foreground">Paid</span>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    /* -------------------- RENDER -------------------- */
    return (
        <>
            <div className="container mx-auto space-y-6 px-4 py-12">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col items-center gap-4 sm:flex-row">
                            <div className="relative group">
                                <Avatar className="h-24 w-24 border-2 border-primary">
                                    <AvatarImage src={user.avatar || ''} />
                                    <AvatarFallback className="text-3xl">{user.name?.charAt(0) ?? '?'}</AvatarFallback>
                                </Avatar>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                                    onClick={() => setIsEditModalOpen(true)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </div>

                            <div>
                                <CardTitle className="text-3xl">{user.name}</CardTitle>
                                <CardDescription className="mt-1">
                                    <Badge variant="secondary" className="capitalize">
                                        {user.role}
                                    </Badge>
                                </CardDescription>
                            </div>

                            <Button variant="outline" className="sm:ml-auto" onClick={() => setIsEditModalOpen(true)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Profile
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="grid gap-4 text-muted-foreground md:grid-cols-2">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5" />
                                <a href={`mailto:${user.email}`} className="hover:text-primary">
                                    {user.email}
                                </a>
                            </div>

                            {user.dateJoined && (
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5" />
                                    Joined on {new Date(user.dateJoined).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {isCustomer && (
                    <>
                        <div className="grid gap-6 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm">Total Spent</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent className="text-2xl font-bold">₦{totalSpent.toFixed(2)}</CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm">Total Orders</CardTitle>
                                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent className="text-2xl font-bold">{userOrders.length}</CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm">Account Balance</CardTitle>
                                    <Wallet className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent className="text-2xl font-bold">
                                    ₦{(user.ledgerBalance ?? 0).toFixed(2)}
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <Tabs defaultValue="all">
                                <CardHeader className="flex justify-between">
                                    <div>
                                        <CardTitle>My Order History</CardTitle>
                                        <CardDescription>View and manage your past orders</CardDescription>
                                    </div>
                                    <TabsList>
                                        <TabsTrigger value="all">All ({userOrders.length})</TabsTrigger>
                                        <TabsTrigger value="outstanding">Outstanding ({outstandingOrders.length})</TabsTrigger>
                                    </TabsList>
                                </CardHeader>

                                <CardContent>
                                    <TabsContent value="all">
                                        {userOrders.length ? renderOrderTable(userOrders) : <p className="py-8 text-center text-muted-foreground">No orders yet.</p>}
                                    </TabsContent>
                                    <TabsContent value="outstanding">
                                        {outstandingOrders.length ? renderOrderTable(outstandingOrders) : <p className="py-8 text-center text-muted-foreground">No outstanding balances.</p>}
                                    </TabsContent>
                                </CardContent>
                            </Tabs>
                        </Card>
                    </>
                )}
            </div>

            <EditProfileForm
                isOpen={isEditModalOpen}
                setIsOpen={setIsEditModalOpen}
                user={user}
                onProfileUpdate={refetchUser}
            />
        </>
    );
}