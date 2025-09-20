
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import Link from 'next/link';
import { Input } from '@/components/ui/input';

type RequestStatus = 'Pending' | 'Sourced' | 'Unavailable' | 'In Stock';

interface ProductRequest {
    id: string;
    productName: string;
    requestedBy: {
        id: string;
        name: string;
    };
    date: string;
    status: RequestStatus;
    notes?: string;
}

const dummyRequests: ProductRequest[] = [
    {
        id: 'REQ001',
        productName: 'iPhone 15 Pro Battery',
        requestedBy: { id: 'CUST001', name: 'Olivia Martin' },
        date: '2023-12-01',
        status: 'Pending',
        notes: 'Customer reports poor battery life and requests a high-capacity replacement.'
    },
    {
        id: 'REQ002',
        productName: 'OnePlus 12 Screen Protector (Matte)',
        requestedBy: { id: 'CUST002', name: 'Jackson Lee' },
        date: '2023-11-28',
        status: 'Sourced',
        notes: 'Sourced from new supplier "ScreenGuard Pro". Awaiting shipment.'
    },
    {
        id: 'REQ003',
        productName: 'Samsung Galaxy Fold 5 Hinge Assembly',
        requestedBy: { id: 'CUST004', name: 'William Kim' },
        date: '2023-11-25',
        status: 'Unavailable',
        notes: 'OEM part is not available for individual sale at this time.'
    },
    {
        id: 'REQ004',
        productName: 'Google Pixel 8 Pro Camera Lens',
        requestedBy: { id: 'CUST005', name: 'Sophia Davis' },
        date: '2023-11-20',
        status: 'In Stock',
        notes: 'Added to inventory as product ID #15. Notified customer.'
    },
];

export default function SourcingPage() {
    const [requests, setRequests] = useState<ProductRequest[]>(dummyRequests);
    const [newItem, setNewItem] = useState('');

    const handleAddItem = () => {
        if (!newItem.trim()) return;

        const newRequest: ProductRequest = {
            id: `REQ${Date.now()}`,
            productName: newItem,
            requestedBy: { id: 'USR001', name: 'Admin' }, // Assuming admin is creating it
            date: new Date().toISOString().split('T')[0],
            status: 'Pending',
        };
        
        setRequests([newRequest, ...requests]);
        setNewItem(''); // Clear the input after adding
    };
    
    const getStatusBadgeVariant = (status: RequestStatus) => {
        switch (status) {
            case 'Pending': return 'destructive';
            case 'Sourced': return 'secondary';
            case 'In Stock': return 'default';
            case 'Unavailable': return 'outline';
            default: return 'secondary';
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Product Sourcing To-Do</CardTitle>
                        <CardDescription>
                            A to-do list for sourcing and adding new products based on customer requests.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
                    <Input
                        placeholder="Add a new item to the list..."
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                    />
                    <Button onClick={handleAddItem}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add
                    </Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Requested By</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((request) => (
                            <TableRow key={request.id}>
                                <TableCell className="font-medium">{request.productName}</TableCell>
                                <TableCell>
                                    <Link href={`/admin/users/${request.requestedBy.id}`} className="text-primary hover:underline">
                                        {request.requestedBy.name}
                                    </Link>
                                </TableCell>
                                <TableCell>{new Date(request.date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(request.status)}>
                                        {request.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem>View Notes</DropdownMenuItem>
                                            <DropdownMenuItem>Update Status</DropdownMenuItem>
                                            <DropdownMenuItem>Mark as In Stock</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
