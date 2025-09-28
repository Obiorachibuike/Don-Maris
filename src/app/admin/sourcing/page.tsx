
'use client';

import { useState, useMemo, FormEvent, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { getAllUsers, addUser, getOrdersByUserId } from '@/lib/dummy-users';
import type { User, CartItem, Product } from '@/lib/types';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SupplyItem {
    id: string; // Changed to product ID for consistency
    itemName: string;
    quantity: number;
    unitCost: number;
    discount: number;
}

const initialSupplyItems: SupplyItem[] = [];

const MAX_ITEMS = 25;

export default function SourcingPage() {
    const [supplyItems, setSupplyItems] = useState<SupplyItem[]>(initialSupplyItems);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [open, setOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
    const [customerSearch, setCustomerSearch] = useState("");
    const [address, setAddress] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [previousBalance, setPreviousBalance] = useState(0);
    const [productToAdd, setProductToAdd] = useState<string | null>(null);
    const [quantityToAdd, setQuantityToAdd] = useState(1);
    const { products, fetchProducts } = useProductStore();
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        setAllUsers(getAllUsers());
        if (products.length === 0) {
            fetchProducts();
        }
    }, [products, fetchProducts]);

    const customers = useMemo(() => allUsers.filter(u => u.role === 'customer'), [allUsers]);

    const filteredCustomers = useMemo(() => {
        if (!customerSearch) return customers;
        return customers.filter(customer =>
            customer.name.toLowerCase().includes(customerSearch.toLowerCase())
        );
    }, [customers, customerSearch]);
    
    const selectedProductForAdding = useMemo(() => {
        if (!productToAdd) return null;
        return products.find(p => p.id === productToAdd);
    }, [productToAdd, products]);

    const handleSelectCustomer = (customer: User) => {
        setSelectedCustomer(customer);
        setCustomerEmail(customer.email);

        const userOrders = getOrdersByUserId(customer.id);
        const unpaidOrders = userOrders.filter(o => o.status === 'Processing' || o.status === 'Pending');
        const balance = unpaidOrders.reduce((acc, order) => acc + order.amount, 0);
        setPreviousBalance(balance);

        if (userOrders.length > 0 && userOrders[0].shippingAddress) {
            setAddress(userOrders[0].shippingAddress);
        } else {
            setAddress('');
        }

        setOpen(false);
        setCustomerSearch("");
    };
    
    const handleAddProduct = () => {
        if (supplyItems.length >= MAX_ITEMS) {
            toast({
                variant: 'destructive',
                title: 'Item Limit Reached',
                description: `You can only add up to ${MAX_ITEMS} items to a single invoice.`,
            });
            return;
        }

        if (!productToAdd || quantityToAdd < 1) return;
        
        const product = products.find(p => p.id === productToAdd);
        if (!product) return;

        const existingItemIndex = supplyItems.findIndex(item => item.id === product.id);

        if (existingItemIndex > -1) {
            const newItems = [...supplyItems];
            newItems[existingItemIndex].quantity += quantityToAdd;
            setSupplyItems(newItems);
        } else {
            const newItem: SupplyItem = {
                id: product.id,
                itemName: product.name,
                quantity: quantityToAdd,
                unitCost: product.price,
                discount: 0,
            };
            setSupplyItems(currentItems => [...currentItems, newItem]);
        }
        setProductToAdd(null);
        setQuantityToAdd(1);
    };

    const availableProducts = useMemo(() => {
        const addedProductIds = supplyItems.map(item => item.id);
        return products.filter(p => !addedProductIds.includes(p.id));
    }, [products, supplyItems]);


    const handleCreateCustomer = () => {
        const newUser = addUser({ name: customerSearch });
        setAllUsers(prev => [...prev, newUser]);
        handleSelectCustomer(newUser);
        setCustomerEmail("");
        setAddress("");
        setPreviousBalance(0);
    };

    const currentSubtotal = supplyItems.reduce((acc, item) => {
        const itemTotal = item.quantity * item.unitCost;
        const discountAmount = itemTotal * item.discount;
        return acc + (itemTotal - discountAmount);
    }, 0);
    
    const totalCost = currentSubtotal + previousBalance;


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
            const product = products.find(p => p.id === supplyItem.id)!;
            return {
                id: product.id,
                product: product,
                quantity: supplyItem.quantity,
            };
        });

        const invoiceData = {
            items: cartItems,
            total: currentSubtotal,
            invoiceId: `INV-${Date.now()}`,
            date: new Date().toLocaleDateString(),
            customer: customerDetails,
            paymentStatus: 'unpaid',
            previousBalance: previousBalance,
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
                        Create and manage invoices for customer orders.
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

                    <div className="space-y-4 pt-4 border-t">
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className="space-y-2">
                                <Label>Product to Add</Label>
                                <Select onValueChange={setProductToAdd} value={productToAdd || ''}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableProducts.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='grid grid-cols-2 gap-2'>
                                <div className="space-y-2">
                                    <Label>Available</Label>
                                    <Input
                                        type="number"
                                        value={selectedProductForAdding?.stock ?? ''}
                                        readOnly
                                        className="bg-muted"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quantity-to-add">Quantity</Label>
                                    <Input
                                        id="quantity-to-add"
                                        type="number"
                                        min="1"
                                        value={quantityToAdd}
                                        onChange={(e) => setQuantityToAdd(parseInt(e.target.value, 10))}
                                        disabled={!productToAdd}
                                    />
                                </div>
                            </div>
                        </div>
                         <Button
                            type="button"
                            onClick={handleAddProduct}
                            disabled={!productToAdd || quantityToAdd < 1 || quantityToAdd > (selectedProductForAdding?.stock ?? 0)}
                            className="w-full md:w-auto"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Product to Invoice
                        </Button>
                    </div>

                    <ScrollArea className="h-72 mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">S/N</TableHead>
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
                    </ScrollArea>
                </CardContent>
                <CardFooter className="flex justify-between items-start pt-6">
                    <Button type="submit">
                        <Printer className="mr-2 h-4 w-4" />
                        Preview Invoice
                    </Button>
                    <div className="w-full max-w-sm space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span>₦{currentSubtotal.toLocaleString()}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Previous Balance:</span>
                            <span>₦{previousBalance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total Amount:</span>
                            <span>₦{totalCost.toLocaleString()}</span>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </form>
    );
}

    