'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrdersTable } from '@/components/orders-table';
import { CustomerLedgerTable } from '@/components/customer-ledger-table';
import ProductsAdminPage from '../products/page';

export default function AccountantPage() {
    return (
        <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="customers">Customer Ledgers</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="mt-6">
                <OrdersTable />
            </TabsContent>
            <TabsContent value="customers" className="mt-6">
                <CustomerLedgerTable />
            </TabsContent>
            <TabsContent value="products" className="mt-6">
                <ProductsAdminPage />
            </TabsContent>
        </Tabs>
    );
}
