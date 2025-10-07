
'use client';

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
import { ScrollArea } from './ui/scroll-area';
import { PrintHistoryEntry } from '@/lib/types';
import { format } from 'date-fns';

interface PrintConfirmationDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: () => void;
  printHistory: PrintHistoryEntry[];
}

export function PrintConfirmationDialog({ isOpen, setIsOpen, onConfirm, printHistory }: PrintConfirmationDialogProps) {
  const lastPrint = printHistory[printHistory.length - 1];

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Invoice Already Printed</AlertDialogTitle>
          <AlertDialogDescription>
            This invoice has been printed before. Are you sure you want to print it again?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="text-sm">
          <p className="font-semibold">Last printed by:</p>
          <p className="text-muted-foreground">
            {lastPrint?.printedBy} on {lastPrint && format(new Date(lastPrint.printedAt), "MMM d, yyyy 'at' h:mm a")}
          </p>
          {printHistory.length > 1 && (
            <div className="mt-4">
                <p className="font-semibold">Full Print History:</p>
                <ScrollArea className="h-24 mt-2 rounded-md border p-2">
                    <ul className="space-y-1">
                        {printHistory.map((entry, index) => (
                            <li key={index} className="text-xs text-muted-foreground">
                                {index + 1}. Printed by <strong>{entry.printedBy}</strong> on {format(new Date(entry.printedAt), "MMM d, h:mm a")}
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            </div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Yes, Print Again</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
