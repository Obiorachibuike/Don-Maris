
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Order, OrderItem, Product } from '@/lib/types';
import { useProductStore } from '@/store/product-store';
import { updateOrder } from '@/lib/dummy-orders';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, PlusCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditOrderFormProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    order: Order;
    onOrderUpdate: (updatedOrder: Order) => void;
}

type EditableOrderItem = OrderItem & { product: Product };

export function EditOrderForm({ isOpen, setIsOpen, order, onOrderUpdate }: EditOrderFormProps) {
    const { products, fetchProducts } = useProductStore();
    const [editableItems, setEditableItems] = useState<EditableOrderItem[]>([]);
    const [productToAdd, setProductToAdd] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    
    useEffect(() => {
        if (products.length === 0) {
            fetchProducts();
        }
    }, [products, fetchProducts]);

    useEffect(() => {
        if (order && products.length > 0) {
            const itemsWithProductData = order.items.map(item => {
                const product = products.find(p => p.id === item.productId);
                return { ...item, product: product! };
            }).filter(item => item.product);
            setEditableItems(itemsWithProductData);
        }
    }, [order, products]);

    const handleQuantityChange = (productId: string, newQuantity: number) => {
        const quantity = Math.max(0, newQuantity);
        setEditableItems(currentItems => 
            currentItems.map(item => 
                item.productId === productId ? { ...item, quantity } : item
            ).filter(item => item.quantity > 0) // Remove if quantity is 0
        );
    };

    const handleRemoveItem = (productId: string) => {
        setEditableItems(currentItems => currentItems.filter(item => item.productId !== productId));
    };

    const handleAddProduct = () => {
        if (!productToAdd) return;
        
        const product = products.find(p => p.id === productToAdd);
        if (!product) return;

        // Check if product is already in the order
        if (editableItems.some(item => item.productId === product.id)) {
            // If it is, just increase the quantity
            handleQuantityChange(product.id, (editableItems.find(item => item.productId === product.id)?.quantity || 0) + 1);
        } else {
            // Otherwise, add it as a new item
            setEditableItems(currentItems => [...currentItems, { productId: product.id, quantity: 1, product }]);
        }
        setProductToAdd(null);
    };

    const availableProducts = useMemo(() => {
        const orderedProductIds = editableItems.map(item => item.productId);
        return products.filter(p => !orderedProductIds.includes(p.id));
    }, [products, editableItems]);

    const handleSaveChanges = () => {
        setIsSaving(true);
        const newTotal = editableItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
        const updatedOrderItems = editableItems.map(({ productId, quantity }) => ({ productId, quantity }));
        
        const updatedOrder = updateOrder(order.id, updatedOrderItems, newTotal);

        if (updatedOrder) {
            onOrderUpdate(updatedOrder);
            toast({
                title: "Order Updated",
                description: `Order #${order.id} has been successfully updated.`,
            });
        } else {
            toast({
                variant: 'destructive',
                title: "Update Failed",
                description: `Could not update order #${order.id}.`,
            });
        }
        
        setIsSaving(false);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Edit Order #{order.id}</DialogTitle>
                    <DialogDescription>
                        Modify quantities, add, or remove products for this order. Click "Save Changes" when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <ScrollArea className="h-72">
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
                                            <Image src={item.product.image} alt={item.product.name} width={32} height={32} className="rounded-sm" />
                                            {item.product.name}
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                type="number" 
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value, 10))}
                                                className="w-20"
                                                min={1}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">${item.product.price.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">${(item.product.price * item.quantity).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.productId)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                    <div className="flex items-center gap-2 pt-4 border-t">
                        <Select onValueChange={setProductToAdd} value={productToAdd || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a product to add" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableProducts.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleAddProduct} disabled={!productToAdd}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSaveChanges} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
