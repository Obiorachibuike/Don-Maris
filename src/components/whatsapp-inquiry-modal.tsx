
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, MessageSquare } from 'lucide-react';
import type { Product } from '@/lib/types';
import Image from 'next/image';

const formSchema = z.object({
  phone: z.string().min(10, 'Please enter a valid phone number including country code.').max(15, 'Phone number is too long.'),
});

type WhatsAppFormValues = z.infer<typeof formSchema>;

interface WhatsAppInquiryModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  product: Product;
}

export function WhatsAppInquiryModal({ isOpen, setIsOpen, product }: WhatsAppInquiryModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<WhatsAppFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: '',
    },
  });

  const onSubmit = async (data: WhatsAppFormValues) => {
    setIsLoading(true);
    try {
      await axios.post('/api/whatsapp/send-price', {
        customerPhone: data.phone,
        productId: product.id,
      });

      toast({
        title: 'Price Sent!',
        description: 'Check your WhatsApp for the product details.',
      });
      setIsOpen(false);
      form.reset();

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Request Failed',
        description: error.response?.data?.error || 'Could not send price. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 relative flex-shrink-0">
                <Image src={product.images[0]} alt={product.name} fill className="object-cover rounded-md" />
            </div>
            <div>
              <DialogTitle>Get Price on WhatsApp</DialogTitle>
              <DialogDescription>
                Enter your WhatsApp number to receive the price for "{product.name}".
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2348012345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
                    Send Price
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
