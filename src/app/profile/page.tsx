

'use client';

import { useSession } from '@/contexts/SessionProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, ShoppingBag, DollarSign, Wallet, Loader2 } from 'lucide-react';
import { getOrdersByUserId } from '@/lib/dummy-users';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Order } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user, isLoading } = useSession();
    const [userOrders, setUserOrders] = useState<Order[]>([]);

    const mockUser = {
        id: 'CUST_MOCK',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
        dateJoined: new Date().toISOString(),
        avatar: 'https://placehold.co/100x100.png',
        ledgerBalance: 42.50,
    };
    
    const displayUser = user || mockUser;

    useEffect(() => {
        if (displayUser && displayUser.role === 'customer') {
            setUserOrders(getOrdersByUserId(displayUser.id));
        }
    }, [displayUser]);

    if (isLoading && !user) {
        return (
            <div className="container mx-auto flex min-h-[80vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    const totalSpent = userOrders.reduce((acc, order) => acc + order.amount, 0);
    const isCustomer = displayUser.role === 'customer';

    return (
        <div className="container mx-auto px-4 py-12 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Avatar className="w-24 h-24 border-2 border-primary">
                            <AvatarImage src={(displayUser as any).avatar} alt={displayUser.name} />
                            <AvatarFallback className="text-3xl">{displayUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-3xl font-headline">{displayUser.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="capitalize text-sm">{displayUser.role}</Badge>
                            </CardDescription>
                        </div>
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
                    </div>
                </CardContent>
            </Card>
            
            {isCustomer && (
              <>
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
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${displayUser.ledgerBalance && displayUser.ledgerBalance > 0 ? 'text-destructive' : ''}`}>
                                ₦{displayUser.ledgerBalance?.toFixed(2) || '0.00'}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
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
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {userOrders.map(order => (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                <Link href={`/invoice?orderId=${order.id}`} className="text-primary hover:underline font-medium">
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
                                            <TableCell className="text-right">₦{order.amount.toFixed(2)}</TableCell>
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
    );
}
