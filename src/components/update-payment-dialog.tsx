
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

interface UpdatePaymentDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  order: Order;
  currentUser: User;
  onOrderUpdate: () => void;
}

const paymentStatuses: OrderPaymentStatus[] = ['Not Paid', 'Incomplete', 'Paid'];

const formSchema = z.object({
  amountPaid: z.coerce.number().min(0, "Amount paid cannot be negative."),
  paymentStatus: z.enum(paymentStatuses as [string, ...string[]], { required_error: 'Please select a status.' }),
});

type PaymentFormValues = z.infer<typeof formSchema>;

export function UpdatePaymentDialog({ isOpen, setIsOpen, order, currentUser, onOrderUpdate }: UpdatePaymentDialogProps) {
  const { toast } = useToast();
  const { updateUser: updateUserInStore } = useUserStore();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amountPaid: order.amountPaid,
      paymentStatus: order.paymentStatus,
    },
  });
  
  useEffect(() => {
    form.reset({
        amountPaid: order.amountPaid,
        paymentStatus: order.paymentStatus,
    })
  }, [order, form]);

  const onSubmit = async (data: PaymentFormValues) => {
    const originalAmountPaid = order.amountPaid;
    const paymentDifference = data.amountPaid - originalAmountPaid;
    
    const originalLedgerBalance = (await axios.get(`/api/users/${order.customer.id}`)).data.ledgerBalance || 0;
    
    // If the new payment is more, the ledger balance should decrease by the difference.
    // If the new payment is less (e.g. a correction), the ledger balance should increase.
    const newLedgerBalance = originalLedgerBalance - paymentDifference;
    
    try {
        // 1. Update the order
        const orderUpdatePromise = axios.put(`/api/orders/${order.id}`, {
            amountPaid: data.amountPaid,
            paymentStatus: data.paymentStatus,
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
            Adjust the amount paid and the payment status for this order. This will affect the customer's ledger balance.
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
                    <Input value={`₦${(order.amount - order.amountPaid).toLocaleString()}`} disabled className="text-destructive font-bold" />
                </div>
             </div>
            <FormField
              control={form.control}
              name="amountPaid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Total Amount Paid</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentStatuses.map(status => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
