
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { dummyOrders } from '@/lib/dummy-orders';
import type { Order } from '@/lib/types';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { useSession } from '@/contexts/SessionProvider';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function OrdersPlaced() {
    const { user, isLoading: isUserLoading } = useSession();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const ordersPerPage = 10;
    
    useEffect(() => {
        const fetchOrders = async () => {
            if (!user?._id) return;

            setIsLoading(true);
            try {
                const response = await fetch(`/api/orders?createdBy=${user._id}`);
                if (!response.ok) throw new Error('Failed to fetch orders');
                let data: Order[] = await response.json();
                setOrders(data);
            } catch (error) {
                console.error("Could not fetch orders:", error);
                setOrders([]);
            } finally {
                setIsLoading(false);
            }
        };
        
        if (!isUserLoading) {
            fetchOrders();
        }

    }, [user, isUserLoading]);

    const filteredOrders = useMemo(() => {
        let filtered = orders;

        if (searchTerm) {
            filtered = filtered.filter(order => 
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.deliveryMethod && order.deliveryMethod.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (dateRange?.from) {
             filtered = filtered.filter(order => new Date(order.date) >= dateRange.from!);
        }
        if (dateRange?.to) {
            // Include the whole day of 'to'
            const toDate = new Date(dateRange.to);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(order => new Date(order.date) <= toDate);
        }

        return filtered;
    }, [orders, searchTerm, dateRange]);


    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    return (
        <div className="w-full">
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle>My Placed Orders</CardTitle>
                            <CardDescription>
                                A list of all orders you have created.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
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
                                    <TableHead>Invoice ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Delivery Method</TableHead>
                                    <TableHead>Fulfillment</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead className="text-right">Total Amount</TableHead>
                                    <TableHead className="text-right">Amount Paid</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
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
                                            <Badge variant={order.status === 'Fulfilled' ? 'default' : order.status === 'Processing' ? 'secondary' : 'destructive'} className={order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20' : ''}>{order.status}</Badge>
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
                            Showing {Math.min(indexOfFirstOrder + 1, filteredOrders.length)} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders.
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
