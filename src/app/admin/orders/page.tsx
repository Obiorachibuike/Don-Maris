
'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { MoreHorizontal } from "lucide-react";

export default function OrdersPage() {
    
    const allOrders = [
        { invoiceId: '123456', customer: 'Olivia Martin', amount: 250.00, status: 'Fulfilled', date: '2023-11-23' },
        { invoiceId: '123457', customer: 'Jackson Lee', amount: 150.75, status: 'Processing', date: '2023-11-23' },
        { invoiceId: '123458', customer: 'Isabella Nguyen', amount: 350.00, status: 'Fulfilled', date: '2023-11-22' },
        { invoiceId: '123459', customer: 'William Kim', amount: 45.50, status: 'Pending', date: '2023-11-22' },
        { invoiceId: '123460', customer: 'Sophia Davis', amount: 550.20, status: 'Fulfilled', date: '2023-11-21' },
        { invoiceId: '123461', customer: 'Liam Garcia', amount: 89.99, status: 'Processing', date: '2023-11-21' },
        { invoiceId: '123462', customer: 'Ava Rodriguez', amount: 120.00, status: 'Cancelled', date: '2023-11-20' },
        { invoiceId: '123463', customer: 'Noah Martinez', amount: 75.00, status: 'Fulfilled', date: '2023-11-20' },
    ];
    
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrders = allOrders.filter(order => 
        order.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                            {filteredOrders.map(order => (
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
                                                <DropdownMenuItem>View Order Details</DropdownMenuItem>
                                                <DropdownMenuItem>Update Status</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-500">Cancel Order</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
