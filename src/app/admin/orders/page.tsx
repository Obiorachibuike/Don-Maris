
'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type Order = {
    invoiceId: string;
    customer: string;
    amount: number;
    status: 'Fulfilled' | 'Processing' | 'Pending' | 'Cancelled';
    date: string;
}

const allOrdersData: Order[] = [
    { invoiceId: '123456', customer: 'Olivia Martin', amount: 250.00, status: 'Fulfilled', date: '2023-11-23' },
    { invoiceId: '123457', customer: 'Jackson Lee', amount: 150.75, status: 'Processing', date: '2023-11-23' },
    { invoiceId: '123458', customer: 'Isabella Nguyen', amount: 350.00, status: 'Fulfilled', date: '2023-11-22' },
    { invoiceId: '123459', customer: 'William Kim', amount: 45.50, status: 'Pending', date: '2023-11-22' },
    { invoiceId: '123460', customer: 'Sophia Davis', amount: 550.20, status: 'Fulfilled', date: '2023-11-21' },
    { invoiceId: '123461', customer: 'Liam Garcia', amount: 89.99, status: 'Processing', date: '2023-11-21' },
    { invoiceId: '123462', customer: 'Ava Rodriguez', amount: 120.00, status: 'Cancelled', date: '2023-11-20' },
    { invoiceId: '123463', customer: 'Noah Martinez', amount: 75.00, status: 'Fulfilled', date: '2023-11-20' },
    { invoiceId: '123464', customer: 'Emma Brown', amount: 300.00, status: 'Fulfilled', date: '2023-11-19' },
    { invoiceId: '123465', customer: 'James Wilson', amount: 99.50, status: 'Processing', date: '2023-11-19' },
    { invoiceId: '123466', customer: 'Charlotte Jones', amount: 180.00, status: 'Fulfilled', date: '2023-11-18' },
    { invoiceId: '123467', customer: 'Benjamin Taylor', amount: 25.00, status: 'Pending', date: '2023-11-18' },
    { invoiceId: '123468', customer: 'Amelia Miller', amount: 600.00, status: 'Cancelled', date: '2023-11-17' },
    { invoiceId: '123469', customer: 'Elijah Anderson', amount: 420.00, status: 'Fulfilled', date: '2023-11-17' },
    { invoiceId: '123470', customer: 'Mia Thomas', amount: 110.25, status: 'Processing', date: '2023-11-16' },
    { invoiceId: '123471', customer: 'Lucas Hernandez', amount: 70.00, status: 'Fulfilled', date: '2023-11-16' },
    { invoiceId: '123472', customer: 'Harper Moore', amount: 85.00, status: 'Pending', date: '2023-11-15' },
    { invoiceId: '123473', customer: 'Henry White', amount: 199.99, status: 'Fulfilled', date: '2023-11-15' },
    { invoiceId: '123474', customer: 'Evelyn Harris', amount: 325.50, status: 'Processing', date: '2023-11-14' },
    { invoiceId: '123475', customer: 'Alexander Clark', amount: 50.00, status: 'Fulfilled', date: '2023-11-14' },
    { invoiceId: '123476', customer: 'Abigail Lewis', amount: 400.00, status: 'Cancelled', date: '2023-11-13' },
    { invoiceId: '123477', customer: 'Daniel Robinson', amount: 135.00, status: 'Fulfilled', date: '2023-11-13' },
    { invoiceId: '123478', customer: 'Madison Walker', amount: 275.00, status: 'Processing', date: '2023-11-12' },
    { invoiceId: '123479', customer: 'Matthew Perez', amount: 95.80, status: 'Fulfilled', date: '2023-11-12' },
    { invoiceId: '123480', customer: 'Chloe Hall', amount: 65.00, status: 'Pending', date: '2023-11-11' },
];

export default function OrdersPage() {
    
    const [orders, setOrders] = useState<Order[]>(allOrdersData);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [newStatus, setNewStatus] = useState<Order['status'] | ''>('');
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 20;

    const handleUpdateStatus = (order: Order) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
    };

    const handleConfirmUpdate = () => {
        if (selectedOrder && newStatus) {
            setOrders(currentOrders =>
                currentOrders.map(o => 
                    o.invoiceId === selectedOrder.invoiceId ? { ...o, status: newStatus as Order['status'] } : o
                )
            );
            setSelectedOrder(null);
            setNewStatus('');
        }
    };

    const filteredOrders = orders.filter(order => 
        String(order.invoiceId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Manage Orders</CardTitle>
                            <CardDescription>View, search, and manage all customer orders.</CardDescription>
                        </div>
                        <Input 
                            placeholder="Search orders..." 
                            className="w-full max-w-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentOrders.map(order => (
                                <TableRow key={order.invoiceId}>
                                    <TableCell className="font-medium">{order.invoiceId}</TableCell>
                                    <TableCell>{order.customer}</TableCell>
                                    <TableCell>${order.amount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            order.status === 'Fulfilled' ? 'default' :
                                            order.status === 'Processing' ? 'secondary' :
                                            'destructive'
                                        } className={order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20' : order.status === 'Cancelled' ? 'bg-gray-500/20 text-gray-700 border-gray-500/20' : ''}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{order.date}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/orders/${order.invoiceId}`}>View Order Details</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => handleUpdateStatus(order)}>
                                                    Update Status
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-500">Cancel Order</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                     <div className="flex items-center justify-between w-full">
                        <div className="text-sm text-muted-foreground">
                            Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders.
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
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardFooter>
            </Card>

            <AlertDialog open={!!selectedOrder} onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Update Order Status</AlertDialogTitle>
                        <AlertDialogDescription>
                            Select the new status for order #{selectedOrder?.invoiceId}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <RadioGroup value={newStatus} onValueChange={(value) => setNewStatus(value as Order['status'])}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Pending" id="r-pending" />
                            <Label htmlFor="r-pending">Pending</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Processing" id="r-processing" />
                            <Label htmlFor="r-processing">Processing</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Fulfilled" id="r-fulfilled" />
                            <Label htmlFor="r-fulfilled">Fulfilled</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Cancelled" id="r-cancelled" />
                            <Label htmlFor="r-cancelled">Cancelled</Label>
                        </div>
                    </RadioGroup>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedOrder(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmUpdate}>Update</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
