
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Users, Package, CreditCard } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const salesData = [
    { month: 'Jan', sales: 186, revenue: 80 },
    { month: 'Feb', sales: 305, revenue: 200 },
    { month: 'Mar', sales: 237, revenue: 120 },
    { month: 'Apr', sales: 73, revenue: 190 },
    { month: 'May', sales: 209, revenue: 130 },
    { month: 'Jun', sales: 214, revenue: 140 },
    { month: 'Jul', sales: 286, revenue: 180 },
    { month: 'Aug', sales: 145, revenue: 120 },
    { month: 'Sep', sales: 298, revenue: 210 },
    { month: 'Oct', sales: 159, revenue: 90 },
    { month: 'Nov', sales: 321, revenue: 250 },
    { month: 'Dec', sales: 367, revenue: 280 },
];

const chartConfig: ChartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--primary))",
  },
  revenue: {
      label: "Revenue",
      color: "hsl(var(--accent))",
  }
};

export default function AdminDashboard() {

  const recentOrders = [
    { id: 'ORD001', customer: 'Olivia Martin', amount: 250.00, status: 'Fulfilled', date: '2023-11-23' },
    { id: 'ORD002', customer: 'Jackson Lee', amount: 150.75, status: 'Processing', date: '2023-11-23' },
    { id: 'ORD003', customer: 'Isabella Nguyen', amount: 350.00, status: 'Fulfilled', date: '2023-11-22' },
    { id: 'ORD004', customer: 'William Kim', amount: 45.50, status: 'Pending', date: '2023-11-22' },
    { id: 'ORD005', customer: 'Sophia Davis', amount: 550.20, status: 'Fulfilled', date: '2023-11-21' },
  ];

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">$45,231.89</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+2350</div>
                    <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Orders</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+12,234</div>
                    <p className="text-xs text-muted-foreground">+19% from last month</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Products in Stock</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">573</div>
                    <p className="text-xs text-muted-foreground">201 since last month</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Sales Overview</CardTitle>
                    <CardDescription>A bar chart showing total sales per month.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                         <BarChart accessibilityLayer data={salesData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Revenue Trends</CardTitle>
                    <CardDescription>A line chart showing revenue over time.</CardDescription>
                </CardHeader>
                <CardContent>
                   <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <LineChart accessibilityLayer data={salesData} margin={{ left: 12, right: 12 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis tickMargin={8} />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>A quick look at the most recent orders.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentOrders.map(order => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.id}</TableCell>
                                <TableCell>{order.customer}</TableCell>
                                <TableCell>${order.amount.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        order.status === 'Fulfilled' ? 'default' :
                                        order.status === 'Processing' ? 'secondary' :
                                        'destructive'
                                    } className={order.status === 'Pending' ? 'bg-red-500/20 text-red-700 border-red-500/20' : ''}>
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{order.date}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
