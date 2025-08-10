
'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UsersPage() {
    
    const allUsers = [
        { id: 'USR001', name: 'Alex Maris', email: 'alex@donmaris.com', role: 'admin', dateJoined: '2023-01-15', avatar: 'https://placehold.co/100x100.png' },
        { id: 'USR002', name: 'Jessica Lane', email: 'jessica@donmaris.com', role: 'supplier', dateJoined: '2023-02-20', avatar: 'https://placehold.co/100x100.png' },
        { id: 'USR003', name: 'David Chen', email: 'david@donmaris.com', role: 'sales', dateJoined: '2023-03-10', avatar: 'https://placehold.co/100x100.png' },
        { id: 'USR004', name: 'Maria Rodriguez', email: 'maria@donmaris.com', role: 'accountant', dateJoined: '2023-04-05', avatar: 'https://placehold.co/100x100.png' },
        { id: 'USR005', name: 'John Smith', email: 'john@donmaris.com', role: 'sales', dateJoined: '2023-05-12', avatar: 'https://placehold.co/100x100.png' },
    ];
    
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = allUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Manage Users</CardTitle>
                            <CardDescription>Add, edit, and manage system users and their roles.</CardDescription>
                        </div>
                         <div className="flex items-center gap-4">
                            <Input 
                                placeholder="Search users..." 
                                className="w-full max-w-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add User
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Date Joined</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={user.avatar} alt={user.name} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p>{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                                    </TableCell>
                                    <TableCell>{user.dateJoined}</TableCell>
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
                                                <DropdownMenuItem>Edit User</DropdownMenuItem>
                                                <DropdownMenuItem>Change Role</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-500">Deactivate User</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
