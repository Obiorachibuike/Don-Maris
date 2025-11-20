
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Order, OrderPaymentStatus } from '@/lib/types';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Loader2, ArrowUpDown, Calendar as CalendarIcon, MoreHorizontal, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/contexts/SessionProvider';
import { UpdatePaymentDialog } from '@/components/update-payment-dialog';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import axios from 'axios';

type SortKey = keyof Order | 'balance';

export function OrdersTable() {
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: SortKey | null; direction: 'ascending' | 'descending' | null }>({ key: 'date', direction: 'descending' });
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const ordersPerPage = 10;
    const { toast } = useToast();
    const { user } = useSession();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

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
    }, []);

    const handleOpenUpdateModal = (order: Order) => {
        setSelectedOrder(order);
        setIsUpdateModalOpen(true);
    };

    const handleDeleteOrder = (order: Order) => {
        setOrderToDelete(order);
    };

    const confirmDeleteOrder = async () => {
        if (!orderToDelete) return;
        try {
            await axios.delete(`/api/orders/${orderToDelete.id}`);
            toast({ title: 'Order Deleted', description: `Order #${orderToDelete.id} has been deleted.` });
            setAllOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
            setOrderToDelete(null);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete order.' });
        }
    }

    const filteredOrders = useMemo(() => {
        let filtered = allOrders;
        
        if(searchTerm) {
            filtered = filtered.filter(order => 
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.paymentStatus.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (dateRange?.from) {
            filtered = filtered.filter(order => new Date(order.date) >= dateRange.from!);
        }
        if (dateRange?.to) {
            const toDate = new Date(dateRange.to);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(order => new Date(order.date) <= toDate);
        }

        return filtered;
    }, [allOrders, searchTerm, dateRange]);

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
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <CardTitle>Manage Orders</CardTitle>
                        <CardDescription>
                            Review, search, and update order payment statuses.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                            <Input 
                            placeholder="Search orders..." 
                            className="w-full md:max-w-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                "w-[300px] justify-start text-left font-normal",
                                !dateRange && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                    {format(dateRange.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(dateRange.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Pick a date range</span>
                                )}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
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
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => handleOpenUpdateModal(order)}>
                                                        Update Payment
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive" onSelect={() => handleDeleteOrder(order)}>
                                                        <Trash2 className="mr-2 h-4 w-4"/> Delete Order
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                    )
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                        No orders found for the selected criteria.
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
        
        {selectedOrder && user && (
            <UpdatePaymentDialog 
                isOpen={isUpdateModalOpen}
                setIsOpen={setIsUpdateModalOpen}
                order={selectedOrder}
                onOrderUpdate={handleUpdateOrder}
                currentUser={user}
            />
        )}
        
        <AlertDialog open={!!orderToDelete} onOpenChange={(isOpen) => !isOpen && setOrderToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Order #{orderToDelete?.id}?</AlertDialogTitle>
                    <AlertDialogDescription>
                       This action is irreversible. It will permanently delete the order and may affect customer ledger balances.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDeleteOrder} className="bg-destructive hover:bg-destructive/90">
                        Yes, delete order
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}
