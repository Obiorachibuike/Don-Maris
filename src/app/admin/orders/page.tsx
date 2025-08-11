
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
import { dummyOrders } from "@/lib/dummy-orders";
import type { Order } from "@/lib/types";

// Flatten order data for the main table view
const allOrdersData = dummyOrders.map(order => ({
    id: order.id,
    customer: order.customer.name,
    amount: order.amount,
    status: order.status,
    date: order.date,
}));

type DisplayOrder = typeof allOrdersData[0];

export default function OrdersPage() {
    
    const [orders, setOrders] = useState<DisplayOrder[]>(allOrdersData);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<DisplayOrder | null>(null);
    const [newStatus, setNewStatus] = useState<Order['status'] | ''>('');
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;

    const handleUpdateStatus = (order: DisplayOrder) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
    };

    const handleConfirmUpdate = () => {
        if (selectedOrder && newStatus) {
            setOrders(currentOrders =>
                currentOrders.map(o => 
                    o.id === selectedOrder.id ? { ...o, status: newStatus as Order['status'] } : o
                )
            );
            // In a real app, you'd also update the master dummyOrders array or call an API
            const orderInMaster = dummyOrders.find(o => o.id === selectedOrder.id);
            if(orderInMaster) {
                orderInMaster.status = newStatus as Order['status'];
            }

            setSelectedOrder(null);
            setNewStatus('');
        }
    };

    const filteredOrders = orders.filter(order => 
        String(order.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}</TableCell>
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
                                                    <Link href={`/admin/orders/${order.id}`}>View Order Details</Link>
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
                            Select the new status for order #{selectedOrder?.id}.
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
