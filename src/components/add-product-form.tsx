
'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
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
  DialogTrigger,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Loader2, Upload } from 'lucide-react';
import { ProductType } from '@/lib/types';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { ScrollArea } from './ui/scroll-area';

const productTypes: ProductType[] = ['Power Flex', 'Charging Flex', 'Screen', 'Backglass', 'Glass', 'Tools'];

const formSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters long.'),
  brand: z.string().min(2, 'Brand name must be at least 2 characters long.'),
  type: z.enum(productTypes, { required_error: 'Please select a product type.' }),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0.'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  longDescription: z.string().min(20, 'Long description must be at least 20 characters long.'),
  image: z.string().min(1, 'Image URL or upload is required.'),
  data_ai_hint: z.string().min(1, 'AI hint is required.'),
  isFeatured: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof formSchema>;

export function AddProductForm() {
  const [isOpen, setIsOpen] = useState(false);
  const { addProduct } = useProductStore();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>('https://placehold.co/600x600.png');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      brand: '',
      price: 0,
      stock: 0,
      description: '',
      longDescription: '',
      image: 'https://placehold.co/600x600.png',
      data_ai_hint: '',
      isFeatured: false,
    },
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        form.setValue('image', dataUri);
        setImagePreview(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    await addProduct(data);
    toast({
      title: 'Product Added',
      description: `The product "${data.name}" has been successfully added.`,
    });
    form.reset();
    setImagePreview('https://placehold.co/600x600.png');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
            form.reset();
            setImagePreview('https://placehold.co/600x600.png');
        }
    }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new product to your store catalog.
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
                  <Label>Product Image</Label>
                  <div className="aspect-square w-full rounded-md border border-dashed flex items-center justify-center overflow-hidden">
                      {imagePreview && <Image src={imagePreview} alt="Product preview" width={200} height={200} className="object-contain" />}
                  </div>
                  <Tabs defaultValue="url" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="url">URL</TabsTrigger>
                          <TabsTrigger value="upload">Upload</TabsTrigger>
                      </TabsList>
                      <TabsContent value="url">
                           <FormField
                              control={form.control}
                              name="image"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel className="sr-only">Image URL</FormLabel>
                                  <FormControl>
                                      <Input 
                                          placeholder="https://..." {...field}
                                          onChange={(e) => {
                                              field.onChange(e);
                                              setImagePreview(e.target.value);
                                          }}
                                       />
                                  </FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                              />
                      </TabsContent>
                      <TabsContent value="upload">
                          <Input
                              type="file"
                              accept="image/*"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              className="hidden"
                              />
                          <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                             <Upload className="mr-2 h-4 w-4" /> Choose File
                          </Button>
                      </TabsContent>
                  </Tabs>
                  <FormField name="image" render={() => <FormMessage />} />
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
            Add Product
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
