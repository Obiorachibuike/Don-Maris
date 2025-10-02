
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
import { getAllUsers } from "@/lib/dummy-users";
import Link from "next/link";

export default function EmployeesPage() {
    
    const allUsers = getAllUsers();
    const employees = allUsers.filter(user => user.role !== 'customer');
    
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEmployees = employees.filter(user => 
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
                            <CardTitle>Manage Employees</CardTitle>
                            <CardDescription>Add, edit, and manage employee accounts and their roles.</CardDescription>
                        </div>
                         <div className="flex items-center gap-4">
                            <Input 
                                placeholder="Search employees..." 
                                className="w-full max-w-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Employee
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Date Joined</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEmployees.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3 group">
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
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                                    </TableCell>
                                    <TableCell>{new Date(user.dateJoined).toLocaleDateString()}</TableCell>
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
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/users/${user.id}`}>View Details</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>Edit Employee</DropdownMenuItem>
                                                <DropdownMenuItem>Change Role</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-500">Deactivate Employee</DropdownMenuItem>
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
