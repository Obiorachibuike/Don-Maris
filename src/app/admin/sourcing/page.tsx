
'use client';

import { useState, useMemo, FormEvent, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import type { User, CartItem, Product, PaymentStatus, Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, PlusCircle, Printer, ShoppingCart, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useProductStore } from '@/store/product-store';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { submitOrder } from '@/lib/client-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSession } from '@/contexts/SessionProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrdersPlaced } from '@/components/orders-placed';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useUserStore } from '@/store/user-store';


interface SupplyItem {
    id: string; // Changed to product ID for consistency
    itemName: string;
    quantity: number;
    unitCost: number;
    discount: number;
}

const initialSupplyItems: SupplyItem[] = [];

const MAX_ITEMS = 25;
const LOCAL_STORAGE_KEY = 'don_maris_sourcing_invoice';

function formatAddress(user: User): string {
    if (!user.address && !user.city && !user.state && !user.zip) return '';
    const street = user.address || '';
    const city = user.city || '';
    const state = user.state || '';
    const zip = user.zip || '';
    return `${street}\n${city}, ${state} ${zip}`.trim();
}

function CreateInvoiceTab() {
    const [supplyItems, setSupplyItems] = useState<SupplyItem[]>(initialSupplyItems);
    const { users: allUsers, fetchUsers } = useUserStore();
    const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);
    const [productPopoverOpen, setProductPopoverOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
    const [customerSearch, setCustomerSearch] = useState("");
    const [productSearch, setProductSearch] = useState("");
    const [address, setAddress] = useState("");
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [customerEmail, setCustomerEmail] = useState("");
    const [deliveryMethod, setDeliveryMethod] = useState('');
    const [previousBalance, setPreviousBalance] = useState(0);
    const [productToAdd, setProductToAdd] = useState<string | null>(null);
    const [quantityToAdd, setQuantityToAdd] = useState(1);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isPurchaseConfirmOpen, setIsPurchaseConfirmOpen] = useState(false);

    const { products, fetchProducts, decreaseStock } = useProductStore();
    const { user, isLoading: isUserLoading } = useSession();
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        try {
            const savedItems = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedItems) {
                setSupplyItems(JSON.parse(savedItems));
            }
        } catch (error) {
            console.error("Failed to parse saved invoice items:", error);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    }, []);

    useEffect(() => {
        try {
            if (supplyItems.length > 0) {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(supplyItems));
            } else {
                localStorage.removeItem(LOCAL_STORAGE_KEY);
            }
        } catch (error) {
            console.error("Failed to save invoice items:", error);
        }
    }, [supplyItems]);

    useEffect(() => {
        if(allUsers.length === 0) fetchUsers();
        if (products.length === 0) fetchProducts();
    }, [products.length, fetchProducts, allUsers.length, fetchUsers]);

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
        setCustomerEmail(customer.email || '');
        setAddress(formatAddress(customer));
        setPreviousBalance(customer.ledgerBalance || 0);
        setCustomerPopoverOpen(false);
        setCustomerSearch("");
    };
    
    const handleSaveAddress = async () => {
        if (!selectedCustomer) return;
        setIsSavingAddress(true);
    
        const addressParts = address.split('\n');
        const street = addressParts[0] || '';
        const cityStateZip = (addressParts[1] || '').split(',');
        const city = cityStateZip[0]?.trim() || '';
        const stateZip = (cityStateZip[1] || '').trim().split(' ');
        const state = stateZip[0] || '';
        const zip = stateZip[1] || '';
    
        try {
            const response = await fetch(`/api/users/${selectedCustomer._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: street, city, state, zip }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update address');
            }
            
            toast({ title: "Address Saved", description: "Customer's address has been updated." });
            // Optionally refetch users to update the local store
            fetchUsers();
        } catch (error: any) {
            console.error("Could not update customer address:", error);
            toast({ variant: 'destructive', title: "Save Failed", description: error.message || "Could not save your address." });
        } finally {
            setIsSavingAddress(false);
        }
    };

    const handleSelectProduct = (productId: string) => {
        setProductToAdd(productId);
        setProductPopoverOpen(false);
        setProductSearch("");
    }
    
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

        if (quantityToAdd > product.stock) {
            toast({
                variant: 'destructive',
                title: 'Insufficient Stock',
                description: `Only ${product.stock} units of ${product.name} are available.`,
            });
            return;
        }

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
        let available = products.filter(p => !addedProductIds.includes(p.id));
        if (productSearch) {
            available = available.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
        }
        return available;
    }, [products, supplyItems, productSearch]);


    const currentSubtotal = supplyItems.reduce((acc, item) => {
        const itemTotal = item.quantity * item.unitCost;
        const discountAmount = itemTotal * item.discount;
        return acc + (itemTotal - discountAmount);
    }, 0);
    
    const totalCost = currentSubtotal + previousBalance;

    const updateStockInDatabase = async (productId: string, quantitySold: number) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        const newStock = product.stock - quantitySold;
        
        try {
            await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stock: newStock,
                    stockChangeReason: 'Sale',
                    stockChangeUser: user?.name || 'Sourcing Dept.'
                }),
            });
            decreaseStock(productId, quantitySold);
        } catch (error) {
            console.error(`Failed to update stock for product ${productId}`, error);
            toast({
                variant: 'destructive',
                title: `Stock Update Failed`,
                description: `Could not update stock for ${product.name}.`,
            });
        }
    };

    const handlePurchase = () => {
        if (!selectedCustomer || !address || !deliveryMethod || supplyItems.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please select a customer, provide an address, choose a delivery method and add items.',
            });
            return;
        }
        setIsPurchaseConfirmOpen(true);
    };


    const processSubmission = async (action: 'preview' | 'purchase') => {
         if (!selectedCustomer || !address || !deliveryMethod || !user) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please select a customer, provide an address, choose a delivery method, and be logged in.',
            });
            return;
        }
        if (supplyItems.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No Items Added',
                description: 'Please add at least one product to the invoice.',
            });
            return;
        }

        const addressParts = address.split('\n');
        const street = addressParts[0] || '';
        const cityStateZip = (addressParts[1] || '').split(',');
        const city = cityStateZip[0]?.trim() || '';
        const stateZip = (cityStateZip[1] || '').trim().split(' ');
        const state = stateZip[0] || '';
        const zip = stateZip[1] || '';


        const customerDetailsForInvoice = {
            id: selectedCustomer._id,
            name: selectedCustomer.name,
            email: customerEmail,
            address: street,
            city: city,
            state: state,
            zip: zip,
            avatar: selectedCustomer.avatar,
        };
        
         const customerDetailsForOrder = {
            id: selectedCustomer._id,
            name: selectedCustomer.name,
            email: customerEmail,
            avatar: selectedCustomer.avatar,
        };

        const cartItems: CartItem[] = supplyItems.map(supplyItem => {
            const product = products.find(p => p.id === supplyItem.id)!;
            return {
                id: product.id,
                product: product,
                quantity: supplyItem.quantity,
            };
        });

        const invoiceId = `INV-${Date.now()}`;
        const orderDate = new Date();

        const invoiceData = {
            items: cartItems,
            total: currentSubtotal,
            invoiceId: invoiceId,
            date: orderDate.toLocaleDateString(),
            customer: customerDetailsForInvoice,
            paymentStatus: 'unpaid' as PaymentStatus,
            previousBalance: previousBalance,
            deliveryMethod: deliveryMethod
        };
        
        sessionStorage.setItem('don_maris_order', JSON.stringify(invoiceData));

        if (action === 'preview') {
            router.push(`/admin/sourcing/invoice`);
        } else {
            setIsPurchasing(true);
            setIsPurchaseConfirmOpen(false);
            const orderDetails: Omit<Order, 'id'> = {
                items: cartItems.map(ci => ({ productId: ci.id, quantity: ci.quantity })),
                amount: currentSubtotal,
                customer: customerDetailsForOrder,
                shippingAddress: address,
                date: orderDate.toISOString(),
                status: 'Pending',
                paymentMethod: 'Pay on Delivery',
                deliveryMethod: deliveryMethod,
                paymentStatus: 'Not Paid',
                amountPaid: 0,
                createdBy: user._id
            };

            const result = await submitOrder(orderDetails);
            
            if (result.status === 'success' || result.id) {
                for (const item of cartItems) {
                    await updateStockInDatabase(item.product.id, item.quantity);
                }

                toast({
                    title: "Purchase Recorded!",
                    description: "The order has been successfully created and stock has been updated.",
                });

                setSupplyItems([]);
                setSelectedCustomer(null);
                setAddress('');
                setCustomerEmail('');
                setPreviousBalance(0);
                setDeliveryMethod('');
                localStorage.removeItem(LOCAL_STORAGE_KEY);

                router.push(`/admin/sourcing/invoice`);
            } else {
                toast({
                    variant: 'destructive',
                    title: "Purchase Failed",
                    description: "There was a problem recording the purchase. Please try again.",
                });
            }
            setIsPurchasing(false);
        }
    }
    
    const isItemLimitReached = supplyItems.length >= MAX_ITEMS;
    const isFormSubmittable = selectedCustomer && address && deliveryMethod && supplyItems.length > 0;

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Create Invoice</CardTitle>
                    <CardDescription>
                        Create and manage invoices for customer orders.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={(e) => e.preventDefault()}>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-8 mb-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Customer Details</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="customer-name">Customer Name</Label>
                                    <Popover open={customerPopoverOpen} onOpenChange={setCustomerPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={customerPopoverOpen}
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
                                                    <CommandEmpty>No customer found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {filteredCustomers.map((customer) => (
                                                            <CommandItem
                                                                key={customer._id}
                                                                value={customer.name}
                                                                onSelect={() => handleSelectCustomer(customer)}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        selectedCustomer?._id === customer._id ? "opacity-100" : "opacity-0"
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
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Shipping & Delivery</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea
                                        id="address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="123 Main St&#10;Anytown, CA 12345"
                                    />
                                    {selectedCustomer && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            onClick={handleSaveAddress}
                                            disabled={isSavingAddress}
                                        >
                                            {isSavingAddress ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                            Save Address
                                        </Button>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Delivery Method</Label>
                                    <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select delivery method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Come Market">Come Market</SelectItem>
                                            <SelectItem value="Waybill">Waybill</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div className="space-y-2">
                                    <Label>Product to Add</Label>
                                    <Popover open={productPopoverOpen} onOpenChange={setProductPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={productPopoverOpen}
                                                className="w-full justify-between"
                                                disabled={isItemLimitReached}
                                            >
                                                {selectedProductForAdding
                                                    ? selectedProductForAdding.name
                                                    : "Select product..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandInput
                                                    placeholder="Search product..."
                                                    value={productSearch}
                                                    onValueChange={setProductSearch}
                                                />
                                                <CommandList>
                                                    <CommandEmpty>No product found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {availableProducts.map((p) => (
                                                            <CommandItem
                                                                key={p.id}
                                                                value={p.name}
                                                                onSelect={() => handleSelectProduct(p.id)}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        productToAdd === p.id ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {p.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className='grid grid-cols-3 gap-2'>
                                    <div className="space-y-2">
                                        <Label>Price (₦)</Label>
                                        <Input
                                            type="number"
                                            value={selectedProductForAdding?.price ?? ''}
                                            readOnly
                                            className="bg-muted"
                                        />
                                    </div>
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
                                            onChange={(e) => setQuantityToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                                            disabled={!productToAdd || isItemLimitReached}
                                        />
                                    </div>
                                </div>
                            </div>
                            <Button
                                type="button"
                                onClick={handleAddProduct}
                                disabled={!productToAdd || quantityToAdd < 1 || quantityToAdd > (selectedProductForAdding?.stock ?? 0) || isItemLimitReached}
                                className="w-full md:w-auto"
                            >
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Product to Invoice
                            </Button>
                            {isItemLimitReached && (
                                <p className="text-sm text-destructive text-center">
                                    You have reached the maximum of {MAX_ITEMS} items per invoice.
                                </p>
                            )}
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
                    <CardFooter className="flex flex-col md:flex-row justify-between items-start gap-6 pt-6">
                        <div className="w-full max-w-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span>₦{currentSubtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Previous Balance:</span>
                                <span className="font-medium text-destructive">₦{previousBalance.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total Amount:</span>
                                <span>₦{totalCost.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                            <Button type="button" variant="outline" className="w-full" onClick={() => processSubmission('preview')} disabled={!isFormSubmittable || isPurchasing}>
                                <Printer className="mr-2 h-4 w-4" />
                                Preview Invoice
                            </Button>
                            <Button type="button" className="w-full" onClick={handlePurchase} disabled={!isFormSubmittable || isPurchasing}>
                                {isPurchasing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                )}
                                {isPurchasing ? 'Purchasing...' : 'Purchase'}
                            </Button>
                        </div>
                    </CardFooter>
                </form>
            </Card>

            <AlertDialog open={isPurchaseConfirmOpen} onOpenChange={setIsPurchaseConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to finalize this purchase? This will create an order and deduct the items from stock. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => processSubmission('purchase')}>
                            Yes, confirm purchase
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}


export default function SourcingPage() {
    return (
        <Tabs defaultValue="create-invoice" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create-invoice">Create Invoice</TabsTrigger>
                <TabsTrigger value="orders-placed">Orders Placed</TabsTrigger>
            </TabsList>
            <TabsContent value="create-invoice" className="mt-6">
                <CreateInvoiceTab />
            </TabsContent>
            <TabsContent value="orders-placed" className="mt-6">
                <OrdersPlaced />
            </TabsContent>
        </Tabs>
    )
}
