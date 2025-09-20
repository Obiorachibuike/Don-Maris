
'use client';

import { useState, useMemo, useEffect, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, ChevronsUpDown, Printer } from "lucide-react";
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useProductStore } from '@/store/product-store';
import { useRouter } from 'next/navigation';
import type { CartItem, User } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getAllUsers } from '@/lib/dummy-users';

type RequestStatus = 'Pending' | 'Sourced' | 'Unavailable' | 'In Stock';

interface ProductRequest {
    id: string;
    productName: string;
    productId?: string;
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
        productId: '9',
        requestedBy: { id: 'CUST005', name: 'Sophia Davis' },
        date: '2023-11-20',
        status: 'In Stock',
        notes: 'Added to inventory as product ID #15. Notified customer.'
    },
];

export default function SourcingPage() {
    const [requests, setRequests] = useState<ProductRequest[]>(dummyRequests);
    const { products, fetchProducts, isLoading } = useProductStore();
    const [productPopoverOpen, setProductPopoverOpen] = useState(false);
    const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
    const router = useRouter();

    const allUsers = useMemo(() => getAllUsers(), []);
    const customers = useMemo(() => allUsers.filter(u => u.role === 'customer'), [allUsers]);

    const [customerName, setCustomerName] = useState("Sourcing Department");
    const [customerEmail, setCustomerEmail] = useState("sourcing@donmaris.com");

    useEffect(() => {
        if (products.length === 0) {
            fetchProducts();
        }
    }, [products.length, fetchProducts]);

    const handleAddItem = () => {
        const product = products.find(p => p.id === selectedProduct);
        if (!product) return;

        const newRequest: ProductRequest = {
            id: `REQ${Date.now()}`,
            productName: product.name,
            productId: product.id,
            requestedBy: { id: 'USR001', name: 'Admin' }, 
            date: new Date().toISOString().split('T')[0],
            status: 'Pending',
        };
        
        setRequests([newRequest, ...requests]);
        setSelectedProduct(null);
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
    
    const displayedProductName = useMemo(() => {
        if (!selectedProduct) return "Select product to add...";
        const product = products.find(p => p.id === selectedProduct);
        return product ? product.name : "Select product to add...";
    }, [selectedProduct, products]);

    const displayedCustomerName = useMemo(() => {
        return selectedCustomer ? selectedCustomer.name : "Select a customer...";
    }, [selectedCustomer]);


    const handleCustomerSelect = (customer: User) => {
        setSelectedCustomer(customer);
        setCustomerName(customer.name);
        setCustomerEmail(customer.email);
        setCustomerPopoverOpen(false);
    }

    const handlePreviewInvoice = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const fullAddress = formData.get('address') as string;
        const addressParts = fullAddress.split('\n');
        const street = addressParts[0] || '';
        const cityStateZip = addressParts.length > 1 ? addressParts[addressParts.length - 1].split(',') : ['', ''];
        const city = cityStateZip[0]?.trim() || '';
        const stateZip = (cityStateZip[1] || '').trim().split(' ');
        const state = stateZip[0] || '';
        const zip = stateZip.slice(1).join(' ') || '';

        const customerDetails = {
            name: customerName,
            email: customerEmail,
            address: street,
            city: city,
            state: state,
            zip: zip,
        };

        const itemsToInvoice = requests
            .map(req => {
                if (req.productId) {
                    const product = products.find(p => p.id === req.productId);
                    if (product) {
                        return { id: product.id, product, quantity: 1 } as CartItem;
                    }
                }
                return null;
            })
            .filter((item): item is CartItem => item !== null);

        if (itemsToInvoice.length === 0) {
            alert("No available products in the request list to create an invoice.");
            return;
        }

        const total = itemsToInvoice.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

        const invoiceData = {
            items: itemsToInvoice,
            total: total,
            invoiceId: `PREVIEW-${Date.now()}`,
            date: new Date().toLocaleDateString(),
            customer: customerDetails,
            paymentStatus: 'unpaid',
        };

        sessionStorage.setItem('don_maris_order', JSON.stringify(invoiceData));
        router.push(`/admin/sourcing/invoice`);
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
                <form onSubmit={handlePreviewInvoice}>
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-xl">Invoice Details</CardTitle>
                            <CardDescription>Set the "Billed To" information for the invoice preview.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="customerName">Customer Name</Label>
                                <Popover open={customerPopoverOpen} onOpenChange={setCustomerPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={customerPopoverOpen}
                                            className="w-full justify-between"
                                        >
                                            {customerName === 'Sourcing Department' ? 'Select a customer...' : customerName}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search customers..." />
                                            <CommandList>
                                                <CommandEmpty>No customer found.</CommandEmpty>
                                                <CommandGroup>
                                                    {customers.map((customer) => (
                                                        <CommandItem
                                                            key={customer.id}
                                                            value={customer.name}
                                                            onSelect={() => handleCustomerSelect(customer)}
                                                        >
                                                            {customer.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customerEmail">Customer Email</Label>
                                <Input id="customerEmail" name="customerEmail" type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea id="address" name="address" rows={3} defaultValue="123 Internal Way\nBusinesstown, CA 90210" />
                            </div>
                             <div className="md:col-span-2 flex justify-end">
                                <Button type="submit" variant="outline">
                                    <Printer className="mr-2 h-4 w-4" />
                                    Preview Invoice
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>

                <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
                    <Popover open={productPopoverOpen} onOpenChange={setProductPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={productPopoverOpen}
                                className="w-full justify-between"
                            >
                                {displayedProductName}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                            <Command>
                                <CommandInput placeholder="Search product..." />
                                <CommandList>
                                    <CommandEmpty>{isLoading ? 'Loading products...' : 'No product found.'}</CommandEmpty>
                                    <CommandGroup>
                                        {products.map((product) => (
                                            <CommandItem
                                                key={product.id}
                                                value={product.name}
                                                onSelect={() => {
                                                    setSelectedProduct(product.id);
                                                    setProductPopoverOpen(false);
                                                }}
                                            >
                                                {product.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <Button onClick={handleAddItem} disabled={!selectedProduct}>
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
                                <TableCell className="font-medium">
                                    {request.productId ? (
                                        <Link href={`/admin/products/${request.productId}`} className="text-primary hover:underline">
                                            {request.productName}
                                        </Link>
                                    ) : (
                                        request.productName
                                    )}
                                </TableCell>
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
