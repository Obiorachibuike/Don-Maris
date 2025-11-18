
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Order, OrderPaymentStatus, User } from '@/lib/types';
import { useUserStore } from '@/store/user-store';
import { useToast } from '@/hooks/use-toast';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { Checkbox } from './ui/checkbox';

interface UpdatePaymentDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  order: Order;
  currentUser: User;
  onOrderUpdate: () => void;
}

const formSchema = z.object({
  amountPaid: z.coerce.number().min(0, "Amount paid cannot be negative."),
  paymentCompleted: z.boolean().default(false),
});

type PaymentFormValues = z.infer<typeof formSchema>;

export function UpdatePaymentDialog({ isOpen, setIsOpen, order, currentUser, onOrderUpdate }: UpdatePaymentDialogProps) {
  const { toast } = useToast();
  const { updateUser: updateUserInStore } = useUserStore();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amountPaid: order.amountPaid,
      paymentCompleted: order.paymentStatus === 'Paid',
    },
  });

  const paymentCompleted = form.watch('paymentCompleted');
  const amountPaidValue = form.watch('amountPaid');
  
  useEffect(() => {
    form.reset({
        amountPaid: order.amountPaid,
        paymentCompleted: order.paymentStatus === 'Paid',
    });
  }, [order, form, isOpen]);

  useEffect(() => {
    if (paymentCompleted) {
        form.setValue('amountPaid', order.amount);
    }
  }, [paymentCompleted, form, order.amount]);


  const onSubmit = async (data: PaymentFormValues) => {
    const originalAmountPaid = order.amountPaid;
    const paymentDifference = data.amountPaid - originalAmountPaid;
    
    let newPaymentStatus: OrderPaymentStatus;
    if (data.paymentCompleted) {
        newPaymentStatus = 'Paid';
    } else if (data.amountPaid <= 0) {
        newPaymentStatus = 'Not Paid';
    } else if (data.amountPaid < order.amount) {
        newPaymentStatus = 'Incomplete';
    } else {
        newPaymentStatus = 'Paid';
    }
    
    try {
        const customerResponse = await axios.get(`/api/users/${order.customer.id}`);
        const originalLedgerBalance = customerResponse.data.ledgerBalance || 0;
        
        const newLedgerBalance = originalLedgerBalance - paymentDifference;
        
        // 1. Update the order
        const orderUpdatePromise = axios.put(`/api/orders/${order.id}`, {
            amountPaid: data.amountPaid,
            paymentStatus: newPaymentStatus,
        });

        // 2. Update the customer's ledger balance
        const userUpdatePromise = updateUserInStore(order.customer.id, {
            ledgerBalance: newLedgerBalance,
        });

        await Promise.all([orderUpdatePromise, userUpdatePromise]);

      toast({
        title: 'Payment Updated',
        description: `Payment for order #${order.id} has been updated.`,
      });
      onOrderUpdate();
      setIsOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update payment details. Please try again.',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Payment for Order #{order.id}</DialogTitle>
          <DialogDescription>
            Adjust the amount paid for this order. This will affect the customer's ledger balance.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">Total Order Amount</label>
                    <Input value={`₦${order.amount.toLocaleString()}`} disabled />
                </div>
                 <div>
                    <label className="text-sm font-medium">Current Balance Due</label>
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
                        <DialogDescription>
                           Check this if the full order amount has been paid.
                        </DialogDescription>
                    </div>
                    </FormItem>
                )}
            />
             <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Payment
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
