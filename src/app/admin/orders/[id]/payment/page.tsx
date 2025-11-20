
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Order, OrderPaymentStatus, User } from '@/lib/types';
import { useUserStore } from '@/store/user-store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useParams, useRouter } from 'next/navigation';
import { useOrderStore } from '@/store/order-store';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useSession } from '@/contexts/SessionProvider';

const formSchema = z.object({
  amountPaid: z.coerce.number().min(0, "Amount paid cannot be negative."),
  paymentCompleted: z.boolean().default(false),
});

type PaymentFormValues = z.infer<typeof formSchema>;

export default function UpdatePaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const { toast } = useToast();
  const { user: currentUser, isLoading: isSessionLoading } = useSession();
  const { getOrderById, updateOrder, isLoading: isOrderLoading } = useOrderStore();
  const { updateUser: updateUserInStore } = useUserStore();
  
  const order = useMemo(() => getOrderById(orderId), [getOrderById, orderId]);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amountPaid: 0,
      paymentCompleted: false,
    },
  });

  const paymentCompleted = form.watch('paymentCompleted');
  const amountPaidValue = form.watch('amountPaid');
  
  useEffect(() => {
    if(order) {
        form.reset({
            amountPaid: order.amountPaid,
            paymentCompleted: order.paymentStatus === 'Paid',
        });
    }
  }, [order, form]);

  useEffect(() => {
    if (paymentCompleted && order) {
        form.setValue('amountPaid', order.amount);
    }
  }, [paymentCompleted, form, order]);

  const onSubmit = async (data: PaymentFormValues) => {
    if (!order) return;

    const originalAmountPaid = order.amountPaid;
    const paymentDifference = data.amountPaid - originalAmountPaid;
    
    let newPaymentStatus: OrderPaymentStatus;
    if (data.paymentCompleted || data.amountPaid >= order.amount) {
        newPaymentStatus = 'Paid';
    } else if (data.amountPaid <= 0) {
        newPaymentStatus = 'Not Paid';
    } else {
        newPaymentStatus = 'Incomplete';
    }
    
    try {
      // We don't need to fetch the user if we can just update their ledger
      // This reduces dependency on the user store being up-to-date
      const userToUpdate = await fetch(`/api/users/${order.customer.id}`).then(res => res.json());
      const originalLedgerBalance = userToUpdate.ledgerBalance || 0;
      const newLedgerBalance = originalLedgerBalance - paymentDifference;
        
      const orderUpdatePromise = updateOrder(order.id, {
          amountPaid: data.amountPaid,
          paymentStatus: newPaymentStatus,
      });

      const userUpdatePromise = updateUserInStore(order.customer.id, {
          ledgerBalance: newLedgerBalance,
      });

      await Promise.all([orderUpdatePromise, userUpdatePromise]);

      toast({
        title: 'Payment Updated',
        description: `Payment for order #${order.id} has been updated.`,
      });
      router.push(`/admin/orders/${order.id}`);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update payment details. Please try again.',
      });
    }
  };

   if (isOrderLoading || isSessionLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Skeleton className="h-10 w-1/3 mb-6" />
                <Card>
                    <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-1/4" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!order) {
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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
         <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold">Update Payment</h1>
                <p className="text-muted-foreground">Order ID: {order.id}</p>
            </div>
            <Button asChild variant="outline">
                <Link href={`/admin/orders/${order.id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
                </Link>
            </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Order #{order.id}</CardTitle>
                <CardDescription>
                    Adjust the amount paid for this order. This will affect the customer's ledger balance.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium">Total Order Amount</Label>
                            <Input value={`₦${order.amount.toLocaleString()}`} disabled />
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Current Balance Due</Label>
                            <Input value={`₦${(order.amount - amountPaidValue).toLocaleString()}`} disabled className="text-destructive font-bold" />
                        </div>
                    </div>
                    <FormField
                    control={form.control}
                    name="amountPaid"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Amount Paid</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" {...field} disabled={paymentCompleted} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                        control={form.control}
                        name="paymentCompleted"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    Payment Completed
                                </FormLabel>
                                <CardDescription>
                                Check this if the full order amount has been paid.
                                </CardDescription>
                            </div>
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={form.formState.isSubmitting} size="lg">
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Payment
                        </Button>
                    </div>
                </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
