
'use client';

import { useState, useRef } from 'react';
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
import { Loader2, Banknote, Upload, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import Image from 'next/image';

interface VirtualAccount {
    account_name: string;
    account_number: string;
    bank: {
        name: string;
    };
}

interface BankTransferModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  virtualAccount: VirtualAccount | null;
  total: number;
  onConfirmPayment: () => void;
}

export function BankTransferModal({ isOpen, setIsOpen, virtualAccount, total, onConfirmPayment }: BankTransferModalProps) {
    const [step, setStep] = useState(2);
    const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
    const [slipPreview, setSlipPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setPaymentSlip(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSlipPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!paymentSlip) {
            toast({
                variant: 'destructive',
                title: 'No file selected',
                description: 'Please select your payment slip to upload.',
            });
            return;
        }

        setIsUploading(true);
        // In a real app, you would upload the file to your server/storage here.
        // For this example, we'll simulate an upload and then confirm.
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setIsUploading(false);
        onConfirmPayment(); // This function will be passed from the parent to handle order completion.
        setIsOpen(false);
    };
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: 'Copied to clipboard!',
        });
    }

    const resetState = () => {
        setStep(2);
        setPaymentSlip(null);
        setSlipPreview(null);
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                resetState();
            }
            setIsOpen(open);
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Pay with Bank Transfer</DialogTitle>
                    <DialogDescription>
                        Follow the steps below to complete your payment.
                    </DialogDescription>
                </DialogHeader>

                {virtualAccount && step === 2 && (
                    <div className="space-y-4">
                        <Alert>
                            <Banknote className="h-4 w-4" />
                            <AlertTitle>Step 1: Transfer Payment</AlertTitle>
                            <AlertDescription>
                                <p>Please transfer the total amount to the account below. Your order will be processed upon confirmation.</p>
                                <div className="space-y-2 mt-4 bg-muted p-4 rounded-md">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Bank Name</p>
                                            <p className="font-semibold">{virtualAccount.bank.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Account Number</p>
                                            <p className="font-semibold text-lg">{virtualAccount.account_number}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(virtualAccount.account_number)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Account Name</p>
                                            <p className="font-semibold">{virtualAccount.account_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Amount</p>
                                            <p className="font-semibold text-lg">₦{total.toFixed(2)}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(total.toFixed(2))}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                        <Button className="w-full" onClick={() => setStep(3)}>
                            I Have Made Payment
                        </Button>
                    </div>
                )}
                
                {step === 3 && (
                    <div className="space-y-4">
                        <Alert>
                            <Upload className="h-4 w-4" />
                            <AlertTitle>Step 2: Upload Payment Slip</AlertTitle>
                            <AlertDescription>
                                Please upload a screenshot or photo of your payment confirmation.
                            </AlertDescription>
                        </Alert>

                        <div 
                            className="mt-2 flex justify-center rounded-lg border border-dashed border-input px-6 py-10 cursor-pointer hover:bg-muted/50"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="text-center">
                                {slipPreview ? (
                                    <Image src={slipPreview} alt="Payment slip preview" width={150} height={150} className="mx-auto rounded-md object-contain" />
                                ) : (
                                    <>
                                        <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                            Click to select a file
                                        </p>
                                        <p className="text-xs leading-5 text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                                    </>
                                )}
                            </div>
                        </div>
                        <Input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*"
                            className="hidden" 
                            id="slip-upload"
                        />
                         <DialogFooter>
                            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                            <Button className="w-full" onClick={handleUpload} disabled={!paymentSlip || isUploading}>
                                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4" />}
                                {isUploading ? "Uploading..." : "Submit Payment Slip"}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
