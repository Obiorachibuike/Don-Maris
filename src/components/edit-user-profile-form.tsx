
'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, Trash2 } from 'lucide-react';
import type { User } from '@/lib/types';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  age: z.coerce.number().int().min(0, 'Age cannot be negative.').optional(),
  avatar: z.string().optional(),
});

type UserProfileFormValues = z.infer<typeof formSchema>;

interface EditUserProfileFormProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    user: User;
    onUserUpdate: () => void;
}

export function EditUserProfileForm({ isOpen, setIsOpen, user, onUserUpdate }: EditUserProfileFormProps) {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(user.avatar);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm<UserProfileFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user.name,
            email: user.email,
            age: user.age,
            avatar: user.avatar,
        },
    });
    
    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name,
                email: user.email,
                age: user.age,
                avatar: user.avatar,
            });
            setImagePreview(user.avatar);
        }
    }, [user, form]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                form.setValue('avatar', result, { shouldValidate: true });
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: UserProfileFormValues) => {
        try {
            const response = await axios.put(`/api/users/${user._id}`, data);
            if (response.status === 200) {
                toast({
                    title: "Profile Updated",
                    description: "Your profile has been successfully updated.",
                });
                onUserUpdate();
                setIsOpen(false);
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: error.response?.data?.error || 'An unexpected error occurred.',
            });
        }
    };
    
    const handleDeleteUser = async () => {
        setIsDeleting(true);
        try {
            await axios.delete(`/api/users/${user._id}`);
            toast({
                title: 'Account Deleted',
                description: 'Your account has been permanently deleted.',
            });
            // You might want to log the user out and redirect here.
            // For now, we'll just close the modals.
            setIsOpen(false);
            setIsDeleteDialogOpen(false);
            // This would typically be a logout and redirect
            window.location.href = '/'; 
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: error.response?.data?.error || 'Could not delete your account.',
            });
        } finally {
            setIsDeleting(false);
        }
    };

  return (
    <>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                    Make changes to your profile here. Click save when you're done.
                </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                             <Label>Profile Picture</Label>
                             <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={imagePreview || ''} alt={user.name} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    accept="image/*"
                                    className="hidden" 
                                    id="avatar-upload"
                                />
                                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="mr-2 h-4 w-4" /> Change
                                </Button>
                             </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="your@email.com" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Age</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="Your age" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="pt-4 flex-col-reverse sm:flex-row sm:justify-between w-full">
                            <Button type="button" variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                            </Button>
                            <div className="flex gap-2">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
        
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    onClick={handleDeleteUser}
                    disabled={isDeleting}
                    className="bg-destructive hover:bg-destructive/90"
                >
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Yes, delete my account
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
