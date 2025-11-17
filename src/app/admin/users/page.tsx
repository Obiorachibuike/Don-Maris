
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, LogOut } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useSession } from "@/contexts/SessionProvider";

export default function UsersPage() {
    const { user: currentUser } = useSession();
    const { users, isLoading, fetchUsers, updateUser, deleteUser } = useUserStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);
    const [userToLogout, setUserToLogout] = useState<User | null>(null);
    
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'accountant';

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

    const handleDelete = (user: User) => {
        setUserToDelete(user);
    };
    
    const handleLogoutUser = (user: User) => {
        setUserToLogout(user);
    };

    const confirmDeactivate = async () => {
        if (userToDeactivate) {
            await updateUser(userToDeactivate._id, { status: 'inactive' });
            toast({
                title: "User Deactivated",
                description: `${userToDeactivate.name} has been deactivated.`,
            });
            setUserToDeactivate(null);
        }
    };
    
    const confirmDelete = async () => {
        if (userToDelete) {
            await deleteUser(userToDelete._id);
            toast({
                title: "User Deleted",
                description: `${userToDelete.name} has been permanently deleted.`,
            });
            setUserToDelete(null);
        }
    };
    
     const confirmLogout = async () => {
        if (userToLogout) {
            await updateUser(userToLogout._id, { forceLogoutBefore: new Date(Date.now() + 5000) });
            toast({
                title: "User Logout Initiated",
                description: `${userToLogout.name} will be logged out shortly.`,
            });
            setUserToLogout(null);
        }
    };

    const filteredUsers = users.filter(user => 
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())) &&
        user.status !== 'inactive'
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
                                {canEdit && <AddUserForm />}
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
                                    {canEdit && <TableHead><span className="sr-only">Actions</span></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? <TableSkeleton /> : filteredUsers.map(user => (
                                    <TableRow key={user._id} className={cn(user.status === 'inactive' && 'opacity-50')}>
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
                                        {canEdit && (
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
                                                        <DropdownMenuSeparator />
                                                        {user.role !== 'customer' && user.role !== 'admin' && (
                                                            <DropdownMenuItem onSelect={() => handleLogoutUser(user)}>
                                                                <LogOut className="mr-2 h-4 w-4" />
                                                                Force Logout
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem onSelect={() => handleDeactivate(user)}>Deactivate User</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-500" onSelect={() => handleDelete(user)}>Permanently Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        )}
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
                        <AlertDialogTitle>Deactivate {userToDeactivate?.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will prevent the user from logging in. Their data will be preserved. You can reactivate them later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUserToDeactivate(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeactivate} className="bg-destructive hover:bg-destructive/90">
                            Yes, deactivate
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={!!userToDelete} onOpenChange={(isOpen) => !isOpen && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Permanently delete {userToDelete?.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                           This action is irreversible and will permanently delete the user and all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                            Yes, permanently delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
             <AlertDialog open={!!userToLogout} onOpenChange={(isOpen) => !isOpen && setUserToLogout(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Force logout for {userToLogout?.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will log the user out of their current session. They will be able to log back in.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUserToLogout(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmLogout}>
                            Yes, force logout
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
