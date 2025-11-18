
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Order, OrderPaymentStatus } from '@/lib/types';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Loader2, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/contexts/SessionProvider';
import axios from 'axios';
import { UpdatePaymentDialog } from '@/components/update-payment-dialog';

type SortKey = keyof Order | 'balance';

export default function AccountantPage() {
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: SortKey | null; direction: 'ascending' | 'descending' | null }>({ key: 'date', direction: 'descending' });
    const ordersPerPage = 10;
    const { toast } = useToast();
    const { user } = useSession();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/orders');
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const data = await response.json();
            setAllOrders(data);
        } catch (error) {
            console.error("Could not fetch orders:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not load orders. Please try again later.'
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchOrders();
    }, [toast]);


    const filteredOrders = useMemo(() => allOrders.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.paymentStatus.toLowerCase().includes(searchTerm.toLowerCase())
    ), [allOrders, searchTerm]);

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
                let aValue: any, bValue: any;

                if (sortConfig.key === 'balance') {
                    aValue = a.amount - a.amountPaid;
                    bValue = b.amount - b.amountPaid;
                } else if (sortConfig.key === 'paymentStatus') {
                    const order = ['Paid', 'Incomplete', 'Not Paid'];
                    aValue = order.indexOf(a.paymentStatus);
                    bValue = order.indexOf(b.paymentStatus);
                } else {
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
    
    const handleUpdateOrder = async () => {
        // This function will be called by the dialog to refetch data
        await fetchOrders();
    }


    const SortableHeader = ({ sortKey, label, className }: { sortKey: SortKey, label: string, className?: string }) => (
        <TableHead className={className}>
            <Button variant="ghost" onClick={() => requestSort(sortKey)} className="px-0">
                {label}
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </TableHead>
    );
    
    return (
        <>
        <div className="w-full">
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle>Accountant Dashboard</CardTitle>
                            <CardDescription>
                                Manage and update order payment statuses.
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
                                    <SortableHeader sortKey="date" label="Date" />
                                    <SortableHeader sortKey="amount" label="Total" className="text-right" />
                                    <SortableHeader sortKey="amountPaid" label="Paid" className="text-right" />
                                    <SortableHeader sortKey="balance" label="Balance" className="text-right" />
                                    <SortableHeader sortKey="paymentStatus" label="Payment Status" />
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                        </TableCell>
                                    </TableRow>
                                ) : currentOrders.length > 0 ? (
                                    currentOrders.map((order) => {
                                        const balance = order.amount - order.amountPaid;
                                        return (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">
                                                <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline">
                                                    {order.id}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{order.customer.name}</TableCell>
                                            <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">₦{order.amount.toLocaleString()}</TableCell>
                                            <TableCell className="text-right text-green-600">₦{order.amountPaid.toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-medium text-destructive">₦{balance.toLocaleString()}</TableCell>
                                            <TableCell>
                                                 <Badge variant={
                                                    order.paymentStatus === 'Paid' ? 'default' :
                                                    order.paymentStatus === 'Not Paid' ? 'destructive' :
                                                    'secondary'
                                                } className={order.paymentStatus === 'Incomplete' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20' : ''}>
                                                    {order.paymentStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                                    Update Payment
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                            No orders found.
                                        </TableCell>
                                    </TableRow>
                                )}
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
        {selectedOrder && user && (
            <UpdatePaymentDialog 
                isOpen={!!selectedOrder}
                setIsOpen={() => setSelectedOrder(null)}
                order={selectedOrder}
                onOrderUpdate={handleUpdateOrder}
                currentUser={user}
            />
        )}
        </>
    );
}
