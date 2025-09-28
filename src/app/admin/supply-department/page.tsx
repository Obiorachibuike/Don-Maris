
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { dummyOrders } from '@/lib/dummy-orders';
import type { Order } from '@/lib/types';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SupplyDepartmentPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;

    // Filter orders to show only those relevant for the supply department (e.g., 'Processing')
    const supplyOrders = dummyOrders.filter(order => order.status === 'Processing' || order.status === 'Pending');

    const filteredOrders = supplyOrders.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Supply Department</CardTitle>
                        <CardDescription>
                            A list of orders awaiting fulfillment.
                        </CardDescription>
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
                            <TableHead className="text-right">Total Amount</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentOrders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">
                                     <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline">
                                        {order.id}
                                    </Link>
                                </TableCell>
                                <TableCell>{order.customer.name}</TableCell>
                                <TableCell className="text-right">${order.amount.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Badge variant={order.status === 'Processing' ? 'secondary' : 'destructive'} className={order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20' : ''}>{order.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
             <CardFooter>
                 <div className="flex items-center justify-between w-full">
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
    );
}
