
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersPage from "../users/page";
import ProductsAdminPage from "../products/page";
import OrdersPage from "../orders/page";


export default function GeneralAdminPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>General Administration</CardTitle>
                <CardDescription>Manage all aspects of your store from one place.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="users" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="users">Users</TabsTrigger>
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="orders">Orders</TabsTrigger>
                    </TabsList>
                    <TabsContent value="users" className="mt-6">
                        {/* 
                            Because the original pages were designed to be full pages, 
                            their top-level Card component creates nested cards here.
                            This is a quick way to reuse them. For a production app,
                            you would refactor the content into components without the Card wrapper.
                        */}
                        <UsersPage />
                    </TabsContent>
                    <TabsContent value="products" className="mt-6">
                        <ProductsAdminPage />
                    </TabsContent>
                    <TabsContent value="orders" className="mt-6">
                        <OrdersPage />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
