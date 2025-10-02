
'use client';

import { useParams, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, User, ShoppingBag } from 'lucide-react';
import { getUserById, getOrdersByUserId } from '@/lib/dummy-users';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

export default function UserDetailsPage() {
    const params = useParams();
    const userId = params.id as string;
    const user = getUserById(userId);
    const userOrders = user && user.role === 'customer' ? getOrdersByUserId(userId) : [];

    if (!user) {
        notFound();
    }
    
    const totalSpent = userOrders.reduce((acc, order) => acc + order.amount, 0);
    const isCustomer = user.role === 'customer';

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="w-20 h-20 border">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-3xl">{user.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                                <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                                <span>-</span>
                                <span className="text-sm">ID: {user.id}</span>
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <p>{user.email}</p>
                        </div>
                         <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <p>Joined on {new Date(user.dateJoined).toLocaleDateString()}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            {isCustomer && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{userOrders.length}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Order History</CardTitle>
                        <CardDescription>
                            {userOrders.length > 0
                                ? `This user has placed ${userOrders.length} order(s).`
                                : 'This user has not placed any orders yet.'
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
                                                <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline">
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
                                            <TableCell className="text-right">${order.amount.toFixed(2)}</TableCell>
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
