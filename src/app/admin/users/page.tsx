
'use client';

import { useState, useEffect } from "react";
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
import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useUserStore } from "@/store/user-store";
import type { User } from "@/lib/types";
import { EditUserForm } from "@/components/edit-user-form";
import { ChangeRoleDialog } from "@/components/change-role-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AddUserForm } from "@/components/add-user-form";

export default function UsersPage() {
    const { users, isLoading, fetchUsers, deleteUser } = useUserStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);
    
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleChangeRole = (user: User) => {
        setSelectedUser(user);
        setIsRoleModalOpen(true);
    };

    const handleDeactivate = (user: User) => {
        setUserToDeactivate(user);
    };

    const confirmDeactivate = async () => {
        if (userToDeactivate) {
            await deleteUser(userToDeactivate._id);
            toast({
                title: "User Deactivated",
                description: `${userToDeactivate.name} has been removed from the system.`,
            });
            setUserToDeactivate(null);
        }
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const TableSkeleton = () => (
        [...Array(5)].map((_, i) => (
            <TableRow key={i}>
                <TableCell className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
            </TableRow>
        ))
    );

    return (
        <>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Manage All Users</CardTitle>
                                <CardDescription>View and manage all system users, including customers and employees.</CardDescription>
                            </div>
                            <div className="flex items-center gap-4">
                                <Input 
                                    placeholder="Search users..." 
                                    className="w-full max-w-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <AddUserForm />
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
                                {isLoading ? <TableSkeleton /> : filteredUsers.map(user => (
                                    <TableRow key={user._id}>
                                        <TableCell className="font-medium">
                                            <Link href={`/admin/users/${user._id}`} className="flex items-center gap-3 group">
                                                <Avatar>
                                                    <AvatarImage src={(user as any).avatar} alt={user.name} />
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
                                                        <Link href={`/admin/users/${user._id}`}>View Details</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => handleEdit(user)}>Edit User</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => handleChangeRole(user)}>Change Role</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-500" onSelect={() => handleDeactivate(user)}>Deactivate User</DropdownMenuItem>
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
            {selectedUser && (
                <>
                    <EditUserForm
                        isOpen={isEditModalOpen}
                        setIsOpen={setIsEditModalOpen}
                        user={selectedUser}
                    />
                    <ChangeRoleDialog
                        isOpen={isRoleModalOpen}
                        setIsOpen={setIsRoleModalOpen}
                        user={selectedUser}
                    />
                </>
            )}
            <AlertDialog open={!!userToDeactivate} onOpenChange={(isOpen) => !isOpen && setUserToDeactivate(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will deactivate the user "{userToDeactivate?.name}". This action can be reversed by an administrator, but the user will lose access immediately.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUserToDeactivate(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeactivate} className="bg-destructive hover:bg-destructive/90">
                            Yes, deactivate user
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
