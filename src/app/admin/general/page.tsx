
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersPage from "../users/page";
import ProductsAdminPage from "../products/page";
import OrdersPage from "../orders/page";


export default function GeneralAdminPage() {
    return (
        <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>
            <TabsContent value="users" className="mt-6">
                <UsersPage />
            </TabsContent>
            <TabsContent value="products" className="mt-6">
                <ProductsAdminPage />
            </TabsContent>
            <TabsContent value="orders" className="mt-6">
                <OrdersPage />
            </TabsContent>
        </Tabs>
    );
}
