
'use client';

import { useCart } from '@/hooks/use-cart';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

export default function CheckoutPage() {
    const { items, total } = useCart();
    const router = useRouter();
    const [shouldSaveInfo, setShouldSaveInfo] = useState(true);

    useEffect(() => {
        const savedDetails = localStorage.getItem('don_maris_shipping_details');
        if (savedDetails) {
            const details = JSON.parse(savedDetails);
            const form = document.getElementById('checkout-form') as HTMLFormElement;
            if (form) {
                (form.elements.namedItem('name') as HTMLInputElement).value = `${details.firstName} ${details.lastName}`;
                (form.elements.namedItem('email') as HTMLInputElement).value = details.email;
                (form.elements.namedItem('phone') as HTMLInputElement).value = details.phone;
                (form.elements.namedItem('address') as HTMLInputElement).value = details.address;
                (form.elements.namedItem('city') as HTMLInputElement).value = details.city;
                (form.elements.namedItem('state') as HTMLInputElement).value = details.state;
                (form.elements.namedItem('zip') as HTMLInputElement).value = details.zip;
            }
        }
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const [firstName, ...lastNameParts] = (formData.get('name') as string).split(' ');
        const customerDetails = {
            firstName: firstName,
            lastName: lastNameParts.join(' '),
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            address: formData.get('address') as string,
            city: formData.get('city') as string,
            state: formData.get('state') as string,
            zip: formData.get('zip') as string,
        };

        if (shouldSaveInfo) {
            localStorage.setItem('don_maris_shipping_details', JSON.stringify(customerDetails));
        } else {
            localStorage.removeItem('don_maris_shipping_details');
        }

        const orderDetails = {
            items,
            total,
            customer: customerDetails,
        };
        
        sessionStorage.setItem('don_maris_shipping', JSON.stringify(orderDetails));
        
        router.push('/payment');
    };

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold font-headline mb-4">Your Cart is Empty</h1>
                <p className="text-muted-foreground mb-6">You need to add items to your cart before you can check out.</p>
                <Button asChild>
                    <Link href="/products">Start Shopping</Link>
                </Button>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold font-headline mb-8 text-center">Checkout - Step 1 of 2</h1>
            <form id="checkout-form" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">Shipping Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" name="name" placeholder="John Doe" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" name="email" type="email" placeholder="john.doe@example.com" required />
                                    </div>
                                     <div className="sm:col-span-2 space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input id="phone" name="phone" type="tel" placeholder="+1234567890" required />
                                    </div>
                                    <div className="sm:col-span-2 space-y-2">
                                        <Label htmlFor="address">Street Address</Label>
                                        <Input id="address" name="address" placeholder="123 Tech Lane" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" name="city" placeholder="Techville" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State / Province</Label>
                                        <Input id="state" name="state" placeholder="California" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="zip">ZIP / Postal Code</Label>
                                        <Input id="zip" name="zip" placeholder="90210" required />
                                    </div>
                                    <div className="sm:col-span-2 flex items-center space-x-2 mt-4">
                                        <Checkbox 
                                            id="save-info" 
                                            checked={shouldSaveInfo}
                                            onCheckedChange={(checked) => setShouldSaveInfo(Boolean(checked))}
                                        />
                                        <Label htmlFor="save-info" className="cursor-pointer">
                                            Save my information for a faster checkout
                                        </Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {items.map(item => (
                                    <div key={item.id} className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <Image src={item.product.image} alt={item.product.name} width={48} height={48} className="rounded-md" />
                                            <div>
                                                <p className="font-medium">{item.product.name}</p>
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                                <Separator />
                                <div className="flex justify-between">
                                    <p className="text-muted-foreground">Subtotal</p>
                                    <p className="font-medium">${total.toFixed(2)}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-muted-foreground">Shipping</p>
                                    <p className="font-medium">Free</p>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-xl">
                                    <p>Total</p>
                                    <p>${total.toFixed(2)}</p>
                                </div>
                            </CardContent>
                        </Card>
                         <div className="mt-6">
                            <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                                Continue to Payment
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
