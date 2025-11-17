
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
import { Bar, BarChart, CartesianGrid, Pie, PieChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import type { Order, User, Product } from "@/lib/types";
import { subDays, format } from 'date-fns';

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

export function AdminDashboardClient({ data }: { data: DashboardData }) {
  const { orders, users, products } = data;

  const totalRevenue = orders.reduce((acc, order) => acc + (order.amountPaid || 0), 0);
  
  const oneMonthAgo = subDays(new Date(), 30);
  const newCustomers = users.filter(user => new Date(user.dateJoined) >= oneMonthAgo).length;
  
  const totalOrders = orders.length;
  const productsInStock = products.reduce((acc, product) => acc + product.stock, 0);

  const salesData = orders.reduce((acc, order) => {
    const month = format(new Date(order.date), 'MMM');
    if (!acc[month]) {
      acc[month] = { month, revenue: 0 };
    }
    acc[month].revenue += order.amountPaid || 0;
    return acc;
  }, {} as Record<string, { month: string, revenue: number }>);
  
  const monthlyRevenue = Object.values(salesData).map(data => ({
      ...data,
      revenue: Math.round(data.revenue)
  })).reverse();


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
                    <CardTitle>Sales Overview (Line Chart)</CardTitle>
                    <CardDescription>A line chart showing total revenue per month.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <LineChart
                          accessibilityLayer
                          data={monthlyRevenue}
                          margin={{
                            left: 12,
                            right: 12,
                          }}
                        >
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="month"
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
        </div>

        <div className="grid grid-cols-1 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Sales Overview (Bar Chart)</CardTitle>
                    <CardDescription>A bar chart showing total revenue per month.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <BarChart accessibilityLayer data={monthlyRevenue}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
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
  );
}
