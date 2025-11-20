
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Order, OrderItem, Product } from '@/lib/types';
import { useProductStore } from '@/store/product-store';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, PlusCircle, Loader2, Save, ArrowLeft, Check, ChevronsUpDown } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandInput, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { useOrderStore } from '@/store/order-store';


type EditableOrderItem = OrderItem & { product: Product };

export default function EditOrderPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const { products, isLoading: areProductsLoading } = useProductStore();
    const { getOrderById, updateOrder, isLoading: isOrderLoading } = useOrderStore();
    
    const originalOrder = useMemo(() => getOrderById(orderId), [getOrderById, orderId]);

    const [editableItems, setEditableItems] = useState<EditableOrderItem[]>([]);
    const [productToAdd, setProductToAdd] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isProductPopoverOpen, setIsProductPopoverOpen] = useState(false);
    const { toast } = useToast();
    
    useEffect(() => {
        if (originalOrder && products.length > 0) {
            const itemsWithProductData = originalOrder.items.map(item => {
                const product = products.find(p => p.id === item.productId);
                return { ...item, product: product! };
            }).filter(item => item.product);
            setEditableItems(itemsWithProductData);
        }
    }, [originalOrder, products]);

    const handleQuantityChange = useCallback((productId: string, newQuantity: number) => {
        const quantity = isNaN(newQuantity) ? 0 : newQuantity;
        setEditableItems(currentItems => 
            currentItems.map(item => 
                item.productId === productId ? { ...item, quantity } : item
            )
        );
    }, []);

    const handleRemoveItem = useCallback((productId: string) => {
        setEditableItems(currentItems => currentItems.filter(item => item.productId !== productId));
    }, []);

    const handleAddProduct = useCallback(() => {
        if (!productToAdd) return;
        
        const product = products.find(p => p.id === productToAdd);
        if (!product) return;

        const existingItem = editableItems.find(item => item.productId === product.id);

        if (existingItem) {
            handleQuantityChange(product.id, existingItem.quantity + 1);
        } else {
            setEditableItems(currentItems => [...currentItems, { productId: product.id, quantity: 1, product }]);
        }
        setProductToAdd(null);
    }, [productToAdd, products, editableItems, handleQuantityChange]);

    const availableProducts = useMemo(() => {
        const orderedProductIds = editableItems.map(item => item.productId);
        return products.filter(p => p.stock > 0 && !orderedProductIds.includes(p.id));
    }, [products, editableItems]);

    const isFormInvalid = useMemo(() => {
        return editableItems.some(item => item.quantity <= 0);
    }, [editableItems]);
    
    const newTotalAmount = useMemo(() => {
        return editableItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    }, [editableItems]);

    const handleSaveChanges = async () => {
        if (isFormInvalid) {
            toast({
                variant: 'destructive',
                title: "Invalid Quantity",
                description: "One or more items have a quantity of 0. Please correct it or remove the item.",
            });
            return;
        }
        if (!originalOrder) return;

        setIsSaving(true);
        const updatedOrderItems = editableItems.map(({ productId, quantity }) => ({ productId, quantity }));
        
        const updatedData: Partial<Order> = {
            items: updatedOrderItems,
            amount: newTotalAmount,
        };
        
        try {
            await updateOrder(originalOrder.id, updatedData);
            toast({
                title: "Order Updated",
                description: `Order #${originalOrder.id} has been successfully updated.`,
            });
            router.push(`/admin/orders/${originalOrder.id}`);
        } catch (error) {
            // Toast is handled by the store
        } finally {
            setIsSaving(false);
        }
    };

    if (isOrderLoading || areProductsLoading) {
        return (
            <div className="container mx-auto px-4 py-8 space-y-6">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-8 w-1/2" />
                <Card>
                    <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
                    <CardContent>
                        <Skeleton className="h-48 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    if (!originalOrder) {
        return (
             <div className="container mx-auto px-4 py-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Order Not Found</CardTitle>
                        <CardDescription>We couldn't find the order you were looking for.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <Button asChild>
                            <Link href="/admin/accountant"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders</Link>
                        </Button>
                    </CardContent>
                 </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
                 <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Edit Order</h1>
                        <p className="text-muted-foreground">Order ID: {originalOrder.id}</p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={`/admin/orders/${originalOrder.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel Edit
                        </Link>
                    </Button>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Modify Items</CardTitle>
                        <CardDescription>
                            Adjust quantities, add, or remove products for this order.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 py-4">
                            <ScrollArea className="h-72 border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="w-[120px]">Quantity</TableHead>
                                            <TableHead className="w-[100px] text-right">Unit Price</TableHead>
                                            <TableHead className="w-[100px] text-right">Total</TableHead>
                                            <TableHead className="w-[50px]"><span className="sr-only">Remove</span></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {editableItems.map(item => (
                                            <TableRow key={item.productId}>
                                                <TableCell className="font-medium flex items-center gap-2">
                                                    <Image src={item.product.images[0]} alt={item.product.name} width={32} height={32} className="rounded-sm object-contain" />
                                                    {item.product.name}
                                                </TableCell>
                                                <TableCell>
                                                    <Input 
                                                        type="number" 
                                                        value={item.quantity}
                                                        onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value, 10))}
                                                        className={cn(
                                                            "w-20",
                                                            item.quantity <= 0 && "border-destructive focus-visible:ring-destructive"
                                                        )}
                                                        min={1}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">₦{item.product.price.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">₦{(item.product.price * item.quantity).toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.productId)}>
                                                        <X className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                            <div className="flex items-center gap-2 pt-4 border-t">
                                <Popover open={isProductPopoverOpen} onOpenChange={setIsProductPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={isProductPopoverOpen}
                                            className="w-[300px] justify-between"
                                        >
                                            {productToAdd
                                                ? availableProducts.find((p) => p.id === productToAdd)?.name
                                                : "Select product to add..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search product..." />
                                            <CommandList>
                                                <CommandEmpty>No product found.</CommandEmpty>
                                                <CommandGroup>
                                                    {availableProducts.map((p) => (
                                                    <CommandItem
                                                        key={p.id}
                                                        value={p.name}
                                                        onSelect={() => {
                                                            setProductToAdd(p.id)
                                                            setIsProductPopoverOpen(false)
                                                        }}
                                                    >
                                                        <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            productToAdd === p.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                        />
                                                        {p.name} (Stock: {p.stock})
                                                    </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <Button onClick={handleAddProduct} disabled={!productToAdd}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Summary of Changes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Original Total:</span>
                            <span className="font-medium">₦{originalOrder.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">New Total:</span>
                            <span className="font-medium text-lg">₦{newTotalAmount.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button onClick={handleSaveChanges} disabled={isSaving || isFormInvalid} size="lg">
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
