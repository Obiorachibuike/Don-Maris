
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProductStore } from '@/store/product-store';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Product, ProductType } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { ScrollArea } from './ui/scroll-area';
import Image from 'next/image';

const productTypes: ProductType[] = ['Power Flex', 'Charging Flex', 'Screen', 'Backglass', 'Glass', 'Tools'];

const formSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters long.'),
  brand: z.string().min(2, 'Brand name must be at least 2 characters long.'),
  type: z.enum(productTypes, { required_error: 'Please select a product type.' }),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0.'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  longDescription: z.string().min(20, 'Long description must be at least 20 characters long.'),
  images: z.array(z.string().url('Please enter a valid URL.')).min(1, "At least one image is required.").max(5, "You can add a maximum of 5 images."),
  data_ai_hint: z.string().min(1, 'AI hint is required.'),
  isFeatured: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface EditProductFormProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    product: Product;
}

export function EditProductForm({ isOpen, setIsOpen, product }: EditProductFormProps) {
  const { editProduct } = useProductStore();
  const { toast } = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...product,
      images: product.images,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "images"
  });

  useEffect(() => {
    form.reset({
      ...product,
      images: product.images,
    });
  }, [product, form, isOpen]);

  const onSubmit = async (data: ProductFormValues) => {
    const submissionData = {
        ...data,
        images: data.images
    };
    await editProduct(product.id, submissionData);
    toast({
      title: 'Product Updated',
      description: `The product "${data.name}" has been successfully updated.`,
    });
    setIsOpen(false);
  };
  
  const currentImages = form.watch('images');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update the details for "{product.name}".
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-2">
              
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                          <Input placeholder="e.g., iPhone 15 Pro Screen" {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
                  <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                          <Input placeholder="e.g., ScreenSavvy" {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
              </div>
              
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select a type" />
                              </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                              {productTypes.map(type => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                              </SelectContent>
                          </Select>
                          <FormMessage />
                          </FormItem>
                      )}
                      />
                  <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                              <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
                   <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Stock</FormLabel>
                          <FormControl>
                              <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
              </div>
              
              <div className="space-y-4">
                  <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                          <Textarea placeholder="A brief, catchy description for the product list." {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
                  <FormField
                  control={form.control}
                  name="longDescription"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Long Description</FormLabel>
                      <FormControl>
                          <Textarea rows={6} placeholder="A detailed description for the product page." {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
                   <FormField
                      control={form.control}
                      name="data_ai_hint"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>AI Image Hint</FormLabel>
                          <FormControl>
                              <Input placeholder="e.g., 'phone screen'" {...field} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                   />
                   <FormField
                    control={form.control}
                    name="isFeatured"
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
                            Feature this product on the homepage
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
              </div>

              <div className="space-y-4">
                <Label>Product Images (up to 5)</Label>
                {currentImages && currentImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                        {currentImages.map((imgSrc, index) => (
                        <div key={index} className="relative aspect-square">
                            <Image src={imgSrc} alt={`Preview ${index + 1}`} layout="fill" className="rounded-md object-cover" />
                        </div>
                        ))}
                    </div>
                )}
                <div className="space-y-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                            <Input
                                {...form.register(`images.${index}`)}
                                placeholder="https://..."
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                {fields.length < 5 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => append("")}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Image URL
                    </Button>
                )}
                <FormField name="images" render={() => <FormMessage />} />
              </div>
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter className="pt-6">
            <DialogClose asChild>
            <Button type="button" variant="outline">
                Cancel
            </Button>
            </DialogClose>
            <Button type="submit" disabled={form.formState.isSubmitting} onClick={form.handleSubmit(onSubmit)}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    