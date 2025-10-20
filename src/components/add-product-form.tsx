
'use client';

import { useState, useRef, useEffect } from 'react';
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
  DialogTrigger,
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
import { PlusCircle, Loader2, Upload, Trash2 } from 'lucide-react';
import { ProductType, Brand } from '@/lib/types';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { ScrollArea } from './ui/scroll-area';
import { useBrandStore } from '@/store/brand-store';

const productTypes: ProductType[] = ['Power Flex', 'Charging Flex', 'Screen', 'Backglass', 'Glass', 'Tools', 'Machine'];

const formSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters long.'),
  brand: z.string().min(1, 'Brand is required.'),
  type: z.enum(productTypes, { required_error: 'Please select a product type.' }),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0.'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  longDescription: z.string().min(20, 'Long description must be at least 20 characters long.'),
  images: z.array(z.string().url('Invalid URL or data URI')).min(1, "At least one image is required.").max(5, "You can add a maximum of 5 images."),
  data_ai_hint: z.string().min(1, 'AI hint is required.'),
  isFeatured: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof formSchema>;

export function AddProductForm() {
  const [isOpen, setIsOpen] = useState(false);
  const { addProduct } = useProductStore();
  const { brands, fetchBrands } = useBrandStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        fetchBrands();
    }
  }, [isOpen, fetchBrands]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      brand: '',
      price: 0,
      stock: 0,
      description: '',
      longDescription: '',
      images: [],
      data_ai_hint: '',
      isFeatured: false,
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "images"
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files).slice(0, 5);
      const dataUris: string[] = [];

      if (fileArray.length > 5) {
        toast({
          variant: "destructive",
          title: "Too many files",
          description: "You can only upload a maximum of 5 images.",
        });
        return;
      }
      
      let filesProcessed = 0;
      fileArray.forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
              dataUris.push(reader.result as string);
              filesProcessed++;
              if (filesProcessed === fileArray.length) {
                  form.setValue('images', dataUris, { shouldValidate: true });
              }
          };
          reader.readAsDataURL(file);
      });
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    await addProduct(data);
    toast({
      title: 'Product Added',
      description: `The product "${data.name}" has been successfully added.`,
    });
    form.reset();
    setIsOpen(false);
  };
  
  const currentImages = form.watch('images');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
            form.reset();
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a brand" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {brands.map(brand => (
                                <SelectItem key={brand.id} value={brand.name}>{brand.name}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
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
                <Label>Product Images</Label>
                <FormControl>
                    <Input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        multiple 
                        accept="image/*"
                        className="hidden" 
                        id="image-upload"
                    />
                </FormControl>
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Select up to 5 Images
                </Button>
                
                {currentImages && currentImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {currentImages.map((imgSrc, index) => (
                      <div key={index} className="relative aspect-square">
                        <Image src={imgSrc} alt={`Preview ${index + 1}`} layout="fill" className="rounded-md object-cover" />
                      </div>
                    ))}
                  </div>
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
            Add Product
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
