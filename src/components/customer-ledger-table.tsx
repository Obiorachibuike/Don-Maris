
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { User } from '@/lib/types';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Loader2, ArrowUpDown } from 'lucide-react';
import { useUserStore } from '@/store/user-store';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

type SortKey = keyof User | 'lifetimeValue' | 'ledgerBalance';

export function CustomerLedgerTable() {
    const { users: allUsers, isLoading, fetchUsers } = useUserStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: SortKey | null; direction: 'ascending' | 'descending' | null }>({ key: null, direction: null });
    const usersPerPage = 10;
    
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const customers = useMemo(() => allUsers.filter(u => u.role === 'customer'), [allUsers]);

    const filteredCustomers = useMemo(() => {
        if (!searchTerm) return customers;
        return customers.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [customers, searchTerm]);

    const requestSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' | null = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
            direction = null;
            key = null;
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const sortedCustomers = useMemo(() => {
        let sortableItems = [...filteredCustomers];
        if (sortConfig.key && sortConfig.direction) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key!] ?? 0;
                const bValue = b[sortConfig.key!] ?? 0;
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredCustomers, sortConfig]);

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = sortedCustomers.slice(indexOfFirstUser, indexOfLastUser);

    const totalPages = Math.ceil(sortedCustomers.length / usersPerPage);

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };
    
    const SortableHeader = ({ sortKey, label, className }: { sortKey: SortKey, label: string, className?: string }) => (
        <TableHead className={className}>
            <Button variant="ghost" onClick={() => requestSort(sortKey)} className="px-0">
                {label}
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </TableHead>
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <CardTitle>Customer Ledgers</CardTitle>
                        <CardDescription>
                            View customer financial summaries.
                        </CardDescription>
                    </div>
                    <Input 
                        placeholder="Search customers..." 
                        className="w-full md:max-w-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="w-full overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <SortableHeader sortKey="lifetimeValue" label="Lifetime Value" className="text-right" />
                                <SortableHeader sortKey="ledgerBalance" label="Ledger Balance" className="text-right" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : currentUsers.length > 0 ? (
                                currentUsers.map((user) => (
                                <TableRow key={user._id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/admin/users/${user._id}`} className="flex items-center gap-3 group">
                                            <Avatar>
                                                <AvatarImage src={user.avatar} alt={user.name} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="group-hover:underline">{user.name}</p>
                                                <p className="text-sm text-muted-foreground group-hover:underline">{user.email}</p>
                                            </div>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-right">₦{(user.lifetimeValue || 0).toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-medium text-destructive">₦{(user.ledgerBalance || 0).toLocaleString()}</TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                        No customers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter>
                <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {Math.min(indexOfFirstUser + 1, sortedCustomers.length)} to {Math.min(indexOfLastUser, sortedCustomers.length)} of {sortedCustomers.length} customers.
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
