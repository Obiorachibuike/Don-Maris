
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { dummyOrders } from '@/lib/dummy-orders';
import type { Order, OrderPaymentStatus } from '@/lib/types';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowUpDown, Loader2 } from 'lucide-react';

type SortKey = keyof Order | 'balance';

export function OrdersPlaced() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: SortKey | null; direction: 'ascending' | 'descending' | null }>({ key: 'date', direction: 'descending' });
    const ordersPerPage = 10;
    
    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/orders');
                if (!response.ok) throw new Error('Failed to fetch');
                let data: Order[] = await response.json();
                // Filter for supply department relevant orders
                data = data.filter(order => order.status === 'Processing' || order.status === 'Pending');
                setOrders(data);
            } catch (error) {
                console.error("Could not fetch orders:", error);
                // Fallback for UI demo
                setOrders(dummyOrders.filter(order => order.status === 'Processing' || order.status === 'Pending'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => orders.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.deliveryMethod && order.deliveryMethod.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [orders, searchTerm]);

    const requestSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' | null = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
            direction = null;
            key = null;
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const sortedOrders = useMemo(() => {
        let sortableItems = [...filteredOrders];
        if (sortConfig.key && sortConfig.direction) {
            sortableItems.sort((a, b) => {
                let aValue, bValue;

                if (sortConfig.key === 'balance') {
                    aValue = a.amount - a.amountPaid;
                    bValue = b.amount - b.amountPaid;
                } else if (sortConfig.key === 'paymentStatus') {
                    const orderMap = ['Paid', 'Incomplete', 'Not Paid'];
                    aValue = orderMap.indexOf(a.paymentStatus);
                    bValue = orderMap.indexOf(b.paymentStatus);
                }
                else {
                    aValue = a[sortConfig.key!];
                    bValue = b[sortConfig.key!];
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredOrders, sortConfig]);

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const SortableHeader = ({ sortKey, label, className }: { sortKey: SortKey, label: string, className?: string }) => (
        <TableHead className={className}>
            <Button variant="ghost" onClick={() => requestSort(sortKey)} className="px-0">
                {label}
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </TableHead>
    );

    return (
        <div className="w-full">
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle>Orders Placed</CardTitle>
                            <CardDescription>
                                A list of all orders that have been created and are awaiting fulfillment.
                            </CardDescription>
                        </div>
                        <Input 
                            placeholder="Search orders..." 
                            className="w-full md:max-w-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="w-full overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <SortableHeader sortKey="id" label="Invoice ID" />
                                    <TableHead>Customer</TableHead>
                                    <SortableHeader sortKey="deliveryMethod" label="Delivery Method" />
                                    <SortableHeader sortKey="status" label="Fulfillment" />
                                    <SortableHeader sortKey="paymentStatus" label="Payment" />
                                    <SortableHeader sortKey="amount" label="Total Amount" className="text-right" />
                                    <SortableHeader sortKey="amountPaid" label="Amount Paid" className="text-right" />
                                    <SortableHeader sortKey="balance" label="Balance" className="text-right" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                        </TableCell>
                                    </TableRow>
                                ) : currentOrders.map((order) => {
                                    const balance = order.amount - order.amountPaid;
                                    return (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">
                                            <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline">
                                                {order.id}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{order.customer.name}</TableCell>
                                        <TableCell>{order.deliveryMethod}</TableCell>
                                        <TableCell>
                                            <Badge variant={order.status === 'Processing' ? 'secondary' : 'destructive'} className={order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20' : ''}>{order.status}</Badge>
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
                                        <TableCell className="text-right">₦{order.amount.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">₦{order.amountPaid.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-medium text-destructive">₦{balance.toLocaleString()}</TableCell>
                                    </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {Math.min(indexOfFirstOrder + 1, sortedOrders.length)} to {Math.min(indexOfLastOrder, sortedOrders.length)} of {sortedOrders.length} orders.
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages > 0 ? totalPages : 1}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
