
'use client';

import { useSession } from '@/contexts/SessionProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, ShoppingBag, DollarSign, Wallet, Loader2, CreditCard, Pencil } from 'lucide-react';
import { getOrdersByUserId } from '@/lib/dummy-users';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import type { Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { EditUserProfileForm } from '@/components/edit-user-profile-form';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
<<<<<<< HEAD
=======
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditProfileForm } from '@/components/edit-profile-form';
>>>>>>> b29b8b0 (And I want a pen icon in the user's profile page tho edit  the user's de)

export default function ProfilePage() {
    const { user, isLoading, refetchUser } = useSession();
    const [userOrders, setUserOrders] = useState<Order[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPaying, setIsPaying] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const displayUser = user;

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
        if (displayUser && displayUser.role === 'customer') {
            setUserOrders(getOrdersByUserId(displayUser.id));
        }
    }, [displayUser, isLoading, user, router]);

    const handlePayNow = async (order: Order) => {
        if (!user) return;
        setIsPaying(order.id);

        const amountToPay = order.amount - order.amountPaid;

        try {
            const res = await axios.post("/api/checkout", {
                userId: user._id,
                amount: amountToPay,
                orderId: order.id
            });

            const data = res.data;
            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            } else {
                toast({ variant: 'destructive', title: 'Error', description: data.error || "Error initializing payment" });
                setIsPaying(null);
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: "Could not initialize payment. Please try again." });
            setIsPaying(null);
        }
    };
    
    if (isLoading || !displayUser) {
        return (
            <div className="container mx-auto flex min-h-[80vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    const totalSpent = userOrders.reduce((acc, order) => acc + order.amountPaid, 0);
    const isCustomer = displayUser.role === 'customer';

    return (
        <>
            <div className="container mx-auto px-4 py-12 space-y-6">
                <Card>
                    <CardHeader>
<<<<<<< HEAD
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="w-24 h-24 border-2 border-primary">
                                    <AvatarImage src={displayUser.avatar} alt={displayUser.name} />
                                    <AvatarFallback className="text-3xl">{displayUser.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-3xl font-headline">{displayUser.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="capitalize text-sm">{displayUser.role}</Badge>
                                    </CardDescription>
                                </div>
                            </div>
                            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5" />
                                <a href={`mailto:${displayUser.email}`} className="hover:text-primary transition-colors">{displayUser.email}</a>
                            </div>
                            {displayUser.dateJoined && (
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5" />
                                    <p>Joined on {new Date(displayUser.dateJoined).toLocaleDateString()}</p>
                                </div>
                            )}
=======
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="relative group">
                                <Avatar className="w-24 h-24 border-2 border-primary">
                                    <AvatarImage src={(displayUser as any).avatar} alt={displayUser.name} />
                                    <AvatarFallback className="text-3xl">{displayUser.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setIsEditModalOpen(true)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </div>
                            <div>
                                <CardTitle className="text-3xl font-headline">{displayUser.name}</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="capitalize text-sm">{displayUser.role}</Badge>
                                </CardDescription>
                            </div>
                            <Button variant="outline" className="sm:ml-auto" onClick={() => setIsEditModalOpen(true)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5" />
                                <a href={`mailto:${displayUser.email}`} className="hover:text-primary transition-colors">{displayUser.email}</a>
                            </div>
                             {(displayUser as any).dateJoined && (
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5" />
                                    <p>Joined on {new Date((displayUser as any).dateJoined).toLocaleDateString()}</p>
                                </div>
                             )}
>>>>>>> b29b8b0 (And I want a pen icon in the user's profile page tho edit  the user's de)
                        </div>
                    </CardContent>
                </Card>
                
                {isCustomer && (
<<<<<<< HEAD
                <>
=======
                  <>
>>>>>>> b29b8b0 (And I want a pen icon in the user's profile page tho edit  the user's de)
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₦{totalSpent.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userOrders.length}</div>
                            </CardContent>
                        </Card>
<<<<<<< HEAD
                        <Card>
=======
                         <Card>
>>>>>>> b29b8b0 (And I want a pen icon in the user's profile page tho edit  the user's de)
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
                                <Wallet className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${displayUser.ledgerBalance && displayUser.ledgerBalance > 0 ? 'text-destructive' : ''}`}>
                                    ₦{displayUser.ledgerBalance?.toFixed(2) || '0.00'}
                                </div>
<<<<<<< HEAD
=======
                                 <p className="text-xs text-muted-foreground">Total outstanding on all orders</p>
>>>>>>> b29b8b0 (And I want a pen icon in the user's profile page tho edit  the user's de)
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
<<<<<<< HEAD
                        <CardHeader>
                            <CardTitle>My Order History</CardTitle>
                            <CardDescription>
                                {userOrders.length > 0
                                    ? `You have placed ${userOrders.length} order(s).`
                                    : "You haven't placed any orders yet."
                                }
                            </CardDescription>
                        </CardHeader>
                        {userOrders.length > 0 && (
                            <CardContent>
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
                                        {userOrders.map(order => (
                                            <TableRow key={order.id}>
                                                <TableCell>
                                                    <Link href={`/orders/${order.id}`} className="text-primary hover:underline font-medium">
                                                        {order.id}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        order.status === 'Fulfilled' ? 'default' :
                                                        order.status === 'Processing' ? 'secondary' :
                                                        'destructive'
                                                    } className={order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20' : order.status === 'Cancelled' ? 'bg-gray-500/20 text-gray-700 border-gray-500/20' : ''}>
                                                        {order.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        order.paymentStatus === 'Paid' ? 'default' :
                                                        order.paymentStatus === 'Not Paid' ? 'destructive' :
                                                        'secondary'
                                                    } className={order.paymentStatus === 'Incomplete' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20' : ''}>
                                                        {order.paymentStatus}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">₦{order.amount.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">
                                                    {order.paymentStatus !== 'Paid' ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handlePayNow(order)}
                                                            disabled={isPaying === order.id}
                                                        >
                                                            {isPaying === order.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
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
                            </CardContent>
                        )}
                    </Card>
                </>
                )}
            </div>
            {displayUser && (
                <EditUserProfileForm 
                    isOpen={isEditModalOpen}
                    setIsOpen={setIsEditModalOpen}
                    user={displayUser}
                    onUserUpdate={refetchUser}
=======
                         <Tabs defaultValue="all">
                            <CardHeader>
                                 <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>My Order History</CardTitle>
                                        <CardDescription>
                                            View and manage your past orders.
                                        </CardDescription>
                                    </div>
                                     <TabsList>
                                        <TabsTrigger value="all">All Orders ({userOrders.length})</TabsTrigger>
                                        <TabsTrigger value="outstanding">Outstanding Balances ({outstandingOrders.length})</TabsTrigger>
                                    </TabsList>
                                 </div>
                            </CardHeader>
                            <CardContent>
                                 <TabsContent value="all">
                                    {userOrders.length > 0 ? (
                                        renderOrderTable(userOrders)
                                    ) : (
                                        <p className="text-muted-foreground text-center py-8">You haven't placed any orders yet.</p>
                                    )}
                                </TabsContent>
                                 <TabsContent value="outstanding">
                                     {outstandingOrders.length > 0 ? (
                                        renderOrderTable(outstandingOrders)
                                    ) : (
                                        <p className="text-muted-foreground text-center py-8">You have no orders with an outstanding balance.</p>
                                    )}
                                </TabsContent>
                            </CardContent>
                         </Tabs>
                    </Card>
                  </>
                )}
            </div>
            {user && (
                <EditProfileForm
                    isOpen={isEditModalOpen}
                    setIsOpen={setIsEditModalOpen}
                    user={user}
                    onProfileUpdate={refetchUser}
>>>>>>> b29b8b0 (And I want a pen icon in the user's profile page tho edit  the user's de)
                />
            )}
        </>
    );
}
