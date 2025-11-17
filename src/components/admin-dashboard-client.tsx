
'use client';

import { useState, useMemo } from 'react';
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
import { Bar, BarChart, CartesianGrid, Pie, PieChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import type { Order, User, Product } from "@/lib/types";
import { subDays, format, startOfDay, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const chartConfig: ChartConfig = {
  revenue: {
      label: "Revenue",
      color: "hsl(var(--primary))",
  },
  Fulfilled: {
      label: "Fulfilled",
      color: "hsl(var(--chart-2))",
  },
  Processing: {
      label: "Processing",
      color: "hsl(var(--chart-4))",
  },
  Pending: {
      label: "Pending",
      color: "hsl(var(--chart-1))",
  },
  Cancelled: {
      label: "Cancelled",
      color: "hsl(var(--muted))",
  }
};

export interface DashboardData {
    orders: Order[];
    users: User[];
    products: Product[];
}

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

const aggregateSalesData = (orders: Order[], range: TimeRange) => {
    const now = new Date();
    let data: { [key: string]: { date: string, revenue: number } } = {};
    let sortedAndFilteredOrders = [...orders].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    switch(range) {
        case 'daily':
            const thirtyDaysAgo = startOfDay(subDays(now, 29));
            sortedAndFilteredOrders = sortedAndFilteredOrders.filter(o => new Date(o.date) >= thirtyDaysAgo);
            sortedAndFilteredOrders.forEach(order => {
                const day = format(new Date(order.date), 'MMM d');
                if (!data[day]) data[day] = { date: day, revenue: 0 };
                data[day].revenue += order.amountPaid || 0;
            });
            break;
        case 'weekly':
            const twelveWeeksAgo = startOfWeek(subDays(now, 12 * 7));
            sortedAndFilteredOrders = sortedAndFilteredOrders.filter(o => new Date(o.date) >= twelveWeeksAgo);
            sortedAndFilteredOrders.forEach(order => {
                const week = format(startOfWeek(new Date(order.date)), 'MMM d');
                if (!data[week]) data[week] = { date: week, revenue: 0 };
                data[week].revenue += order.amountPaid || 0;
            });
            break;
        case 'monthly':
            const twelveMonthsAgo = startOfMonth(subDays(now, 365));
             sortedAndFilteredOrders = sortedAndFilteredOrders.filter(o => new Date(o.date) >= twelveMonthsAgo);
            sortedAndFilteredOrders.forEach(order => {
                const month = format(new Date(order.date), 'MMM');
                if (!data[month]) data[month] = { date: month, revenue: 0 };
                data[month].revenue += order.amountPaid || 0;
            });
            break;
        case 'yearly':
             sortedAndFilteredOrders.forEach(order => {
                const year = format(new Date(order.date), 'yyyy');
                if (!data[year]) data[year] = { date: year, revenue: 0 };
                data[year].revenue += order.amountPaid || 0;
            });
            break;
    }
    return Object.values(data).map(d => ({ ...d, revenue: Math.round(d.revenue) }));
};

export function AdminDashboardClient({ data }: { data: DashboardData }) {
  const { orders, users, products } = data;
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');

  const totalRevenue = orders.reduce((acc, order) => acc + (order.amountPaid || 0), 0);
  
  const oneMonthAgo = subDays(new Date(), 30);
  const newCustomers = users.filter(user => new Date(user.dateJoined) >= oneMonthAgo).length;
  
  const totalOrders = orders.length;
  const productsInStock = products.reduce((acc, product) => acc + product.stock, 0);

  const salesData = useMemo(() => aggregateSalesData(orders, timeRange), [orders, timeRange]);

  const orderStatusCounts = orders.reduce((acc, order) => {
    const status = order.status || 'Pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<Order['status'], number>);
  
  const orderStatusData = Object.entries(orderStatusCounts).map(([status, count]) => ({
    status,
    count,
    fill: `var(--color-${status})`,
  }));

  const recentOrders = orders.slice(0, 5);
  
  const SalesCharts = () => (
    <>
       <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Sales Overview (Line Chart)</CardTitle>
                <CardDescription>Total revenue over time.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <LineChart
                        accessibilityLayer
                        data={salesData}
                        margin={{
                        left: 12,
                        right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        />
                        <YAxis
                        tickFormatter={(value) => `₦${value / 1000}k`}
                        />
                        <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent 
                            formatter={(value) => `₦${Number(value).toLocaleString()}`}
                        />}
                        />
                        <Line
                        dataKey="revenue"
                        type="monotone"
                        stroke="var(--color-revenue)"
                        strokeWidth={2}
                        dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Sales Overview (Bar Chart)</CardTitle>
                <CardDescription>Total revenue over time.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart accessibilityLayer data={salesData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <YAxis 
                            tickFormatter={(value) => `₦${value / 1000}k`}
                        />
                        <ChartTooltip content={<ChartTooltipContent 
                                formatter={(value) => `₦${Number(value).toLocaleString()}`}
                        />} />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    </>
  );

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">All-time revenue from all orders</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{newCustomers}</div>
                    <p className="text-xs text-muted-foreground">in the last 30 days</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalOrders}</div>
                    <p className="text-xs text-muted-foreground">Total orders placed all-time</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Products in Stock</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{productsInStock}</div>
                    <p className="text-xs text-muted-foreground">Total units across all products</p>
                </CardContent>
            </Card>
        </div>
        
        <Tabs defaultValue="monthly" onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
            <TabsContent value="daily">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <SalesCharts />
                 </div>
            </TabsContent>
            <TabsContent value="weekly">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <SalesCharts />
                 </div>
            </TabsContent>
            <TabsContent value="monthly">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <SalesCharts />
                 </div>
            </TabsContent>
            <TabsContent value="yearly">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <SalesCharts />
                 </div>
            </TabsContent>
        </Tabs>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
                 <CardHeader>
                    <CardTitle>Order Status</CardTitle>
                    <CardDescription>A pie chart showing the status of all orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                         <PieChart accessibilityLayer>
                            <Tooltip content={<ChartTooltipContent nameKey="count" hideLabel />} />
                            <Pie data={orderStatusData} dataKey="count" nameKey="status" innerRadius={60} />
                            <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>A quick look at the most recent orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice ID</TableHead>
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
                                    <TableCell>{order.customer.name}</TableCell>
                                    <TableCell>₦{order.amount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            order.status === 'Fulfilled' ? 'default' :
                                            order.status === 'Processing' ? 'secondary' :
                                            'destructive'
                                        } className={order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20' : order.status === 'Cancelled' ? 'bg-gray-500/20 text-gray-700 border-gray-500/20' : ''}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
