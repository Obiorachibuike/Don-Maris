
'use client';

import { useState, useEffect, useMemo } from "react";
import { useProductStore } from "@/store/product-store";
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
import { MoreHorizontal, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import Image from "next/image";
import { formatProductType } from "@/lib/display-utils";
import { AddProductForm } from "@/components/add-product-form";
import type { Product } from "@/lib/types";

type SortKey = keyof Product | null;

export default function ProductsAdminPage() {
    
    const { products, isLoading, fetchProducts } = useProductStore();
    
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' | null }>({ key: null, direction: null });
    const productsPerPage = 10;

    const filteredProducts = useMemo(() => products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatProductType(product.type).toLowerCase().includes(searchTerm.toLowerCase())
    ), [products, searchTerm]);

    const sortedProducts = useMemo(() => {
        const sortableItems = [...filteredProducts];
        if (sortConfig.key && sortConfig.direction) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key!];
                const bValue = b[sortConfig.key!];

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredProducts, sortConfig]);

    const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
    const indexOfLastOrder = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastOrder - productsPerPage;
    const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastOrder);

    const requestSort = (key: SortKey) => {
        if (!key) {
            setSortConfig({ key: null, direction: null });
            return;
        }

        let direction: 'ascending' | 'descending' | null = 'ascending';
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'ascending') {
                direction = 'descending';
            } else if (sortConfig.direction === 'descending') {
                direction = null; // Return to default
                key = null;
            }
        }
        setSortConfig({ key, direction });
    };

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const SortableHeader = ({ sortKey, label }: { sortKey: keyof Product, label: string }) => (
        <TableHead>
            <Button variant="ghost" onClick={() => requestSort(sortKey)}>
                {label}
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </TableHead>
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Manage Products</CardTitle>
                            <CardDescription>Add, edit, and manage all products in your store.</CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            <Input 
                                placeholder="Search products..." 
                                className="w-full max-w-sm"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // Reset to first page on new search
                                }}
                            />
                            <AddProductForm />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <SortableHeader sortKey="name" label="Name" />
                                <TableHead>Brand</TableHead>
                                <TableHead>Type</TableHead>
                                <SortableHeader sortKey="price" label="Price" />
                                <SortableHeader sortKey="stock" label="Stock" />
                                <SortableHeader sortKey="rating" label="Rating" />
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentProducts.map(product => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <Image src={product.image} alt={product.name} width={40} height={40} className="rounded-md object-cover" />
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{product.brand}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{formatProductType(product.type)}</Badge>
                                    </TableCell>
                                    <TableCell>${product.price.toFixed(2)}</TableCell>
                                    <TableCell>{product.stock}</TableCell>
                                    <TableCell>{product.rating.toFixed(1)}</TableCell>
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
                                                <DropdownMenuItem>Edit Product</DropdownMenuItem>
                                                <DropdownMenuItem>View on Storefront</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-500">Delete Product</DropdownMenuItem>
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
                            Showing {Math.min(indexOfFirstProduct + 1, sortedProducts.length)} to {Math.min(indexOfLastOrder, sortedProducts.length)} of {sortedProducts.length} products.
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
        </div>
    );
}
