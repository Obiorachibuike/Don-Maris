
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrdersTable } from '@/components/orders-table';
import { CustomerLedgerTable } from '@/components/customer-ledger-table';

export default function AccountantPage() {
    return (
        <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="customers">Customer Ledgers</TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="mt-6">
                <OrdersTable />
            </TabsContent>
            <TabsContent value="customers" className="mt-6">
                <CustomerLedgerTable />
            </TabsContent>
        </Tabs>
    );
}
