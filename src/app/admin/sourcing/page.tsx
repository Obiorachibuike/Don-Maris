
'use client';

import { useState, useMemo, FormEvent, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { getAllUsers, addUser } from '@/lib/dummy-users';
import type { User, CartItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, PlusCircle, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useProductStore } from '@/store/product-store';
import { useToast } from '@/hooks/use-toast';

interface SupplyItem {
    id: number;
    itemName: string;
    quantity: number;
    unitCost: number;
    discount: number;
}

const initialSupplyItems: SupplyItem[] = [
    { id: 1, itemName: "IPX BACK GLASS B", quantity: 10, unitCost: 990.00, discount: 0 },
    { id: 2, itemName: "IPX BACK GLASS W", quantity: 10, unitCost: 990.00, discount: 0 },
    { id: 3, itemName: "IPXR BACK GLASS BLACK", quantity: 2, unitCost: 990.00, discount: 0 },
    { id: 4, itemName: "IPXR BACK GLASS BLUE", quantity: 2, unitCost: 990.00, discount: 0 },
    { id: 5, itemName: "IPXR BACK GLASS CORAL", quantity: 2, unitCost: 990.00, discount: 0 },
    { id: 6, itemName: "IPXR BACK GLASS WHITE", quantity: 2, unitCost: 990.00, discount: 0 },
    { id: 7, itemName: "IPXR BACK GLASS WHITE", quantity: 2, unitCost: 990.00, discount: 0 },
    { id: 8, itemName: "IPXS MAX BACK GLASS B", quantity: 3, unitCost: 990.00, discount: 0 },
    { id: 9, itemName: "IPXS MAX BACK GLASS GOLD", quantity: 4, unitCost: 990.00, discount: 0 },
    { id: 10, itemName: "IPXS MAX BACK GLASS W", quantity: 3, unitCost: 990.00, discount: 0 },
    { id: 11, itemName: "IP11pro BACK GLASS Black", quantity: 2, unitCost: 2300.00, discount: 0 },
    { id: 12, itemName: "IP11pro BACK GLASS GOLD", quantity: 4, unitCost: 2300.00, discount: 0 },
    { id: 13, itemName: "IP11pro BACK GLASS GREEN", quantity: 2, unitCost: 2300.00, discount: 0 },
    { id: 14, itemName: "IP11pro BACK GLASS White", quantity: 2, unitCost: 2300.00, discount: 0 },
    { id: 15, itemName: "IP11pro MAX BACK GLASS GOLD", quantity: 4, unitCost: 2300.00, discount: 0 },
    { id: 16, itemName: "IP11PRO MAX BACK GLASS GREEN", quantity: 3, unitCost: 2300.00, discount: 0 },
    { id: 17, itemName: "IP12pro BACK GLASS Black", quantity: 2, unitCost: 2300.00, discount: 0 },
    { id: 18, itemName: "IP11PRO MAX BACK GLASS White", quantity: 3, unitCost: 2300.00, discount: 0 },
    { id: 19, itemName: "IP12pro BACK GLASS BLUE", quantity: 4, unitCost: 2300.00, discount: 0 },
    { id: 20, itemName: "IP12pro BACK GLASS GOLD", quantity: 2, unitCost: 2300.00, discount: 0 },
    { id: 21, itemName: "IP12pro BACK GLASS White", quantity: 2, unitCost: 2300.00, discount: 0 },
    { id: 22, itemName: "IP12pro MAX BACK GLASS BLACK", quantity: 2, unitCost: 2300.00, discount: 0 },
    { id: 23, itemName: "IP12pro MAX BACK GLASS BLUE", quantity: 4, unitCost: 2300.00, discount: 0 },
    { id: 24, itemName: "IP12pro MAX BACK GLASS GOLD", quantity: 2, unitCost: 2300.00, discount: 0 },
    { id: 25, itemName: "IP12pro MAX BACK GLASS WHITE", quantity: 2, unitCost: 2300.00, discount: 0 },
    { id: 26, itemName: "IP13pro BACK GLASS B", quantity: 2, unitCost: 2180.00, discount: 0 },
    { id: 27, itemName: "IP13pro BACK GLASS GOLD", quantity: 2, unitCost: 2180.00, discount: 0 },
    { id: 28, itemName: "IP13Pro MAX BACK GLASS GREEN", quantity: 2, unitCost: 2180.00, discount: 0 },
    { id: 29, itemName: "IP13pro BACK GLASS WHITE", quantity: 2, unitCost: 2180.00, discount: 0 },
    { id: 30, itemName: "IP13pro BACK GLASS BLUE", quantity: 2, unitCost: 2180.00, discount: 0 },
    { id: 31, itemName: "IP13Pro MAX BACK GLASS BLUE", quantity: 2, unitCost: 2180.00, discount: 0 },
    { id: 32, itemName: "IP13Pro MAX BACK GLASS BLACK", quantity: 2, unitCost: 2180.00, discount: 0 },
    { id: 33, itemName: "IP13Pro MAX BACK GLASS GREEN", quantity: 2, unitCost: 2180.00, discount: 0 },
];

export default function SourcingPage() {
    const [supplyItems] = useState<SupplyItem[]>(initialSupplyItems);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [open, setOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
    const [customerSearch, setCustomerSearch] = useState("");
    const [address, setAddress] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const { products } = useProductStore();
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        setAllUsers(getAllUsers());
    }, []);

    const customers = useMemo(() => allUsers.filter(u => u.role === 'customer'), [allUsers]);

    const filteredCustomers = useMemo(() => {
        if (!customerSearch) return customers;
        return customers.filter(customer =>
            customer.name.toLowerCase().includes(customerSearch.toLowerCase())
        );
    }, [customers, customerSearch]);

    const handleSelectCustomer = (customer: User) => {
        setSelectedCustomer(customer);
        setCustomerEmail(customer.email);
        setOpen(false);
        setCustomerSearch("");
    };

    const handleCreateCustomer = () => {
        const newUser = addUser({ name: customerSearch });
        setAllUsers(prev => [...prev, newUser]);
        handleSelectCustomer(newUser);
        setCustomerEmail("");
    };

    const totalQuantity = supplyItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalCost = supplyItems.reduce((acc, item) => {
        const itemTotal = item.quantity * item.unitCost;
        const discountAmount = itemTotal * item.discount;
        return acc + (itemTotal - discountAmount);
    }, 0);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!selectedCustomer || !address) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please provide customer name and address.',
            });
            return;
        }

        const customerName = selectedCustomer.name;
        const [firstName, ...lastNameParts] = customerName.split(' ');
        const customerDetails = {
            name: customerName,
            firstName,
            lastName: lastNameParts.join(' '),
            email: customerEmail,
            address: address.split('\n')[0] || '',
            city: address.split('\n')[1]?.split(',')[0] || '',
            state: address.split('\n')[1]?.split(',')[1]?.trim().split(' ')[0] || '',
            zip: address.split('\n')[1]?.split(',')[1]?.trim().split(' ')[1] || '',
        };

        const cartItems: CartItem[] = supplyItems.map(supplyItem => {
            const product = products.find(p => p.name === supplyItem.itemName) || {
                id: `supply-${supplyItem.id}`,
                name: supplyItem.itemName,
                price: supplyItem.unitCost,
                image: 'https://placehold.co/100x100.png',
                brand: 'Don Maris',
            } as any;

            return {
                id: product.id,
                product: product,
                quantity: supplyItem.quantity,
            };
        });

        const invoiceData = {
            items: cartItems,
            total: totalCost,
            invoiceId: `INV-${Date.now()}`,
            date: new Date().toLocaleDateString(),
            customer: customerDetails,
            paymentStatus: 'unpaid',
        };

        sessionStorage.setItem('don_maris_order', JSON.stringify(invoiceData));
        router.push(`/admin/sourcing/invoice`);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Posting Department</CardTitle>
                    <CardDescription>
                        A list of items to be posted based on the provided invoice.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Customer Details</h3>
                            <div className="space-y-2">
                                <Label htmlFor="customer-name">Customer Name</Label>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className="w-full justify-between"
                                        >
                                            {selectedCustomer
                                                ? selectedCustomer.name
                                                : "Select customer..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput
                                                placeholder="Search customer..."
                                                value={customerSearch}
                                                onValueChange={setCustomerSearch}
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    <div className="p-4 text-sm text-center">
                                                        No customer found.
                                                        {customerSearch && (
                                                            <Button
                                                                variant="link"
                                                                className="p-0 h-auto"
                                                                onClick={handleCreateCustomer}
                                                            >
                                                                Create "{customerSearch}"
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {filteredCustomers.map((customer) => (
                                                        <CommandItem
                                                            key={customer.id}
                                                            value={customer.name}
                                                            onSelect={() => handleSelectCustomer(customer)}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
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
                                <Label htmlFor="customer-email">Customer Email</Label>
                                <Input
                                    id="customer-email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    placeholder="customer@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="123 Main St&#10;Anytown, CA 12345"
                                />
                            </div>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">S/N</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead className="text-center">Quantity</TableHead>
                                <TableHead className="text-right">Unit Cost (₦)</TableHead>
                                <TableHead className="text-right">Discount</TableHead>
                                <TableHead className="text-right">Price (₦)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {supplyItems.map((item, index) => {
                                const itemTotal = item.quantity * item.unitCost;
                                const discountAmount = itemTotal * item.discount;
                                const price = itemTotal - discountAmount;
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="font-medium">{item.itemName}</TableCell>
                                        <TableCell className="text-center">{item.quantity}</TableCell>
                                        <TableCell className="text-right">{item.unitCost.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{(item.discount * 100).toFixed(0)}%</TableCell>
                                        <TableCell className="text-right">{price.toLocaleString()}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="flex justify-between items-start pt-6">
                    <Button type="submit">
                        <Printer className="mr-2 h-4 w-4" />
                        Preview Invoice
                    </Button>
                    <div className="w-full max-w-sm space-y-2">
                        <div className="flex justify-between">
                            <span className="font-medium text-muted-foreground">Total Quantity:</span>
                            <span className="font-bold">{totalQuantity}</span>
                        </div>
                        <div className="flex justify-between text-lg">
                            <span className="font-bold">Total Cost:</span>
                            <span className="font-bold">₦{totalCost.toLocaleString()}</span>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </form>
    );
}

    